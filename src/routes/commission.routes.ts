import { Router } from "express";
import { validateApiKey, validateToken } from "../middlewares";
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
export const invoiceUpload = multer(10, ["application/pdf", "pdf"]);
const router = Router();

router.post(
  "/",
  validateApiKey,
  checkDuplicateCommissionSettlementFields,
  createCommissionSettlementController
);
router.put("/:id", validateApiKey, updateCommissionSettlementController);
router.delete("/:id", validateApiKey, deleteCommissionSettlementController);
router.get("/details/:id", validateApiKey, getCommissionSettlementDetails);
router.get(
  "/pagination",
  validateApiKey,
  getCommissionSettlementsListController
);
router.get("/lead", getCommissionSettlementsByLead);
router.post(
  "/upload-invoice",
  invoiceUpload.single("file"),
  validateSettlementIds,
  uploadInvoiceController
);

export { router as commissionRoutes };
