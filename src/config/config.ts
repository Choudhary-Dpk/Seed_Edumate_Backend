// src/config/config.ts
import dotenv from 'dotenv';
import { HUBSPOT_B2B_PARTNERS_OBJECT_TYPE } from "../setup/secrets";

dotenv.config();

interface ServerConfig {
  port: number;
  environment: string;
}

interface HubSpotConfig {
  accessToken: string;
  baseUrl: string;
  customObjects: {
    edumateContact: string;
    b2bPartners: string;
  };
}

interface LoggingConfig {
  level: string;
  maxFiles: string;
  maxSize: string;
}

interface edumateConfig {
  logo: string;
}

interface AppConfig {
  server: ServerConfig;
  hubspot: HubSpotConfig;
  logging: LoggingConfig;
  edumate: edumateConfig;
}

export const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    environment: process.env.NODE_ENV || "development",
  },
  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN || "",
    baseUrl: process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com",
    customObjects: {
      edumateContact:
        process.env.HUBSPOT_EDUMATE_CONTACT_OBJECT_TYPE || "2-169456956",
      b2bPartners: HUBSPOT_B2B_PARTNERS_OBJECT_TYPE || "2-46227624",
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    maxFiles: process.env.LOG_MAX_FILES || "14d",
    maxSize: process.env.LOG_MAX_SIZE || "20m",
  },
  edumate: {
    logo:
      process.env.EDUMATE_LOGO ||
      "https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png",
  },
};

// Validate required environment variables
const requiredEnvVars: string[] = ['HUBSPOT_ACCESS_TOKEN'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

// Export individual config sections for easier access
export const serverConfig = config.server;
export const hubspotConfig = config.hubspot;
export const loggingConfig = config.logging;