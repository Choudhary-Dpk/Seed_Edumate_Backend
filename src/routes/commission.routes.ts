import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createCommissionSettlementController,
  deleteCommissionSettlementController,
  getCommissionSettlementDetails,
  getCommissionSettlementsByLead,
  getCommissionSettlementsListController,
  updateCommissionSettlementController,
  uploadInvoiceController,
  generateInvoiceController,
  acceptSettlementController,
  raiseObjectionController,
  resolveDisputeController,
} from "../controllers/commission.controller";
import {
  checkDuplicateCommissionSettlementFields,
  validateSettlementIds,
  validateSettlementOwnership,
  validateSettlementStatus,
} from "../middlewares/commission.middleware";
import multer from "../setup/multer";
import { getB2bPartnersList } from "../controllers/partner.controller";
import { AuthMethod } from "../types/auth";
import { getLeadsViewList } from "../controllers/contact.controller";
export const invoiceUpload = multer(10, ["application/pdf", "pdf"]);
const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateCommissionSettlementFields,
  createCommissionSettlementController,
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  updateCommissionSettlementController,
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  deleteCommissionSettlementController,
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getCommissionSettlementDetails,
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.BOTH,
    allowedRoles: [
      "Admin",
      "Manager",
      "User",
      "super_admin",
      "Admin",
      "commission_reviewer",
      "commission_approver",
      "commission_viewer",
    ],
  }),
  getCommissionSettlementsListController,
);
router.get("/lead", getCommissionSettlementsByLead);
router.post(
  "/upload-invoice",
  authenticate({
    method: AuthMethod.JWT,
  }),
  invoiceUpload.single("file"),
  validateSettlementIds,
  uploadInvoiceController,
);

// ── Phase 3: System generated invoice ──
router.post(
  "/generate-invoice",
  authenticate({
    method: AuthMethod.JWT,
  }),
  generateInvoiceController,
);

// ── Phase 3: Partner accepts settlement ──
router.patch(
  "/:id/accept",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: [],
  }),
  validateSettlementOwnership,
  validateSettlementStatus(["Pending"], "verification_status"),
  acceptSettlementController,
);

// ── Phase 3: Partner raises objection ──
router.patch(
  "/:id/raise-objection",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: [],
  }),
  validateSettlementOwnership,
  validateSettlementStatus(["Pending"], "verification_status"),
  raiseObjectionController,
);

// ── Phase 3: Admin resolves dispute ──
router.patch(
  "/:id/resolve-dispute",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "super_admin"],
  }),
  validateSettlementStatus(["Disputed"], "settlement_status"),
  resolveDisputeController,
);

router.get("/partners", getB2bPartnersList);
router.get("/leads", getLeadsViewList);

export { router as commissionRoutes };
