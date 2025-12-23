const { Client } = require("pg");
require("dotenv").config();

const sql = `
CREATE OR REPLACE FUNCTION notify_edumate_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  contact_id_value INTEGER;
  hs_object_id_value TEXT;
  source_value TEXT;
BEGIN
  IF TG_TABLE_NAME = 'hs_edumate_contacts' THEN
    contact_id_value := COALESCE(NEW.id, OLD.id);
    hs_object_id_value := COALESCE(NEW.hs_object_id, OLD.hs_object_id);
    source_value := COALESCE(NEW.source, OLD.source);
  ELSE
    contact_id_value := COALESCE(NEW.contact_id, OLD.contact_id);
    hs_object_id_value := NULL;
    source_value := NULL;
  END IF;

  payload := json_build_object(
    'table_name', TG_TABLE_NAME,
    'entity_id', COALESCE(NEW.id, OLD.id),
    'contact_id', contact_id_value,
    'operation', TG_OP,
    'hs_object_id', hs_object_id_value,
    'source', source_value,
    'timestamp', EXTRACT(EPOCH FROM NOW())
  );

  -- Always notify on INSERT for main table, block UPDATE from HubSpot
  IF (TG_OP = 'DELETE' 
      OR TG_TABLE_NAME != 'hs_edumate_contacts'
      OR (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'hs_edumate_contacts')
      OR (TG_OP = 'UPDATE' AND (source_value IS NULL OR source_value != 'hubspot'))) THEN
    PERFORM pg_notify('edumate_sync_channel', payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS hs_edumate_contacts_sync_trigger ON hs_edumate_contacts;
DROP TRIGGER IF EXISTS hs_edumate_contacts_personal_information_sync_trigger ON hs_edumate_contacts_personal_information;
DROP TRIGGER IF EXISTS hs_edumate_contacts_academic_profiles_sync_trigger ON hs_edumate_contacts_academic_profiles;
DROP TRIGGER IF EXISTS hs_edumate_contacts_lead_attribution_sync_trigger ON hs_edumate_contacts_lead_attribution;
DROP TRIGGER IF EXISTS hs_edumate_contacts_financial_info_sync_trigger ON hs_edumate_contacts_financial_info;
DROP TRIGGER IF EXISTS hs_edumate_contacts_loan_preferences_sync_trigger ON hs_edumate_contacts_loan_preferences;
DROP TRIGGER IF EXISTS hs_edumate_contacts_application_journey_sync_trigger ON hs_edumate_contacts_application_journey;
DROP TRIGGER IF EXISTS hs_edumate_contacts_system_tracking_sync_trigger ON hs_edumate_contacts_system_tracking;

-- Create triggers for all edumate contact tables
CREATE TRIGGER hs_edumate_contacts_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_personal_information_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_personal_information
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_academic_profiles_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_academic_profiles
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_lead_attribution_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_lead_attribution
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_financial_info_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_financial_info
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_loan_preferences_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_loan_preferences
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_application_journey_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_application_journey
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();

CREATE TRIGGER hs_edumate_contacts_system_tracking_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_edumate_contacts_system_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_edumate_sync();
`;

async function setupEdumateTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("[Edumate Setup] Connecting to database...");
    await client.connect();

    console.log("[Edumate Setup] Creating notify function and triggers...");
    await client.query(sql);

    console.log("[Edumate Setup] Successfully created:");
    console.log("   - notify_edumate_sync() function");
    console.log("   - Triggers on all 8 edumate contact tables");
    console.log("   - Listening on 'edumate_sync_channel'");
  } catch (error) {
    console.error("[Edumate Setup] Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupEdumateTriggers();
}

module.exports = setupEdumateTriggers;
