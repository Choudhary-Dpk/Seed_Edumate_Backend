import logger from "../utils/logger";
import { startEdumatePGNotifyWorker } from "./edumate-pg-notify.worker";
import { startCommissionPGNotifyWorker } from "./commission-pg-notify.worker";
import { startLoanPGNotifyWorker } from "./loanApplication-pg-notify.worker";
import { startB2BPartnerPGNotifyWorker } from "./partner-pg-notify-worker";
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

    startB2BPartnerPGNotifyWorker().catch((error) => {
      logger.error(
        "[Workers] B2B Partners PG NOTIFY Worker crashed:",
        error
      );
      process.exit(1);
    });

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
