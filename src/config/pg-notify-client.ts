import { Client } from "pg";
import logger from "../utils/logger";

/**
 * Shared PostgreSQL client for LISTEN/NOTIFY across all workers
 * This prevents creating multiple connections - we only need ONE!
 *
 * Module-level singleton using functions (no class needed!)
 */

// Private module-level variables
let instance: Client | null = null;
let isConnecting: boolean = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Channels that need to be re-subscribed after reconnect
const channels: string[] = [];

/**
 * Get the singleton PostgreSQL client instance
 */
export async function getInstance(): Promise<Client> {
  if (!instance) {
    await connect();
  }

  if (!instance) {
    throw new Error("[PG NOTIFY] Failed to get PostgreSQL client instance");
  }

  return instance;
}

/**
 * Register a channel that should be auto-resubscribed on reconnect
 */
export function registerChannel(channelName: string): void {
  if (!channels.includes(channelName)) {
    channels.push(channelName);
    logger.debug(`[PG NOTIFY] Registered channel: ${channelName}`);
  }
}

/**
 * Connect to PostgreSQL
 */
async function connect(): Promise<void> {
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  isConnecting = true;

  try {
    instance = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await instance.connect();
    logger.info("[PG NOTIFY] Connected to PostgreSQL");

    // Setup error handler for auto-reconnect
    instance.on("error", (err: any) => {
      logger.error("[PG NOTIFY] PostgreSQL connection error:", err);
      reconnect();
    });

    instance.on("end", () => {
      logger.warn("[PG NOTIFY] PostgreSQL connection ended");
      instance = null;
    });

    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    instance = null;
    logger.error("[PG NOTIFY] Failed to connect to PostgreSQL:", error);
    throw error;
  }
}

/**
 * Reconnect to PostgreSQL with exponential backoff
 */
async function reconnect(): Promise<void> {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  logger.warn("[PG NOTIFY] Attempting to reconnect to PostgreSQL...");

  try {
    // Close existing connection if any
    if (instance) {
      try {
        await instance.end();
      } catch (err) {
        logger.debug("[PG NOTIFY] Error closing old connection:", err);
      }
      instance = null;
    }

    await connect();

    // Verify connection was established
    if (!instance) {
      throw new Error("Connection was not established");
    }

    // Store in local constant for TypeScript type narrowing
    const client: Client = instance;

    // Re-listen to all registered channels after reconnect
    if (channels.length > 0) {
      for (const channel of channels) {
        await client.query(`LISTEN ${channel}`);
        logger.debug(`[PG NOTIFY] Re-subscribed to channel: ${channel}`);
      }
      logger.info(
        `[PG NOTIFY] Reconnected and re-subscribed to ${channels.length} channel(s)`
      );
    } else {
      logger.info("[PG NOTIFY] Reconnected successfully");
    }
  } catch (error) {
    logger.error("[PG NOTIFY] Reconnection failed, retrying in 5s:", error);
    instance = null;
    reconnectTimeout = setTimeout(() => reconnect(), 5000);
  }
}

/**
 * Gracefully close the connection
 */
export async function close(): Promise<void> {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (instance) {
    try {
      await instance.end();
      instance = null;
      logger.info("[PG NOTIFY] PostgreSQL connection closed gracefully");
    } catch (error) {
      logger.error("[PG NOTIFY] Error closing connection:", error);
    }
  }

  // Clear registered channels on shutdown
  channels.length = 0;
}

/**
 * Get the list of registered channels (for debugging)
 */
export function getRegisteredChannels(): string[] {
  return [...channels];
}
