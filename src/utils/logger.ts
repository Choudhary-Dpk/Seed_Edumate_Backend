import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config/config";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = "\n" + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Daily rotate file transport for all logs
const fileRotateTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles,
  maxSize: config.logging.maxSize,
  format: logFormat,
  level: config.logging.level,
});

// Daily rotate file transport for error logs only
const errorFileRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: config.logging.maxFiles,
  maxSize: config.logging.maxSize,
  format: logFormat,
});

// Exception handler
const exceptionHandler = new DailyRotateFile({
  filename: "logs/exceptions-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles,
  maxSize: config.logging.maxSize,
  format: logFormat,
});

// Rejection handler
const rejectionHandler = new DailyRotateFile({
  filename: "logs/rejections-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: config.logging.maxFiles,
  maxSize: config.logging.maxSize,
  format: logFormat,
});

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: "hubspot-integration" },
  transports: [fileRotateTransport, errorFileRotateTransport],
  exceptionHandlers: [exceptionHandler],
  rejectionHandlers: [rejectionHandler],
  exitOnError: false,
});

// Console transport for development
if (config.server.environment === "development") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
}

// Handle PM2 cluster mode
if (process.env.NODE_ENV === "production") {
  logger.info("Logger initialized for production with PM2 compatibility", {
    level: config.logging.level,
    environment: config.server.environment,
  });
}

// Create logger interface for better TypeScript support
export interface LoggerInterface {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  verbose(message: string, meta?: any): void;
}

// Export typed logger
export default logger as LoggerInterface;
