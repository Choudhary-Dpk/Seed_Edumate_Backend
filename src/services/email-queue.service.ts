import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";
import { 
  createEmailLog, 
  EmailType, 
  EmailCategory, 
  EmailLogStatus, 
  SenderType 
} from "./email-log.service";

// ============================================================================
// TYPES
// ============================================================================

export interface QueueEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
  priority?: number;
  scheduled_at?: Date;
  
  // NEW: Email classification for logging
  email_type?: EmailType;
  category?: EmailCategory;
  sent_by_user_id?: number;
  sent_by_name?: string;
  sent_by_type?: SenderType;
  reference_type?: string;
  reference_id?: number;
  
  metadata?: any;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Queue email for async sending
 * 
 * UPDATED: Now creates EmailLog entry automatically
 * 
 * Process:
 * 1. Validate email options
 * 2. Create EmailLog entry (status: QUEUED)
 * 3. Insert into EmailQueue
 * 4. Link queue item to email log
 * 
 * @param options - Email queue configuration
 * @returns Object with emailLog and queueItem
 */
export async function queueEmail(options: QueueEmailOptions): Promise<{
  emailLog: any;
  queueItem: any;
}> {
  // Validate required fields
  if (!options.to || !options.subject || !options.html) {
    throw new Error("Missing required email fields: to, subject, html");
  }

  // Normalize email addresses
  const to = Array.isArray(options.to) ? options.to.join(",") : options.to;
  const cc = Array.isArray(options.cc) ? options.cc.join(",") : options.cc;
  const bcc = Array.isArray(options.bcc) ? options.bcc.join(",") : options.bcc;

  // Prepare attachments data
  const attachmentsData = options.attachments && options.attachments.length > 0
    ? options.attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      }))
    : undefined;

  // Prepare metadata
  const metadataData = {
    ...options.metadata,
    email_type: options.email_type,
    category: options.category,
    sent_by_user_id: options.sent_by_user_id,
    sent_by_name: options.sent_by_name,
    sent_by_type: options.sent_by_type,
    reference_type: options.reference_type,
    reference_id: options.reference_id,
  };

  try {
    // ========================================================================
    // STEP 1: Create EmailLog entry
    // ========================================================================
    const emailLog = await createEmailLog({
      recipient: to,
      cc,
      bcc,
      from: options.from,
      subject: options.subject,
      email_type: options.email_type || EmailType.UNKNOWN,
      category: options.category || EmailCategory.SYSTEM,
      sent_by_user_id: options.sent_by_user_id,
      sent_by_name: options.sent_by_name,
      sent_by_type: options.sent_by_type || SenderType.SYSTEM,
      reference_type: options.reference_type,
      reference_id: options.reference_id,
      has_attachment: attachmentsData ? true : false,
      attachment_count: options.attachments?.length || 0,
      status: EmailLogStatus.QUEUED,
      metadata: metadataData,
    });

    logger.debug("Email log created for queue", {
      emailLogId: emailLog.id,
      recipient: to,
      email_type: options.email_type,
    });

    // ========================================================================
    // STEP 2: Insert into EmailQueue
    // ========================================================================
    const queueItem = await prisma.emailQueue.create({
      data: {
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from,
        cc,
        bcc,
        attachments: attachmentsData as Prisma.InputJsonValue,
        metadata: {
          ...metadataData,
          email_log_id: emailLog.id,  // Link to email log
        } as Prisma.InputJsonValue,
        priority: options.priority || 0,
        scheduled_at: options.scheduled_at || new Date(),
        status: "PENDING",
      },
    });

    logger.info("Email queued", {
      queueItemId: queueItem.id,
      emailLogId: emailLog.id,
      recipient: to,
      subject: options.subject,
      priority: queueItem.priority,
    });

    // ========================================================================
    // STEP 3: Link queue item back to email log
    // ========================================================================
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { queue_item_id: queueItem.id },
    });

    logger.debug("Email log linked to queue item", {
      emailLogId: emailLog.id,
      queueItemId: queueItem.id,
    });

    return { emailLog, queueItem };
  } catch (error) {
    logger.error("Failed to queue email", {
      error: error instanceof Error ? error.message : "Unknown error",
      recipient: to,
      subject: options.subject,
    });
    throw error;
  }
}

/**
 * Get pending emails from queue
 * 
 * Called by email-queue-worker.ts to process emails
 * 
 * @param limit - Max number of emails to fetch
 * @returns Array of pending emails
 */
export async function getPendingEmails(limit: number = 10): Promise<any[]> {
  try {
    const now = new Date();

    const emails = await prisma.emailQueue.findMany({
      where: {
        status: "PENDING",
        scheduled_at: { lte: now },
        //  Removed the incorrect attempts comparison
      },
      orderBy: [{ priority: "desc" }, { scheduled_at: "asc" }],
    });

    //  Filter in application code
    const eligibleEmails = emails
      .filter((email: any) => email.attempts < email.max_attempts)
      .slice(0, limit);

    return eligibleEmails;
  } catch (error) {
    logger.error("Failed to get pending emails", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

/**
 * Mark email as processing
 * 
 * Prevents duplicate processing by multiple workers
 * 
 * @param id - Email queue ID
 * @returns Updated queue item
 */
export async function markEmailAsProcessing(id: number): Promise<any> {
  try {
    const email = await prisma.emailQueue.update({
      where: { id },
      data: {
        status: "PROCESSING",
        updated_at: new Date(),
      },
    });

    return email;
  } catch (error) {
    logger.error("Failed to mark email as processing", {
      error: error instanceof Error ? error.message : "Unknown error",
      emailId: id,
    });
    throw error;
  }
}

/**
 * Mark email as sent
 * 
 * Called after successful email delivery
 * 
 * @param id - Email queue ID
 * @returns Updated queue item
 */
export async function markEmailAsSent(id: number): Promise<any> {
  try {
    const email = await prisma.emailQueue.update({
      where: { id },
      data: {
        status: "SENT",
        sent_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info("Email marked as sent", { emailId: id });
    return email;
  } catch (error) {
    logger.error("Failed to mark email as sent", {
      error: error instanceof Error ? error.message : "Unknown error",
      emailId: id,
    });
    throw error;
  }
}

/**
 * Mark email as failed
 * 
 * Called after failed email delivery attempt
 * Implements retry logic
 * 
 * @param id - Email queue ID
 * @param errorMessage - Error description
 * @returns Updated queue item
 */
export async function markEmailAsFailed(
  id: number,
  errorMessage: string
): Promise<any> {
  try {
    const email = await prisma.emailQueue.findUnique({
      where: { id },
    });

    if (!email) {
      throw new Error(`Email queue item ${id} not found`);
    }

    const newAttempts = email.attempts + 1;
    const shouldMoveToDeadLetter = newAttempts >= email.max_attempts;

    const updatedEmail = await prisma.emailQueue.update({
      where: { id },
      data: {
        status: shouldMoveToDeadLetter ? "DEAD_LETTER" : "FAILED",
        attempts: newAttempts,
        last_error: errorMessage,
        updated_at: new Date(),
      },
    });

    logger.warn("Email marked as failed", {
      emailId: id,
      attempts: newAttempts,
      maxAttempts: email.max_attempts,
      movedToDeadLetter: shouldMoveToDeadLetter,
      error: errorMessage,
    });

    return updatedEmail;
  } catch (error) {
    logger.error("Failed to mark email as failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      emailId: id,
    });
    throw error;
  }
}

/**
 * Get queue statistics
 * 
 * Useful for monitoring and alerting
 * 
 * @returns Queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  dead_letter: number;
  total: number;
}> {
  try {
    const [pending, processing, sent, failed, deadLetter, total] = await Promise.all([
      prisma.emailQueue.count({ where: { status: "PENDING" } }),
      prisma.emailQueue.count({ where: { status: "PROCESSING" } }),
      prisma.emailQueue.count({ where: { status: "SENT" } }),
      prisma.emailQueue.count({ where: { status: "FAILED" } }),
      prisma.emailQueue.count({ where: { status: "DEAD_LETTER" } }),
      prisma.emailQueue.count(),
    ]);

    return {
      pending,
      processing,
      sent,
      failed,
      dead_letter: deadLetter,
      total,
    };
  } catch (error) {
    logger.error("Failed to get queue stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}