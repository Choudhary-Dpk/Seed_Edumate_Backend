import { Router } from "express";
import { validateToken } from "../middlewares";
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
  validateToken(["Admin", "Manager", "User"]),
  checkDuplicateCommissionSettlementFields,
  createCommissionSettlementController
);
router.put(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  updateCommissionSettlementController
);
router.delete(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  deleteCommissionSettlementController
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  getCommissionSettlementDetails
);
router.get(
  "/pagination",
  validateToken(["Admin", "Manager", "User"]),
  getCommissionSettlementsListController
);

export { router as commissionRoutes };
