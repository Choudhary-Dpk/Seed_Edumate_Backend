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

  -- FIXED: Always notify on INSERT for main table, block UPDATE from HubSpot
  IF (TG_OP = 'DELETE' 
      OR TG_TABLE_NAME != 'hs_edumate_contacts'
      OR (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'hs_edumate_contacts')
      OR (TG_OP = 'UPDATE' AND (source_value IS NULL OR source_value != 'hubspot'))) THEN
    PERFORM pg_notify('edumate_sync_channel', payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
`;

async function setupEdumateTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("[Fix] Connecting to database...");
    await client.connect();

    console.log("[Fix] Updating function with correct field handling...");
    await client.query(sql);

    console.log("[Fix] Function updated successfully!");
  } catch (error) {
    console.error("[Fix] Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupEdumateTriggers();
}

module.exports = setupEdumateTriggers;
