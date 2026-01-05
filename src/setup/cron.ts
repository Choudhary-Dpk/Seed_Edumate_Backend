import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';
import { updatePropertySync } from '../scripts/sync_loan_product_options';
import { updateExchangeRates } from '../scripts/curreny_update';

dotenv.config();

// Create logs directory
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

// Simple logger with 10-day rotation
function log(taskName: string, message: string): void {
  const now = new Date();
  const day = now.getDate();
  const period = day <= 10 ? '01-10' : day <= 20 ? '11-20' : '21-end';
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const logFile = `./logs/${taskName}_${date}_${period}.log`;
  
  const timestamp = now.toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  console.log(`[${taskName}] ${message}`);
}

// ==================================================
// YOUR TASKS
// ==================================================

// Task 1: HubSpot Property Update
async function propertyUpdate(): Promise<void> {
  log('property-update', 'Starting...');
  
  try {
    await updatePropertySync();
    log('property-update', 'Done!');
  } catch (error: any) {
    log('property-update', `Error: ${error.message}`);
    throw error;
  }
}

// Task 2: Currency Update
async function currencyUpdate(): Promise<void> {
  log('currency-update', 'Starting...');
  
  try {
    await updateExchangeRates();
    log('currency-update', 'Done!');
  } catch (error: any) {
    log('currency-update', `Error: ${error.message}`);
    throw error;
  }
}

// Task 3: Database Cleanup
async function dbCleanup(): Promise<void> {
  log('db-cleanup', 'Starting...');
  
  // Your cleanup code here
  
  log('db-cleanup', 'Done!');
}

// ==================================================
// SCHEDULES
// ==================================================

// Property Update - Daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await propertyUpdate();
  } catch (error: any) {
    log('property-update', `Failed: ${error.message}`);
  }
});

// Currency Update - Daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await currencyUpdate();
  } catch (error: any) {
    log('currency-update', `Failed: ${error.message}`);
  }
});

// Database Cleanup - Every Sunday at 3 AM
cron.schedule('0 3 * * 0', async () => {
  try {
    await dbCleanup();
  } catch (error: any) {
    log('db-cleanup', `Failed: ${error.message}`);
  }
});

// ==================================================
// STARTUP
// ==================================================

console.log('✓ Cron Manager Started');
console.log('✓ Property Update: Daily at 2 AM');
console.log('✓ Currency Update: Daily at midnight');
console.log('✓ DB Cleanup: Sunday at 3 AM');
console.log('✓ Logs: ./logs/');

log('manager', 'Cron manager started');

// Export for manual triggers if needed
export { propertyUpdate, currencyUpdate, dbCleanup };