import { Router } from "express";

import { validateAdminToken } from "../../middlewares";
import {
  createLoanProductController,
  updateLoanProductController,
  deleteLoanProductController,
  getLoanProductDetails,
  getLoanProductsListController,
} from "../../controllers/loanProduct.controller";
import { checkDuplicateLoanProductFields } from "../../middlewares/loanProduct.middleware";
const router = Router();

router.post(
  "/",
  validateAdminToken(["Admin"]),
  checkDuplicateLoanProductFields,
  createLoanProductController
);
router.put(
  "/:id",
  validateAdminToken(["Admin"]),
  updateLoanProductController
);
router.delete(
  "/:id",
  validateAdminToken(["Admin"]),
  deleteLoanProductController
);
router.get(
  "/details/:id",
  validateAdminToken(["Admin"]),
  getLoanProductDetails
);
router.get(
  "/pagination",
  validateAdminToken(["Admin"]),
  getLoanProductsListController
);

export { router as loanProuductRoutes };
