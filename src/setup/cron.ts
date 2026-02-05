import dotenv from "dotenv";
import cron from "node-cron";
import fs from "fs";
import { updatePropertySync } from "../scripts/sync_loan_product_options";
import { updateExchangeRates } from "../scripts/curreny_update";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { generateMonthlyMISReports } from "../services/mis-report.service";
import { queueEmail } from "../services/email-queue.service";
import { 
  EmailType, 
  EmailCategory, 
  SenderType 
} from "../services/email-log.service";

dotenv.config();

// Create logs directory
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

// Email recipients for notifications
const NOTIFICATION_EMAILS = ["deepak@seedglobaleducation.com"];

// Simple logger with 10-day rotation
function log(taskName: string, message: string): void {
  const now = new Date();
  const day = now.getDate();
  const period = day <= 10 ? "01-10" : day <= 20 ? "11-20" : "21-end";
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
  const logFile = `./logs/${taskName}_${date}_${period}.log`;

  const timestamp = now.toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

/**
 * ✅ UPDATED: Send email notification using unified email system
 * 
 * Changes:
 * - Uses queueEmail() instead of emailQueue.push()
 * - Uses EmailType.CRON_NOTIFICATION
 * - Uses EmailCategory.SYSTEM
 * - Uses SenderType.CRON
 * - Async function with proper error handling
 */
async function sendNotification(
  taskName: string,
  success: boolean,
  duration: number,
  error?: any,
): Promise<void> {
  const status = success ? "Success" : "Failed";
  const statusEmoji = success ? "✅" : "❌";
  const subject = `[Cron Job] ${taskName} - ${statusEmoji} ${status}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: ${
      success ? "#4CAF50" : "#f44336"
    }; color: white; padding: 20px; border-radius: 5px; }
    .info { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${statusEmoji} ${taskName} - ${status}</h2>
  </div>
  <div class="info">
    <p><strong>Task:</strong> ${taskName}</p>
    <p><strong>Status:</strong> ${
      success ? "Completed Successfully" : "Failed"
    }</p>
    <p><strong>Duration:</strong> ${duration.toFixed(2)} seconds</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    ${error ? `<p><strong>Error:</strong> ${error.message}</p>` : ""}
  </div>
</body>
</html>`;

  try {
    // ✅ NEW: Use unified email queue service
    for (const email of NOTIFICATION_EMAILS) {
      await queueEmail({
        to: email,
        subject,
        html,
        email_type: EmailType.CRON_NOTIFICATION,
        category: EmailCategory.SYSTEM,
        sent_by_type: SenderType.CRON,
        metadata: {
          taskName,
          success,
          duration,
          error: error?.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    logger.debug(`Cron notification emails queued for ${taskName}`);
  } catch (emailError) {
    logger.error(`Failed to queue cron notification email`, {
      taskName,
      error: emailError instanceof Error ? emailError.message : "Unknown error",
    });
    // Don't throw - notification failure shouldn't break the cron job
  }
}

// ==================================================
// YOUR TASKS
// ==================================================

// Task 1: HubSpot Property Update
async function propertyUpdate(): Promise<void> {
  const startTime = Date.now();
  log("property-update", "Starting...");

  try {
    await updatePropertySync(log);
    const duration = (Date.now() - startTime) / 1000;
    log("property-update", "Done!");
    await sendNotification("HubSpot Property Update", true, duration);
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    log("property-update", `Error: ${error.message}`);
    await sendNotification("HubSpot Property Update", false, duration, error);
    throw error;
  }
}

// Task 2: Currency Update
async function currencyUpdate(): Promise<void> {
  const startTime = Date.now();
  log("currency-update", "Starting...");

  try {
    await updateExchangeRates(log);
    const duration = (Date.now() - startTime) / 1000;
    log("currency-update", "Done!");
    await sendNotification("Currency Exchange Update", true, duration);
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    log("currency-update", `Error: ${error.message}`);
    await sendNotification("Currency Exchange Update", false, duration, error);
    throw error;
  }
}

// Task 3: Database Cleanup
async function dbCleanup(): Promise<void> {
  const startTime = Date.now();
  log("db-cleanup", "Starting...");

  try {
    // Your cleanup code here

    const duration = (Date.now() - startTime) / 1000;
    log("db-cleanup", "Done!");
    await sendNotification("Database Cleanup", true, duration);
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    log("db-cleanup", `Error: ${error.message}`);
    await sendNotification("Database Cleanup", false, duration, error);
    throw error;
  }
}

// // Task 4: Partner Auto Deactivation (Inactivity Check)
export async function partnerAutoDeactivation(): Promise<void> {
  const startTime = Date.now();
  log("partner-auto-deactivation", "Starting inactivity check...");

  try {
    const INACTIVE_AFTER_DAYS = 90; // 3 months = ~90 days
    const cutoffTime = new Date(
      Date.now() - INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000, // 90 days in milliseconds
    );

    // ✅ Find partners inactive for > 3 months using last_activity_at
    const inactivePartners = await prisma.b2BPartnersUsers.findMany({
      where: {
        is_active: true,
        last_activity_at: {
          lt: cutoffTime,
        },
      },
      select: {
        id: true,
        email: true,
        last_activity_at: true,
      },
    });

    log(
      "partner-auto-deactivation",
      `Found ${inactivePartners.length} inactive partners (>90 days) to deactivate`,
    );

    let deactivatedCount = 0;

    for (const partner of inactivePartners) {
      const daysSinceActivity = Math.floor(
        (Date.now() - partner.last_activity_at.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      log(
        "partner-auto-deactivation",
        `Deactivating partner ${partner.id} (${partner.email}) - Last activity: ${partner.last_activity_at.toISOString()} (${daysSinceActivity} days ago)`,
      );

      // Deactivate user
      await prisma.b2BPartnersUsers.update({
        where: { id: partner.id },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      // Invalidate all active sessions
      await prisma.b2BPartnersSessions.updateMany({
        where: {
          user_id: partner.id,
          is_valid: true,
        },
        data: {
          is_valid: false,
        },
      });

      // Update login history to inactive
      await prisma.loginHistory.findFirst({
        where: {
          b2b_user_id: partner.id,
          user_type: "partner",
        },
        orderBy: { created_at: "desc" },
      });

      deactivatedCount++;
    }

    const duration = (Date.now() - startTime) / 1000;
    log(
      "partner-auto-deactivation",
      `Done! Deactivated ${deactivatedCount} partners in ${duration.toFixed(2)}s`,
    );
    await sendNotification(
      `Partner Auto-Deactivation - 90 Days (${deactivatedCount} users)`,
      true,
      duration,
    );
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    log("partner-auto-deactivation", `Error: ${error.message}`);
    await sendNotification("Partner Auto-Deactivation", false, duration, error);
    throw error;
  }
}

export async function triggerMonthlyMISReportManually() {
  logger.info("Manually triggering monthly MIS report generation");

  try {
    const result = await generateMonthlyMISReports();

    logger.info("Manual MIS report generation completed", {
      reports_generated: result.reports_generated,
      reports_failed: result.reports_failed,
      total_time_seconds: result.total_processing_time_seconds,
    });

    return result;
  } catch (error) {
    logger.error("Manual MIS report generation failed", { error });
    throw error;
  }
}

// ==================================================
// SCHEDULES
// ==================================================

// Property Update - Daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await propertyUpdate();
  } catch (error: any) {
    log("property-update", `Failed: ${error.message}`);
  }
});

// Currency Update - Daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await currencyUpdate();
  } catch (error: any) {
    log("currency-update", `Failed: ${error.message}`);
  }
});

// cron.schedule("* * * * *", async () => {
//   try {
//     await partnerAutoDeactivation();
//   } catch (error: any) {
//     log("partner-auto-deactivation", `Failed: ${error.message}`);
//   }
// });

// cron.schedule("0 0 1 * *", async () => {
//   try {
//     await triggerMonthlyMISReportManually();
//   } catch (error: any) {
//     log("triggerMonthlyMISReportManually", `Failed: ${error.message}`);
//   }
// });

log("manager", "Cron manager started");

// Export for manual triggers if needed
export { propertyUpdate, currencyUpdate, dbCleanup };