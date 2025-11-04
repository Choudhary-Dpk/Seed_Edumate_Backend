import { Router } from "express";
import {
  createLenderController,
  deleteLendersController,
  getLenderListController,
  getLendersListController,
  getLoanProductsByLenderController,
  updateLenderController,
  getLenderDetailsController,
} from "../controllers/lender.controller";
import { validateApiKey, validateToken } from "../middlewares";
import { checkDuplicateLenderFields } from "../middlewares/lender.middleware";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);
router.post(
  "/",
  validateApiKey,
  checkDuplicateLenderFields,
  createLenderController
);
router.put("/:id", validateApiKey, updateLenderController);
router.get("/pagination", validateApiKey, getLendersListController);
router.delete("/:id", validateApiKey, deleteLendersController);
router.get("/details/:id", validateApiKey, getLenderDetailsController);

export { router as lenderRoutes };
