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
} from "../controllers/commission.controller";
import {
  checkDuplicateCommissionSettlementFields,
  validateSettlementIds,
} from "../middlewares/commission.middleware";
import multer from "../setup/multer";
import { getB2bPartnersList } from "../controllers/partner.controller";
import { getLeadsViewList } from "../controllers/loanApplication.controller";
import { AuthMethod } from "../types/auth";
export const invoiceUpload = multer(10, ["application/pdf", "pdf"]);
const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateCommissionSettlementFields,
  createCommissionSettlementController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  updateCommissionSettlementController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  deleteCommissionSettlementController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getCommissionSettlementDetails
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getCommissionSettlementsListController
);
router.get("/lead", getCommissionSettlementsByLead);
router.post(
  "/upload-invoice",
  invoiceUpload.single("file"),
  validateSettlementIds,
  uploadInvoiceController
);
router.get("/partners", getB2bPartnersList);
router.get("/leads", getLeadsViewList);

export { router as commissionRoutes };
