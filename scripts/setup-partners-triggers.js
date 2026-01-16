const { Client } = require("pg");
require("dotenv").config();

const sql = `
CREATE OR REPLACE FUNCTION notify_b2b_partner_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  partner_id_value INTEGER;
  hs_object_id_value TEXT;
  source_value TEXT;
BEGIN
  IF TG_TABLE_NAME = 'hs_b2b_partners' THEN
    partner_id_value := COALESCE(NEW.id, OLD.id);
    hs_object_id_value := COALESCE(NEW.hs_object_id, OLD.hs_object_id);
    source_value := COALESCE(NEW.source, OLD.source);
  ELSE
    partner_id_value := COALESCE(NEW.partner_id, OLD.partner_id);
    hs_object_id_value := NULL;
    source_value := NULL;
  END IF;

  payload := json_build_object(
    'table_name', TG_TABLE_NAME,
    'entity_id', COALESCE(NEW.id, OLD.id),
    'partner_id', partner_id_value,
    'operation', TG_OP,
    'hs_object_id', hs_object_id_value,
    'source', source_value,
    'timestamp', EXTRACT(EPOCH FROM NOW())
  );

  -- Always notify on INSERT for main table, block UPDATE from HubSpot
  IF (TG_OP = 'DELETE' 
      OR TG_TABLE_NAME != 'hs_b2b_partners'
      OR (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'hs_b2b_partners')
      OR (TG_OP = 'UPDATE' AND (source_value IS NULL OR source_value != 'hubspot'))) THEN
    PERFORM pg_notify('b2b_partner_sync_channel', payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS hs_b2b_partners_sync_trigger ON hs_b2b_partners;
DROP TRIGGER IF EXISTS hs_b2b_partners_business_capabilities_sync_trigger ON hs_b2b_partners_business_capabilities;
DROP TRIGGER IF EXISTS hs_b2b_partners_commission_structure_sync_trigger ON hs_b2b_partners_commission_structure;
DROP TRIGGER IF EXISTS hs_b2b_partners_compliance_and_documentation_sync_trigger ON hs_b2b_partners_compliance_and_documentation;
DROP TRIGGER IF EXISTS hs_b2b_partners_contact_info_sync_trigger ON hs_b2b_partners_contact_info;
DROP TRIGGER IF EXISTS hs_b2b_partners_financial_tracking_sync_trigger ON hs_b2b_partners_financial_tracking;
DROP TRIGGER IF EXISTS hs_b2b_partners_lead_attribution_sync_trigger ON hs_b2b_partners_lead_attribution;
DROP TRIGGER IF EXISTS hs_b2b_partners_marketing_and_promotion_sync_trigger ON hs_b2b_partners_marketing_and_promotion;
DROP TRIGGER IF EXISTS hs_b2b_partners_partnership_details_sync_trigger ON hs_b2b_partners_partnership_details;
DROP TRIGGER IF EXISTS hs_b2b_partners_performance_metrics_sync_trigger ON hs_b2b_partners_performance_metrics;
DROP TRIGGER IF EXISTS hs_b2b_partners_relationship_mgmt_sync_trigger ON hs_b2b_partners_relationship_mgmt;
DROP TRIGGER IF EXISTS hs_b2b_partners_system_tracking_sync_trigger ON hs_b2b_partners_system_tracking;

-- Create triggers for all B2B partner tables
CREATE TRIGGER hs_b2b_partners_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_business_capabilities_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_business_capabilities
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_commission_structure_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_commission_structure
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_compliance_and_documentation_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_compliance_and_documentation
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_contact_info_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_contact_info
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_financial_tracking_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_financial_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_lead_attribution_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_lead_attribution
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_marketing_and_promotion_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_marketing_and_promotion
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_partnership_details_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_partnership_details
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_performance_metrics_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_relationship_mgmt_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_relationship_mgmt
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();

CREATE TRIGGER hs_b2b_partners_system_tracking_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hs_b2b_partners_system_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_b2b_partner_sync();
`;

async function setupB2BPartnersTriggers() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("[B2B Partners Setup] Connecting to database...");
        await client.connect();

        console.log("[B2B Partners Setup] Creating notify function and triggers...");
        await client.query(sql);

        console.log("[B2B Partners Setup] Successfully created:");
        console.log("   - notify_b2b_partner_sync() function");
        console.log("   - Listening on 'b2b_partner_sync_channel'");
        console.log("   - 12 triggers for all B2B partner tables");
    } catch (error) {
        console.error("[B2B Partners Setup] Error:", error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    setupB2BPartnersTriggers();
}

module.exports = setupB2BPartnersTriggers;