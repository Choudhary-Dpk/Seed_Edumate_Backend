import { Router } from "express";
import { validateAdminToken } from "../../middlewares";
import { getLenderListController, getLoanProductsByLenderController, createLenderController, updateLenderController, getLendersListController, deleteLendersController, getLenderDetailsController } from "../../controllers/lender.controller";
import { checkDuplicateLenderFields } from "../../middlewares/lender.middleware";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);
router.post(
  "/",
  validateAdminToken(["Admin"]),
  checkDuplicateLenderFields,
  createLenderController
);
router.put(
  "/:id",
  validateAdminToken(["Admin"]),
  updateLenderController
);
router.get(
  "/pagination",
  validateAdminToken(["Admin"]),
  getLendersListController
);
router.delete(
  "/:id",
  validateAdminToken(["Admin"]),
  deleteLendersController
);
router.get(
  "/details/:id",
  validateAdminToken(["Admin"]),
  getLenderDetailsController
);

export { router as lenderRoutes };
