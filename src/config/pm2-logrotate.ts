// ============================================
// PM2 Logrotate Configuration
// Change settings here - they auto-apply on app start
// ============================================

export const pm2LogrotateConfig = {
  rotateInterval: "0 0 1,15 * *", // 1st and 15th of every month

  // Number of rotated files to keep
  retain: 24,

  // Max file size before rotation (e.g., '10M', '50M', '100M')
  maxSize: "50M",

  // Compress old log files
  compress: true,

  // Date format for rotated file names
  dateFormat: "YYYY-MM-DD",

  // How often to check for rotation (in seconds)
  workerInterval: 30,

  // Rotate pm2-logrotate's own logs
  rotateModule: true,
};
