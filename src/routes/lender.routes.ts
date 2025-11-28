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
import { authenticate, AuthMethod, validateApiKey } from "../middlewares";
import { checkDuplicateLenderFields } from "../middlewares/lender.middleware";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);
router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateLenderFields,
  createLenderController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  updateLenderController
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getLendersListController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  deleteLendersController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getLenderDetailsController
);

export { router as lenderRoutes };
