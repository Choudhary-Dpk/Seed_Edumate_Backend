import { PrismaClient } from "@prisma/client";
import { createAuditExtension } from "../middlewares/audit.middleware"; // ← ADD THIS LINE

const basePrisma = new PrismaClient(); // ← RENAME from 'prisma' to 'basePrisma'

const prisma = basePrisma.$extends(createAuditExtension()); // ← ADD THIS LINE

export const checkPrismaConnection = async () => {
  try {
    await basePrisma.$connect(); // ← CHANGE from 'prisma' to 'basePrisma'
    console.log("✅ Prisma connected successfully");
    console.log("✅ Audit tracking enabled"); // ← OPTIONAL: Add this line
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "⚠️ Prisma connection failed (but app will continue):",
        error.message
      );
    } else {
      console.error(
        "⚠️ Prisma connection failed (but app will continue):",
        error
      );
    }
  }
};

export default prisma; // ← This stays the same (exports the extended client)
