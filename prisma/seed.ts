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

const main = async () => {
  try {
    await seedAdminRoles();
    await seedAdminUser();
    // await seedRoles();
    // await seedCurrencies();
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
