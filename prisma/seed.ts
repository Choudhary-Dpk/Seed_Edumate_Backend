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

const seedLenderEnumMappings = async () => {
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
};

const seedCommissionEnumMappings = async () => {
  console.log("Starting Commission Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-46470694";

  try {
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

const seedPartnerEnumMappings = async () => {
  console.log("Starting Partner Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-46470693";

  try {
    console.log("\nSeeding Business Type...");
    const businessTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "businessType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "business_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "businessType",
        hubspotProperty: "business_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of business entity",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "individual",
          hubspotValue: "Individual",
          displayLabel: "Individual",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "partnership",
          hubspotValue: "Partnership",
          displayLabel: "Partnership",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "private_limited",
          hubspotValue: "Private Limited",
          displayLabel: "Private Limited",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "public_limited",
          hubspotValue: "Public Limited",
          displayLabel: "Public Limited",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "llp",
          hubspotValue: "LLP",
          displayLabel: "LLP",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "ngo",
          hubspotValue: "NGO",
          displayLabel: "NGO",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: businessTypeEnum.id,
          sourceValue: "educational_trust",
          hubspotValue: "Educational Trust",
          displayLabel: "Educational Trust",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Business Type seeded (7 values)");

    console.log("\nSeeding Partner Type...");
    const partnerTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partner_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerType",
        hubspotProperty: "partner_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of partner organization",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "test_prep_center",
          hubspotValue: "Test Prep Center",
          displayLabel: "Test Prep Center",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "study_abroad_consultant",
          hubspotValue: "Study Abroad Consultant",
          displayLabel: "Study Abroad Consultant",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "educational_institution",
          hubspotValue: "Educational Institution",
          displayLabel: "Educational Institution",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "online_platform",
          hubspotValue: "Online Platform",
          displayLabel: "Online Platform",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "coaching_institute",
          hubspotValue: "Coaching Institute",
          displayLabel: "Coaching Institute",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "career_counselor",
          hubspotValue: "Career Counselor",
          displayLabel: "Career Counselor",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "immigration_consultant",
          hubspotValue: "Immigration Consultant",
          displayLabel: "Immigration Consultant",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "university_representative",
          hubspotValue: "University Representative",
          displayLabel: "University Representative",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "dsa",
          hubspotValue: "DSA",
          displayLabel: "DSA",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "forex_service_provider",
          hubspotValue: "Forex Service Provider",
          displayLabel: "Forex Service Provider",
          sortOrder: 10,
          isActive: true,
        },
        {
          enumMappingId: partnerTypeEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 11,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Partner Type seeded (11 values)");

    console.log("\nSeeding Target Courses...");
    const targetCoursesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "targetCourses",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "target_courses",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "targetCourses",
        hubspotProperty: "target_courses",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Target courses for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "engineering",
          hubspotValue: "Engineering",
          displayLabel: "Engineering",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "mba",
          hubspotValue: "MBA",
          displayLabel: "MBA",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "ms",
          hubspotValue: "MS",
          displayLabel: "MS",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "medicine",
          hubspotValue: "Medicine",
          displayLabel: "Medicine",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "law",
          hubspotValue: "Law",
          displayLabel: "Law",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "arts",
          hubspotValue: "Arts",
          displayLabel: "Arts",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "science",
          hubspotValue: "Science",
          displayLabel: "Science",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "management",
          hubspotValue: "Management",
          displayLabel: "Management",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: targetCoursesEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Target Courses seeded (9 values)");

    console.log("\nSeeding Target Destinations...");
    const targetDestinationsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "targetDestinations",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "target_destinations",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "targetDestinations",
        hubspotProperty: "target_destinations",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Target destination countries",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "us",
          hubspotValue: "US",
          displayLabel: "United States",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "uk",
          hubspotValue: "UK",
          displayLabel: "United Kingdom",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "canada",
          hubspotValue: "Canada",
          displayLabel: "Canada",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "australia",
          hubspotValue: "Australia",
          displayLabel: "Australia",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "germany",
          hubspotValue: "Germany",
          displayLabel: "Germany",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "france",
          hubspotValue: "France",
          displayLabel: "France",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "singapore",
          hubspotValue: "Singapore",
          displayLabel: "Singapore",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "italy",
          hubspotValue: "Italy",
          displayLabel: "Italy",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
          sourceValue: "uae",
          hubspotValue: "UAE",
          displayLabel: "UAE",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: targetDestinationsEnum.id,
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
    console.log("Target Destinations seeded (10 values)");

    console.log("\nSeeding Commission Model...");
    const commissionModelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerCommissionModel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "commission_model",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerCommissionModel",
        hubspotProperty: "commission_model",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Commission model for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "fixed_amount",
          hubspotValue: "Fixed Amount",
          displayLabel: "Fixed Amount",
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
        {
          enumMappingId: commissionModelEnum.id,
          sourceValue: "performance_based",
          hubspotValue: "Performance Based",
          displayLabel: "Performance Based",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Commission Model seeded (5 values)");

    console.log("\nSeeding Commission Type...");
    const commissionTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerCommissionType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "commission_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerCommissionType",
        hubspotProperty: "commission_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Commission type for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: commissionTypeEnum.id,
          sourceValue: "per_lead",
          hubspotValue: "Per Lead",
          displayLabel: "Per Lead",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: commissionTypeEnum.id,
          sourceValue: "per_application",
          hubspotValue: "Per Application",
          displayLabel: "Per Application",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: commissionTypeEnum.id,
          sourceValue: "per_approval",
          hubspotValue: "Per Approval",
          displayLabel: "Per Approval",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: commissionTypeEnum.id,
          sourceValue: "per_disbursement",
          hubspotValue: "Per Disbursement",
          displayLabel: "Per Disbursement",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Commission Type seeded (4 values)");

    console.log("\nSeeding GST Applicable...");
    const gstApplicableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "gstApplicable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "gst_applicable",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "gstApplicable",
        hubspotProperty: "gst_applicable",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether GST is applicable",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: gstApplicableEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: gstApplicableEnum.id,
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
    console.log("GST Applicable seeded (2 values)");

    console.log("\nSeeding Payment Frequency...");
    const paymentFrequencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerPaymentFrequency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_frequency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerPaymentFrequency",
        hubspotProperty: "payment_frequency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Payment frequency for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: paymentFrequencyEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: paymentFrequencyEnum.id,
          sourceValue: "quarterly",
          hubspotValue: "Quarterly",
          displayLabel: "Quarterly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentFrequencyEnum.id,
          sourceValue: "on_achievement",
          hubspotValue: "On Achievement",
          displayLabel: "On Achievement",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentFrequencyEnum.id,
          sourceValue: "custom",
          hubspotValue: "Custom",
          displayLabel: "Custom",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payment Frequency seeded (4 values)");

    console.log("\nSeeding Payment Method...");
    const paymentMethodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerPaymentMethod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_method",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerPaymentMethod",
        hubspotProperty: "payment_method",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Payment method for partner",
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
          sourceValue: "cheque",
          hubspotValue: "Cheque",
          displayLabel: "Cheque",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "upi",
          hubspotValue: "UPI",
          displayLabel: "UPI",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentMethodEnum.id,
          sourceValue: "digital_wallet",
          hubspotValue: "Digital Wallet",
          displayLabel: "Digital Wallet",
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

    console.log("\nSeeding Payment Terms...");
    const paymentTermsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "paymentTerms",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_terms",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "paymentTerms",
        hubspotProperty: "payment_terms",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Payment terms for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: paymentTermsEnum.id,
          sourceValue: "net_30",
          hubspotValue: "Net 30",
          displayLabel: "Net 30",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: paymentTermsEnum.id,
          sourceValue: "net_45",
          hubspotValue: "Net 45",
          displayLabel: "Net 45",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentTermsEnum.id,
          sourceValue: "net_60",
          hubspotValue: "Net 60",
          displayLabel: "Net 60",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentTermsEnum.id,
          sourceValue: "immediate",
          hubspotValue: "Immediate",
          displayLabel: "Immediate",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: paymentTermsEnum.id,
          sourceValue: "custom",
          hubspotValue: "Custom",
          displayLabel: "Custom",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payment Terms seeded (5 values)");

    console.log("\nSeeding TDS Applicable...");
    const tdsApplicableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "tdsApplicable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "tds_applicable",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "tdsApplicable",
        hubspotProperty: "tds_applicable",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether TDS is applicable",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: tdsApplicableEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: tdsApplicableEnum.id,
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
    console.log("TDS Applicable seeded (2 values)");

    console.log("\nSeeding Background Verification Status...");
    const bgVerificationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "backgroundVerificationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "background_verification_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "backgroundVerificationStatus",
        hubspotProperty: "background_verification_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Background verification status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: bgVerificationStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: bgVerificationStatusEnum.id,
          sourceValue: "complete",
          hubspotValue: "Complete",
          displayLabel: "Complete",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: bgVerificationStatusEnum.id,
          sourceValue: "failed",
          hubspotValue: "Failed",
          displayLabel: "Failed",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: bgVerificationStatusEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Background Verification Status seeded (4 values)");

    console.log("\nSeeding KYC Status...");
    const kycStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "kycStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "kyc_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "kycStatus",
        hubspotProperty: "kyc_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "KYC verification status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: kycStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: kycStatusEnum.id,
          sourceValue: "complete",
          hubspotValue: "Complete",
          displayLabel: "Complete",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: kycStatusEnum.id,
          sourceValue: "expired",
          hubspotValue: "Expired",
          displayLabel: "Expired",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: kycStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("KYC Status seeded (4 values)");

    console.log("\nSeeding Payment Status...");
    const paymentStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerPaymentStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "payment_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerPaymentStatus",
        hubspotProperty: "payment_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Payment status for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "up_to_date",
          hubspotValue: "Up to Date",
          displayLabel: "Up to Date",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "overdue",
          hubspotValue: "Overdue",
          displayLabel: "Overdue",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: paymentStatusEnum.id,
          sourceValue: "on_hold",
          hubspotValue: "On Hold",
          displayLabel: "On Hold",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Payment Status seeded (4 values)");

    console.log("\nSeeding Lead Submission Method...");
    const leadSubmissionMethodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "leadSubmissionMethod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lead_submission_method",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "leadSubmissionMethod",
        hubspotProperty: "lead_submission_method",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Method used to submit leads",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "online_form",
          hubspotValue: "Online Form",
          displayLabel: "Online Form",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "email",
          hubspotValue: "Email",
          displayLabel: "Email",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "phone",
          hubspotValue: "Phone",
          displayLabel: "Phone",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "whatsapp",
          hubspotValue: "WhatsApp",
          displayLabel: "WhatsApp",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "portal",
          hubspotValue: "Portal",
          displayLabel: "Portal",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: leadSubmissionMethodEnum.id,
          sourceValue: "api",
          hubspotValue: "API",
          displayLabel: "API",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Lead Submission Method seeded (6 values)");

    console.log("\nSeeding Lead Tracking Method...");
    const leadTrackingMethodEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "leadTrackingMethod",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lead_tracking_method",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "leadTrackingMethod",
        hubspotProperty: "lead_tracking_method",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Method used to track leads",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: leadTrackingMethodEnum.id,
          sourceValue: "unique_referral_code",
          hubspotValue: "Unique Referral Code",
          displayLabel: "Unique Referral Code",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: leadTrackingMethodEnum.id,
          sourceValue: "utm_parameters",
          hubspotValue: "UTM Parameters",
          displayLabel: "UTM Parameters",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: leadTrackingMethodEnum.id,
          sourceValue: "phone_tracking",
          hubspotValue: "Phone Tracking",
          displayLabel: "Phone Tracking",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: leadTrackingMethodEnum.id,
          sourceValue: "email_tracking",
          hubspotValue: "Email Tracking",
          displayLabel: "Email Tracking",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: leadTrackingMethodEnum.id,
          sourceValue: "manual_attribution",
          hubspotValue: "Manual Attribution",
          displayLabel: "Manual Attribution",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Lead Tracking Method seeded (5 values)");

    console.log("\nSeeding Co-Marketing Approval...");
    const coMarketingApprovalEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coMarketingApproval",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_marketing_approval",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coMarketingApproval",
        hubspotProperty: "co_marketing_approval",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Co-marketing approval status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coMarketingApprovalEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coMarketingApprovalEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coMarketingApprovalEnum.id,
          sourceValue: "case_by_case",
          hubspotValue: "Case by Case",
          displayLabel: "Case by Case",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Co-Marketing Approval seeded (3 values)");

    console.log("\nSeeding Content Collaboration...");
    const contentCollaborationEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "contentCollaboration",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "content_collaboration",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "contentCollaboration",
        hubspotProperty: "content_collaboration",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Content collaboration status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: contentCollaborationEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: contentCollaborationEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: contentCollaborationEnum.id,
          sourceValue: "interested",
          hubspotValue: "Interested",
          displayLabel: "Interested",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Content Collaboration seeded (3 values)");

    console.log("\nSeeding Marketing Materials Provided...");
    const marketingMaterialsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "marketingMaterialsProvided",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "marketing_materials_provided",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "marketingMaterialsProvided",
        hubspotProperty: "marketing_materials_provided",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Types of marketing materials provided",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: marketingMaterialsEnum.id,
          sourceValue: "brochures",
          hubspotValue: "Brochures",
          displayLabel: "Brochures",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: marketingMaterialsEnum.id,
          sourceValue: "digital_assets",
          hubspotValue: "Digital Assets",
          displayLabel: "Digital Assets",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: marketingMaterialsEnum.id,
          sourceValue: "presentation_templates",
          hubspotValue: "Presentation Templates",
          displayLabel: "Presentation Templates",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: marketingMaterialsEnum.id,
          sourceValue: "case_studies",
          hubspotValue: "Case Studies",
          displayLabel: "Case Studies",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: marketingMaterialsEnum.id,
          sourceValue: "success_stories",
          hubspotValue: "Success Stories",
          displayLabel: "Success Stories",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Marketing Materials Provided seeded (5 values)");

    console.log("\nSeeding Agreement Type...");
    const agreementTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "agreementType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "agreement_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "agreementType",
        hubspotProperty: "agreement_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of partnership agreement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: agreementTypeEnum.id,
          sourceValue: "standard",
          hubspotValue: "Standard",
          displayLabel: "Standard",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: agreementTypeEnum.id,
          sourceValue: "custom",
          hubspotValue: "Custom",
          displayLabel: "Custom",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: agreementTypeEnum.id,
          sourceValue: "pilot",
          hubspotValue: "Pilot",
          displayLabel: "Pilot",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: agreementTypeEnum.id,
          sourceValue: "enterprise",
          hubspotValue: "Enterprise",
          displayLabel: "Enterprise",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Agreement Type seeded (4 values)");

    console.log("\nSeeding Partnership Status...");
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
        description: "Current status of partnership",
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
        {
          enumMappingId: partnershipStatusEnum.id,
          sourceValue: "onboarding",
          hubspotValue: "Onboarding",
          displayLabel: "Onboarding",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Partnership Status seeded (7 values)");

    console.log("\nSeeding Best Performing Month...");
    const bestPerformingMonthEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "bestPerformingMonth",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "best_performing_month",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "bestPerformingMonth",
        hubspotProperty: "best_performing_month",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Best performing month for partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "january",
          hubspotValue: "January",
          displayLabel: "January",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "february",
          hubspotValue: "February",
          displayLabel: "February",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "march",
          hubspotValue: "March",
          displayLabel: "March",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "april",
          hubspotValue: "April",
          displayLabel: "April",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "may",
          hubspotValue: "May",
          displayLabel: "May",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "june",
          hubspotValue: "June",
          displayLabel: "June",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "july",
          hubspotValue: "July",
          displayLabel: "July",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "august",
          hubspotValue: "August",
          displayLabel: "August",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "september",
          hubspotValue: "September",
          displayLabel: "September",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "october",
          hubspotValue: "October",
          displayLabel: "October",
          sortOrder: 10,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
          sourceValue: "november",
          hubspotValue: "November",
          displayLabel: "November",
          sortOrder: 11,
          isActive: true,
        },
        {
          enumMappingId: bestPerformingMonthEnum.id,
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
    console.log("Best Performing Month seeded (12 values)");

    console.log("\nSeeding Communication Frequency...");
    const communicationFrequencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "communicationFrequency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "communication_frequency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "communicationFrequency",
        hubspotProperty: "communication_frequency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Frequency of communication with partner",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "daily",
          hubspotValue: "Daily",
          displayLabel: "Daily",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "weekly",
          hubspotValue: "Weekly",
          displayLabel: "Weekly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "bi_weekly",
          hubspotValue: "Bi-weekly",
          displayLabel: "Bi-weekly",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "quarterly",
          hubspotValue: "Quarterly",
          displayLabel: "Quarterly",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: communicationFrequencyEnum.id,
          sourceValue: "as_needed",
          hubspotValue: "As Needed",
          displayLabel: "As Needed",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Communication Frequency seeded (6 values)");

    console.log("\nSeeding Relationship Status...");
    const relationshipStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "relationshipStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "relationship_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "relationshipStatus",
        hubspotProperty: "relationship_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of partner relationship",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "new",
          hubspotValue: "New",
          displayLabel: "New",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "onboarding",
          hubspotValue: "Onboarding",
          displayLabel: "Onboarding",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "high_performer",
          hubspotValue: "High Performer",
          displayLabel: "High Performer",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "underperforming",
          hubspotValue: "Underperforming",
          displayLabel: "Underperforming",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "at_risk",
          hubspotValue: "At Risk",
          displayLabel: "At Risk",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: relationshipStatusEnum.id,
          sourceValue: "champion",
          hubspotValue: "Champion",
          displayLabel: "Champion",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Relationship Status seeded (7 values)");

    console.log("\nSeeding Training Completed...");
    const trainingCompletedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "trainingCompleted",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "training_completed",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "trainingCompleted",
        hubspotProperty: "training_completed",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether partner training is completed",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: trainingCompletedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: trainingCompletedEnum.id,
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
    console.log("Training Completed seeded (2 values)");

    console.log("\nSeeding API Access Provided...");
    const apiAccessProvidedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "apiAccessProvided",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "api_access_provided",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "apiAccessProvided",
        hubspotProperty: "api_access_provided",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether API access is provided",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: apiAccessProvidedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: apiAccessProvidedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: apiAccessProvidedEnum.id,
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
    console.log("API Access Provided seeded (3 values)");

    console.log("\nSeeding Data Source...");
    const dataSourceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerDataSource",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerDataSource",
        hubspotProperty: "data_source",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Source of partner data",
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
          sourceValue: "partner_application",
          hubspotValue: "Partner Application",
          displayLabel: "Partner Application",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "referral",
          hubspotValue: "Referral",
          displayLabel: "Referral",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Data Source seeded (4 values)");

    console.log("\nSeeding Integration Status...");
    const integrationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerIntegrationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "integration_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerIntegrationStatus",
        hubspotProperty: "integration_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of partner integration",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "complete",
          hubspotValue: "Complete",
          displayLabel: "Complete",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
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
    console.log("Integration Status seeded (4 values)");

    console.log("\nSeeding Partner Record Status...");
    const partnerRecordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partner_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerRecordStatus",
        hubspotProperty: "partner_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of partner record",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnerRecordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnerRecordStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: partnerRecordStatusEnum.id,
          sourceValue: "suspended",
          hubspotValue: "Suspended",
          displayLabel: "Suspended",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: partnerRecordStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: partnerRecordStatusEnum.id,
          sourceValue: "archived",
          hubspotValue: "Archived",
          displayLabel: "Archived",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("Partner Record Status seeded (5 values)");

    console.log("\nSeeding Portal Access Provided...");
    const portalAccessProvidedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "portalAccessProvided",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "portal_access_provided",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "portalAccessProvided",
        hubspotProperty: "portal_access_provided",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether portal access is provided",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: portalAccessProvidedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: portalAccessProvidedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: portalAccessProvidedEnum.id,
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
    console.log("Portal Access Provided seeded (3 values)");

    console.log("\n" + "=".repeat(60));
    console.log("PARTNER ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Successfully seeded: ${successCount}/30 enum mappings`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    console.log("\nENUM VALUES COUNT:");
    console.log("   1. Business Type: 7 values");
    console.log("   2. Partner Type: 11 values");
    console.log("   3. Target Courses: 9 values");
    console.log("   4. Target Destinations: 10 values");
    console.log("   5. Commission Model: 5 values");
    console.log("   6. Commission Type: 4 values");
    console.log("   7. GST Applicable: 2 values");
    console.log("   8. Payment Frequency: 4 values");
    console.log("   9. Payment Method: 5 values");
    console.log("   10. Payment Terms: 5 values");
    console.log("   11. TDS Applicable: 2 values");
    console.log("   12. Background Verification Status: 4 values");
    console.log("   13. KYC Status: 4 values");
    console.log("   14. Payment Status: 4 values");
    console.log("   15. Lead Submission Method: 6 values");
    console.log("   16. Lead Tracking Method: 5 values");
    console.log("   17. Co-Marketing Approval: 3 values");
    console.log("   18. Content Collaboration: 3 values");
    console.log("   19. Marketing Materials Provided: 5 values");
    console.log("   20. Agreement Type: 4 values");
    console.log("   21. Partnership Status: 7 values");
    console.log("   22. Best Performing Month: 12 values");
    console.log("   23. Communication Frequency: 6 values");
    console.log("   24. Relationship Status: 7 values");
    console.log("   25. Training Completed: 2 values");
    console.log("   26. API Access Provided: 3 values");
    console.log("   27. Data Source: 4 values");
    console.log("   28. Integration Status: 4 values");
    console.log("   29. Partner Record Status: 5 values");
    console.log("   30. Portal Access Provided: 3 values");
    console.log("   " + "-".repeat(30));
    console.log("   TOTAL: 156 partner enum values");
  } catch (error) {
    errorCount++;
    console.error("Error during partner enum seeding:", error);
    throw error;
  }
};

const seedEdumateContactEnumMappings = async () => {
  console.log("Starting Edumate Contact Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "0-1"; // Standard HubSpot Contact object type

  try {
    // ==================== ACADEMIC INFORMATION GROUP ====================

    // ===== 1. ADMISSION STATUS =====
    console.log("\n📚 Seeding Admission Status...");
    const admissionStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "admissionStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "admission_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "admissionStatus",
        hubspotProperty: "admission_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current admission status of the student",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "not_applied",
          hubspotValue: "Not Applied",
          displayLabel: "Not Applied",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "applied",
          hubspotValue: "Applied",
          displayLabel: "Applied",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "interview_scheduled",
          hubspotValue: "Interview Scheduled",
          displayLabel: "Interview Scheduled",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "waitlisted",
          hubspotValue: "Waitlisted",
          displayLabel: "Waitlisted",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "admitted",
          hubspotValue: "Admitted",
          displayLabel: "Admitted",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Admission Status seeded (6 values)");

    // ===== 2. CURRENT EDUCATION LEVEL =====
    console.log("\n📚 Seeding Current Education Level...");
    const currentEducationLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "currentEducationLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "current_education_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "currentEducationLevel",
        hubspotProperty: "current_education_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Student's current level of education",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: currentEducationLevelEnum.id,
          sourceValue: "high_school",
          hubspotValue: "High School",
          displayLabel: "High School",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: currentEducationLevelEnum.id,
          sourceValue: "bachelors",
          hubspotValue: "Bachelors",
          displayLabel: "Bachelors",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: currentEducationLevelEnum.id,
          sourceValue: "masters",
          hubspotValue: "Masters",
          displayLabel: "Masters",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: currentEducationLevelEnum.id,
          sourceValue: "phd",
          hubspotValue: "PhD",
          displayLabel: "PhD",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: currentEducationLevelEnum.id,
          sourceValue: "diploma",
          hubspotValue: "Diploma",
          displayLabel: "Diploma",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: currentEducationLevelEnum.id,
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
    console.log("✅ Current Education Level seeded (6 values)");

    // ===== 3. INTENDED START TERM =====
    console.log("\n📚 Seeding Intended Start Term...");
    const intendedStartTermEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "intendedStartTerm",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "intended_start_term",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "intendedStartTerm",
        hubspotProperty: "intended_start_term",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Academic term when student intends to start",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: intendedStartTermEnum.id,
          sourceValue: "fall",
          hubspotValue: "Fall",
          displayLabel: "Fall",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: intendedStartTermEnum.id,
          sourceValue: "spring",
          hubspotValue: "Spring",
          displayLabel: "Spring",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: intendedStartTermEnum.id,
          sourceValue: "summer",
          hubspotValue: "Summer",
          displayLabel: "Summer",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: intendedStartTermEnum.id,
          sourceValue: "winter",
          hubspotValue: "Winter",
          displayLabel: "Winter",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Intended Start Term seeded (4 values)");

    // ===== 4. PREFERRED STUDY DESTINATION =====
    console.log("\n🌍 Seeding Preferred Study Destination...");
    const preferredStudyDestinationEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "preferredStudyDestination",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "preferred_study_destination",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "preferredStudyDestination",
        hubspotProperty: "preferred_study_destination",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Student's preferred country/destination for study",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "us",
          hubspotValue: "US",
          displayLabel: "United States",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "uk",
          hubspotValue: "UK",
          displayLabel: "United Kingdom",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "canada",
          hubspotValue: "Canada",
          displayLabel: "Canada",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "australia",
          hubspotValue: "Australia",
          displayLabel: "Australia",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "germany",
          hubspotValue: "Germany",
          displayLabel: "Germany",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "france",
          hubspotValue: "France",
          displayLabel: "France",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "singapore",
          hubspotValue: "Singapore",
          displayLabel: "Singapore",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "italy",
          hubspotValue: "Italy",
          displayLabel: "Italy",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "uae",
          hubspotValue: "UAE",
          displayLabel: "United Arab Emirates",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "japan",
          hubspotValue: "Japan",
          displayLabel: "Japan",
          sortOrder: 10,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "china",
          hubspotValue: "China",
          displayLabel: "China",
          sortOrder: 11,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "india",
          hubspotValue: "India",
          displayLabel: "India",
          sortOrder: 12,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "new_zealand",
          hubspotValue: "New Zealand",
          displayLabel: "New Zealand",
          sortOrder: 13,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "ireland",
          hubspotValue: "Ireland",
          displayLabel: "Ireland",
          sortOrder: 14,
          isActive: true,
        },
        {
          enumMappingId: preferredStudyDestinationEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 15,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Preferred Study Destination seeded (15 values)");

    // ===== 5. TARGET DEGREE LEVEL =====
    console.log("\n🎓 Seeding Target Degree Level...");
    const targetDegreeLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "targetDegreeLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "target_degree_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "targetDegreeLevel",
        hubspotProperty: "target_degree_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Degree level student is targeting",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "bachelors",
          hubspotValue: "Bachelors",
          displayLabel: "Bachelors",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "masters",
          hubspotValue: "Masters",
          displayLabel: "Masters",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "phd",
          hubspotValue: "PhD",
          displayLabel: "PhD",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "diploma",
          hubspotValue: "Diploma",
          displayLabel: "Diploma",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "certificate",
          hubspotValue: "Certificate",
          displayLabel: "Certificate",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: targetDegreeLevelEnum.id,
          sourceValue: "professional_course",
          hubspotValue: "Professional Course",
          displayLabel: "Professional Course",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Target Degree Level seeded (6 values)");

    // ==================== APPLICATION JOURNEY GROUP ====================

    // ===== 6. CURRENT STATUS DISPOSITION =====
    console.log("\n📞 Seeding Current Status Disposition...");
    const currentStatusDispositionEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "currentStatusDisposition",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "current_status_disposition",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "currentStatusDisposition",
        hubspotProperty: "current_status_disposition",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current contact/call disposition status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "not_interested",
          hubspotValue: "Not Interested",
          displayLabel: "Not Interested",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "wrong_number",
          hubspotValue: "Wrong Number",
          displayLabel: "Wrong Number",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "call_not_answered",
          hubspotValue: "Call not Answered",
          displayLabel: "Call not Answered",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "follow_up",
          hubspotValue: "Follow Up",
          displayLabel: "Follow Up",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "int_for_next_year",
          hubspotValue: "Int for Next Year",
          displayLabel: "Interested for Next Year",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: currentStatusDispositionEnum.id,
          sourceValue: "partial_documents_received",
          hubspotValue: "Partial Documents Received",
          displayLabel: "Partial Documents Received",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Current Status Disposition seeded (6 values)");

    // ===== 7. CURRENT STATUS DISPOSITION REASON =====
    console.log("\n📝 Seeding Current Status Disposition Reason...");
    const dispositionReasonEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "currentStatusDispositionReason",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "current_status_disposition_reason",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "currentStatusDispositionReason",
        hubspotProperty: "current_status_disposition_reason",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Reason for current disposition status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: dispositionReasonEnum.id,
          sourceValue: "already_applied",
          hubspotValue: "Already Applied",
          displayLabel: "Already Applied",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: dispositionReasonEnum.id,
          sourceValue: "not_looking_at_loan",
          hubspotValue: "Not Looking at Loan",
          displayLabel: "Not Looking at Loan",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: dispositionReasonEnum.id,
          sourceValue: "self_funding",
          hubspotValue: "Self Funding",
          displayLabel: "Self Funding",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: dispositionReasonEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Current Status Disposition Reason seeded (4 values)");

    // ===== 8. PRIORITY LEVEL =====
    console.log("\n⭐ Seeding Priority Level...");
    const priorityLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "priorityLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "priority_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "priorityLevel",
        hubspotProperty: "priority_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Priority level for contact follow-up",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "high",
          hubspotValue: "High",
          displayLabel: "High",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "medium",
          hubspotValue: "Medium",
          displayLabel: "Medium",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "low",
          hubspotValue: "Low",
          displayLabel: "Low",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Priority Level seeded (3 values)");

    // ==================== EDUMATE CONTACTS INFORMATION GROUP ====================

    // ===== 9. COURSE TYPE =====
    console.log("\n📖 Seeding Course Type...");
    const courseTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "courseType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "course_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "courseType",
        hubspotProperty: "course_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type/category of course",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: courseTypeEnum.id,
          sourceValue: "stem",
          hubspotValue: "STEM",
          displayLabel: "STEM",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: courseTypeEnum.id,
          sourceValue: "business",
          hubspotValue: "Business",
          displayLabel: "Business",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: courseTypeEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Course Type seeded (3 values)");

    // ==================== FINANCIAL INFORMATION GROUP ====================

    // ===== 10. CO-APPLICANT 1 OCCUPATION =====
    console.log("\n💼 Seeding Co-applicant 1 Occupation...");
    const coApplicant1OccupationEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant1Occupation",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_1_occupation",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant1Occupation",
        hubspotProperty: "co_applicant_1_occupation",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Occupation type of co-applicant 1",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant1OccupationEnum.id,
          sourceValue: "salaried",
          hubspotValue: "Salaried",
          displayLabel: "Salaried",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1OccupationEnum.id,
          sourceValue: "self_employed",
          hubspotValue: "Self Employed",
          displayLabel: "Self Employed",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1OccupationEnum.id,
          sourceValue: "retired",
          hubspotValue: "Retired",
          displayLabel: "Retired",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1OccupationEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 1 Occupation seeded (4 values)");

    // ===== 11. CO-APPLICANT 1 RELATIONSHIP =====
    console.log("\n👨‍👩‍👧 Seeding Co-applicant 1 Relationship...");
    const coApplicant1RelationshipEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant1Relationship",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_1_relationship",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant1Relationship",
        hubspotProperty: "co_applicant_1_relationship",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Relationship of co-applicant 1 to student",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "father",
          hubspotValue: "Father",
          displayLabel: "Father",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "mother",
          hubspotValue: "Mother",
          displayLabel: "Mother",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "spouse",
          hubspotValue: "Spouse",
          displayLabel: "Spouse",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "sibling",
          hubspotValue: "Sibling",
          displayLabel: "Sibling",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "uncle",
          hubspotValue: "Uncle",
          displayLabel: "Uncle",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "aunt",
          hubspotValue: "Aunt",
          displayLabel: "Aunt",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "grand_father",
          hubspotValue: "Grand Father",
          displayLabel: "Grand Father",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "grand_mother",
          hubspotValue: "Grand Mother",
          displayLabel: "Grand Mother",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: coApplicant1RelationshipEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 1 Relationship seeded (9 values)");

    // ===== 12. CO-APPLICANT 2 OCCUPATION =====
    console.log("\n💼 Seeding Co-applicant 2 Occupation...");
    const coApplicant2OccupationEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant2Occupation",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_2_occupation",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant2Occupation",
        hubspotProperty: "co_applicant_2_occupation",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Occupation type of co-applicant 2",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant2OccupationEnum.id,
          sourceValue: "salaried",
          hubspotValue: "Salaried",
          displayLabel: "Salaried",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2OccupationEnum.id,
          sourceValue: "self_employed",
          hubspotValue: "Self Employed",
          displayLabel: "Self Employed",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2OccupationEnum.id,
          sourceValue: "retired",
          hubspotValue: "Retired",
          displayLabel: "Retired",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2OccupationEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 2 Occupation seeded (4 values)");

    // ===== 13. CO-APPLICANT 2 RELATIONSHIP =====
    console.log("\n👨‍👩‍👧 Seeding Co-applicant 2 Relationship...");
    const coApplicant2RelationshipEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant2Relationship",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_2_relationship",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant2Relationship",
        hubspotProperty: "co_applicant_2_relationship",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Relationship of co-applicant 2 to student",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "father",
          hubspotValue: "Father",
          displayLabel: "Father",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "mother",
          hubspotValue: "Mother",
          displayLabel: "Mother",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "spouse",
          hubspotValue: "Spouse",
          displayLabel: "Spouse",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "sibling",
          hubspotValue: "Sibling",
          displayLabel: "Sibling",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "uncle",
          hubspotValue: "Uncle",
          displayLabel: "Uncle",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "aunt",
          hubspotValue: "Aunt",
          displayLabel: "Aunt",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "grand_father",
          hubspotValue: "Grand Father",
          displayLabel: "Grand Father",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "grand_mother",
          hubspotValue: "Grand Mother",
          displayLabel: "Grand Mother",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: coApplicant2RelationshipEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 2 Relationship seeded (9 values)");

    // ===== 14. CO-APPLICANT 3 OCCUPATION =====
    console.log("\n💼 Seeding Co-applicant 3 Occupation...");
    const coApplicant3OccupationEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant3Occupation",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_3_occupation",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant3Occupation",
        hubspotProperty: "co_applicant_3_occupation",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Occupation type of co-applicant 3",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant3OccupationEnum.id,
          sourceValue: "salaried",
          hubspotValue: "Salaried",
          displayLabel: "Salaried",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3OccupationEnum.id,
          sourceValue: "self_employed",
          hubspotValue: "Self Employed",
          displayLabel: "Self Employed",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3OccupationEnum.id,
          sourceValue: "retired",
          hubspotValue: "Retired",
          displayLabel: "Retired",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3OccupationEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 3 Occupation seeded (4 values)");

    // ===== 15. CO-APPLICANT 3 RELATIONSHIP =====
    console.log("\n👨‍👩‍👧 Seeding Co-applicant 3 Relationship...");
    const coApplicant3RelationshipEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicant3Relationship",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_3_relationship",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicant3Relationship",
        hubspotProperty: "co_applicant_3_relationship",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Relationship of co-applicant 3 to student",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "father",
          hubspotValue: "Father",
          displayLabel: "Father",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "mother",
          hubspotValue: "Mother",
          displayLabel: "Mother",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "spouse",
          hubspotValue: "Spouse",
          displayLabel: "Spouse",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "sibling",
          hubspotValue: "Sibling",
          displayLabel: "Sibling",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "uncle",
          hubspotValue: "Uncle",
          displayLabel: "Uncle",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "aunt",
          hubspotValue: "Aunt",
          displayLabel: "Aunt",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "grand_father",
          hubspotValue: "Grand Father",
          displayLabel: "Grand Father",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "grand_mother",
          hubspotValue: "Grand Mother",
          displayLabel: "Grand Mother",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: coApplicant3RelationshipEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant 3 Relationship seeded (9 values)");

    // ===== 16. COLLATERAL 2 AVAILABLE =====
    console.log("\n🏦 Seeding Collateral 2 Available...");
    const collateral2AvailableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateral2Available",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_2_available",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateral2Available",
        hubspotProperty: "collateral_2_available",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether second collateral is available",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateral2AvailableEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateral2AvailableEnum.id,
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
    console.log("✅ Collateral 2 Available seeded (2 values)");

    // ===== 17. COLLATERAL 2 TYPE =====
    console.log("\n🏦 Seeding Collateral 2 Type...");
    const collateral2TypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateral2Type",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_2_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateral2Type",
        hubspotProperty: "collateral_2_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of second collateral",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateral2TypeEnum.id,
          sourceValue: "property",
          hubspotValue: "Property",
          displayLabel: "Property",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateral2TypeEnum.id,
          sourceValue: "fd",
          hubspotValue: "FD",
          displayLabel: "Fixed Deposit",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: collateral2TypeEnum.id,
          sourceValue: "na_plot",
          hubspotValue: "NA Plot",
          displayLabel: "NA Plot",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: collateral2TypeEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Collateral 2 Type seeded (4 values)");

    // ===== 18. COLLATERAL AVAILABLE =====
    console.log("\n🏦 Seeding Collateral Available...");
    const collateralAvailableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateralAvailable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_available",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateralAvailable",
        hubspotProperty: "collateral_available",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether collateral is available",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralAvailableEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralAvailableEnum.id,
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
    console.log("✅ Collateral Available seeded (2 values)");

    // ===== 19. COLLATERAL TYPE =====
    console.log("\n🏦 Seeding Collateral Type...");
    const collateralTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateralType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateralType",
        hubspotProperty: "collateral_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of collateral",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralTypeEnum.id,
          sourceValue: "property",
          hubspotValue: "Property",
          displayLabel: "Property",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralTypeEnum.id,
          sourceValue: "fd",
          hubspotValue: "FD",
          displayLabel: "Fixed Deposit",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: collateralTypeEnum.id,
          sourceValue: "na_plot",
          hubspotValue: "NA Plot",
          displayLabel: "NA Plot",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: collateralTypeEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Collateral Type seeded (4 values)");

    // ===== 20. CURRENCY =====
    console.log("\n💰 Seeding Currency...");
    const currencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "currency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "currency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "currency",
        hubspotProperty: "currency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Currency for financial amounts",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "inr",
          hubspotValue: "INR",
          displayLabel: "INR (Indian Rupee)",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "usd",
          hubspotValue: "USD",
          displayLabel: "USD (US Dollar)",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "eur",
          hubspotValue: "EUR",
          displayLabel: "EUR (Euro)",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "gbp",
          hubspotValue: "GBP",
          displayLabel: "GBP (British Pound)",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "cad",
          hubspotValue: "CAD",
          displayLabel: "CAD (Canadian Dollar)",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "aud",
          hubspotValue: "AUD",
          displayLabel: "AUD (Australian Dollar)",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: currencyEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Currency seeded (7 values)");

    // ==================== LEAD ATTRIBUTION GROUP ====================

    // ===== 21. LEAD SOURCE =====
    console.log("\n📢 Seeding Lead Source...");
    const leadSourceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "leadSource",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "lead_source",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "leadSource",
        hubspotProperty: "lead_source",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Source/channel of lead generation",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "organic_search",
          hubspotValue: "Organic Search",
          displayLabel: "Organic Search",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "social_media",
          hubspotValue: "Social Media",
          displayLabel: "Social Media",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "b2b_partner",
          hubspotValue: "B2B Partner",
          displayLabel: "B2B Partner",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "referral",
          hubspotValue: "Referral",
          displayLabel: "Referral",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "advertisement",
          hubspotValue: "Advertisement",
          displayLabel: "Advertisement",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "website",
          hubspotValue: "Website",
          displayLabel: "Website",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "walk_in",
          hubspotValue: "Walk-in",
          displayLabel: "Walk-in",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: leadSourceEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 8,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Lead Source seeded (8 values)");

    // ===== 22. PARTNER COMMISSION APPLICABLE =====
    console.log("\n💵 Seeding Partner Commission Applicable...");
    const partnerCommissionEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partnerCommissionApplicable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partner_commission_applicable",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partnerCommissionApplicable",
        hubspotProperty: "partner_commission_applicable",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether partner commission is applicable",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnerCommissionEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnerCommissionEnum.id,
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
    console.log("✅ Partner Commission Applicable seeded (2 values)");

    // ==================== LOAN PREFERENCES GROUP ====================

    // ===== 23. LOAN TYPE PREFERENCE =====
    console.log("\n💳 Seeding Loan Type Preference...");
    const loanTypePreferenceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanTypePreference",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "loan_type_preference",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanTypePreference",
        hubspotProperty: "loan_type_preference",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Student's preferred loan type",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: loanTypePreferenceEnum.id,
          sourceValue: "secured",
          hubspotValue: "Secured",
          displayLabel: "Secured",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: loanTypePreferenceEnum.id,
          sourceValue: "unsecured",
          hubspotValue: "Unsecured",
          displayLabel: "Unsecured",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: loanTypePreferenceEnum.id,
          sourceValue: "government_scheme",
          hubspotValue: "Government Scheme",
          displayLabel: "Government Scheme",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: loanTypePreferenceEnum.id,
          sourceValue: "no_preference",
          hubspotValue: "No Preference",
          displayLabel: "No Preference",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Loan Type Preference seeded (4 values)");

    // ===== 24. REPAYMENT TYPE PREFERENCE =====
    console.log("\n💳 Seeding Repayment Type Preference...");
    const repaymentTypePreferenceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "repaymentTypePreference",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "repayment_type_preference",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "repaymentTypePreference",
        hubspotProperty: "repayment_type_preference",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Student's preferred repayment structure",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: repaymentTypePreferenceEnum.id,
          sourceValue: "emi",
          hubspotValue: "EMI",
          displayLabel: "EMI (Equated Monthly Installment)",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: repaymentTypePreferenceEnum.id,
          sourceValue: "simple_int",
          hubspotValue: "Simple Int",
          displayLabel: "Simple Interest",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: repaymentTypePreferenceEnum.id,
          sourceValue: "partial_int",
          hubspotValue: "Partial Int",
          displayLabel: "Partial Interest",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: repaymentTypePreferenceEnum.id,
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
    console.log("✅ Repayment Type Preference seeded (4 values)");

    // ==================== PERSONAL INFORMATION GROUP ====================

    // ===== 25. GENDER =====
    console.log("\n👤 Seeding Gender...");
    const genderEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "gender",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "gender",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "gender",
        hubspotProperty: "gender",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Gender of the contact",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: genderEnum.id,
          sourceValue: "male",
          hubspotValue: "Male",
          displayLabel: "Male",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: genderEnum.id,
          sourceValue: "female",
          hubspotValue: "Female",
          displayLabel: "Female",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: genderEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: genderEnum.id,
          sourceValue: "prefer_not_to_say",
          hubspotValue: "Prefer not to say",
          displayLabel: "Prefer not to say",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Gender seeded (4 values)");

    // ===== 26. NATIONALITY =====
    console.log("\n🌏 Seeding Nationality...");
    const nationalityEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "nationality",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "nationality",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "nationality",
        hubspotProperty: "nationality",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Nationality/citizenship of the contact",
      },
    });

    // Note: There are 254 nationalities - creating a subset of most common ones
    // You can expand this list as needed
    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "afghanistan",
          hubspotValue: "Afghanistan",
          displayLabel: "Afghanistan",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "albania",
          hubspotValue: "Albania",
          displayLabel: "Albania",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "algeria",
          hubspotValue: "Algeria",
          displayLabel: "Algeria",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "argentina",
          hubspotValue: "Argentina",
          displayLabel: "Argentina",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "australia",
          hubspotValue: "Australia",
          displayLabel: "Australia",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "austria",
          hubspotValue: "Austria",
          displayLabel: "Austria",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "bangladesh",
          hubspotValue: "Bangladesh",
          displayLabel: "Bangladesh",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "belgium",
          hubspotValue: "Belgium",
          displayLabel: "Belgium",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "brazil",
          hubspotValue: "Brazil",
          displayLabel: "Brazil",
          sortOrder: 9,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "canada",
          hubspotValue: "Canada",
          displayLabel: "Canada",
          sortOrder: 10,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "china",
          hubspotValue: "China",
          displayLabel: "China",
          sortOrder: 11,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "colombia",
          hubspotValue: "Colombia",
          displayLabel: "Colombia",
          sortOrder: 12,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "denmark",
          hubspotValue: "Denmark",
          displayLabel: "Denmark",
          sortOrder: 13,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "egypt",
          hubspotValue: "Egypt",
          displayLabel: "Egypt",
          sortOrder: 14,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "finland",
          hubspotValue: "Finland",
          displayLabel: "Finland",
          sortOrder: 15,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "france",
          hubspotValue: "France",
          displayLabel: "France",
          sortOrder: 16,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "germany",
          hubspotValue: "Germany",
          displayLabel: "Germany",
          sortOrder: 17,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "greece",
          hubspotValue: "Greece",
          displayLabel: "Greece",
          sortOrder: 18,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "hong_kong",
          hubspotValue: "Hong Kong",
          displayLabel: "Hong Kong",
          sortOrder: 19,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "india",
          hubspotValue: "India",
          displayLabel: "India",
          sortOrder: 20,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "indonesia",
          hubspotValue: "Indonesia",
          displayLabel: "Indonesia",
          sortOrder: 21,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "iran",
          hubspotValue: "Iran",
          displayLabel: "Iran",
          sortOrder: 22,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "iraq",
          hubspotValue: "Iraq",
          displayLabel: "Iraq",
          sortOrder: 23,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "ireland",
          hubspotValue: "Ireland",
          displayLabel: "Ireland",
          sortOrder: 24,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "israel",
          hubspotValue: "Israel",
          displayLabel: "Israel",
          sortOrder: 25,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "italy",
          hubspotValue: "Italy",
          displayLabel: "Italy",
          sortOrder: 26,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "japan",
          hubspotValue: "Japan",
          displayLabel: "Japan",
          sortOrder: 27,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "jordan",
          hubspotValue: "Jordan",
          displayLabel: "Jordan",
          sortOrder: 28,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "kenya",
          hubspotValue: "Kenya",
          displayLabel: "Kenya",
          sortOrder: 29,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "south_korea",
          hubspotValue: "South Korea",
          displayLabel: "South Korea",
          sortOrder: 30,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "malaysia",
          hubspotValue: "Malaysia",
          displayLabel: "Malaysia",
          sortOrder: 31,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "mexico",
          hubspotValue: "Mexico",
          displayLabel: "Mexico",
          sortOrder: 32,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "netherlands",
          hubspotValue: "Netherlands",
          displayLabel: "Netherlands",
          sortOrder: 33,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "new_zealand",
          hubspotValue: "New Zealand",
          displayLabel: "New Zealand",
          sortOrder: 34,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "nigeria",
          hubspotValue: "Nigeria",
          displayLabel: "Nigeria",
          sortOrder: 35,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "norway",
          hubspotValue: "Norway",
          displayLabel: "Norway",
          sortOrder: 36,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "pakistan",
          hubspotValue: "Pakistan",
          displayLabel: "Pakistan",
          sortOrder: 37,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "philippines",
          hubspotValue: "Philippines",
          displayLabel: "Philippines",
          sortOrder: 38,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "poland",
          hubspotValue: "Poland",
          displayLabel: "Poland",
          sortOrder: 39,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "portugal",
          hubspotValue: "Portugal",
          displayLabel: "Portugal",
          sortOrder: 40,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "russia",
          hubspotValue: "Russia",
          displayLabel: "Russia",
          sortOrder: 41,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "saudi_arabia",
          hubspotValue: "Saudi Arabia",
          displayLabel: "Saudi Arabia",
          sortOrder: 42,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "singapore",
          hubspotValue: "Singapore",
          displayLabel: "Singapore",
          sortOrder: 43,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "south_africa",
          hubspotValue: "South Africa",
          displayLabel: "South Africa",
          sortOrder: 44,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "spain",
          hubspotValue: "Spain",
          displayLabel: "Spain",
          sortOrder: 45,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "sri_lanka",
          hubspotValue: "Sri Lanka",
          displayLabel: "Sri Lanka",
          sortOrder: 46,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "sweden",
          hubspotValue: "Sweden",
          displayLabel: "Sweden",
          sortOrder: 47,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "switzerland",
          hubspotValue: "Switzerland",
          displayLabel: "Switzerland",
          sortOrder: 48,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "thailand",
          hubspotValue: "Thailand",
          displayLabel: "Thailand",
          sortOrder: 49,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "turkey",
          hubspotValue: "Türkiye",
          displayLabel: "Türkiye",
          sortOrder: 50,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "uae",
          hubspotValue: "United Arab Emirates",
          displayLabel: "United Arab Emirates",
          sortOrder: 51,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "uk",
          hubspotValue: "United Kingdom",
          displayLabel: "United Kingdom",
          sortOrder: 52,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "us",
          hubspotValue: "United States",
          displayLabel: "United States",
          sortOrder: 53,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "vietnam",
          hubspotValue: "Vietnam",
          displayLabel: "Vietnam",
          sortOrder: 54,
          isActive: true,
        },
        {
          enumMappingId: nationalityEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 255,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Nationality seeded (55 common values - expand as needed)");

    // ==================== SYSTEM TRACKING GROUP ====================

    // ===== 27. DATA SOURCE =====
    console.log("\n📊 Seeding Data Source...");
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
        description: "Source of data entry",
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
          sourceValue: "api",
          hubspotValue: "API",
          displayLabel: "API",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "website_form",
          hubspotValue: "Website Form",
          displayLabel: "Website Form",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: dataSourceEnum.id,
          sourceValue: "partner_integration",
          hubspotValue: "Partner Integration",
          displayLabel: "Partner Integration",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Data Source seeded (5 values)");

    // ===== 28. GDPR CONSENT =====
    console.log("\n🔒 Seeding GDPR Consent...");
    const gdprConsentEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "gdprConsent",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "gdpr_consent",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "gdprConsent",
        hubspotProperty: "gdpr_consent",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "GDPR consent status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: gdprConsentEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: gdprConsentEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: gdprConsentEnum.id,
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
    console.log("✅ GDPR Consent seeded (3 values)");

    // ===== 29. MARKETING CONSENT =====
    console.log("\n📧 Seeding Marketing Consent...");
    const marketingConsentEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "marketingConsent",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "marketing_consent",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "marketingConsent",
        hubspotProperty: "marketing_consent",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Marketing communication consent status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: marketingConsentEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: marketingConsentEnum.id,
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
    console.log("✅ Marketing Consent seeded (2 values)");

    console.log("\n📋 Seeding Student Record Status...");
    const studentRecordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "studentRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "student_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "studentRecordStatus",
        hubspotProperty: "student_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of student record in system",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: studentRecordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: studentRecordStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: studentRecordStatusEnum.id,
          sourceValue: "duplicate",
          hubspotValue: "Duplicate",
          displayLabel: "Duplicate",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: studentRecordStatusEnum.id,
          sourceValue: "merged",
          hubspotValue: "Merged",
          displayLabel: "Merged",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Student Record Status seeded (4 values)");

    console.log("\n" + "=".repeat(80));
    console.log("📊 EDUMATE CONTACT ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Successfully seeded: ${successCount}/30 enum mappings`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(80));

    console.log("\n📋 ENUM VALUES COUNT:");
    console.log("   ACADEMIC INFORMATION GROUP:");
    console.log("   1. Admission Status: 6 values");
    console.log("   2. Current Education Level: 6 values");
    console.log("   3. Intended Start Term: 4 values");
    console.log("   4. Preferred Study Destination: 15 values");
    console.log("   5. Target Degree Level: 6 values");

    console.log("\n   APPLICATION JOURNEY GROUP:");
    console.log("   6. Current Status Disposition: 6 values");
    console.log("   7. Current Status Disposition Reason: 4 values");
    console.log("   8. Priority Level: 3 values");

    console.log("\n   EDUMATE CONTACTS INFORMATION GROUP:");
    console.log("   9. Course Type: 3 values");

    console.log("\n   FINANCIAL INFORMATION GROUP:");
    console.log("   10. Co-applicant 1 Occupation: 4 values");
    console.log("   11. Co-applicant 1 Relationship: 9 values");
    console.log("   12. Co-applicant 2 Occupation: 4 values");
    console.log("   13. Co-applicant 2 Relationship: 9 values");
    console.log("   14. Co-applicant 3 Occupation: 4 values");
    console.log("   15. Co-applicant 3 Relationship: 9 values");
    console.log("   16. Collateral 2 Available: 2 values");
    console.log("   17. Collateral 2 Type: 4 values");
    console.log("   18. Collateral Available: 2 values");
    console.log("   19. Collateral Type: 4 values");
    console.log("   20. Currency: 7 values");

    console.log("\n   LEAD ATTRIBUTION GROUP:");
    console.log("   21. Lead Source: 8 values");
    console.log("   22. Partner Commission Applicable: 2 values");

    console.log("\n   LOAN PREFERENCES GROUP:");
    console.log("   23. Loan Type Preference: 4 values");
    console.log("   24. Repayment Type Preference: 4 values");

    console.log("\n   PERSONAL INFORMATION GROUP:");
    console.log("   25. Gender: 4 values");
    console.log("   26. Nationality: 55 values (expand as needed)");

    console.log("\n   SYSTEM TRACKING GROUP:");
    console.log("   27. Data Source: 5 values");
    console.log("   28. GDPR Consent: 3 values");
    console.log("   29. Marketing Consent: 2 values");
    console.log("   30. Student Record Status: 4 values");

    console.log("\n   📈 TOTAL: ~200+ enum values");
    console.log("=".repeat(80));
  } catch (error) {
    errorCount++;
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

const seedLoanApplicationEnumMappings = async () => {
  console.log("Starting Loan Application Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-46227735";

  try {
    // ===== 1. ADMISSION STATUS =====
    console.log("\n📚 Seeding Admission Status...");
    const admissionStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanAppAdmissionStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "admission_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanAppAdmissionStatus",
        hubspotProperty: "admission_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "University admission status of the student",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "not_applied",
          hubspotValue: "Not Applied",
          displayLabel: "Not Applied",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "applied",
          hubspotValue: "Applied",
          displayLabel: "Applied",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "admitted",
          hubspotValue: "Admitted",
          displayLabel: "Admitted",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "waitlisted",
          hubspotValue: "Waitlisted",
          displayLabel: "Waitlisted",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "deferred",
          hubspotValue: "Deferred",
          displayLabel: "Deferred",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: admissionStatusEnum.id,
          sourceValue: "interview_scheduled",
          hubspotValue: "Interview Scheduled",
          displayLabel: "Interview Scheduled",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Admission Status seeded (7 values)");

    // ===== 2. COURSE LEVEL =====
    console.log("\n🎓 Seeding Course Level...");
    const courseLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "courseLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "course_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "courseLevel",
        hubspotProperty: "course_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Level of educational course",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "bachelors",
          hubspotValue: "Bachelors",
          displayLabel: "Bachelors",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "masters",
          hubspotValue: "Masters",
          displayLabel: "Master's",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "phd",
          hubspotValue: "PhD",
          displayLabel: "PhD",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "diploma",
          hubspotValue: "Diploma",
          displayLabel: "Diploma",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "certificate",
          hubspotValue: "Certificate",
          displayLabel: "Certificate",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: courseLevelEnum.id,
          sourceValue: "professional",
          hubspotValue: "Professional",
          displayLabel: "Professional",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Course Level seeded (6 values)");

    // ===== 3. I20 CAS RECEIVED =====
    console.log("\n📄 Seeding I20 CAS Received...");
    const i20CasReceivedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "i20CasReceived",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "i20_cas_received",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "i20CasReceived",
        hubspotProperty: "i20_cas_received",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of I-20/CAS document receipt",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: i20CasReceivedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: i20CasReceivedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: i20CasReceivedEnum.id,
          sourceValue: "not_applicable",
          hubspotValue: "Not Applicable",
          displayLabel: "Not Applicable",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: i20CasReceivedEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ I20 CAS Received seeded (4 values)");

    // ===== 4. VISA STATUS =====
    console.log("\n🛂 Seeding Visa Status...");
    const visaStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "visaStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "visa_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "visaStatus",
        hubspotProperty: "visa_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current visa application status",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: visaStatusEnum.id,
          sourceValue: "not_applied",
          hubspotValue: "Not Applied",
          displayLabel: "Not Applied",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: visaStatusEnum.id,
          sourceValue: "applied",
          hubspotValue: "Applied",
          displayLabel: "Applied",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: visaStatusEnum.id,
          sourceValue: "approved",
          hubspotValue: "Approved",
          displayLabel: "Approved",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: visaStatusEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: visaStatusEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Visa Status seeded (5 values)");

    // ==================== APPLICATION STATUS GROUP ====================

    // ===== 5. APPLICATION STATUS =====
    console.log("\n📋 Seeding Application Status...");
    const applicationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "applicationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "application_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "applicationStatus",
        hubspotProperty: "application_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current status of loan application",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "pre_approved",
          hubspotValue: "Pre-Approved",
          displayLabel: "Pre-Approved",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "approved",
          hubspotValue: "Approved",
          displayLabel: "Approved",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "sanction_letter_issued",
          hubspotValue: "Sanction Letter Issued",
          displayLabel: "Sanction Letter Issued",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "disbursement_pending",
          hubspotValue: "Disbursement Pending",
          displayLabel: "Disbursement Pending",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "disbursed",
          hubspotValue: "Disbursed",
          displayLabel: "Disbursed",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "on_hold",
          hubspotValue: "On Hold",
          displayLabel: "On Hold",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "withdrawn",
          hubspotValue: "Withdrawn",
          displayLabel: "Withdrawn",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: applicationStatusEnum.id,
          sourceValue: "cancelled",
          hubspotValue: "Cancelled",
          displayLabel: "Cancelled",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Application Status seeded (9 values)");

    // ===== 6. PRIORITY LEVEL =====
    console.log("\n⭐ Seeding Priority Level...");
    const priorityLevelEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanAppPriorityLevel",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "priority_level",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanAppPriorityLevel",
        hubspotProperty: "priority_level",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Priority level of loan application",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "high",
          hubspotValue: "High",
          displayLabel: "High",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "medium",
          hubspotValue: "Medium",
          displayLabel: "Medium",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "low",
          hubspotValue: "Low",
          displayLabel: "Low",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: priorityLevelEnum.id,
          sourceValue: "urgent",
          hubspotValue: "Urgent",
          displayLabel: "Urgent",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Priority Level seeded (4 values)");

    // ==================== COMMISSION & SETTLEMENT GROUP ====================

    // ===== 7. COMMISSION CALCULATION BASE =====
    console.log("\n💰 Seeding Commission Calculation Base...");
    const commissionCalculationBaseEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "commissionCalculationBase",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "commission_calculation_base",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "commissionCalculationBase",
        hubspotProperty: "commission_calculation_base",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Basis for commission calculation",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: commissionCalculationBaseEnum.id,
          sourceValue: "loan_amount",
          hubspotValue: "Loan Amount",
          displayLabel: "Loan Amount",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: commissionCalculationBaseEnum.id,
          sourceValue: "fixed_amount",
          hubspotValue: "Fixed Amount",
          displayLabel: "Fixed Amount",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: commissionCalculationBaseEnum.id,
          sourceValue: "tiered",
          hubspotValue: "Tiered",
          displayLabel: "Tiered",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Commission Calculation Base seeded (3 values)");

    // ===== 8. COMMISSION STATUS =====
    console.log("\n💵 Seeding Commission Status...");
    const commissionStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "commissionStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "commission_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "commissionStatus",
        hubspotProperty: "commission_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of commission payment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "not_applicable",
          hubspotValue: "Not Applicable",
          displayLabel: "Not Applicable",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "pending_calculation",
          hubspotValue: "Pending Calculation",
          displayLabel: "Pending Calculation",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "calculated",
          hubspotValue: "Calculated",
          displayLabel: "Calculated",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "approved_for_payment",
          hubspotValue: "Approved for Payment",
          displayLabel: "Approved for Payment",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "paid",
          hubspotValue: "Paid",
          displayLabel: "Paid",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: commissionStatusEnum.id,
          sourceValue: "on_hold",
          hubspotValue: "On Hold",
          displayLabel: "On Hold",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Commission Status seeded (6 values)");

    // ===== 9. PARTNER COMMISSION APPLICABLE =====
    console.log("\n🤝 Seeding Partner Commission Applicable...");
    const partnerCommissionApplicableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanAppPartnerCommissionApplicable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "partner_commission_applicable",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanAppPartnerCommissionApplicable",
        hubspotProperty: "partner_commission_applicable",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether partner commission is applicable",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partnerCommissionApplicableEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partnerCommissionApplicableEnum.id,
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
    console.log("✅ Partner Commission Applicable seeded (2 values)");

    // ==================== COMMUNICATION GROUP ====================

    // ===== 10. COMMUNICATION PREFERENCE =====
    console.log("\n📞 Seeding Communication Preference...");
    const communicationPreferenceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "communicationPreference",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "communication_preference",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "communicationPreference",
        hubspotProperty: "communication_preference",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Preferred communication channel",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: communicationPreferenceEnum.id,
          sourceValue: "phone",
          hubspotValue: "Phone",
          displayLabel: "Phone",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: communicationPreferenceEnum.id,
          sourceValue: "email",
          hubspotValue: "Email",
          displayLabel: "Email",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: communicationPreferenceEnum.id,
          sourceValue: "whatsapp",
          hubspotValue: "WhatsApp",
          displayLabel: "WhatsApp",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: communicationPreferenceEnum.id,
          sourceValue: "sms",
          hubspotValue: "SMS",
          displayLabel: "SMS",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: communicationPreferenceEnum.id,
          sourceValue: "video_call",
          hubspotValue: "Video Call",
          displayLabel: "Video Call",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Communication Preference seeded (5 values)");

    // ===== 11. COMPLAINT RAISED =====
    console.log("\n⚠️ Seeding Complaint Raised...");
    const complaintRaisedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "complaintRaised",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "complaint_raised",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "complaintRaised",
        hubspotProperty: "complaint_raised",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether a complaint has been raised",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: complaintRaisedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: complaintRaisedEnum.id,
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
    console.log("✅ Complaint Raised seeded (2 values)");

    // ===== 12. FOLLOW UP FREQUENCY =====
    console.log("\n🔄 Seeding Follow Up Frequency...");
    const followUpFrequencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "followUpFrequency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "follow_up_frequency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "followUpFrequency",
        hubspotProperty: "follow_up_frequency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Frequency of follow-up communication",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: followUpFrequencyEnum.id,
          sourceValue: "daily",
          hubspotValue: "Daily",
          displayLabel: "Daily",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: followUpFrequencyEnum.id,
          sourceValue: "weekly",
          hubspotValue: "Weekly",
          displayLabel: "Weekly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: followUpFrequencyEnum.id,
          sourceValue: "bi_weekly",
          hubspotValue: "Bi-weekly",
          displayLabel: "Bi-weekly",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: followUpFrequencyEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: followUpFrequencyEnum.id,
          sourceValue: "as_needed",
          hubspotValue: "As Needed",
          displayLabel: "As Needed",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Follow Up Frequency seeded (5 values)");

    // ==================== LENDER INFORMATION GROUP ====================

    // ===== 13. CO-SIGNER REQUIRED =====
    console.log("\n✍️ Seeding Co-signer Required...");
    const coSignerRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coSignerRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_signer_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coSignerRequired",
        hubspotProperty: "co_signer_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether co-signer is required for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coSignerRequiredEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coSignerRequiredEnum.id,
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
    console.log("✅ Co-signer Required seeded (2 values)");

    // ===== 14. COLLATERAL REQUIRED =====
    console.log("\n🏦 Seeding Collateral Required...");
    const collateralRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateralRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateralRequired",
        hubspotProperty: "collateral_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether collateral is required for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralRequiredEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralRequiredEnum.id,
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
    console.log("✅ Collateral Required seeded (2 values)");

    // ===== 15. INTEREST RATE TYPE =====
    console.log("\n📊 Seeding Interest Rate Type...");
    const interestRateTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "interestRateType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "interest_rate_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "interestRateType",
        hubspotProperty: "interest_rate_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of interest rate applied to loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: interestRateTypeEnum.id,
          sourceValue: "fixed",
          hubspotValue: "Fixed",
          displayLabel: "Fixed",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: interestRateTypeEnum.id,
          sourceValue: "floating",
          hubspotValue: "Floating",
          displayLabel: "Floating",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: interestRateTypeEnum.id,
          sourceValue: "hybrid",
          hubspotValue: "Hybrid",
          displayLabel: "Hybrid",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Interest Rate Type seeded (3 values)");

    // ===== 16. LOAN PRODUCT TYPE =====
    console.log("\n💳 Seeding Loan Product Type...");
    const loanProductTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanProductType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "loan_product_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanProductType",
        hubspotProperty: "loan_product_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: loanProductTypeEnum.id,
          sourceValue: "secured",
          hubspotValue: "Secured",
          displayLabel: "Secured",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: loanProductTypeEnum.id,
          sourceValue: "unsecured",
          hubspotValue: "Unsecured",
          displayLabel: "Unsecured",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: loanProductTypeEnum.id,
          sourceValue: "government_scheme",
          hubspotValue: "Government Scheme",
          displayLabel: "Government Scheme",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Loan Product Type seeded (3 values)");

    // ==================== LOAN APPLICATIONS INFORMATION GROUP ====================

    // ===== 17. APPLICATION SOURCE =====
    console.log("\n📢 Seeding Application Source...");
    const applicationSourceEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanAppApplicationSource",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "application_source",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanAppApplicationSource",
        hubspotProperty: "application_source",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Source of loan application",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: applicationSourceEnum.id,
          sourceValue: "direct",
          hubspotValue: "Direct",
          displayLabel: "Direct",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceEnum.id,
          sourceValue: "b2b_partner",
          hubspotValue: "B2B Partner",
          displayLabel: "B2B Partner",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceEnum.id,
          sourceValue: "website",
          hubspotValue: "Website",
          displayLabel: "Website",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceEnum.id,
          sourceValue: "referral",
          hubspotValue: "Referral",
          displayLabel: "Referral",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceEnum.id,
          sourceValue: "advertisement",
          hubspotValue: "Advertisement",
          displayLabel: "Advertisement",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Application Source seeded (5 values)");

    // ==================== PROCESSING TIMELINE GROUP ====================

    // ===== 18. DELAY REASON =====
    console.log("\n⏱️ Seeding Delay Reason...");
    const delayReasonEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "delayReason",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "delay_reason",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "delayReason",
        hubspotProperty: "delay_reason",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Reason for application delay",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: delayReasonEnum.id,
          sourceValue: "incomplete_documents",
          hubspotValue: "Incomplete Documents",
          displayLabel: "Incomplete Documents",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: delayReasonEnum.id,
          sourceValue: "customer_not_responding",
          hubspotValue: "Customer not responding",
          displayLabel: "Customer not responding",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: delayReasonEnum.id,
          sourceValue: "etc",
          hubspotValue: "etc.",
          displayLabel: "Other",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Delay Reason seeded (3 values)");

    // ===== 19. SLA BREACH =====
    console.log("\n🚨 Seeding SLA Breach...");
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
        description: "Whether SLA has been breached",
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
    console.log("✅ SLA Breach seeded (2 values)");

    // ==================== REJECTION & ISSUES GROUP ====================

    // ===== 20. APPEAL OUTCOME =====
    console.log("\n⚖️ Seeding Appeal Outcome...");
    const appealOutcomeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "appealOutcome",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "appeal_outcome",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "appealOutcome",
        hubspotProperty: "appeal_outcome",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Outcome of appeal process",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: appealOutcomeEnum.id,
          sourceValue: "pending",
          hubspotValue: "Pending",
          displayLabel: "Pending",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: appealOutcomeEnum.id,
          sourceValue: "approved",
          hubspotValue: "Approved",
          displayLabel: "Approved",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: appealOutcomeEnum.id,
          sourceValue: "rejected",
          hubspotValue: "Rejected",
          displayLabel: "Rejected",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: appealOutcomeEnum.id,
          sourceValue: "not_applicable",
          hubspotValue: "Not Applicable",
          displayLabel: "Not Applicable",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Appeal Outcome seeded (4 values)");

    // ===== 21. APPEAL SUBMITTED =====
    console.log("\n📝 Seeding Appeal Submitted...");
    const appealSubmittedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "appealSubmitted",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "appeal_submitted",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "appealSubmitted",
        hubspotProperty: "appeal_submitted",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether appeal has been submitted",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: appealSubmittedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: appealSubmittedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: appealSubmittedEnum.id,
          sourceValue: "not_applicable",
          hubspotValue: "Not Applicable",
          displayLabel: "Not Applicable",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Appeal Submitted seeded (3 values)");

    // ===== 22. REJECTION REASON =====
    console.log("\n❌ Seeding Rejection Reason...");
    const rejectionReasonEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "rejectionReason",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "rejection_reason",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "rejectionReason",
        hubspotProperty: "rejection_reason",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Reason for loan application rejection",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "insufficient_income",
          hubspotValue: "Insufficient Income",
          displayLabel: "Insufficient Income",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "poor_credit_score",
          hubspotValue: "Poor Credit Score",
          displayLabel: "Poor Credit Score",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "incomplete_documents",
          hubspotValue: "Incomplete Documents",
          displayLabel: "Incomplete Documents",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "course_not_approved",
          hubspotValue: "Course Not Approved",
          displayLabel: "Course Not Approved",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "university_not_approved",
          hubspotValue: "University Not Approved",
          displayLabel: "University Not Approved",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "high_risk_profile",
          hubspotValue: "High Risk Profile",
          displayLabel: "High Risk Profile",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "policy_changes",
          hubspotValue: "Policy Changes",
          displayLabel: "Policy Changes",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: rejectionReasonEnum.id,
          sourceValue: "other",
          hubspotValue: "Other",
          displayLabel: "Other",
          sortOrder: 8,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Rejection Reason seeded (8 values)");

    // ==================== SYSTEM TRACKING GROUP ====================

    // ===== 23. APPLICATION RECORD STATUS =====
    console.log("\n📋 Seeding Application Record Status...");
    const applicationRecordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "applicationRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "application_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "applicationRecordStatus",
        hubspotProperty: "application_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of application record in system",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: applicationRecordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: applicationRecordStatusEnum.id,
          sourceValue: "completed",
          hubspotValue: "Completed,",
          displayLabel: "Completed",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: applicationRecordStatusEnum.id,
          sourceValue: "cancelled",
          hubspotValue: "Cancelled",
          displayLabel: "Cancelled",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: applicationRecordStatusEnum.id,
          sourceValue: "archived",
          hubspotValue: "Archived",
          displayLabel: "Archived",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Application Record Status seeded (4 values)");

    // ===== 24. APPLICATION SOURCE SYSTEM =====
    console.log("\n💻 Seeding Application Source System...");
    const applicationSourceSystemEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "applicationSourceSystem",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "application_source_system",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "applicationSourceSystem",
        hubspotProperty: "application_source_system",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "System source of application entry",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: applicationSourceSystemEnum.id,
          sourceValue: "manual_entry",
          hubspotValue: "Manual Entry",
          displayLabel: "Manual Entry",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceSystemEnum.id,
          sourceValue: "website_form",
          hubspotValue: "Website Form",
          displayLabel: "Website Form",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceSystemEnum.id,
          sourceValue: "partner_portal",
          hubspotValue: "Partner Portal",
          displayLabel: "Partner Portal",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceSystemEnum.id,
          sourceValue: "import",
          hubspotValue: "Import",
          displayLabel: "Import",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: applicationSourceSystemEnum.id,
          sourceValue: "api",
          hubspotValue: "API",
          displayLabel: "API",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Application Source System seeded (5 values)");

    // ===== 25. INTEGRATION STATUS =====
    console.log("\n🔄 Seeding Integration Status...");
    const integrationStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanAppIntegrationStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "integration_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanAppIntegrationStatus",
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
          sourceValue: "synced",
          hubspotValue: "Synced",
          displayLabel: "Synced",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "pending_sync",
          hubspotValue: "Pending Sync",
          displayLabel: "Pending Sync",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "sync_failed",
          hubspotValue: "Sync Failed",
          displayLabel: "Sync Failed",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: integrationStatusEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Integration Status seeded (4 values)");

    console.log("\n" + "=".repeat(80));
    console.log("📊 LOAN APPLICATION ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Successfully seeded: ${successCount}/25 enum mappings`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(80));

    console.log("\n📋 ENUM VALUES COUNT BY GROUP:");

    console.log("\n   ACADEMIC DETAILS:");
    console.log("   1. Admission Status: 7 values");
    console.log("   2. Course Level: 6 values");
    console.log("   3. I20 CAS Received: 4 values");
    console.log("   4. Visa Status: 5 values");

    console.log("\n   APPLICATION STATUS:");
    console.log("   5. Application Status: 9 values");
    console.log("   6. Priority Level: 4 values");

    console.log("\n   COMMISSION & SETTLEMENT:");
    console.log("   7. Commission Calculation Base: 3 values");
    console.log("   8. Commission Status: 6 values");
    console.log("   9. Partner Commission Applicable: 2 values");

    console.log("\n   COMMUNICATION:");
    console.log("   10. Communication Preference: 5 values");
    console.log("   11. Complaint Raised: 2 values");
    console.log("   12. Follow Up Frequency: 5 values");

    console.log("\n   LENDER INFORMATION:");
    console.log("   13. Co-signer Required: 2 values");
    console.log("   14. Collateral Required: 2 values");
    console.log("   15. Interest Rate Type: 3 values");
    console.log("   16. Loan Product Type: 3 values");

    console.log("\n   LOAN APPLICATIONS INFORMATION:");
    console.log("   17. Application Source: 5 values");

    console.log("\n   PROCESSING TIMELINE:");
    console.log("   18. Delay Reason: 3 values");
    console.log("   19. SLA Breach: 2 values");

    console.log("\n   REJECTION & ISSUES:");
    console.log("   20. Appeal Outcome: 4 values");
    console.log("   21. Appeal Submitted: 3 values");
    console.log("   22. Rejection Reason: 8 values");

    console.log("\n   SYSTEM TRACKING:");
    console.log("   23. Application Record Status: 4 values");
    console.log("   24. Application Source System: 5 values");
    console.log("   25. Integration Status: 4 values");

    console.log("\n   📈 TOTAL: 106 enum values across 25 mappings");
    console.log("=".repeat(80));
  } catch (error) {
    errorCount++;
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

const seedLoanProductEnumMappings = async () => {
  console.log("Starting Loan Product Enum Mappings seeding...");
  let successCount = 0;
  let errorCount = 0;

  const hubspotObjectType = "2-52086541";

  try {
    // ===== 1. PRODUCT TYPE =====
    console.log("\n📦 Seeding Product Type...");
    const productTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "productType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "product_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "productType",
        hubspotProperty: "product_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of loan product offered",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "secured_education_loan",
          hubspotValue: "Secured Education Loan",
          displayLabel: "Secured Education Loan",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "unsecured_education_loan",
          hubspotValue: "Unsecured Education Loan",
          displayLabel: "Unsecured Education Loan",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "government_scheme",
          hubspotValue: "Government Scheme",
          displayLabel: "Government Scheme",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "scholar_loan",
          hubspotValue: "Scholar Loan",
          displayLabel: "Scholar Loan",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "express_loan",
          hubspotValue: "Express Loan",
          displayLabel: "Express Loan",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: productTypeEnum.id,
          sourceValue: "premium_loan",
          hubspotValue: "Premium Loan",
          displayLabel: "Premium Loan",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Product Type seeded (6 values)");

    // ===== 2. PRODUCT CATEGORY =====
    console.log("\n📚 Seeding Product Category...");
    const productCategoryEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "productCategory",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "product_category",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "productCategory",
        hubspotProperty: "product_category",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Category of education loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: productCategoryEnum.id,
          sourceValue: "domestic_education",
          hubspotValue: "Domestic Education",
          displayLabel: "Domestic Education",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: productCategoryEnum.id,
          sourceValue: "international_education",
          hubspotValue: "International Education",
          displayLabel: "International Education",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: productCategoryEnum.id,
          sourceValue: "skill_development",
          hubspotValue: "Skill Development",
          displayLabel: "Skill Development",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: productCategoryEnum.id,
          sourceValue: "professional_courses",
          hubspotValue: "Professional Courses",
          displayLabel: "Professional Courses",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Product Category seeded (4 values)");

    // ===== 3. PRODUCT STATUS =====
    console.log("\n⚡ Seeding Product Status...");
    const productStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "productStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "product_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "productStatus",
        hubspotProperty: "product_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Current status of loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: productStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: productStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: productStatusEnum.id,
          sourceValue: "discontinued",
          hubspotValue: "Discontinued",
          displayLabel: "Discontinued",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: productStatusEnum.id,
          sourceValue: "coming_soon",
          hubspotValue: "Coming Soon",
          displayLabel: "Coming Soon",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: productStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Product Status seeded (5 values)");

    // ==================== APPLICATION & PROCESSING ====================

    // ===== 4. APPLICATION MODE =====
    console.log("\n💻 Seeding Application Mode...");
    const applicationModeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "applicationMode",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "application_mode",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "applicationMode",
        hubspotProperty: "application_mode",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Mode of loan application submission",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: applicationModeEnum.id,
          sourceValue: "online",
          hubspotValue: "Online",
          displayLabel: "Online",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: applicationModeEnum.id,
          sourceValue: "offline",
          hubspotValue: "Offline",
          displayLabel: "Offline",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: applicationModeEnum.id,
          sourceValue: "hybrid",
          hubspotValue: "Hybrid",
          displayLabel: "Hybrid",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: applicationModeEnum.id,
          sourceValue: "mobile_app",
          hubspotValue: "Mobile App",
          displayLabel: "Mobile App",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: applicationModeEnum.id,
          sourceValue: "portal",
          hubspotValue: "Portal",
          displayLabel: "Portal",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Application Mode seeded (5 values)");

    // ===== 5. DISBURSEMENT PROCESS =====
    console.log("\n💰 Seeding Disbursement Process...");
    const disbursementProcessEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "disbursementProcess",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "disbursement_process",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "disbursementProcess",
        hubspotProperty: "disbursement_process",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Process for loan disbursement",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: disbursementProcessEnum.id,
          sourceValue: "direct_to_university",
          hubspotValue: "Direct to University",
          displayLabel: "Direct to University",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: disbursementProcessEnum.id,
          sourceValue: "direct_to_student",
          hubspotValue: "Direct to Student",
          displayLabel: "Direct to Student",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: disbursementProcessEnum.id,
          sourceValue: "installment_based",
          hubspotValue: "Installment Based",
          displayLabel: "Installment Based",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: disbursementProcessEnum.id,
          sourceValue: "full_amount",
          hubspotValue: "Full Amount",
          displayLabel: "Full Amount",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: disbursementProcessEnum.id,
          sourceValue: "partial_disbursement",
          hubspotValue: "Partial Disbursement",
          displayLabel: "Partial Disbursement",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Disbursement Process seeded (5 values)");

    // ==================== COLLATERAL & SECURITY ====================

    // ===== 6. COLLATERAL REQUIRED =====
    console.log("\n🏦 Seeding Collateral Required...");
    const collateralRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanProductCollateralRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanProductCollateralRequired",
        hubspotProperty: "collateral_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Collateral requirement for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralRequiredEnum.id,
          sourceValue: "yes_always",
          hubspotValue: "Yes - Always",
          displayLabel: "Yes - Always",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralRequiredEnum.id,
          sourceValue: "yes_above_threshold",
          hubspotValue: "Yes - Above Threshold",
          displayLabel: "Yes - Above Threshold",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: collateralRequiredEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: collateralRequiredEnum.id,
          sourceValue: "optional",
          hubspotValue: "Optional",
          displayLabel: "Optional",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Collateral Required seeded (4 values)");

    // ===== 7. COLLATERAL TYPES ACCEPTED =====
    console.log("\n🏠 Seeding Collateral Types Accepted...");
    const collateralTypesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "collateralTypesAccepted",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "collateral_types_accepted",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "collateralTypesAccepted",
        hubspotProperty: "collateral_types_accepted",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Types of collateral accepted by lender",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: collateralTypesEnum.id,
          sourceValue: "residential_property",
          hubspotValue: "Residential Property",
          displayLabel: "Residential Property",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: collateralTypesEnum.id,
          sourceValue: "commercial_property",
          hubspotValue: "Commercial Property",
          displayLabel: "Commercial Property",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: collateralTypesEnum.id,
          sourceValue: "non_agricultural_land",
          hubspotValue: "Non Agricultural Land",
          displayLabel: "Non Agricultural Land",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: collateralTypesEnum.id,
          sourceValue: "fixed_deposits",
          hubspotValue: "Fixed Deposits",
          displayLabel: "Fixed Deposits",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Collateral Types Accepted seeded (4 values)");

    // ===== 8. GUARANTOR REQUIRED =====
    console.log("\n✍️ Seeding Guarantor Required...");
    const guarantorRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "guarantorRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "guarantor_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "guarantorRequired",
        hubspotProperty: "guarantor_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Guarantor requirement for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: guarantorRequiredEnum.id,
          sourceValue: "always",
          hubspotValue: "Always",
          displayLabel: "Always",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: guarantorRequiredEnum.id,
          sourceValue: "above_threshold",
          hubspotValue: "Above Threshold",
          displayLabel: "Above Threshold",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: guarantorRequiredEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: guarantorRequiredEnum.id,
          sourceValue: "optional",
          hubspotValue: "Optional",
          displayLabel: "Optional",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Guarantor Required seeded (4 values)");

    // ===== 9. INSURANCE REQUIRED =====
    console.log("\n🛡️ Seeding Insurance Required...");
    const insuranceRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "insuranceRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "insurance_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "insuranceRequired",
        hubspotProperty: "insurance_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Insurance requirement for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: insuranceRequiredEnum.id,
          sourceValue: "life_insurance",
          hubspotValue: "Life Insurance",
          displayLabel: "Life Insurance",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: insuranceRequiredEnum.id,
          sourceValue: "property_insurance",
          hubspotValue: "Property Insurance",
          displayLabel: "Property Insurance",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: insuranceRequiredEnum.id,
          sourceValue: "both",
          hubspotValue: "Both",
          displayLabel: "Both",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: insuranceRequiredEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Insurance Required seeded (4 values)");

    // ===== 10. THIRD PARTY GUARANTEE ACCEPTED =====
    console.log("\n🤝 Seeding Third Party Guarantee Accepted...");
    const thirdPartyGuaranteeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "thirdPartyGuaranteeAccepted",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "third_party_guarantee_accepted",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "thirdPartyGuaranteeAccepted",
        hubspotProperty: "third_party_guarantee_accepted",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether third party guarantee is accepted",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: thirdPartyGuaranteeEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: thirdPartyGuaranteeEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: thirdPartyGuaranteeEnum.id,
          sourceValue: "case_by_case",
          hubspotValue: "Case by Case",
          displayLabel: "Case by Case",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Third Party Guarantee Accepted seeded (3 values)");

    // ==================== COMPETITIVE ANALYSIS ====================

    // ===== 11. MARKET POSITIONING =====
    console.log("\n📊 Seeding Market Positioning...");
    const marketPositioningEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "marketPositioning",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "market_positioning",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "marketPositioning",
        hubspotProperty: "market_positioning",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Market positioning of loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: marketPositioningEnum.id,
          sourceValue: "premium",
          hubspotValue: "Premium",
          displayLabel: "Premium",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: marketPositioningEnum.id,
          sourceValue: "mid_market",
          hubspotValue: "Mid-Market",
          displayLabel: "Mid-Market",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: marketPositioningEnum.id,
          sourceValue: "budget",
          hubspotValue: "Budget",
          displayLabel: "Budget",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: marketPositioningEnum.id,
          sourceValue: "niche",
          hubspotValue: "Niche",
          displayLabel: "Niche",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: marketPositioningEnum.id,
          sourceValue: "mass_market",
          hubspotValue: "Mass Market",
          displayLabel: "Mass Market",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Market Positioning seeded (5 values)");

    // ===== 12. PRICING STRATEGY =====
    console.log("\n💵 Seeding Pricing Strategy...");
    const pricingStrategyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "pricingStrategy",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "pricing_strategy",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "pricingStrategy",
        hubspotProperty: "pricing_strategy",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Pricing strategy for loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: pricingStrategyEnum.id,
          sourceValue: "competitive",
          hubspotValue: "Competitive",
          displayLabel: "Competitive",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: pricingStrategyEnum.id,
          sourceValue: "premium",
          hubspotValue: "Premium",
          displayLabel: "Premium",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: pricingStrategyEnum.id,
          sourceValue: "penetration",
          hubspotValue: "Penetration",
          displayLabel: "Penetration",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: pricingStrategyEnum.id,
          sourceValue: "value_based",
          hubspotValue: "Value Based",
          displayLabel: "Value Based",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Pricing Strategy seeded (4 values)");

    // ==================== ELIGIBILITY CRITERIA ====================

    // ===== 13. CO-APPLICANT RELATIONSHIP =====
    console.log("\n👥 Seeding Co-applicant Relationship...");
    const coApplicantRelationshipEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "coApplicantRelationship",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_relationship",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "coApplicantRelationship",
        hubspotProperty: "co_applicant_relationship",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Acceptable co-applicant relationships",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "parent",
          hubspotValue: "Parent",
          displayLabel: "Parent",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "spouse",
          hubspotValue: "Spouse",
          displayLabel: "Spouse",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "guardian",
          hubspotValue: "Guardian",
          displayLabel: "Guardian",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "sibling",
          hubspotValue: "Sibling",
          displayLabel: "Sibling",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "in_laws",
          hubspotValue: "In-laws",
          displayLabel: "In-laws",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRelationshipEnum.id,
          sourceValue: "any_blood_relative",
          hubspotValue: "Any Blood Relative",
          displayLabel: "Any Blood Relative",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Co-applicant Relationship seeded (6 values)");

    // ===== 14. CO-APPLICANT REQUIRED =====
    console.log("\n👤 Seeding Co-applicant Required...");
    const coApplicantRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanProductCoApplicantRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "co_applicant_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanProductCoApplicantRequired",
        hubspotProperty: "co_applicant_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether co-applicant is required",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: coApplicantRequiredEnum.id,
          sourceValue: "always",
          hubspotValue: "Always",
          displayLabel: "Always",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRequiredEnum.id,
          sourceValue: "sometimes",
          hubspotValue: "Sometimes",
          displayLabel: "Sometimes",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: coApplicantRequiredEnum.id,
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
    console.log("✅ Co-applicant Required seeded (3 values)");

    // ===== 15. ENTRANCE EXAM REQUIRED =====
    console.log("\n📝 Seeding Entrance Exam Required...");
    const entranceExamRequiredEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "entranceExamRequired",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "entrance_exam_required",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "entranceExamRequired",
        hubspotProperty: "entrance_exam_required",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Required entrance exams for eligibility",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "gre",
          hubspotValue: "GRE",
          displayLabel: "GRE",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "gmat",
          hubspotValue: "GMAT",
          displayLabel: "GMAT",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "ielts",
          hubspotValue: "IELTS",
          displayLabel: "IELTS",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "toefl",
          hubspotValue: "TOEFL",
          displayLabel: "TOEFL",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "sat",
          hubspotValue: "SAT",
          displayLabel: "SAT",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "neet",
          hubspotValue: "NEET",
          displayLabel: "NEET",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "jee",
          hubspotValue: "JEE",
          displayLabel: "JEE",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "cat",
          hubspotValue: "CAT",
          displayLabel: "CAT",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: entranceExamRequiredEnum.id,
          sourceValue: "not_required",
          hubspotValue: "Not Required",
          displayLabel: "Not Required",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Entrance Exam Required seeded (9 values)");

    // ===== 16. NATIONALITY RESTRICTIONS =====
    console.log("\n🌍 Seeding Nationality Restrictions...");
    const nationalityRestrictionsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "nationalityRestrictions",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "nationality_restrictions",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "nationalityRestrictions",
        hubspotProperty: "nationality_restrictions",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Nationality restrictions for loan eligibility",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: nationalityRestrictionsEnum.id,
          sourceValue: "indian",
          hubspotValue: "Indian",
          displayLabel: "Indian",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: nationalityRestrictionsEnum.id,
          sourceValue: "others",
          hubspotValue: "Others",
          displayLabel: "Others",
          sortOrder: 2,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Nationality Restrictions seeded (2 values)");

    // ===== 17. RESIDENCY REQUIREMENTS =====
    console.log("\n🏡 Seeding Residency Requirements...");
    const residencyRequirementsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "residencyRequirements",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "residency_requirements",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "residencyRequirements",
        hubspotProperty: "residency_requirements",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Residency requirements for loan eligibility",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: residencyRequirementsEnum.id,
          sourceValue: "resident",
          hubspotValue: "Resident",
          displayLabel: "Resident",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: residencyRequirementsEnum.id,
          sourceValue: "non_resident",
          hubspotValue: "Non-Resident",
          displayLabel: "Non-Resident",
          sortOrder: 2,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Residency Requirements seeded (2 values)");

    // ===== 18. TARGET SEGMENT =====
    console.log("\n🎯 Seeding Target Segment...");
    const targetSegmentEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "targetSegment",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "target_segment",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "targetSegment",
        hubspotProperty: "target_segment",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Target student segment for loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "undergraduate",
          hubspotValue: "Undergraduate",
          displayLabel: "Undergraduate",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "graduate",
          hubspotValue: "Graduate",
          displayLabel: "Graduate",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "phd",
          hubspotValue: "PhD",
          displayLabel: "PhD",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "diploma",
          hubspotValue: "Diploma",
          displayLabel: "Diploma",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "certificate",
          hubspotValue: "Certificate",
          displayLabel: "Certificate",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "professional",
          hubspotValue: "Professional",
          displayLabel: "Professional",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "technical",
          hubspotValue: "Technical",
          displayLabel: "Technical",
          sortOrder: 7,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "medical",
          hubspotValue: "Medical",
          displayLabel: "Medical",
          sortOrder: 8,
          isActive: true,
        },
        {
          enumMappingId: targetSegmentEnum.id,
          sourceValue: "management",
          hubspotValue: "Management",
          displayLabel: "Management",
          sortOrder: 9,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Target Segment seeded (9 values)");

    // ==================== FINANCIAL TERMS ====================

    // ===== 19. INTEREST RATE TYPE =====
    console.log("\n📊 Seeding Interest Rate Type...");
    const loanProductInterestRateTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "loanProductInterestRateType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "interest_rate_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "loanProductInterestRateType",
        hubspotProperty: "interest_rate_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of interest rate for loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: loanProductInterestRateTypeEnum.id,
          sourceValue: "fixed",
          hubspotValue: "Fixed",
          displayLabel: "Fixed",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: loanProductInterestRateTypeEnum.id,
          sourceValue: "floating",
          hubspotValue: "Floating",
          displayLabel: "Floating",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: loanProductInterestRateTypeEnum.id,
          sourceValue: "hybrid",
          hubspotValue: "Hybrid",
          displayLabel: "Hybrid",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: loanProductInterestRateTypeEnum.id,
          sourceValue: "choice_based",
          hubspotValue: "Choice Based",
          displayLabel: "Choice Based",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Interest Rate Type seeded (4 values)");

    // ===== 20. PROCESSING FEE TYPE =====
    console.log("\n💳 Seeding Processing Fee Type...");
    const processingFeeTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "processingFeeType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "processing_fee_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "processingFeeType",
        hubspotProperty: "processing_fee_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of processing fee charged",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: processingFeeTypeEnum.id,
          sourceValue: "percentage",
          hubspotValue: "Percentage",
          displayLabel: "Percentage",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: processingFeeTypeEnum.id,
          sourceValue: "fixed_amount",
          hubspotValue: "Fixed Amount",
          displayLabel: "Fixed Amount",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: processingFeeTypeEnum.id,
          sourceValue: "nil",
          hubspotValue: "Nil",
          displayLabel: "Nil",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Processing Fee Type seeded (3 values)");

    // ==================== GEOGRAPHIC COVERAGE ====================

    // ===== 21. SUPPORTED COURSE TYPES =====
    console.log("\n📖 Seeding Supported Course Types...");
    const loanProductSupportedCourseTypesEnum = await prisma.enumMapping.upsert(
      {
        where: {
          enumName_version: {
            enumName: "loanProductSupportedCourseTypes",
            version: 1,
          },
        },
        update: {
          hubspotProperty: "supported_course_types",
          hubspotObjectType: hubspotObjectType,
          isActive: true,
        },
        create: {
          enumName: "loanProductSupportedCourseTypes",
          hubspotProperty: "supported_course_types",
          hubspotObjectType: hubspotObjectType,
          version: 1,
          isActive: true,
          description: "Types of courses supported by loan product",
        },
      }
    );

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "full_time",
          hubspotValue: "Full Time",
          displayLabel: "Full Time",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "part_time",
          hubspotValue: "Part Time",
          displayLabel: "Part Time",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "distance_learning",
          hubspotValue: "Distance Learning",
          displayLabel: "Distance Learning",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "online",
          hubspotValue: "Online",
          displayLabel: "Online",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "executive",
          hubspotValue: "Executive",
          displayLabel: "Executive",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "regular",
          hubspotValue: "Regular",
          displayLabel: "Regular",
          sortOrder: 6,
          isActive: true,
        },
        {
          enumMappingId: loanProductSupportedCourseTypesEnum.id,
          sourceValue: "accelerated",
          hubspotValue: "Accelerated",
          displayLabel: "Accelerated",
          sortOrder: 7,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Supported Course Types seeded (7 values)");

    // ==================== REPAYMENT TERMS ====================

    // ===== 22. MORATORIUM TYPE =====
    console.log("\n⏸️ Seeding Moratorium Type...");
    const moratoriumTypeEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "moratoriumType",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "moratorium_type",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "moratoriumType",
        hubspotProperty: "moratorium_type",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Type of moratorium period offered",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: moratoriumTypeEnum.id,
          sourceValue: "complete",
          hubspotValue: "Complete",
          displayLabel: "Complete",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: moratoriumTypeEnum.id,
          sourceValue: "interest_only",
          hubspotValue: "Interest Only",
          displayLabel: "Interest Only",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: moratoriumTypeEnum.id,
          sourceValue: "partial_emi",
          hubspotValue: "Partial EMI",
          displayLabel: "Partial EMI",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: moratoriumTypeEnum.id,
          sourceValue: "no_moratorium",
          hubspotValue: "No Moratorium",
          displayLabel: "No Moratorium",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Moratorium Type seeded (4 values)");

    // ===== 23. PART PAYMENT ALLOWED =====
    console.log("\n💸 Seeding Part Payment Allowed...");
    const partPaymentAllowedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "partPaymentAllowed",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "part_payment_allowed",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "partPaymentAllowed",
        hubspotProperty: "part_payment_allowed",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether part payment is allowed",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: partPaymentAllowedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: partPaymentAllowedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: partPaymentAllowedEnum.id,
          sourceValue: "minimum_amount",
          hubspotValue: "Minimum Amount",
          displayLabel: "Minimum Amount",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Part Payment Allowed seeded (3 values)");

    // ===== 24. PREPAYMENT ALLOWED =====
    console.log("\n💰 Seeding Prepayment Allowed...");
    const prepaymentAllowedEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "prepaymentAllowed",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "prepayment_allowed",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "prepaymentAllowed",
        hubspotProperty: "prepayment_allowed",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Whether prepayment is allowed",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: prepaymentAllowedEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: prepaymentAllowedEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: prepaymentAllowedEnum.id,
          sourceValue: "after_lock_in_period",
          hubspotValue: "After Lock-in Period",
          displayLabel: "After Lock-in Period",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Prepayment Allowed seeded (3 values)");

    // ===== 25. REPAYMENT FREQUENCY =====
    console.log("\n📅 Seeding Repayment Frequency...");
    const repaymentFrequencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "repaymentFrequency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "repayment_frequency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "repaymentFrequency",
        hubspotProperty: "repayment_frequency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Frequency of loan repayment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: repaymentFrequencyEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: repaymentFrequencyEnum.id,
          sourceValue: "quarterly",
          hubspotValue: "Quarterly",
          displayLabel: "Quarterly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: repaymentFrequencyEnum.id,
          sourceValue: "half_yearly",
          hubspotValue: "Half-yearly",
          displayLabel: "Half-yearly",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: repaymentFrequencyEnum.id,
          sourceValue: "annually",
          hubspotValue: "Annually",
          displayLabel: "Annually",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: repaymentFrequencyEnum.id,
          sourceValue: "flexible",
          hubspotValue: "Flexible",
          displayLabel: "Flexible",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Repayment Frequency seeded (5 values)");

    // ==================== SPECIAL FEATURES ====================

    // ===== 26. CUSTOMER SUPPORT FEATURES =====
    console.log("\n📞 Seeding Customer Support Features...");
    const customerSupportFeaturesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "customerSupportFeatures",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "customer_support_features",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "customerSupportFeatures",
        hubspotProperty: "customer_support_features",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Customer support features available",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: customerSupportFeaturesEnum.id,
          sourceValue: "24x7_support",
          hubspotValue: "24x7 Support",
          displayLabel: "24x7 Support",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: customerSupportFeaturesEnum.id,
          sourceValue: "dedicated_rm",
          hubspotValue: "Dedicated RM",
          displayLabel: "Dedicated RM",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: customerSupportFeaturesEnum.id,
          sourceValue: "online_chat",
          hubspotValue: "Online Chat",
          displayLabel: "Online Chat",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: customerSupportFeaturesEnum.id,
          sourceValue: "video_kyc",
          hubspotValue: "Video KYC",
          displayLabel: "Video KYC",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: customerSupportFeaturesEnum.id,
          sourceValue: "door_step_service",
          hubspotValue: "Door Step Service",
          displayLabel: "Door Step Service",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Customer Support Features seeded (5 values)");

    // ===== 27. DIGITAL FEATURES =====
    console.log("\n📱 Seeding Digital Features...");
    const digitalFeaturesEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "digitalFeatures",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "digital_features",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "digitalFeatures",
        hubspotProperty: "digital_features",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Digital features available for loan product",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "online_application",
          hubspotValue: "Online Application",
          displayLabel: "Online Application",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "digital_documentation",
          hubspotValue: "Digital Documentation",
          displayLabel: "Digital Documentation",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "e_statements",
          hubspotValue: "E-Statements",
          displayLabel: "E-Statements",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "mobile_app",
          hubspotValue: "Mobile App",
          displayLabel: "Mobile App",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "sms_alerts",
          hubspotValue: "SMS Alerts",
          displayLabel: "SMS Alerts",
          sortOrder: 5,
          isActive: true,
        },
        {
          enumMappingId: digitalFeaturesEnum.id,
          sourceValue: "email_notifications",
          hubspotValue: "Email Notifications",
          displayLabel: "Email Notifications",
          sortOrder: 6,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Digital Features seeded (6 values)");

    // ===== 28. FLEXIBLE REPAYMENT OPTIONS =====
    console.log("\n🔄 Seeding Flexible Repayment Options...");
    const flexibleRepaymentOptionsEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "flexibleRepaymentOptions",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "flexible_repayment_options",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "flexibleRepaymentOptions",
        hubspotProperty: "flexible_repayment_options",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Flexible repayment options available",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: flexibleRepaymentOptionsEnum.id,
          sourceValue: "step_up_emi",
          hubspotValue: "Step Up EMI",
          displayLabel: "Step Up EMI",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: flexibleRepaymentOptionsEnum.id,
          sourceValue: "step_down_emi",
          hubspotValue: "Step Down EMI",
          displayLabel: "Step Down EMI",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: flexibleRepaymentOptionsEnum.id,
          sourceValue: "bullet_payment",
          hubspotValue: "Bullet Payment",
          displayLabel: "Bullet Payment",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: flexibleRepaymentOptionsEnum.id,
          sourceValue: "flexible_emi",
          hubspotValue: "Flexible EMI",
          displayLabel: "Flexible EMI",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: flexibleRepaymentOptionsEnum.id,
          sourceValue: "holiday_options",
          hubspotValue: "Holiday Options",
          displayLabel: "Holiday Options",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Flexible Repayment Options seeded (5 values)");

    // ===== 29. TAX BENEFITS AVAILABLE =====
    console.log("\n💼 Seeding Tax Benefits Available...");
    const taxBenefitsAvailableEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "taxBenefitsAvailable",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "tax_benefits_available",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "taxBenefitsAvailable",
        hubspotProperty: "tax_benefits_available",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Tax benefits available for loan",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: taxBenefitsAvailableEnum.id,
          sourceValue: "yes_section_80e",
          hubspotValue: "Yes - Section 80E",
          displayLabel: "Yes - Section 80E",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: taxBenefitsAvailableEnum.id,
          sourceValue: "yes_other",
          hubspotValue: "Yes - Other",
          displayLabel: "Yes - Other",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: taxBenefitsAvailableEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Tax Benefits Available seeded (3 values)");

    // ==================== SYSTEM INTEGRATION ====================

    // ===== 30. API AVAILABILITY =====
    console.log("\n🔌 Seeding API Availability...");
    const apiAvailabilityEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "apiAvailability",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "api_availability",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "apiAvailability",
        hubspotProperty: "api_availability",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Availability of API for integration",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: apiAvailabilityEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: apiAvailabilityEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: apiAvailabilityEnum.id,
          sourceValue: "under_development",
          hubspotValue: "Under Development",
          displayLabel: "Under Development",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: apiAvailabilityEnum.id,
          sourceValue: "planned",
          hubspotValue: "Planned",
          displayLabel: "Planned",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ API Availability seeded (4 values)");

    // ===== 31. DATA FORMAT =====
    console.log("\n📄 Seeding Data Format...");
    const dataFormatEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "dataFormat",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "data_format",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "dataFormat",
        hubspotProperty: "data_format",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Data format for integration",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: dataFormatEnum.id,
          sourceValue: "json",
          hubspotValue: "JSON",
          displayLabel: "JSON",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: dataFormatEnum.id,
          sourceValue: "xml",
          hubspotValue: "XML",
          displayLabel: "XML",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: dataFormatEnum.id,
          sourceValue: "csv",
          hubspotValue: "CSV",
          displayLabel: "CSV",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: dataFormatEnum.id,
          sourceValue: "api",
          hubspotValue: "API",
          displayLabel: "API",
          sortOrder: 4,
          isActive: true,
        },
        {
          enumMappingId: dataFormatEnum.id,
          sourceValue: "manual",
          hubspotValue: "Manual",
          displayLabel: "Manual",
          sortOrder: 5,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Data Format seeded (5 values)");

    // ===== 32. INTEGRATION COMPLEXITY =====
    console.log("\n⚙️ Seeding Integration Complexity...");
    const integrationComplexityEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "integrationComplexity",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "integration_complexity",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "integrationComplexity",
        hubspotProperty: "integration_complexity",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Complexity level of integration",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: integrationComplexityEnum.id,
          sourceValue: "simple",
          hubspotValue: "Simple",
          displayLabel: "Simple",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: integrationComplexityEnum.id,
          sourceValue: "medium",
          hubspotValue: "Medium",
          displayLabel: "Medium",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: integrationComplexityEnum.id,
          sourceValue: "complex",
          hubspotValue: "Complex",
          displayLabel: "Complex",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: integrationComplexityEnum.id,
          sourceValue: "custom_required",
          hubspotValue: "Custom Required",
          displayLabel: "Custom Required",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Integration Complexity seeded (4 values)");

    // ===== 33. SANDBOX ENVIRONMENT =====
    console.log("\n🧪 Seeding Sandbox Environment...");
    const sandboxEnvironmentEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "sandboxEnvironment",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "sandbox_environment",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "sandboxEnvironment",
        hubspotProperty: "sandbox_environment",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Availability of sandbox environment",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: sandboxEnvironmentEnum.id,
          sourceValue: "available",
          hubspotValue: "Available",
          displayLabel: "Available",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: sandboxEnvironmentEnum.id,
          sourceValue: "not_available",
          hubspotValue: "Not Available",
          displayLabel: "Not Available",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: sandboxEnvironmentEnum.id,
          sourceValue: "on_request",
          hubspotValue: "On Request",
          displayLabel: "On Request",
          sortOrder: 3,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Sandbox Environment seeded (3 values)");

    // ===== 34. WEBHOOK SUPPORT =====
    console.log("\n🪝 Seeding Webhook Support...");
    const webhookSupportEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "webhookSupport",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "webhook_support",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "webhookSupport",
        hubspotProperty: "webhook_support",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Availability of webhook support",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: webhookSupportEnum.id,
          sourceValue: "yes",
          hubspotValue: "Yes",
          displayLabel: "Yes",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: webhookSupportEnum.id,
          sourceValue: "no",
          hubspotValue: "No",
          displayLabel: "No",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: webhookSupportEnum.id,
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
    console.log("✅ Webhook Support seeded (3 values)");

    // ==================== SYSTEM TRACKING ====================

    // ===== 35. PRODUCT RECORD STATUS =====
    console.log("\n📝 Seeding Product Record Status...");
    const productRecordStatusEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "productRecordStatus",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "product_record_status",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "productRecordStatus",
        hubspotProperty: "product_record_status",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Status of product record in system",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: productRecordStatusEnum.id,
          sourceValue: "active",
          hubspotValue: "Active",
          displayLabel: "Active",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: productRecordStatusEnum.id,
          sourceValue: "inactive",
          hubspotValue: "Inactive",
          displayLabel: "Inactive",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: productRecordStatusEnum.id,
          sourceValue: "under_review",
          hubspotValue: "Under Review",
          displayLabel: "Under Review",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: productRecordStatusEnum.id,
          sourceValue: "discontinued",
          hubspotValue: "Discontinued",
          displayLabel: "Discontinued",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Product Record Status seeded (4 values)");

    // ===== 36. REVIEW FREQUENCY =====
    console.log("\n🔍 Seeding Review Frequency...");
    const reviewFrequencyEnum = await prisma.enumMapping.upsert({
      where: {
        enumName_version: {
          enumName: "reviewFrequency",
          version: 1,
        },
      },
      update: {
        hubspotProperty: "review_frequency",
        hubspotObjectType: hubspotObjectType,
        isActive: true,
      },
      create: {
        enumName: "reviewFrequency",
        hubspotProperty: "review_frequency",
        hubspotObjectType: hubspotObjectType,
        version: 1,
        isActive: true,
        description: "Frequency of product review",
      },
    });

    await prisma.enumValue.createMany({
      data: [
        {
          enumMappingId: reviewFrequencyEnum.id,
          sourceValue: "monthly",
          hubspotValue: "Monthly",
          displayLabel: "Monthly",
          sortOrder: 1,
          isActive: true,
        },
        {
          enumMappingId: reviewFrequencyEnum.id,
          sourceValue: "quarterly",
          hubspotValue: "Quarterly",
          displayLabel: "Quarterly",
          sortOrder: 2,
          isActive: true,
        },
        {
          enumMappingId: reviewFrequencyEnum.id,
          sourceValue: "half_yearly",
          hubspotValue: "Half-yearly",
          displayLabel: "Half-yearly",
          sortOrder: 3,
          isActive: true,
        },
        {
          enumMappingId: reviewFrequencyEnum.id,
          sourceValue: "yearly",
          hubspotValue: "Yearly",
          displayLabel: "Yearly",
          sortOrder: 4,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    successCount++;
    console.log("✅ Review Frequency seeded (4 values)");

    // ==================== SEEDING SUMMARY ====================
    console.log("\n" + "=".repeat(80));
    console.log("📊 LOAN PRODUCT ENUM MAPPINGS SEEDING SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Successfully seeded: ${successCount}/36 enum mappings`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(80));

    console.log("\n📋 ENUM VALUES COUNT BY GROUP:");

    console.log("\n   MAIN TABLE (LOAN PRODUCTS INFORMATION):");
    console.log("   1. Product Type: 6 values");
    console.log("   2. Product Category: 4 values");
    console.log("   3. Product Status: 5 values");

    console.log("\n   APPLICATION & PROCESSING:");
    console.log("   4. Application Mode: 5 values");
    console.log("   5. Disbursement Process: 5 values");

    console.log("\n   COLLATERAL & SECURITY:");
    console.log("   6. Collateral Required: 4 values");
    console.log("   7. Collateral Types Accepted: 4 values");
    console.log("   8. Guarantor Required: 4 values");
    console.log("   9. Insurance Required: 4 values");
    console.log("   10. Third Party Guarantee Accepted: 3 values");

    console.log("\n   COMPETITIVE ANALYSIS:");
    console.log("   11. Market Positioning: 5 values");
    console.log("   12. Pricing Strategy: 4 values");

    console.log("\n   ELIGIBILITY CRITERIA:");
    console.log("   13. Co-applicant Relationship: 6 values");
    console.log("   14. Co-applicant Required: 3 values");
    console.log("   15. Entrance Exam Required: 9 values");
    console.log("   16. Nationality Restrictions: 2 values");
    console.log("   17. Residency Requirements: 2 values");
    console.log("   18. Target Segment: 9 values");

    console.log("\n   FINANCIAL TERMS:");
    console.log("   19. Interest Rate Type: 4 values");
    console.log("   20. Processing Fee Type: 3 values");

    console.log("\n   GEOGRAPHIC COVERAGE:");
    console.log("   21. Supported Course Types: 7 values");

    console.log("\n   REPAYMENT TERMS:");
    console.log("   22. Moratorium Type: 4 values");
    console.log("   23. Part Payment Allowed: 3 values");
    console.log("   24. Prepayment Allowed: 3 values");
    console.log("   25. Repayment Frequency: 5 values");

    console.log("\n   SPECIAL FEATURES:");
    console.log("   26. Customer Support Features: 5 values");
    console.log("   27. Digital Features: 6 values");
    console.log("   28. Flexible Repayment Options: 5 values");
    console.log("   29. Tax Benefits Available: 3 values");

    console.log("\n   SYSTEM INTEGRATION:");
    console.log("   30. API Availability: 4 values");
    console.log("   31. Data Format: 5 values");
    console.log("   32. Integration Complexity: 4 values");
    console.log("   33. Sandbox Environment: 3 values");
    console.log("   34. Webhook Support: 3 values");

    console.log("\n   SYSTEM TRACKING:");
    console.log("   35. Product Record Status: 4 values");
    console.log("   36. Review Frequency: 4 values");

    console.log("\n   📈 TOTAL: 159 enum values across 36 mappings");
    console.log("=".repeat(80));
  } catch (error) {
    errorCount++;
    console.error("❌ Error during seeding:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await seedAdminRoles();
    await seedAdminUser();
    await seedRoles();
    await seedCurrencies();
    await seedLenderEnumMappings();
    await seedCommissionEnumMappings();
    await seedPartnerEnumMappings();
    await seedEdumateContactEnumMappings();
    await seedLoanApplicationEnumMappings();
    await seedLoanProductEnumMappings();
    console.log("All seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
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
