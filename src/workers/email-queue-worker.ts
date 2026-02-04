import * as cron from 'node-cron';
import logger from '../utils/logger';
import { getQueueStats, processEmailQueue } from '../services/email-queue.service';

// Configuration
const CRON_SCHEDULE = '* * * * *'; // Every minute
const BATCH_SIZE = 50; // Process 50 emails per run
const ENABLE_WORKER = process.env.ENABLE_EMAIL_WORKER !== 'false'; // Default: enabled

// Worker state
let isRunning = false;
let cronTask: cron.ScheduledTask | null = null;

/**
 * Process email queue batch
 * Main worker function
 */
async function processBatch(): Promise<void> {
  // Prevent concurrent runs
  if (isRunning) {
    logger.warn('Email queue worker already running, skipping this cycle');
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    // Get queue stats before processing
    const statsBefore = await getQueueStats();
    
    logger.info('Email queue worker started', {
      pending: statsBefore.pending,
      processing: statsBefore.processing,
      deadLetter: statsBefore.deadLetter
    });

    // Process batch
    const result = await processEmailQueue(BATCH_SIZE);

    // Get queue stats after processing
    const statsAfter = await getQueueStats();
    
    const duration = Date.now() - startTime;

    logger.info('Email queue worker completed', {
      duration: `${duration}ms`,
      processed: result.processed,
      failed: result.failed,
      skipped: result.skipped,
      pendingRemaining: statsAfter.pending
    });

  } catch (error: any) {
    logger.error('Email queue worker error', {
      error: error.message,
      stack: error.stack
    });
  } finally {
    isRunning = false;
  }
}

/**
 * Start the email queue worker
 * Called on application startup
 */
export function startEmailQueueWorker(): void {
  if (!ENABLE_WORKER) {
    logger.info('Email queue worker is disabled');
    return;
  }

  if (cronTask) {
    logger.warn('Email queue worker is already running');
    return;
  }

  // Schedule cron job
  cronTask = cron.schedule(CRON_SCHEDULE, async () => {
    await processBatch();
  });

  logger.info('Email queue worker started', {
    schedule: CRON_SCHEDULE,
    batchSize: BATCH_SIZE
  });

  // Process immediately on startup (don't wait for first cron tick)
  setTimeout(() => {
    processBatch().catch(error => {
      logger.error('Initial email queue processing failed', { error });
    });
  }, 5000); // Wait 5 seconds after startup
}

/**
 * Stop the email queue worker
 * Called on application shutdown
 */
export function stopEmailQueueWorker(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('Email queue worker stopped');
  }
}

/**
 * Get worker status
 * For health checks and monitoring
 */
export function getWorkerStatus(): {
  enabled: boolean;
  running: boolean;
  schedule: string;
} {
  return {
    enabled: ENABLE_WORKER,
    running: cronTask !== null && isRunning,
    schedule: CRON_SCHEDULE
  };
}

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, stopping email queue worker');
  stopEmailQueueWorker();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, stopping email queue worker');
  stopEmailQueueWorker();
});