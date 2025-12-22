const { Client } = require("pg");
require("dotenv").config();

// Import SQL from individual setup files
const setupEdumateSQL = require("./setup-edumate-triggers");
const setupCommissionSQL = require("./setup-commission-triggers");
const setupLoanSQL = require("./setup-loanApplication-triggers");

async function setupAllTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("\n Starting Database Triggers Setup...\n");
    await client.connect();
    console.log("Connected to database\n");

    // Setup Edumate Triggers
    console.log("Setting up Edumate Contact triggers...");
    await setupEdumateSQL();
    console.log("✓ Edumate triggers created\n");

    // Setup Commission Triggers
    console.log("Setting up Commission Settlement triggers...");
    await setupCommissionSQL();
    console.log("   ✓ Commission triggers created\n");

    // Setup Loan Triggers
    console.log("Setting up Loan Application triggers...");
    await setupLoanSQL();
    console.log("✓ Loan triggers created\n");

    console.log(" All triggers setup completed successfully!\n");
    console.log("Summary:");
    console.log("   • Total Functions: 3");
    console.log("   • Total Triggers: 33");
    console.log("   • Total Channels: 3\n");
  } catch (error) {
    console.error("\n Error setting up triggers:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupAllTriggers();
