import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config/config";

// ============================================
// CUSTOM LOG FORMATS
// ============================================

// JSON format for file logs (searchable, parseable)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Beautiful console format for PM2/terminal viewing
const consoleFormat = winston.format.printf((info) => {
  const {
    timestamp,
    level,
    message,
    task,
    action,
    service,
    duration,
    ...meta
  } = info;

  // Level styling
  const levelUpper = level.toUpperCase().padEnd(5);

  // Build prefix parts
  const parts: string[] = [];

  // Add service name
  if (service) {
    parts.push(`[${service}]`);
  }

  // Add task name (e.g., property-update, currency-update)
  if (task) {
    parts.push(`[${task}]`);
  }

  // Add action (e.g., FETCH, SYNC, CREATE, UPDATE, DELETE)
  if (action) {
    parts.push(`<${action}>`);
  }

  const prefix = parts.join(" ");

  // Add duration if present
  let durationStr = "";
  if (duration) {
    durationStr = ` (${duration})`;
  }

  // Add metadata if present
  let metaStr = "";
  const filteredMeta = { ...meta };
  // Remove winston internal fields
  delete filteredMeta.splat;

  if (Object.keys(filteredMeta).length > 0) {
    metaStr = "\n    → " + JSON.stringify(filteredMeta);
  }

  return `${timestamp} [${levelUpper}] ${prefix} ${message}${durationStr}${metaStr}`;
});

const consoleFormatCombined = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  consoleFormat
);

// ============================================
// FILE TRANSPORTS (Daily Rotation)
// ============================================

// All logs - daily rotation
const fileRotateTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles || "14d",
  maxSize: config.logging.maxSize || "20m",
  format: fileFormat,
  level: config.logging.level || "info",
});

// Error logs only - daily rotation
const errorFileRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: config.logging.maxFiles || "14d",
  maxSize: config.logging.maxSize || "20m",
  format: fileFormat,
});

// Exception handler
const exceptionHandler = new DailyRotateFile({
  filename: "logs/exceptions-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles || "14d",
  maxSize: config.logging.maxSize || "20m",
  format: fileFormat,
});

// Rejection handler
const rejectionHandler = new DailyRotateFile({
  filename: "logs/rejections-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles || "14d",
  maxSize: config.logging.maxSize || "20m",
  format: fileFormat,
});

// Console transport for PM2 visibility
const consoleTransport = new winston.transports.Console({
  format: consoleFormatCombined,
  level: config.server.environment === "development" ? "debug" : "info",
});

// ============================================
// MAIN LOGGER
// ============================================

export const logger = winston.createLogger({
  level: config.logging.level || "info",
  format: fileFormat,
  defaultMeta: { service: "edumate-api" },
  transports: [fileRotateTransport, errorFileRotateTransport, consoleTransport],
  exceptionHandlers: [exceptionHandler],
  rejectionHandlers: [rejectionHandler],
  exitOnError: false,
});

// ============================================
// TASK-SPECIFIC LOGGER FACTORY
// ============================================

/**
 * Creates a logger for a specific task/module
 * Usage: const taskLogger = createTaskLogger('property-update');
 *        taskLogger.info('Fetching products', { action: 'FETCH', count: 10 });
 */
export function createTaskLogger(taskName: string) {
  return {
    info: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, ...meta });
    },
    error: (message: string, meta?: Record<string, any>) => {
      logger.error(message, { task: taskName, ...meta });
    },
    warn: (message: string, meta?: Record<string, any>) => {
      logger.warn(message, { task: taskName, ...meta });
    },
    debug: (message: string, meta?: Record<string, any>) => {
      logger.debug(message, { task: taskName, ...meta });
    },

    // Convenience methods for common actions
    start: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "START", ...meta });
    },
    complete: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "COMPLETE", ...meta });
    },
    fetch: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "FETCH", ...meta });
    },
    create: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "CREATE", ...meta });
    },
    update: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "UPDATE", ...meta });
    },
    delete: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "DELETE", ...meta });
    },
    sync: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { task: taskName, action: "SYNC", ...meta });
    },
    fail: (message: string, meta?: Record<string, any>) => {
      logger.error(message, { task: taskName, action: "FAIL", ...meta });
    },
  };
}

// ============================================
// PRE-CONFIGURED TASK LOGGERS
// ============================================

export const apiLogger = createTaskLogger("api");
export const cronLogger = createTaskLogger("cron");
export const dbLogger = createTaskLogger("database");
export const hubspotLogger = createTaskLogger("hubspot");
export const authLogger = createTaskLogger("auth");

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

export interface LoggerInterface {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  verbose(message: string, meta?: any): void;
}

export default logger;
