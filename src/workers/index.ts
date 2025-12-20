import { startHubSpotSyncWorker } from "./hubspot-sync.worker";
import { startLoanHubSpotSyncWorker } from "./hubspot-loan-sync.worker"; // 🆕 ADD THIS LINE
import logger from "../utils/logger";
import { startCommissionSettlementsHubSpotSyncWorker } from "./hubspot-commission-settlement-sync.worker";
import { startEdumatePGNotifyWorker } from "./edumate-pg-notify.worker";
import { startCommissionPGNotifyWorker } from "./commission-pg-notify.worker";
import { startLoanPGNotifyWorker } from "./loanApplication-pg-notify.worker";
/**
 * Start all background workers
 */
export async function startWorkers() {
  try {
    logger.info("Initializing background workers...");

    startEdumatePGNotifyWorker().catch((error) => {
      logger.error("[Workers] Edumate PG NOTIFY Worker crashed:", error);
      process.exit(1);
    });

    startCommissionPGNotifyWorker().catch((error) => {
      logger.error(
        "[Workers] Commission Settlement PG NOTIFY Worker crashed:",
        error
      );
      process.exit(1);
    });

    startLoanPGNotifyWorker().catch((error) => {
      logger.error(
        "[Workers] Loan Application PG NOTIFY Worker crashed:",
        error
      );
      process.exit(1);
    });

    // startHubSpotSyncWorker().catch((error) => {
    //   logger.error("Contact Sync Worker crashed:", error);
    //   process.exit(1);
    // });

    // startLoanHubSpotSyncWorker().catch((error) => {
    //   logger.error("Loan Sync Worker crashed:", error);
    //   process.exit(1);
    // });

    // startCommissionSettlementsHubSpotSyncWorker().catch((error) => {
    //   logger.error("Commission Settlment Sync Worker crashed:", error);
    //   process.exit(1);
    // });

    logger.info("All workers started successfully");
  } catch (error) {
    logger.error("Failed to start workers:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down workers gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down workers gracefully...");
  process.exit(0);
});
