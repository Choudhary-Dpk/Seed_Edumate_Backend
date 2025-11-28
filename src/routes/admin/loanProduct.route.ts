import { Router } from "express";

import {
  authenticate,
  AuthMethod,
} from "../../middlewares";
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
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  checkDuplicateLoanProductFields,
  createLoanProductController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  updateLoanProductController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  deleteLoanProductController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLoanProductDetails
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLoanProductsListController
);

export { router as loanProuductRoutes };
