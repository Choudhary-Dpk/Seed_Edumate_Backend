import { Router } from "express";
import { validateApiKey, validateToken } from "../middlewares";
import {
  createCommissionSettlementController,
  deleteCommissionSettlementController,
  getCommissionSettlementDetails,
  getCommissionSettlementsListController,
  updateCommissionSettlementController,
} from "../controllers/commission.controller";
import { checkDuplicateCommissionSettlementFields } from "../middlewares/commission.middleware";
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

export { router as commissionRoutes };
