import { Router } from "express";
import {
  authenticate,
  AuthMethod,
} from "../../middlewares";
import {
  getLenderListController,
  getLoanProductsByLenderController,
  createLenderController,
  updateLenderController,
  getLendersListController,
  deleteLendersController,
  getLenderDetailsController,
} from "../../controllers/lender.controller";
import { checkDuplicateLenderFields } from "../../middlewares/lender.middleware";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);
router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  checkDuplicateLenderFields,
  createLenderController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  updateLenderController
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLendersListController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  deleteLendersController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLenderDetailsController
);

export { router as lenderRoutes };
