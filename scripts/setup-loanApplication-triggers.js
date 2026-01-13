const { Client } = require("pg");
require("dotenv").config();

const sql = `
CREATE OR REPLACE FUNCTION notify_loan_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  application_id_value INTEGER;
  hs_object_id_value TEXT;
  source_value TEXT;
BEGIN
  IF TG_TABLE_NAME = 'hs_loan_applications' THEN
    application_id_value := COALESCE(NEW.id, OLD.id);
    hs_object_id_value := COALESCE(NEW.hs_object_id, OLD.hs_object_id);
    source_value := COALESCE(NEW.source, OLD.source);
  ELSE
    application_id_value := COALESCE(NEW.application_id, OLD.application_id);
    hs_object_id_value := NULL;
    source_value := NULL;
  END IF;

  payload := json_build_object(
    'table_name', TG_TABLE_NAME,
    'entity_id', COALESCE(NEW.id, OLD.id),
    'application_id', application_id_value,
    'operation', TG_OP,
    'hs_object_id', hs_object_id_value,
    'source', source_value,
    'timestamp', EXTRACT(EPOCH FROM NOW())
  );

  -- Always notify on INSERT for main table, block UPDATE from HubSpot
  IF (TG_OP = 'DELETE' 
      OR TG_TABLE_NAME != 'hs_loan_applications'
      OR (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'hs_loan_applications')
      OR (TG_OP = 'UPDATE' AND (source_value IS NULL OR source_value != 'hubspot'))) THEN
    PERFORM pg_notify('loan_sync_channel', payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS loan_applications_sync_trigger ON hs_loan_applications;
DROP TRIGGER IF EXISTS loan_academic_sync_trigger ON hs_loan_applications_academic_details;
DROP TRIGGER IF EXISTS loan_additional_sync_trigger ON hs_loan_applications_additional_services;
DROP TRIGGER IF EXISTS loan_status_sync_trigger ON hs_loan_applications_status;
DROP TRIGGER IF EXISTS loan_commission_sync_trigger ON hs_loan_applications_commission_records;
DROP TRIGGER IF EXISTS loan_communication_sync_trigger ON hs_loan_applications_communication_preferences;
DROP TRIGGER IF EXISTS loan_document_sync_trigger ON hs_loan_applications_document_management;
DROP TRIGGER IF EXISTS loan_financial_sync_trigger ON hs_loan_applications_financial_requirements;
DROP TRIGGER IF EXISTS loan_lender_sync_trigger ON hs_loan_applications_lender_information;
DROP TRIGGER IF EXISTS loan_timeline_sync_trigger ON hs_loan_applications_processing_timeline;
DROP TRIGGER IF EXISTS loan_rejection_sync_trigger ON hs_loan_applications_rejection_details;
DROP TRIGGER IF EXISTS loan_system_sync_trigger ON hs_loan_applications_system_tracking;

-- Create triggers for all loan application tables
CREATE TRIGGER loan_applications_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_academic_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_academic_details
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_additional_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_additional_services
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_status_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_status
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_commission_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_commission_records
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_communication_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_communication_preferences
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_document_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_document_management
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_financial_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_financial_requirements
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_lender_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_lender_information
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_timeline_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_processing_timeline
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_rejection_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_rejection_details
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();

CREATE TRIGGER loan_system_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_loan_applications_system_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_loan_sync();
`;

async function setupLoanTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("[Loan Setup] Connecting to database...");
    await client.connect();

    console.log("[Loan Setup] Creating notify function and triggers...");
    await client.query(sql);

    console.log("[Loan Setup] Successfully created:");
    console.log("   - notify_loan_sync() function");
    console.log("   - Listening on 'loan_sync_channel'");
  } catch (error) {
    console.error("[Loan Setup] Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupLoanTriggers();
}

module.exports = setupLoanTriggers;
