import * as cron from "node-cron";
import logger from "../utils/logger";
import {
  getPendingEmails,
  markEmailAsProcessing,
  markEmailAsSent,
  markEmailAsFailed,
} from "../services/email-queue.service";
import { 
  updateEmailLogStatus, 
  EmailLogStatus 
} from "../services/email-log.service";
import { sendUnifiedEmail } from "../services/unified-email.service";

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENABLE_WORKER = process.env.ENABLE_EMAIL_WORKER !== "false";
const BATCH_SIZE = parseInt(process.env.EMAIL_BATCH_SIZE || "10", 10);
const INTERVAL = process.env.EMAIL_WORKER_INTERVAL || "*/1 * * * *"; // Every minute

// ============================================================================
// WORKER FUNCTIONS
// ============================================================================

/**
 * Process batch of emails
 * 
 * UPDATED: Now updates EmailLog status for each email
 */
async function processBatch(): Promise<void> {
  try {
    // Fetch pending emails
    const emails = await getPendingEmails(BATCH_SIZE);

    if (emails.length === 0) {
      logger.debug("No pending emails to process");
      return;
    }

    logger.info(`Processing ${emails.length} emails`);

    // Process each email
    const results = await Promise.allSettled(
      emails.map((email) => processEmail(email))
    );

    // Log results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logger.info("Batch processing complete", {
      total: emails.length,
      successful,
      failed,
    });
  } catch (error) {
    logger.error("Error processing email batch", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Process individual email
 * 
 * UPDATED: Now updates EmailLog status throughout the process
 */
async function processEmail(email: any): Promise<void> {
  const emailLogId = email.metadata?.email_log_id;

  try {
    // Mark as processing in queue
    await markEmailAsProcessing(email.id);

    logger.info("Processing email", {
      queueItemId: email.id,
      emailLogId,
      recipient: email.to,
      subject: email.subject,
    });

    // Parse attachments if present
    const attachments = email.attachments
      ? JSON.parse(JSON.stringify(email.attachments))
      : undefined;

    // Send email
    const result = await sendUnifiedEmail({
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      from: email.from,
      cc: email.cc,
      bcc: email.bcc,
      attachments,
    });

    // ========================================================================
    // SUCCESS: Update both queue and email log
    // ========================================================================
    await markEmailAsSent(email.id);

    // Update email log status
    if (emailLogId) {
      await updateEmailLogStatus(emailLogId, EmailLogStatus.SENT, {
        sent_at: new Date(),
      });
    }

    logger.info("Email sent successfully", {
      queueItemId: email.id,
      emailLogId,
      recipient: email.to,
      messageId: result.messageId,
    });
  } catch (error) {
    // ========================================================================
    // FAILURE: Update both queue and email log
    // ========================================================================
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await markEmailAsFailed(email.id, errorMessage);

    // Update email log status
    if (emailLogId) {
      const currentAttempts = (email.attempts || 0) + 1;
      const maxAttempts = email.max_attempts || 3;
      const isFinalFailure = currentAttempts >= maxAttempts;

      await updateEmailLogStatus(
        emailLogId,
        isFinalFailure ? EmailLogStatus.FAILED : EmailLogStatus.QUEUED,
        {
          error_message: errorMessage,
          attempts: currentAttempts,
          failed_at: isFinalFailure ? new Date() : undefined,
        }
      );
    }

    logger.error("Failed to send email", {
      queueItemId: email.id,
      emailLogId,
      recipient: email.to,
      error: errorMessage,
      attempts: email.attempts + 1,
      maxAttempts: email.max_attempts,
    });

    throw error;
  }
}

/**
 * Health check for worker
 * 
 * Monitors queue and alerts if backlog grows
 */
async function healthCheck(): Promise<void> {
  try {
    const stats = await require("../services/email-queue.service").getQueueStats();

    logger.debug("Email queue health check", stats);

    // Alert if backlog is growing
    if (stats.pending > 100) {
      logger.warn("Email queue backlog growing", {
        pending: stats.pending,
        processing: stats.processing,
      });
    }

    // Alert if too many dead letters
    if (stats.dead_letter > 50) {
      logger.error("Too many dead letter emails", {
        dead_letter: stats.dead_letter,
      });
    }
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// ============================================================================
// WORKER LIFECYCLE
// ============================================================================

/**
 * Start email queue worker
 * 
 * Called from app.ts on server startup
 */
export function startEmailQueueWorker(): void {
  if (!ENABLE_WORKER) {
    logger.info("Email queue worker disabled");
    return;
  }

  logger.info("Starting email queue worker", {
    interval: INTERVAL,
    batchSize: BATCH_SIZE,
  });

  // Schedule email processing
  cron.schedule(INTERVAL, async () => {
    try {
      await processBatch();
    } catch (error) {
      logger.error("Error in scheduled email processing", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Schedule health check (every 5 minutes)
  cron.schedule("*/5 * * * *", async () => {
    try {
      await healthCheck();
    } catch (error) {
      logger.error("Error in health check", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  logger.info("Email queue worker started successfully");
}

/**
 * Manual trigger for testing
 * 
 * Can be called via admin endpoint for manual processing
 */
export async function triggerManualProcessing(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  logger.info("Manual email processing triggered");

  const emails = await getPendingEmails(BATCH_SIZE);
  const results = await Promise.allSettled(
    emails.map((email) => processEmail(email))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    processed: emails.length,
    successful,
    failed,
  };
}