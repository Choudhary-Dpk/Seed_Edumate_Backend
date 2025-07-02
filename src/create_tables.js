const { Client } = require('pg');

// Uncomment the line below if you want to use a .env file for environment variables
// require('dotenv').config();

/**
 * PostgreSQL Table Creation Script for Edumate System
 * 
 * This script creates database tables based on Excel file schemas with hardcoded table structures.
 * Each table includes a 'record_id' field as the primary key.
 * 
 * Setup Instructions:
 * 1. Install dependencies: npm install pg
 * 2. Optional: For .env file support, install dotenv: npm install dotenv
 * 3. Set your database URL in one of these ways:
 *    a) Environment variable: export DATABASE_URL="postgresql://username:password@host:port/database"
 *    b) Create a .env file with: DATABASE_URL=postgresql://username:password@host:port/database
 *    c) Modify the DATABASE_URL constant below
 * 4. Run the script: node create_tables.js
 * 
 * Supported Database Providers:
 * - Local PostgreSQL
 * - Heroku Postgres
 * - Supabase
 * - Railway
 * - Neon
 * - AWS RDS
 * - Google Cloud SQL
 */

// Database connection configuration using connection URL
// You can set the DATABASE_URL environment variable or modify the fallback URL below
// 
// Connection string formats:
// Local PostgreSQL: postgresql://username:password@localhost:5432/database_name
// Heroku: postgres://username:password@hostname:port/database_name
// Supabase: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
// Railway: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
// Neon: postgresql://[username]:[password]@[endpoint]/[dbname]
// 
// To use environment variable, set: export DATABASE_URL="your_connection_string"
//
// Example usage scenarios:
//
// 1. Using environment variable:
//    export DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/edumate_db"
//    node create_tables.js
//
// 2. Using .env file:
//    Create .env file with: DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/edumate_db
//    Uncomment require('dotenv').config() above
//    node create_tables.js
//
// 3. Direct modification:
//    Change the DATABASE_URL constant below and run: node create_tables.js
//
// IMPORTANT: If your password contains special characters (@, :, /, etc.), 
// you must URL encode them. Use encodeURIComponent() or an online URL encoder.
// Example: password@123 becomes password%40123
//
const DATABASE_URL = "postgresql://postgres:admin@localhost:5432/edumate-db" || 'postgresql://username:password@localhost:5432/database_name';

// Function to validate and provide helpful feedback on DATABASE_URL
function validateDatabaseURL(url) {
  if (!url || url === 'postgresql://username:password@localhost:5432/database_name') {
    throw new Error('DATABASE_URL is not configured. Please set a valid PostgreSQL connection string.');
  }
  
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must start with "postgresql://" or "postgres://"');
  }
  
  return url;
}

// Helper function to create properly encoded DATABASE_URL
// Uncomment and use this if your password contains special characters
/*
function createDatabaseURL(username, password, host, port, database) {
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
}

// Example usage:
// const DATABASE_URL = createDatabaseURL('postgres', 'my@password:123', 'localhost', 5432, 'mydb');
*/

const client = new Client({
  connectionString: validateDatabaseURL(DATABASE_URL),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Map Excel data types to PostgreSQL types
function mapDataType(excelType) {
  switch (excelType.toLowerCase()) {
    case 'string':
      return 'TEXT';
    case 'number':
      return 'DECIMAL';
    case 'date':
      return 'DATE';
    case 'datetime':
      return 'TIMESTAMP';
    case 'enumeration':
      return 'TEXT';
    default:
      return 'TEXT';
  }
}

// Table schemas derived from Excel files
const tableSchemas = {
  loan_products: [
    { name: 'application_mode', type: 'enumeration' },
    { name: 'disbursement_process', type: 'enumeration' },
    { name: 'disbursement_timeline', type: 'string' },
    { name: 'documentation_list', type: 'string' },
    { name: 'mandatory_documents', type: 'string' },
    { name: 'optional_documents', type: 'string' },
    { name: 'collateral_margin', type: 'number' },
    { name: 'collateral_required', type: 'enumeration' },
    { name: 'collateral_threshold_amount', type: 'number' },
    { name: 'collateral_types_accepted', type: 'enumeration' },
    { name: 'co_applicant_income_required', type: 'enumeration' },
    { name: 'co_applicant_required', type: 'enumeration' },
    { name: 'co_borrower_required', type: 'enumeration' },
    { name: 'guarantor_required', type: 'enumeration' },
    { name: 'interest_rate_fixed', type: 'number' },
    { name: 'interest_rate_variable', type: 'number' },
    { name: 'loan_amount_max', type: 'number' },
    { name: 'loan_amount_min', type: 'number' },
    { name: 'loan_term_max_months', type: 'number' },
    { name: 'loan_term_min_months', type: 'number' },
    { name: 'moratorium_period_months', type: 'number' },
    { name: 'processing_fee_percentage', type: 'number' },
    { name: 'processing_fee_fixed', type: 'number' },
    { name: 'prepayment_charges', type: 'number' },
    { name: 'late_payment_charges', type: 'number' },
    { name: 'eligibility_criteria', type: 'string' },
    { name: 'age_criteria_min', type: 'number' },
    { name: 'age_criteria_max', type: 'number' },
    { name: 'income_criteria_min', type: 'number' },
    { name: 'credit_score_min', type: 'number' },
    { name: 'employment_type_accepted', type: 'enumeration' },
    { name: 'education_level_required', type: 'enumeration' },
    { name: 'course_types_covered', type: 'string' },
    { name: 'countries_covered', type: 'string' },
    { name: 'universities_covered', type: 'string' },
    { name: 'lender_name', type: 'string' },
    { name: 'product_name', type: 'string' },
    { name: 'product_code', type: 'string' },
    { name: 'product_description', type: 'string' },
    { name: 'product_status', type: 'enumeration' },
    { name: 'launch_date', type: 'date' },
    { name: 'end_date', type: 'date' },
    { name: 'currency', type: 'string' },
    { name: 'regulatory_compliance', type: 'string' },
    { name: 'tax_implications', type: 'string' }
  ],

  loan_documents: [
    { name: 'alternative_documents_accepted', type: 'string' },
    { name: 'equivalent_documents', type: 'string' },
    { name: 'exemption_criteria', type: 'string' },
    { name: 'special_cases_handling', type: 'string' },
    { name: 'waiver_conditions', type: 'string' },
    { name: 'age_criteria', type: 'string' },
    { name: 'applicable_for_co_applicant_1', type: 'enumeration' },
    { name: 'applicable_for_co_applicant_2', type: 'enumeration' },
    { name: 'applicable_for_co_applicant_3', type: 'enumeration' },
    { name: 'applicable_for_guarantor', type: 'enumeration' },
    { name: 'applicable_for_primary_applicant', type: 'enumeration' },
    { name: 'document_category', type: 'enumeration' },
    { name: 'document_format_accepted', type: 'enumeration' },
    { name: 'document_language', type: 'enumeration' },
    { name: 'document_name', type: 'string' },
    { name: 'document_type', type: 'enumeration' },
    { name: 'expiry_date_required', type: 'enumeration' },
    { name: 'file_size_limit_mb', type: 'number' },
    { name: 'mandatory_optional', type: 'enumeration' },
    { name: 'notarization_required', type: 'enumeration' },
    { name: 'submission_deadline', type: 'string' },
    { name: 'submission_method', type: 'enumeration' },
    { name: 'verification_process', type: 'string' },
    { name: 'validity_period_months', type: 'number' },
    { name: 'apostille_required', type: 'enumeration' },
    { name: 'translation_required', type: 'enumeration' },
    { name: 'certification_authority', type: 'string' },
    { name: 'document_description', type: 'string' },
    { name: 'sample_document_available', type: 'enumeration' },
    { name: 'processing_time_days', type: 'number' }
  ],

  loan_applications: [
    { name: 'admission_status', type: 'enumeration' },
    { name: 'course_duration', type: 'number' },
    { name: 'course_end_date', type: 'date' },
    { name: 'course_level', type: 'enumeration' },
    { name: 'course_start_date', type: 'date' },
    { name: 'i20_cas_received', type: 'enumeration' },
    { name: 'target_course', type: 'string' },
    { name: 'target_university', type: 'string' },
    { name: 'target_university_country', type: 'string' },
    { name: 'visa_status', type: 'enumeration' },
    { name: 'application_id', type: 'string' },
    { name: 'applicant_name', type: 'string' },
    { name: 'applicant_email', type: 'string' },
    { name: 'applicant_phone', type: 'string' },
    { name: 'date_of_birth', type: 'date' },
    { name: 'gender', type: 'enumeration' },
    { name: 'nationality', type: 'string' },
    { name: 'passport_number', type: 'string' },
    { name: 'current_address', type: 'string' },
    { name: 'permanent_address', type: 'string' },
    { name: 'father_name', type: 'string' },
    { name: 'mother_name', type: 'string' },
    { name: 'marital_status', type: 'enumeration' },
    { name: 'annual_income', type: 'number' },
    { name: 'employment_status', type: 'enumeration' },
    { name: 'employer_name', type: 'string' },
    { name: 'work_experience_years', type: 'number' },
    { name: 'loan_amount_requested', type: 'number' },
    { name: 'loan_purpose', type: 'string' },
    { name: 'repayment_period_months', type: 'number' },
    { name: 'application_date', type: 'date' },
    { name: 'application_status', type: 'enumeration' },
    { name: 'approval_date', type: 'date' },
    { name: 'disbursement_date', type: 'date' },
    { name: 'rejection_reason', type: 'string' },
    { name: 'credit_score', type: 'number' },
    { name: 'existing_loans', type: 'number' },
    { name: 'monthly_expenses', type: 'number' },
    { name: 'assets_value', type: 'number' },
    { name: 'liabilities_value', type: 'number' }
  ],

  lenders: [
    { name: 'average_approval_rate', type: 'number' },
    { name: 'average_disbursement_days', type: 'number' },
    { name: 'average_processing_days', type: 'number' },
    { name: 'monthly_application_volume', type: 'number' },
    { name: 'quarterly_application_volume', type: 'number' },
    { name: 'yearly_application_volume', type: 'number' },
    { name: 'customer_service_email', type: 'string' },
    { name: 'customer_service_number', type: 'string' },
    { name: 'escalation_hierarchy_1_designation', type: 'string' },
    { name: 'escalation_hierarchy_1_email', type: 'string' },
    { name: 'escalation_hierarchy_1_name', type: 'string' },
    { name: 'escalation_hierarchy_1_phone', type: 'string' },
    { name: 'escalation_hierarchy_2_designation', type: 'string' },
    { name: 'escalation_hierarchy_2_email', type: 'string' },
    { name: 'escalation_hierarchy_2_name', type: 'string' },
    { name: 'escalation_hierarchy_2_phone', type: 'string' },
    { name: 'lender_name', type: 'string' },
    { name: 'lender_code', type: 'string' },
    { name: 'lender_type', type: 'enumeration' },
    { name: 'establishment_year', type: 'number' },
    { name: 'headquarters_location', type: 'string' },
    { name: 'regulatory_license_number', type: 'string' },
    { name: 'regulatory_authority', type: 'string' },
    { name: 'website_url', type: 'string' },
    { name: 'business_hours', type: 'string' },
    { name: 'supported_languages', type: 'string' },
    { name: 'partnership_start_date', type: 'date' },
    { name: 'partnership_status', type: 'enumeration' },
    { name: 'commission_rate', type: 'number' },
    { name: 'settlement_frequency', type: 'enumeration' },
    { name: 'minimum_loan_amount', type: 'number' },
    { name: 'maximum_loan_amount', type: 'number' },
    { name: 'interest_rate_range_min', type: 'number' },
    { name: 'interest_rate_range_max', type: 'number' },
    { name: 'processing_fee_range_min', type: 'number' },
    { name: 'processing_fee_range_max', type: 'number' },
    { name: 'loan_tenure_min_months', type: 'number' },
    { name: 'loan_tenure_max_months', type: 'number' },
    { name: 'collateral_requirement', type: 'enumeration' },
    { name: 'guarantor_requirement', type: 'enumeration' }
  ],

  edumate_contacts: [
    { name: 'admission_status', type: 'enumeration' },
    { name: 'course_duration_months', type: 'number' },
    { name: 'current_cgpa_percentage', type: 'number' },
    { name: 'current_course_major', type: 'string' },
    { name: 'current_education_level', type: 'enumeration' },
    { name: 'current_graduation_year', type: 'number' },
    { name: 'current_institution', type: 'string' },
    { name: 'gmat_score', type: 'number' },
    { name: 'gre_score', type: 'number' },
    { name: 'ielts_score', type: 'number' },
    { name: 'toefl_score', type: 'number' },
    { name: 'sat_score', type: 'number' },
    { name: 'act_score', type: 'number' },
    { name: 'target_course_name', type: 'string' },
    { name: 'target_university_name', type: 'string' },
    { name: 'target_country', type: 'string' },
    { name: 'target_intake', type: 'string' },
    { name: 'target_academic_year', type: 'string' },
    { name: 'estimated_course_fee', type: 'number' },
    { name: 'estimated_living_expenses', type: 'number' },
    { name: 'total_funding_required', type: 'number' },
    { name: 'self_funding_amount', type: 'number' },
    { name: 'loan_amount_required', type: 'number' },
    { name: 'scholarship_amount', type: 'number' },
    { name: 'contact_name', type: 'string' },
    { name: 'contact_email', type: 'string' },
    { name: 'contact_phone', type: 'string' },
    { name: 'contact_source', type: 'enumeration' },
    { name: 'lead_status', type: 'enumeration' },
    { name: 'assigned_counselor', type: 'string' },
    { name: 'first_contact_date', type: 'date' },
    { name: 'last_contact_date', type: 'date' },
    { name: 'next_follow_up_date', type: 'date' },
    { name: 'contact_stage', type: 'enumeration' },
    { name: 'contact_priority', type: 'enumeration' },
    { name: 'father_name', type: 'string' },
    { name: 'mother_name', type: 'string' },
    { name: 'father_occupation', type: 'string' },
    { name: 'mother_occupation', type: 'string' },
    { name: 'family_annual_income', type: 'number' },
    { name: 'current_city', type: 'string' },
    { name: 'current_state', type: 'string' },
    { name: 'current_country', type: 'string' },
    { name: 'preferred_destination_1', type: 'string' },
    { name: 'preferred_destination_2', type: 'string' },
    { name: 'preferred_destination_3', type: 'string' }
  ],

  commission_settlements: [
    { name: 'adjustment_amount', type: 'number' },
    { name: 'adjustment_reason', type: 'string' },
    { name: 'bonus_amount', type: 'number' },
    { name: 'bonus_rate_applied', type: 'number' },
    { name: 'commission_model', type: 'enumeration' },
    { name: 'commission_rate_applied', type: 'number' },
    { name: 'commission_tier_applied', type: 'string' },
    { name: 'gross_commission_amount', type: 'number' },
    { name: 'incentive_amount', type: 'number' },
    { name: 'penalty_amount', type: 'number' },
    { name: 'net_commission_amount', type: 'number' },
    { name: 'settlement_id', type: 'string' },
    { name: 'settlement_date', type: 'date' },
    { name: 'settlement_period_start', type: 'date' },
    { name: 'settlement_period_end', type: 'date' },
    { name: 'settlement_status', type: 'enumeration' },
    { name: 'settlement_method', type: 'enumeration' },
    { name: 'partner_id', type: 'string' },
    { name: 'partner_name', type: 'string' },
    { name: 'partner_type', type: 'enumeration' },
    { name: 'application_count', type: 'number' },
    { name: 'approved_application_count', type: 'number' },
    { name: 'disbursed_application_count', type: 'number' },
    { name: 'total_loan_amount', type: 'number' },
    { name: 'total_disbursed_amount', type: 'number' },
    { name: 'base_commission_rate', type: 'number' },
    { name: 'performance_multiplier', type: 'number' },
    { name: 'quality_score', type: 'number' },
    { name: 'payment_bank_name', type: 'string' },
    { name: 'payment_account_number', type: 'string' },
    { name: 'payment_ifsc_code', type: 'string' },
    { name: 'payment_upi_id', type: 'string' },
    { name: 'tax_deduction_amount', type: 'number' },
    { name: 'tax_rate_applied', type: 'number' },
    { name: 'invoice_number', type: 'string' },
    { name: 'invoice_date', type: 'date' },
    { name: 'payment_reference_number', type: 'string' },
    { name: 'payment_date', type: 'date' },
    { name: 'currency', type: 'string' },
    { name: 'exchange_rate', type: 'number' }
  ],

  b2b_partners: [
    { name: 'business_address', type: 'string' },
    { name: 'business_type', type: 'enumeration' },
    { name: 'city', type: 'string' },
    { name: 'country', type: 'string' },
    { name: 'gst_number', type: 'string' },
    { name: 'hs_created_by_user_id', type: 'number' },
    { name: 'hs_createdate', type: 'datetime' },
    { name: 'hs_lastmodifieddate', type: 'datetime' },
    { name: 'hs_merged_object_ids', type: 'enumeration' },
    { name: 'hs_object_id', type: 'number' },
    { name: 'partner_name', type: 'string' },
    { name: 'partner_code', type: 'string' },
    { name: 'partner_type', type: 'enumeration' },
    { name: 'partnership_tier', type: 'enumeration' },
    { name: 'partnership_start_date', type: 'date' },
    { name: 'partnership_end_date', type: 'date' },
    { name: 'partnership_status', type: 'enumeration' },
    { name: 'primary_contact_name', type: 'string' },
    { name: 'primary_contact_email', type: 'string' },
    { name: 'primary_contact_phone', type: 'string' },
    { name: 'primary_contact_designation', type: 'string' },
    { name: 'secondary_contact_name', type: 'string' },
    { name: 'secondary_contact_email', type: 'string' },
    { name: 'secondary_contact_phone', type: 'string' },
    { name: 'website_url', type: 'string' },
    { name: 'linkedin_profile', type: 'string' },
    { name: 'company_registration_number', type: 'string' },
    { name: 'pan_number', type: 'string' },
    { name: 'tan_number', type: 'string' },
    { name: 'establishment_year', type: 'number' },
    { name: 'employee_count', type: 'number' },
    { name: 'annual_revenue', type: 'number' },
    { name: 'specialization_areas', type: 'string' },
    { name: 'target_markets', type: 'string' },
    { name: 'commission_structure', type: 'enumeration' },
    { name: 'base_commission_rate', type: 'number' },
    { name: 'performance_commission_rate', type: 'number' },
    { name: 'payment_terms', type: 'string' },
    { name: 'settlement_frequency', type: 'enumeration' },
    { name: 'minimum_monthly_volume', type: 'number' },
    { name: 'performance_targets', type: 'string' },
    { name: 'territory_coverage', type: 'string' },
    { name: 'product_authorization', type: 'string' },
    { name: 'certification_status', type: 'enumeration' },
    { name: 'training_completion_date', type: 'date' },
    { name: 'agreement_signed_date', type: 'date' },
    { name: 'agreement_expiry_date', type: 'date' },
    { name: 'last_performance_review_date', type: 'date' },
    { name: 'next_review_due_date', type: 'date' },
    { name: 'onboarding_status', type: 'enumeration' },
    { name: 'risk_category', type: 'enumeration' },
    { name: 'compliance_status', type: 'enumeration' }
  ]
};

// Function to create a single table
async function createTable(tableName, columns) {
  try {
    console.log(`Creating table: ${tableName}`);
    
    // Start with record_id as primary key
    let createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    createTableSQL += `  record_id SERIAL PRIMARY KEY,\n`;
    
    // Add all columns from schema
    const columnDefinitions = columns.map(column => {
      const postgresType = mapDataType(column.type);
      return `  ${column.name} ${postgresType}`;
    });
    
    createTableSQL += columnDefinitions.join(',\n');
    createTableSQL += `\n);`;
    
    // Execute the query
    await client.query(createTableSQL);
    console.log(`✓ Table ${tableName} created successfully`);
    
    // Create index on record_id for better performance
    const indexSQL = `CREATE INDEX IF NOT EXISTS idx_${tableName}_record_id ON ${tableName} (record_id);`;
    await client.query(indexSQL);
    
    return true;
    
  } catch (error) {
    console.error(`✗ Error creating table ${tableName}:`, error.message);
    return false;
  }
}

// Main function to create all tables
async function createAllTables() {
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log('Database URL configured:', DATABASE_URL ? '✓' : '✗');
    
    await client.connect();
    console.log('✓ Connected to database');
    
    // Test connection with a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✓ Database connection test successful');
    console.log('  Server time:', result.rows[0].current_time);
    
    console.log('\nStarting table creation process...\n');
    
    let successCount = 0;
    let totalTables = Object.keys(tableSchemas).length;
    
    for (const [tableName, columns] of Object.entries(tableSchemas)) {
      const success = await createTable(tableName, columns);
      if (success) successCount++;
      console.log(''); // Add spacing between table creations
    }
    
    console.log('='.repeat(50));
    console.log(`Table creation completed!`);
    console.log(`Successfully created: ${successCount}/${totalTables} tables`);
    
    if (successCount === totalTables) {
      console.log('🎉 All tables created successfully!');
    } else {
      console.log(`⚠️  ${totalTables - successCount} tables failed to create`);
    }
    
    // Display table summary
    console.log('\nCreated tables:');
    for (const [tableName, columns] of Object.entries(tableSchemas)) {
      console.log(`  - ${tableName} (${columns.length + 1} columns including record_id)`);
    }
    
  } catch (error) {
    console.error('✗ Failed to connect to database:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check your DATABASE_URL format: postgresql://username:password@hostname:port/database_name');
    console.error('2. Ensure your database server is running');
    console.error('3. Verify your credentials and database name');
    console.error('4. For cloud databases, check if your IP is whitelisted');
    
    // Special handling for SASL authentication errors
    if (error.message.includes('SASL') || error.message.includes('password must be a string')) {
      console.error('5. SPECIAL: Your password contains special characters that need URL encoding');
      console.error('   Examples: @ becomes %40, : becomes %3A, / becomes %2F');
      console.error('   Use https://www.urlencoder.org/ to encode your password');
      console.error('   Example: "pass@123" should be "pass%40123"');
    }
    
    // Safely display DATABASE_URL with masked password
    try {
      const maskedUrl = DATABASE_URL ? DATABASE_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2') : 'Not set';
      console.error('6. Current DATABASE_URL:', maskedUrl);
    } catch (urlError) {
      console.error('6. DATABASE_URL appears to be malformed');
    }
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createAllTables().catch(console.error);
}

module.exports = {
  createAllTables,
  tableSchemas,
  mapDataType
};

/*
Quick Setup Guide:

1. For passwords with special characters:
   Password: "my@pass:123"
   Encoded:  "my%40pass%3A123"
   
   Common encodings:
   @ → %40    : → %3A    / → %2F    # → %23
   % → %25    + → %2B    space → %20

2. Example DATABASE_URLs:
   
   Local PostgreSQL:
   postgresql://postgres:password@localhost:5432/mydb
   
   Heroku:
   postgres://user:pass@host:5432/dbname
   
   Supabase:
   postgresql://postgres:password@db.abc123.supabase.co:5432/postgres
   
   Railway:
   postgresql://postgres:password@host.railway.app:5432/railway

3. Setting DATABASE_URL:
   
   Linux/Mac:
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
   
   Windows Command Prompt:
   set DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb
   
   Windows PowerShell:
   $env:DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"

4. For .env file:
   Create a file named .env in your project root:
   DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb
   
   Then uncomment this line at the top of the script:
   // require('dotenv').config();
*/