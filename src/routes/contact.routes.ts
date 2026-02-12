import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  contactsLeadPaginationValidationRules,
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import {
  validateContactLeadById,
  validateContactsJSONPayload,
  validateContactsLeadPayload,
} from "../middlewares/contacts";
import {
  createContactsLead,
  deleteContactLead,
  downloadContactsTemplate,
  editContactsLead,
  getContactsLeadDetails,
  getLeadStats,
  uploadContactsCSV,
  uploadContactsJSON,
  upsertContactsLead,
  getLeadsViewList,
} from "../controllers/contact.controller";
import { validateAndParseCSVFile } from "../middlewares/loanApplication.middleware";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateReqParams,
  validateContactsLeadPayload,
  createContactsLead,
);

router.post("/upsert", upsertContactsLead);

router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  deleteContactLead,
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateId(),
  validateReqParams,
  validateContactLeadById,
  getContactsLeadDetails,
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateReqParams,
  validateContactLeadById,
  editContactsLead,
);
router.get(
  "/list",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  contactsLeadPaginationValidationRules(),
  validateReqParams,
  getLeadsViewList,
);

/**
 * GET /contacts/lead-stats
 * Get aggregated lead statistics
 *
 * Query Parameters:
 * - partner: boolean (optional, default: false)
 *   - If true: Filter by authenticated user's b2b_partner_id
 *   - If false: Return all leads without partner filtering
 *
 * Returns:
 * - lifecycleStages: Count grouped by lifecycle_stages
 * - lifecycleStagesStatus: Count grouped by lifecycle_stages_status
 * - totalLeads: Total number of leads
 * - filteredBy: Filter information
 */
router.get(
  "/lead-stats",
  authenticate({
    method: AuthMethod.BOTH, // Allow both JWT and API Key
    allowedRoles: ["Admin", "Manager", "User", "Partner"],
  }),
  validateReqParams,
  getLeadStats,
);

router.post(
  "/upload-csv",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateAndParseCSVFile("CSV"),
  uploadContactsCSV,
);
// Bulk upload contacts via JSON payload
router.post(
  "/bulk-import",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateContactsJSONPayload,
  uploadContactsJSON,
);
router.get("/template", downloadContactsTemplate);

export { router as contactRoutes };
