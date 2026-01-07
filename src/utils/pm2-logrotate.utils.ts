import { exec } from "child_process";
import { pm2LogrotateConfig } from "../config/pm2-logrotate";
import { logger } from "./logger";

// ============================================
// Auto-apply PM2 Logrotate settings from config
// Called once on app startup
// ============================================

let isConfigured = false;

export function setupPm2Logrotate(): void {
  // Only run once per app lifecycle
  if (isConfigured) return;

  // Skip if not running under PM2
  if (!process.env.PM2_HOME) {
    logger.info("Skipping pm2-logrotate setup (not running under PM2)", {
      task: "pm2-logrotate",
    });
    return;
  }

  isConfigured = true;

  // Run async to not block app startup
  applyConfig().catch((err) => {
    logger.warn("Could not configure pm2-logrotate", {
      task: "pm2-logrotate",
      error: err.message,
    });
  });
}

async function applyConfig(): Promise<void> {
  logger.info("Applying pm2-logrotate configuration...", {
    task: "pm2-logrotate",
  });

  const config = pm2LogrotateConfig;

  const settings = [
    ["rotateInterval", `'${config.rotateInterval}'`],
    ["retain", config.retain],
    ["max_size", config.maxSize],
    ["compress", config.compress],
    ["dateFormat", config.dateFormat],
    ["workerInterval", config.workerInterval],
    ["rotateModule", config.rotateModule],
  ];

  for (const [key, value] of settings) {
    await runCommand(`pm2 set pm2-logrotate:${key} ${value}`);
  }

  logger.info("pm2-logrotate configuration applied", {
    task: "pm2-logrotate",
    rotateInterval: config.rotateInterval,
    retain: config.retain,
    maxSize: config.maxSize,
    compress: config.compress,
  });
}

function runCommand(command: string): Promise<void> {
  return new Promise((resolve) => {
    exec(
      command,
      {
        windowsHide: true, // Hide terminal window on Windows
        shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
      },
      (error) => {
        // Resolve even on error - don't fail app startup
        resolve();
      }
    );
  });
}
