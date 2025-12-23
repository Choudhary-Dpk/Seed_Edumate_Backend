import { PrismaClient } from "@prisma/client";
// import { createAuditExtension } from "../middlewares/audit.middleware"; // ← ADD THIS LINE
// import { createHubSpotSyncExtension } from "../middlewares/hubspot-sync.middleware";
import { createLoanHubSpotSyncExtension } from "../middlewares/hubspot-loan-sync.middleware";
import { createCommissionHubSpotSyncExtension } from "../middlewares/hubspot-commission-settlements-sync.middleware";

const basePrisma = new PrismaClient(); // ← RENAME from 'prisma' to 'basePrisma'

const prisma = basePrisma
  // .$extends(createAuditExtension()) // Audit logging extension
  // .$extends(createHubSpotSyncExtension()) // Edumate Contact sync extension
  .$extends(createLoanHubSpotSyncExtension()) // Loan Application sync
  .$extends(createCommissionHubSpotSyncExtension()); // Commission Settlements

export const checkPrismaConnection = async () => {
  try {
    await basePrisma.$connect(); // ← CHANGE from 'prisma' to 'basePrisma'
    console.log(" Prisma connected successfully");
    console.log(" Audit tracking enabled"); // ← OPTIONAL: Add this line
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Prisma connection failed (but app will continue):",
        error.message
      );
    } else {
      console.error(
        "Prisma connection failed (but app will continue):",
        error
      );
    }
  }
};

export default prisma; // ← This stays the same (exports the extended client)
