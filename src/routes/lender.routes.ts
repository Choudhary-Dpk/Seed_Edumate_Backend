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
import { validateToken } from "../middlewares";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);
router.post(
  "/",
  validateToken(["Admin", "Manager", "User"]),
  createLenderController
);
router.put(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  updateLenderController
);
router.get(
  "/pagination",
  validateToken(["Admin", "Manager", "User"]),
  getLendersListController
);
router.delete(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  deleteLendersController
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  getLenderDetailsController
);

export { router as lenderRoutes };
