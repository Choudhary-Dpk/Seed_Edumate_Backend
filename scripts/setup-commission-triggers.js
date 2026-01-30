const { Client } = require("pg");
require("dotenv").config();

const sql = `
CREATE OR REPLACE FUNCTION notify_commission_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  settlement_id_value INTEGER;
  hs_object_id_value TEXT;
  source_value TEXT;
BEGIN
  IF TG_TABLE_NAME = 'hs_commission_settlements' THEN
    settlement_id_value := COALESCE(NEW.id, OLD.id);
    hs_object_id_value := COALESCE(NEW.hs_object_id, OLD.hs_object_id);
    source_value := COALESCE(NEW.source, OLD.source);
  ELSE
    settlement_id_value := COALESCE(NEW.settlement_id, OLD.settlement_id);
    hs_object_id_value := NULL;
    source_value := NULL;
  END IF;

  payload := json_build_object(
    'table_name', TG_TABLE_NAME,
    'entity_id', COALESCE(NEW.id, OLD.id),
    'settlement_id', settlement_id_value,
    'operation', TG_OP,
    'hs_object_id', hs_object_id_value,
    'source', source_value,
    'timestamp', EXTRACT(EPOCH FROM NOW())
  );

  -- Always notify on INSERT for main table, block UPDATE from HubSpot
  IF (TG_OP = 'DELETE' 
      OR TG_TABLE_NAME != 'hs_commission_settlements'
      OR (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'hs_commission_settlements')
      OR (TG_OP = 'UPDATE' AND (source_value IS NULL OR source_value != 'hubspot'))) THEN
    PERFORM pg_notify('commission_sync_channel', payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS commission_settlements_sync_trigger ON hs_commission_settlements;
DROP TRIGGER IF EXISTS commission_calculation_sync_trigger ON hs_commission_settlements_commission_calculations;
DROP TRIGGER IF EXISTS commission_communication_sync_trigger ON hs_commission_settlements_communication;
DROP TRIGGER IF EXISTS commission_tax_sync_trigger ON hs_commission_settlements_tax_and_deductions;
DROP TRIGGER IF EXISTS commission_documentation_sync_trigger ON hs_commission_settlements_documentation;
DROP TRIGGER IF EXISTS commission_hold_sync_trigger ON hs_commission_settlements_hold_and_disputes;
DROP TRIGGER IF EXISTS commission_loan_sync_trigger ON hs_commission_settlements_loan_details;
DROP TRIGGER IF EXISTS commission_payment_sync_trigger ON hs_commission_settlements_payment_processing;
DROP TRIGGER IF EXISTS commission_performance_sync_trigger ON hs_commission_settlements_performance_analytics;
DROP TRIGGER IF EXISTS commission_reconciliation_sync_trigger ON hs_commission_settlements_reconciliations;
DROP TRIGGER IF EXISTS commission_status_sync_trigger ON hs_commission_settlements_settlement_status;
DROP TRIGGER IF EXISTS commission_system_sync_trigger ON hs_commission_settlements_system_tracking;
DROP TRIGGER IF EXISTS commission_transaction_sync_trigger ON hs_commission_settlements_transaction_details;

-- Create triggers for all commission settlement tables
CREATE TRIGGER commission_settlements_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_calculation_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_commission_calculations
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_communication_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_communication
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_tax_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_tax_and_deductions
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_documentation_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_documentation
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_hold_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_hold_and_disputes
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_loan_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_loan_details
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_payment_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_payment_processing
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_performance_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_performance_analytics
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_reconciliation_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_reconciliations
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_status_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_settlement_status
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_system_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_system_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();

CREATE TRIGGER commission_transaction_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_commission_settlements_transaction_details
  FOR EACH ROW EXECUTE FUNCTION notify_commission_sync();
`;

async function setupCommissionTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    await client.query(sql);

    console.log("[Commission Setup] Successfully created:");
  } catch (error) {
    console.error("[Commission Setup] Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupCommissionTriggers();
}

module.exports = setupCommissionTriggers;
