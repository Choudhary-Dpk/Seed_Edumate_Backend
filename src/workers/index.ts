import { startHubSpotSyncWorker } from './hubspot-sync.worker';
import { startLoanHubSpotSyncWorker } from './hubspot-loan-sync.worker'; // 🆕 ADD THIS LINE
import logger from '../utils/logger';

/**
 * Start all background workers
 */
export async function startWorkers() {
  try {
    logger.info("🔧 Initializing background workers...");
    
    // Start Contact sync worker
    startHubSpotSyncWorker().catch((error) => {
      logger.error("Contact Sync Worker crashed:", error);
      process.exit(1);
    });

    // 🆕 ADD THIS BLOCK - Start Loan sync worker
    startLoanHubSpotSyncWorker().catch((error) => {
      logger.error("Loan Sync Worker crashed:", error);
      process.exit(1);
    });

    logger.info("✅ All workers started successfully");
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