// src/services/enumMapping.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface EnumTranslation {
  enumName: string;
  sourceValue: any;
}

class EnumMappingService {
  /**
   * Translate a single value - accepts BOTH source and HubSpot values
   */
  async translateValue(
    enumName: string,
    sourceValue: any
  ): Promise<string | null> {
    try {
      if (!sourceValue) return null;

      // Query for BOTH sourceValue and hubspotValue match
      const enumValue = await prisma.enumValue.findFirst({
        where: {
          enumMapping: {
            enumName: enumName,
            isActive: true,
          },
          OR: [
            { sourceValue: String(sourceValue) },      // Match source value
            { hubspotValue: String(sourceValue) },     // Match HubSpot value
          ],
          isActive: true,
        },
        select: {
          hubspotValue: true,
        },
      });

      if (!enumValue) {
        console.warn(
          `⚠️ No mapping found for ${enumName}: "${sourceValue}"`
        );
        
        return null;
      }

      return enumValue.hubspotValue;
    } catch (error) {
      console.error(
        `Error translating enum ${enumName}:${sourceValue}`,
        error
      );
      return null;
    }
  }

  /**
   * Translate multiple values in ONE database query
   * Accepts BOTH source values and HubSpot values
   */
  async translateBatch(
    translations: EnumTranslation[]
  ): Promise<Record<string, string | null>> {
    try {
      if (translations.length === 0) return {};

      const enumNames = [...new Set(translations.map((t) => t.enumName))];
      const values = translations.map((t) => String(t.sourceValue));

      // Query for BOTH sourceValue and hubspotValue matches
      const enumValues = await prisma.enumValue.findMany({
        where: {
          enumMapping: {
            enumName: { in: enumNames },
            isActive: true,
          },
          OR: [
            { sourceValue: { in: values } },      // Match source values
            { hubspotValue: { in: values } },     // Match HubSpot values
          ],
          isActive: true,
        },
        include: {
          enumMapping: {
            select: {
              enumName: true,
            },
          },
        },
      });

      // Create lookup map for BOTH sourceValue and hubspotValue
      const lookupMap = new Map<string, string>();
      
      for (const ev of enumValues) {
        // Map sourceValue → hubspotValue (e.g., "private_bank" → "Private Bank")
        const sourceKey = `${ev.enumMapping.enumName}:${ev.sourceValue}`;
        lookupMap.set(sourceKey, ev.hubspotValue);
        
        // Map hubspotValue → hubspotValue (e.g., "Private Bank" → "Private Bank")
        const hubspotKey = `${ev.enumMapping.enumName}:${ev.hubspotValue}`;
        lookupMap.set(hubspotKey, ev.hubspotValue);
      }

      // Build result
      const result: Record<string, string | null> = {};
      
      for (const translation of translations) {
        const key = `${translation.enumName}:${translation.sourceValue}`;
        const hubspotValue = lookupMap.get(key) || null;

        if (!hubspotValue) {
          console.log(
            `No mapping found for ${translation.enumName}: "${translation.sourceValue}"`
          );
          
        }

        result[key] = hubspotValue;
      }

      return result;
    } catch (error) {
      console.error("Error in batch translation:", error);
      return {};
    }
  }


  /**
   * Get all values for a specific enum (for dropdowns, etc.)
   */
  async getEnumValues(enumName: string) {
    try {
      const values = await prisma.enumValue.findMany({
        where: {
          enumMapping: {
            enumName: enumName,
            isActive: true,
          },
          isActive: true,
        },
        select: {
          sourceValue: true,
          hubspotValue: true,
          displayLabel: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

      return values;
    } catch (error) {
      console.error(`Error getting enum values for ${enumName}:`, error);
      return [];
    }
  }
}

export const enumMappingService = new EnumMappingService();