import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { sendUnifiedEmail, UnifiedEmailOptions, EmailAttachment } from "./unified-email.service";
import logger from "../utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface QueueEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  metadata?: {
    type?: string;
    emailSource?: 'auto' | 'manual';
    partnerId?: number;
    emailLogId?: number;
    [key: string]: any;
  };
  priority?: number;
  scheduledAt?: Date;
  maxAttempts?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  deadLetter: number;
  total: number;
}

export interface ProcessingResult {
  processed: number;
  failed: number;
  skipped: number;
}

// ============================================================================
// QUEUE OPERATIONS
// ============================================================================

/**
 * Add email to database queue
 * 
 * @param options - Email options
 * @returns Queue item ID and status
 */
export async function queueEmail(
  options: QueueEmailOptions
): Promise<{ id: number; status: string }> {
  try {
    // Convert arrays to comma-separated strings for storage
    const to = Array.isArray(options.to) ? options.to.join(',') : options.to;
    const cc = options.cc 
      ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc)
      : null;
    const bcc = options.bcc
      ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc)
      : null;

    // Serialize attachments to JSON
    const attachmentsData = options.attachments && options.attachments.length > 0
      ? options.attachments.map(att => ({
          filename: att.filename,
          content: att.content 
            ? (Buffer.isBuffer(att.content) 
                ? att.content.toString('base64') 
                : att.content)
            : null,
          path: att.path,
          contentType: att.contentType
        }))
      : undefined;

    // Prepare metadata
    const metadataData = options.metadata || undefined;

    // Insert into database
    const queueItem = await prisma.emailQueue.create({
      data: {
        to,
        subject: options.subject,
        html: options.html || '',
        text: options.text || undefined,
        from: options.from || undefined,
        cc: cc || undefined,
        bcc: bcc || undefined,
        attachments: attachmentsData as Prisma.InputJsonValue | undefined,
        metadata: metadataData as Prisma.InputJsonValue | undefined,
        status: 'PENDING',
        priority: options.priority || 0,
        scheduled_at: options.scheduledAt || new Date(),
        max_attempts: options.maxAttempts || 3,
        attempts: 0
      }
    });

    logger.info('Email queued successfully', {
      queueId: queueItem.id,
      to: options.to,
      subject: options.subject,
      metadata: options.metadata
    });

    return {
      id: queueItem.id,
      status: 'PENDING'
    };

  } catch (error: any) {
    logger.error('Failed to queue email', {
      error: error.message,
      stack: error.stack,
      to: options.to,
      subject: options.subject
    });
    throw error;
  }
}

/**
 * Process pending emails from queue
 * 
 * Called by worker/cron job to send queued emails
 * 
 * @param batchSize - Number of emails to process in one batch
 * @returns Processing statistics
 */
export async function processEmailQueue(
  batchSize: number = 50
): Promise<ProcessingResult> {
  const stats: ProcessingResult = { 
    processed: 0, 
    failed: 0, 
    skipped: 0 
  };

  try {
    // Fetch pending emails that are due to be sent
    // Use FOR UPDATE to lock rows (prevents concurrent processing)
    const pendingEmails = await prisma.$queryRaw<any[]>`
      SELECT * FROM email_queue
      WHERE status = 'PENDING'
        AND scheduled_at <= NOW()
        AND attempts < max_attempts
      ORDER BY priority DESC, created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    `;

    logger.info('Processing email queue batch', {
      batchSize: pendingEmails.length
    });

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Mark as processing (prevents duplicate processing)
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: 'PROCESSING' }
        });

        // Parse attachments from JSON
        let attachments: EmailAttachment[] | undefined;
        if (email.attachments) {
          const parsedAttachments = email.attachments as any[];
          attachments = parsedAttachments.map((att: any) => ({
            filename: att.filename,
            content: att.content 
              ? Buffer.from(att.content, 'base64')
              : undefined,
            path: att.path,
            contentType: att.contentType
          }));
        }

        // Parse metadata
        const metadata = email.metadata as any || undefined;

        // Send email using unified service
        const result = await sendUnifiedEmail({
          to: email.to.split(','),
          subject: email.subject,
          html: email.html,
          text: email.text || undefined,
          from: email.from || undefined,
          cc: email.cc ? email.cc.split(',') : undefined,
          bcc: email.bcc ? email.bcc.split(',') : undefined,
          attachments,
          metadata
        });

        if (result.success) {
          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status: 'SENT',
              sent_at: new Date()
            }
          });

          stats.processed++;
          
          logger.info('Email sent from queue', {
            queueId: email.id,
            messageId: result.messageId,
            to: email.to
          });

        } else {
          throw new Error(result.error || 'Email send failed');
        }

      } catch (error: any) {
        stats.failed++;
        
        // Calculate retry logic
        const newAttempts = email.attempts + 1;
        const isFinalAttempt = newAttempts >= email.max_attempts;

        // Exponential backoff: 2^attempts minutes (2, 4, 8, 16...)
        const backoffMinutes = Math.pow(2, newAttempts);
        const nextScheduledAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

        // Update queue item
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: isFinalAttempt ? 'DEAD_LETTER' : 'PENDING',
            attempts: newAttempts,
            last_error: error.message,
            scheduled_at: isFinalAttempt ? email.scheduled_at : nextScheduledAt
          }
        });

        logger.error('Email failed in queue', {
          queueId: email.id,
          attempt: newAttempts,
          maxAttempts: email.max_attempts,
          isFinalAttempt,
          error: error.message,
          nextRetry: isFinalAttempt ? 'DEAD_LETTER' : nextScheduledAt.toISOString()
        });
      }
    }

    logger.info('Email queue batch completed', stats);
    return stats;

  } catch (error: any) {
    logger.error('Email queue processing error', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Get queue statistics
 * 
 * @returns Queue stats by status
 */
export async function getQueueStats(): Promise<QueueStats> {
  try {
    const [pending, processing, sent, failed, deadLetter] = await Promise.all([
      prisma.emailQueue.count({ where: { status: 'PENDING' } }),
      prisma.emailQueue.count({ where: { status: 'PROCESSING' } }),
      prisma.emailQueue.count({ where: { status: 'SENT' } }),
      prisma.emailQueue.count({ where: { status: 'FAILED' } }),
      prisma.emailQueue.count({ where: { status: 'DEAD_LETTER' } })
    ]);

    const total = pending + processing + sent + failed + deadLetter;

    return {
      pending,
      processing,
      sent,
      failed,
      deadLetter,
      total
    };
  } catch (error: any) {
    logger.error('Failed to get queue stats', { error: error.message });
    throw error;
  }
}

/**
 * Retry failed emails (admin action)
 * 
 * @param emailIds - Array of email queue IDs to retry
 * @returns Number of emails retried
 */
export async function retryFailedEmails(
  emailIds: number[]
): Promise<{ retried: number }> {
  try {
    const result = await prisma.emailQueue.updateMany({
      where: {
        id: { in: emailIds },
        status: { in: ['FAILED', 'DEAD_LETTER'] }
      },
      data: {
        status: 'PENDING',
        attempts: 0,
        last_error: null,
        scheduled_at: new Date()
      }
    });

    logger.info('Failed emails retried', {
      emailIds,
      count: result.count
    });

    return { retried: result.count };
  } catch (error: any) {
    logger.error('Failed to retry emails', {
      error: error.message,
      emailIds
    });
    throw error;
  }
}

/**
 * Clean up old sent/failed emails
 * 
 * @param daysOld - Delete emails older than this many days
 * @returns Number of emails deleted
 */
export async function cleanupOldEmails(
  daysOld: number = 30
): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.emailQueue.deleteMany({
      where: {
        status: { in: ['SENT', 'FAILED'] },
        created_at: { lt: cutoffDate }
      }
    });

    logger.info('Old emails cleaned up', {
      daysOld,
      deleted: result.count
    });

    return { deleted: result.count };
  } catch (error: any) {
    logger.error('Failed to cleanup old emails', {
      error: error.message,
      daysOld
    });
    throw error;
  }
}

/**
 * Get dead letter emails (for admin review)
 * 
 * @param limit - Maximum number of emails to return
 * @returns Array of dead letter emails
 */
export async function getDeadLetterEmails(limit: number = 100) {
  try {
    const emails = await prisma.emailQueue.findMany({
      where: { status: 'DEAD_LETTER' },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    return emails;
  } catch (error: any) {
    logger.error('Failed to get dead letter emails', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Cancel pending email
 * 
 * @param emailId - Email queue ID
 * @returns Success status
 */
export async function cancelEmail(emailId: number): Promise<{ success: boolean }> {
  try {
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: { status: 'FAILED', last_error: 'Cancelled by admin' }
    });

    logger.info('Email cancelled', { emailId });
    return { success: true };
  } catch (error: any) {
    logger.error('Failed to cancel email', {
      error: error.message,
      emailId
    });
    throw error;
  }
}