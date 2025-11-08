import { PrismaClient } from "@prisma/client";
import currencyData from "../src/seeders/currencyConfigs.json";
import rolesData from "../src/seeders/b2bPartnersRoles.json";
import adminRolesData from "../src/seeders/adminRoles.json";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

interface CurrencyData {
  code: string;
  symbol: string;
  iso_code: string;
  countries: string[];
  name: string;
  position: string;
  thousands_separator: string;
  decimal_separator: string;
  min_loan_amount: number;
  max_loan_amount: number;
  formatting?: {
    k_format_decimals: number;
    m_format_decimals: number;
    k_threshold: number;
    m_threshold: number;
  };
  quick_amounts: Array<{ amount: number; label: string }>;
  large_amount_units: {
    [key: string]: { divisor: number; suffix: string } | undefined;
  };
  is_active: boolean;
}

interface RoleData {
  role: string;
  display_name: string;
  description: string;
}

interface AdminRoleData {
  role: string;
  display_name: string;
  description: string;
}

const seedAdminRoles = async () => {
  console.log("Starting admin roles seeding...");
  let successCount = 0;

  for (const roleData of adminRolesData as AdminRoleData[]) {
    try {
      await prisma.adminRoles.upsert({
        where: { role: roleData.role },
        update: {
          display_name: roleData.display_name,
          description: roleData.description,
        },
        create: {
          role: roleData.role,
          display_name: roleData.display_name,
          description: roleData.description,
        },
      });
      successCount++;
      console.log(
        `✅ Seeded admin role: ${roleData.role} - ${roleData.display_name}`
      );
    } catch (error) {
      console.error(
        `❌ Error seeding admin role ${roleData.role}:`,
        (error as Error).message
      );
    }
  }

  console.log(
    `\n📊 Admin Roles Seeding Summary: ${successCount}/${adminRolesData.length}\n`
  );
};

const seedAdminUser = async () => {
  console.log("Starting admin user seeding...");
  try {
    const adminEmail = "edumate@yopmail.com";
    const hashedPassword = await hashPassword("Admin@1234");

    const adminUser = await prisma.adminUsers.upsert({
      where: { email: adminEmail },
      update: {
        full_name: "Edumate",
        password_hash: hashedPassword,
        is_active: true,
      },
      create: {
        email: adminEmail,
        full_name: "Edumate",
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    console.log(
      `✅ Admin user created: ${adminUser.email} (${adminUser.full_name})`
    );

    // Fetch super_admin role
    const superAdminRole = await prisma.adminRoles.findUnique({
      where: { role: "Admin" },
    });

    if (!superAdminRole) {
      console.error(
        "❌ Super admin role not found. Ensure roles are seeded first."
      );
      return;
    }

    // Assign super_admin role
    await prisma.adminUserRoles.upsert({
      where: {
        user_id_role_id: {
          user_id: adminUser.id,
          role_id: superAdminRole.id,
        },
      },
      update: {},
      create: {
        user_id: adminUser.id,
        role_id: superAdminRole.id,
      },
    });

    console.log(`✅ Assigned super_admin role to ${adminUser.email}\n`);
  } catch (error) {
    console.error(`❌ Error seeding admin user:`, (error as Error).message);
  }
};

const seedCurrencies = async () => {
  console.log("Starting currency seeding...");
  let successCount = 0;
  let errorCount = 0;

  for (const currency of currencyData as CurrencyData[]) {
    try {
      await prisma.currencyConfigs.upsert({
        where: { code: currency.code },
        update: {
          symbol: currency.symbol,
          name: currency.name,
          iso_code: currency.iso_code,
          countries: currency.countries,
          position: currency.position,
          thousands_separator: currency.thousands_separator,
          decimal_separator: currency.decimal_separator,
          min_loan_amount: currency.min_loan_amount,
          max_loan_amount: currency.max_loan_amount,
          formatting: currency.formatting || {},
          quick_amounts: currency.quick_amounts,
          large_amount_units: currency.large_amount_units,
          is_active: currency.is_active,
        },
        create: {
          code: currency.code,
          symbol: currency.symbol,
          name: currency.name,
          iso_code: currency.iso_code,
          countries: currency.countries,
          position: currency.position,
          thousands_separator: currency.thousands_separator,
          decimal_separator: currency.decimal_separator,
          min_loan_amount: currency.min_loan_amount,
          max_loan_amount: currency.max_loan_amount,
          formatting: currency.formatting || {},
          quick_amounts: currency.quick_amounts,
          large_amount_units: currency.large_amount_units,
          is_active: currency.is_active,
        },
      });
      successCount++;
      console.log(`✅ Seeded ${currency.code} - ${currency.name}`);
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error seeding ${currency.code}:`,
        (error as Error).message
      );
    }
  }

  console.log("\n📊 Currency Seeding Summary:");
  console.log(`   Total currencies: ${currencyData.length}`);
  console.log(`   Successfully seeded: ${successCount}`);
  console.log(`   Errors: ${errorCount}\n`);
};

const seedRoles = async () => {
  console.log("Starting B2B partner roles seeding...");
  let successCount = 0;
  let errorCount = 0;

  for (const roleData of rolesData as RoleData[]) {
    try {
      await prisma.b2BPartnersRoles.upsert({
        where: { role: roleData.role },
        update: {
          display_name: roleData.display_name,
          description: roleData.description,
        },
        create: {
          role: roleData.role,
          display_name: roleData.display_name,
          description: roleData.description,
        },
      });
      successCount++;
      console.log(
        `✅ Seeded B2B role: ${roleData.role} - ${roleData.display_name}`
      );
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error seeding B2B role ${roleData.role}:`,
        (error as Error).message
      );
    }
  }

  console.log("\n📊 B2B Partner Roles Seeding Summary:");
  console.log(`   Total roles: ${rolesData.length}`);
  console.log(`   Successfully seeded: ${successCount}`);
  console.log(`   Errors: ${errorCount}\n`);
};

async function seedLenderEnumMappings() {
  console.log("Starting Lender Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-46227053";

  try {
    console.log("\n Seeding Lender Category...");
    const lenderCategoryEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "lenderCategory",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lender_category",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "lenderCategory",
        hubspotProperty: "lender_category",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of lender based on geographic focus",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: lenderCategoryEnum.id,
          sourceValue: "domestic",
          hubspotValue: "Domestic",
          displayLabel: "Domestic",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: lenderCategoryEnum.id,
          sourceValue: "international",
          hubspotValue: "International",
          displayLabel: "International",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: lenderCategoryEnum.id,
          sourceValue: "both",
          hubspotValue: "Both",
          displayLabel: "Both (Domestic & International)",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Lender Category seeded (3 values)");

    console.log("\n Seeding Lender Type...");
    const lenderTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "lenderType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lender_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "lenderType",
        hubspotProperty: "lender_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of financial institution",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "public_bank",
          hubspotValue: "Public Bank",
          displayLabel: "Public Bank",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "private_bank",
          hubspotValue: "Private Bank",
          displayLabel: "Private Bank",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "nbfc",
          hubspotValue: "NBFC",
          displayLabel: "NBFC (Non-Banking Financial Company)",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "credit_union",
          hubspotValue: "Credit Union",
          displayLabel: "Credit Union",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "international_lender",
          hubspotValue: "International Lender",
          displayLabel: "International Lender",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: lenderTypeEnum.id,
          sourceValue: "fintech",
          hubspotValue: "Fintech",
          displayLabel: "Fintech",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Lender Type seeded (6 values)");

    console.log("\n Seeding Co-signer Requirements...");
    const coSignerEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coSignerRequirement",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_signer_requirements",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coSignerRequirement",
        hubspotProperty: "co_signer_requirements",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Co-signer requirement for loan applications",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coSignerEnum.id,
          sourceValue: "always_required",
          hubspotValue: "Always Required",
          displayLabel: "Always Required",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coSignerEnum.id,
          sourceValue: "sometimes_required",
          hubspotValue: "Sometimes Required",
          displayLabel: "Sometimes Required",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coSignerEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Co-signer Requirements seeded (3 values)");

    console.log("\n Seeding Collateral Requirements...");
    const collateralEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateralType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_requirements",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateralType",
        hubspotProperty: "collateral_requirements",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Types of collateral accepted by lender",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "property",
          hubspotValue: "Property",
          displayLabel: "Property",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "fixed_deposits",
          hubspotValue: "Fixed Deposits",
          displayLabel: "Fixed Deposits",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "lic_policies",
          hubspotValue: "LIC Policies",
          displayLabel: "LIC Policies",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "securities",
          hubspotValue: "Securities",
          displayLabel: "Securities",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "guarantor_only",
          hubspotValue: "Guarantor Only",
          displayLabel: "Guarantor Only",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "no_collateral",
          hubspotValue: "No Collateral",
          displayLabel: "No Collateral",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: collateralEnum.id,
          sourceValue: "na_plot",
          hubspotValue: "NA Plot",
          displayLabel: "NA Plot",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Collateral Requirements seeded (7 values)");

    console.log("\n Seeding Supported Course Types...");
    const courseTypesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "supportedCourseTypes",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "supported_course_types",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "supportedCourseTypes",
        hubspotProperty: "supported_course_types",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Types of educational programs supported",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "undergraduate",
          hubspotValue: "Undergraduate",
          displayLabel: "Undergraduate",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "graduate",
          hubspotValue: "Graduate",
          displayLabel: "Graduate",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "phd",
          hubspotValue: "PhD",
          displayLabel: "PhD",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "diploma",
          hubspotValue: "Diploma",
          displayLabel: "Diploma",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "certificate",
          hubspotValue: "Certificate",
          displayLabel: "Certificate",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "professional",
          hubspotValue: "Professional",
          displayLabel: "Professional",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: courseTypesEnum.id,
          sourceValue: "technical",
          hubspotValue: "Technical",
          displayLabel: "Technical",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Supported Course Types seeded (7 values)");

    // ===== 6. SUPPORTED DESTINATIONS =====
    console.log("\n Seeding Supported Destinations...");
    const destinationsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "supportedDestinations",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "supported_destinations",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "supportedDestinations",
        hubspotProperty: "supported_destinations",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Countries/regions where loans are supported",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "us",
          hubspotValue: "US",
          displayLabel: "United States",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "uk",
          hubspotValue: "UK",
          displayLabel: "United Kingdom",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "canada",
          hubspotValue: "Canada",
          displayLabel: "Canada",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "australia",
          hubspotValue: "Australia",
          displayLabel: "Australia",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "germany",
          hubspotValue: "Germany",
          displayLabel: "Germany",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "france",
          hubspotValue: "France",
          displayLabel: "France",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "singapore",
          hubspotValue: "Singapore",
          displayLabel: "Singapore",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "italy",
          hubspotValue: "Italy",
          displayLabel: "Italy",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "uae",
          hubspotValue: "UAE",
          displayLabel: "United Arab Emirates",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: destinationsEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 10,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Supported Destinations seeded (10 values)");

    // ===== 7. API CONNECTIVITY STATUS =====
    console.log("\n📦 Seeding API Connectivity Status...");
    const apiStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "apiConnectivityStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "api_connectivity_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "apiConnectivityStatus",
        hubspotProperty: "api_connectivity_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of API integration with lender",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: apiStatusEnum.id,
          sourceValue: "not_connected",
          hubspotValue: "Not Connected",
          displayLabel: "Not Connected",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: apiStatusEnum.id,
          sourceValue: "in_progress",
          hubspotValue: "In Progress",
          displayLabel: "In Progress",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: apiStatusEnum.id,
          sourceValue: "connected",
          hubspotValue: "Connected",
          displayLabel: "Connected",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: apiStatusEnum.id,
          sourceValue: "issues",
          hubspotValue: "Issues",
          displayLabel: "Issues",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("API Connectivity Status seeded (4 values)");

    console.log("\n Seeding Digital Integration Level...");
    const integrationLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "integrationLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "digital_integration_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "integrationLevel",
        hubspotProperty: "digital_integration_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Level of digital integration with lender",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: integrationLevelEnum.id,
          sourceValue: "basic",
          hubspotValue: "Basic",
          displayLabel: "Basic",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: integrationLevelEnum.id,
          sourceValue: "intermediate",
          hubspotValue: "Intermediate",
          displayLabel: "Intermediate",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: integrationLevelEnum.id,
          sourceValue: "advanced",
          hubspotValue: "Advanced",
          displayLabel: "Advanced",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: integrationLevelEnum.id,
          sourceValue: "full_api",
          hubspotValue: "Full API",
          displayLabel: "Full API",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Digital Integration Level seeded (4 values)");

    console.log("\n Seeding Holiday Processing...");
    const holidayProcessingEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "holidayProcessing",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "holiday_processing",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "holidayProcessing",
        hubspotProperty: "holiday_processing",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether lender processes applications during holidays",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: holidayProcessingEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: holidayProcessingEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: holidayProcessingEnum.id,
          sourceValue: "limited",
          hubspotValue: "Limited",
          displayLabel: "Limited",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("\n Holiday Processing seeded (3 values)");

    // ===== 10. REPAYMENT OPTIONS =====
    console.log("\n Seeding Repayment Options...");
    const repaymentOptionsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "repaymentOptions",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "repayment_options",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "repaymentOptions",
        hubspotProperty: "repayment_options",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Available loan repayment options",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: repaymentOptionsEnum.id,
          sourceValue: "emi",
          hubspotValue: "EMI",
          displayLabel: "EMI (Equated Monthly Installment)",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: repaymentOptionsEnum.id,
          sourceValue: "simple_int",
          hubspotValue: "Simple Int",
          displayLabel: "Simple Interest",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: repaymentOptionsEnum.id,
          sourceValue: "partial_int",
          hubspotValue: "Partial Int",
          displayLabel: "Partial Interest",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: repaymentOptionsEnum.id,
          sourceValue: "complete_morat",
          hubspotValue: "Complete Morat",
          displayLabel: "Complete Moratorium",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Repayment Options seeded (4 values)");

    // ===== 11. PARTNERSHIP STATUS =====
    console.log("\n Seeding Partnership Status...");
    const partnershipStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnershipStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partnership_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnershipStatus",
        hubspotProperty: "partnership_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current status of partnership with lender",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "suspended",
          hubspotValue: "Suspended",
          displayLabel: "Suspended",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "terminated",
          hubspotValue: "Terminated",
          displayLabel: "Terminated",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Partnership Status seeded (6 values)");

    console.log("\n Seeding Payout Terms...");
    const payoutTermsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "payoutTerms",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payout_terms",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "payoutTerms",
        hubspotProperty: "payout_terms",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Commission payout terms",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: payoutTermsEnum.id,
          sourceValue: "net_30",
          hubspotValue: "Net 30",
          displayLabel: "Net 30 Days",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: payoutTermsEnum.id,
          sourceValue: "net_45",
          hubspotValue: "Net 45",
          displayLabel: "Net 45 Days",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: payoutTermsEnum.id,
          sourceValue: "net_60",
          hubspotValue: "Net 60",
          displayLabel: "Net 60 Days",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: payoutTermsEnum.id,
          sourceValue: "custom",
          hubspotValue: "Custom",
          displayLabel: "Custom Terms",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payout Terms seeded (4 values)");

    console.log("\n Seeding Data Source...");
    const dataSourceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "dataSource",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "dataSource",
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Source of lender data entry",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "manual_entry",
          hubspotValue: "Manual Entry",
          displayLabel: "Manual Entry",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "import",
          hubspotValue: "Import",
          displayLabel: "Import",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "api_integration",
          hubspotValue: "API Integration",
          displayLabel: "API Integration",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Data Source seeded (3 values)");

    console.log("\n Seeding Lender Record Status...");
    const recordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "lenderRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lender_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "lenderRecordStatus",
        hubspotProperty: "lender_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of lender record in system",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: recordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: recordStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: recordStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: recordStatusEnum.id,
          sourceValue: "suspended",
          hubspotValue: "Suspended",
          displayLabel: "Suspended",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Lender Record Status seeded (4 values)");

    console.log("\n Seeding Performance Rating...");
    const performanceRatingEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "performanceRating",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "performance_rating",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "performanceRating",
        hubspotProperty: "performance_rating",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Lender performance rating",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: performanceRatingEnum.id,
          sourceValue: "excellent",
          hubspotValue: "Excellent",
          displayLabel: "Excellent",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: performanceRatingEnum.id,
          sourceValue: "good",
          hubspotValue: "Good",
          displayLabel: "Good",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: performanceRatingEnum.id,
          sourceValue: "average",
          hubspotValue: "Average",
          displayLabel: "Average",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: performanceRatingEnum.id,
          sourceValue: "poor",
          hubspotValue: "Poor",
          displayLabel: "Poor",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Performance Rating seeded (4 values)");

    console.log("\n" + "=".repeat(60));
    console.log("📊 LENDER ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Successfully seeded: ${successCount}/15 enum mappings`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    console.log("\n ENUM VALUES COUNT:");
    console.log("   1. Lender Category: 3 values");
    console.log("   2. Lender Type: 6 values");
    console.log("   3. Co-signer Requirements: 3 values");
    console.log("   4. Collateral Requirements: 7 values");
    console.log("   5. Supported Course Types: 7 values");
    console.log("   6. Supported Destinations: 10 values");
    console.log("   7. API Connectivity Status: 4 values");
    console.log("   8. Digital Integration Level: 4 values");
    console.log("   9. Holiday Processing: 3 values");
    console.log("   10. Repayment Options: 4 values");
    console.log("   11. Partnership Status: 6 values");
    console.log("   12. Payout Terms: 4 values");
    console.log("   13. Data Source: 3 values");
    console.log("   14. Lender Record Status: 4 values");
    console.log("   15. Performance Rating: 4 values");
    console.log("   TOTAL: 72 enum values");
  } catch (error) {
    errorCount++;
    console.error("Error during seeding:", error);
    throw error;
  }
}

const seedCommissionEnumMappings = async () => {
  console.log("Starting Commission Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-46470694";

  try {
    // ===== 1. SETTLEMENT PERIOD =====
    console.log("\nSeeding Settlement Period...");
    const settlementPeriodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "settlementPeriod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "settlement_period",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "settlementPeriod",
        hubspotProperty: "settlement_period",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Settlement period type",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: settlementPeriodEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: settlementPeriodEnum.id,
          sourceValue: "quarterly",
          hubspotValue: "Quarterly",
          displayLabel: "Quarterly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: settlementPeriodEnum.id,
          sourceValue: "bi_annual",
          hubspotValue: "Bi-Annual",
          displayLabel: "Bi-Annual",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: settlementPeriodEnum.id,
          sourceValue: "annual",
          hubspotValue: "Annual",
          displayLabel: "Annual",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Settlement Period seeded (4 values)");

    // ===== 2. SETTLEMENT MONTH =====
    console.log("\nSeeding Settlement Month...");
    const settlementMonthEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "settlementMonth",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "settlement_month",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "settlementMonth",
        hubspotProperty: "settlement_month",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Month of settlement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "january",
          hubspotValue: "January",
          displayLabel: "January",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "february",
          hubspotValue: "February",
          displayLabel: "February",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "march",
          hubspotValue: "March",
          displayLabel: "March",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "april",
          hubspotValue: "April",
          displayLabel: "April",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "may",
          hubspotValue: "May",
          displayLabel: "May",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "june",
          hubspotValue: "June",
          displayLabel: "June",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "july",
          hubspotValue: "July",
          displayLabel: "July",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "august",
          hubspotValue: "August",
          displayLabel: "August",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "september",
          hubspotValue: "September",
          displayLabel: "September",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "october",
          hubspotValue: "October",
          displayLabel: "October",
          sortOrder: 10,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "november",
          hubspotValue: "November",
          displayLabel: "November",
          sortOrder: 11,
          isActive: true,
        },
        {
          enumMappingId: settlementMonthEnum.id,
          sourceValue: "december",
          hubspotValue: "December",
          displayLabel: "December",
          sortOrder: 12,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Settlement Month seeded (12 values)");

    // ===== 3. SETTLEMENT STATUS =====
    console.log("\nSeeding Settlement Status...");
    const settlementStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "settlementStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "settlement_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "settlementStatus",
        hubspotProperty: "settlement_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current status of settlement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "calculated",
          hubspotValue: "Calculated",
          displayLabel: "Calculated",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "approved",
          hubspotValue: "Approved",
          displayLabel: "Approved",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "paid",
          hubspotValue: "Paid",
          displayLabel: "Paid",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: settlementStatusEnum.id,
          sourceValue: "cancelled",
          hubspotValue: "Cancelled",
          displayLabel: "Cancelled",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Settlement Status seeded (6 values)");

    // ===== 4. VERIFICATION STATUS =====
    console.log("\nSeeding Verification Status...");
    const verificationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "verificationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "verification_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "verificationStatus",
        hubspotProperty: "verification_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Verification status of settlement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: verificationStatusEnum.id,
          sourceValue: "not_verified",
          hubspotValue: "Not Verified",
          displayLabel: "Not Verified",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: verificationStatusEnum.id,
          sourceValue: "pending_verification",
          hubspotValue: "Pending Verification",
          displayLabel: "Pending Verification",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: verificationStatusEnum.id,
          sourceValue: "verified",
          hubspotValue: "Verified",
          displayLabel: "Verified",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: verificationStatusEnum.id,
          sourceValue: "disputed",
          hubspotValue: "Disputed",
          displayLabel: "Disputed",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Verification Status seeded (4 values)");

    // ===== 5. COMMISSION DATA SOURCE =====
    console.log("\nSeeding Commission Data Source...");
    const dataSourceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "commissionDataSource",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "commissionDataSource",
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Source of commission data",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "manual_entry",
          hubspotValue: "Manual Entry",
          displayLabel: "Manual Entry",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "import",
          hubspotValue: "Import",
          displayLabel: "Import",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "api_integration",
          hubspotValue: "API Integration",
          displayLabel: "API Integration",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "system_generated",
          hubspotValue: "System Generated",
          displayLabel: "System Generated",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Commission Data Source seeded (4 values)");

    // ===== 6. INTEGRATION STATUS =====
    console.log("\nSeeding Integration Status...");
    const integrationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "integrationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "integration_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "integrationStatus",
        hubspotProperty: "integration_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of system integration",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "not_synced",
          hubspotValue: "Not Synced",
          displayLabel: "Not Synced",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "syncing",
          hubspotValue: "Syncing",
          displayLabel: "Syncing",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "synced",
          hubspotValue: "Synced",
          displayLabel: "Synced",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "sync_failed",
          hubspotValue: "Sync Failed",
          displayLabel: "Sync Failed",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Integration Status seeded (4 values)");

    // ===== 7. SETTLEMENT RECORD STATUS =====
    console.log("\nSeeding Settlement Record Status...");
    const settlementRecordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "settlementRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "settlement_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "settlementRecordStatus",
        hubspotProperty: "settlement_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of settlement record",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: settlementRecordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: settlementRecordStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: settlementRecordStatusEnum.id,
          sourceValue: "archived",
          hubspotValue: "Archived",
          displayLabel: "Archived",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Settlement Record Status seeded (3 values)");

    // ===== 8. SYSTEM GENERATED =====
    console.log("\nSeeding System Generated...");
    const systemGeneratedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "systemGenerated",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "system_generated",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "systemGenerated",
        hubspotProperty: "system_generated",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether record was system generated",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: systemGeneratedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: systemGeneratedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("System Generated seeded (2 values)");

    // ===== 9. DISBURSEMENT TRIGGER =====
    console.log("\nSeeding Disbursement Trigger...");
    const disbursementTriggerEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "disbursementTrigger",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "disbursement_trigger",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "disbursementTrigger",
        hubspotProperty: "disbursement_trigger",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "What triggered the disbursement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: disbursementTriggerEnum.id,
          sourceValue: "loan_disbursement",
          hubspotValue: "Loan Disbursement",
          displayLabel: "Loan Disbursement",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: disbursementTriggerEnum.id,
          sourceValue: "milestone_completion",
          hubspotValue: "Milestone Completion",
          displayLabel: "Milestone Completion",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: disbursementTriggerEnum.id,
          sourceValue: "manual_trigger",
          hubspotValue: "Manual Trigger",
          displayLabel: "Manual Trigger",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: disbursementTriggerEnum.id,
          sourceValue: "scheduled",
          hubspotValue: "Scheduled",
          displayLabel: "Scheduled",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Disbursement Trigger seeded (4 values)");

    // ===== 10. TRANSACTION TYPES =====
    console.log("\nSeeding Transaction Types...");
    const transactionTypesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "transactionTypes",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "transaction_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "transactionTypes",
        hubspotProperty: "transaction_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of transaction",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: transactionTypesEnum.id,
          sourceValue: "commission",
          hubspotValue: "Commission",
          displayLabel: "Commission",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: transactionTypesEnum.id,
          sourceValue: "bonus",
          hubspotValue: "Bonus",
          displayLabel: "Bonus",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: transactionTypesEnum.id,
          sourceValue: "incentive",
          hubspotValue: "Incentive",
          displayLabel: "Incentive",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: transactionTypesEnum.id,
          sourceValue: "adjustment",
          hubspotValue: "Adjustment",
          displayLabel: "Adjustment",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: transactionTypesEnum.id,
          sourceValue: "reversal",
          hubspotValue: "Reversal",
          displayLabel: "Reversal",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Transaction Types seeded (5 values)");

    // ===== 11. COMMISSION MODEL =====
    console.log("\nSeeding Commission Model...");
    const commissionModelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "commissionModel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "commission_model",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "commissionModel",
        hubspotProperty: "commission_model",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Commission calculation model",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "flat",
          hubspotValue: "Flat",
          displayLabel: "Flat Amount",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "percentage",
          hubspotValue: "Percentage",
          displayLabel: "Percentage",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "tiered",
          hubspotValue: "Tiered",
          displayLabel: "Tiered",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "hybrid",
          hubspotValue: "Hybrid",
          displayLabel: "Hybrid",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Commission Model seeded (4 values)");

    // ===== 12. ACKNOWLEDGMENT STATUS =====
    console.log("\nSeeding Acknowledgment Status...");
    const acknowledgmentStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "acknowledgmentStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "acknowledgment_received",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "acknowledgmentStatus",
        hubspotProperty: "acknowledgment_received",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of acknowledgment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: acknowledgmentStatusEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: acknowledgmentStatusEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: acknowledgmentStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Acknowledgment Status seeded (3 values)");

    // ===== 13. NOTIFICATION METHOD =====
    console.log("\nSeeding Notification Method...");
    const notificationMethodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "notificationMethod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "notification_method",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "notificationMethod",
        hubspotProperty: "notification_method",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Method of notification",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: notificationMethodEnum.id,
          sourceValue: "email",
          hubspotValue: "Email",
          displayLabel: "Email",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: notificationMethodEnum.id,
          sourceValue: "sms",
          hubspotValue: "SMS",
          displayLabel: "SMS",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: notificationMethodEnum.id,
          sourceValue: "whatsapp",
          hubspotValue: "WhatsApp",
          displayLabel: "WhatsApp",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: notificationMethodEnum.id,
          sourceValue: "portal",
          hubspotValue: "Portal",
          displayLabel: "Portal Notification",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: notificationMethodEnum.id,
          sourceValue: "phone",
          hubspotValue: "Phone",
          displayLabel: "Phone Call",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Notification Method seeded (5 values)");

    // ===== 14. PARTNER NOTIFICATION SENT =====
    console.log("\nSeeding Partner Notification Sent...");
    const partnerNotificationSentEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerNotificationSent",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partner_notification_sent",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerNotificationSent",
        hubspotProperty: "partner_notification_sent",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether partner notification was sent",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnerNotificationSentEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnerNotificationSentEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: partnerNotificationSentEnum.id,
          sourceValue: "failed",
          hubspotValue: "Failed",
          displayLabel: "Failed",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Partner Notification Sent seeded (3 values)");

    // ===== 15. PAYMENT METHOD =====
    console.log("\nSeeding Payment Method...");
    const paymentMethodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "paymentMethod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_method",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "paymentMethod",
        hubspotProperty: "payment_method",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Method used for payment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "bank_transfer",
          hubspotValue: "Bank Transfer",
          displayLabel: "Bank Transfer",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "upi",
          hubspotValue: "UPI",
          displayLabel: "UPI",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "check",
          hubspotValue: "Check",
          displayLabel: "Check",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "wire_transfer",
          hubspotValue: "Wire Transfer",
          displayLabel: "Wire Transfer",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "cash",
          hubspotValue: "Cash",
          displayLabel: "Cash",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payment Method seeded (5 values)");

    // ===== 16. PAYMENT STATUS =====
    console.log("\nSeeding Payment Status...");
    const paymentStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "paymentStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "paymentStatus",
        hubspotProperty: "payment_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of payment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "processing",
          hubspotValue: "Processing",
          displayLabel: "Processing",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "completed",
          hubspotValue: "Completed",
          displayLabel: "Completed",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "failed",
          hubspotValue: "Failed",
          displayLabel: "Failed",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "on_hold",
          hubspotValue: "On Hold",
          displayLabel: "On Hold",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "refunded",
          hubspotValue: "Refunded",
          displayLabel: "Refunded",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payment Status seeded (6 values)");

    // ===== 17. INVOICE STATUS =====
    console.log("\nSeeding Invoice Status...");
    const invoiceStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "invoiceStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "invoice_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "invoiceStatus",
        hubspotProperty: "invoice_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of invoice",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: invoiceStatusEnum.id,
          sourceValue: "draft",
          hubspotValue: "Draft",
          displayLabel: "Draft",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: invoiceStatusEnum.id,
          sourceValue: "sent",
          hubspotValue: "Sent",
          displayLabel: "Sent",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: invoiceStatusEnum.id,
          sourceValue: "paid",
          hubspotValue: "Paid",
          displayLabel: "Paid",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: invoiceStatusEnum.id,
          sourceValue: "overdue",
          hubspotValue: "Overdue",
          displayLabel: "Overdue",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: invoiceStatusEnum.id,
          sourceValue: "cancelled",
          hubspotValue: "Cancelled",
          displayLabel: "Cancelled",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Invoice Status seeded (5 values)");

    console.log("\nSeeding SLA Breach...");
    const slaBreachEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "slaBreach",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "sla_breach",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "slaBreach",
        hubspotProperty: "sla_breach",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether SLA was breached",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: slaBreachEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: slaBreachEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("SLA Breach seeded (2 values)");

    // ===== 18. TAX CERTIFICATE REQUIRED =====
    console.log("\nSeeding Tax Certificate Required...");
    const taxCertificateRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "taxCertificateRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "tax_certificate_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "taxCertificateRequired",
        hubspotProperty: "tax_certificate_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether tax certificate is required",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: taxCertificateRequiredEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: taxCertificateRequiredEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: taxCertificateRequiredEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Tax Certificate Required seeded (3 values)");

    // ===== 19. HOLD REASON =====
    console.log("\nSeeding Hold Reason...");
    const holdReasonEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "holdReason",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "hold_reason",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "holdReason",
        hubspotProperty: "hold_reason",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Reason for hold",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "documentation_pending",
          hubspotValue: "Documentation Pending",
          displayLabel: "Documentation Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "verification_pending",
          hubspotValue: "Verification Pending",
          displayLabel: "Verification Pending",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "dispute_raised",
          hubspotValue: "Dispute Raised",
          displayLabel: "Dispute Raised",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "compliance_review",
          hubspotValue: "Compliance Review",
          displayLabel: "Compliance Review",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "payment_issues",
          hubspotValue: "Payment Issues",
          displayLabel: "Payment Issues",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: holdReasonEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Hold Reason seeded (6 values)");

    // ===== 20. RECONCILIATION STATUS =====
    console.log("\nSeeding Reconciliation Status...");
    const reconciliationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "reconciliationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "reconciliation_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "reconciliationStatus",
        hubspotProperty: "reconciliation_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of reconciliation",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: reconciliationStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: reconciliationStatusEnum.id,
          sourceValue: "in_progress",
          hubspotValue: "In Progress",
          displayLabel: "In Progress",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: reconciliationStatusEnum.id,
          sourceValue: "reconciled",
          hubspotValue: "Reconciled",
          displayLabel: "Reconciled",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: reconciliationStatusEnum.id,
          sourceValue: "discrepancy_found",
          hubspotValue: "Discrepancy Found",
          displayLabel: "Discrepancy Found",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: reconciliationStatusEnum.id,
          sourceValue: "failed",
          hubspotValue: "Failed",
          displayLabel: "Failed",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Reconciliation Status seeded (5 values)");

    console.log("\n" + "=".repeat(60));
    console.log("COMMISSION ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Successfully seeded: ${successCount}/20 enum mappings`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    console.log("\nENUM VALUES COUNT:");
    console.log("   1. Settlement Period: 4 values");
    console.log("   2. Settlement Month: 12 values");
    console.log("   3. Settlement Status: 6 values");
    console.log("   4. Verification Status: 4 values");
    console.log("   5. Commission Data Source: 4 values");
    console.log("   6. Integration Status: 4 values");
    console.log("   7. Settlement Record Status: 3 values");
    console.log("   8. System Generated: 2 values");
    console.log("   9. Disbursement Trigger: 4 values");
    console.log("   10. Transaction Types: 5 values");
    console.log("   11. Commission Model: 4 values");
    console.log("   12. Acknowledgment Status: 3 values");
    console.log("   13. Notification Method: 5 values");
    console.log("   14. Partner Notification Sent: 3 values");
    console.log("   15. Payment Method: 5 values");
    console.log("   16. Payment Status: 6 values");
    console.log("   17. Invoice Status: 5 values");
    console.log("   18. Tax Certificate Required: 3 values");
    console.log("   19. Hold Reason: 6 values");
    console.log("   20. Reconciliation Status: 5 values");
    console.log("   21. SLA Breach: 2 values");
    console.log("   " + "-".repeat(30));
    console.log("   TOTAL: 95 commission enum values");
  } catch (error) {
    errorCount++;
    console.error("Error during commission enum seeding:", error);
    throw error;
  }
};

export default seedCommissionEnumMappings;

const main = async () => {
  try {
    await seedAdminRoles();
    await seedAdminUser();
    await seedRoles();
    await seedCurrencies();
    await seedLenderEnumMappings();
    await seedCommissionEnumMappings();
    console.log("✅ All seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
};

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
