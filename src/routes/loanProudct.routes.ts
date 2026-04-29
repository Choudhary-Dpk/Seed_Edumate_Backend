import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createLoanProductController,
  deleteLoanProductController,
  getLoanProductDetails,
  getLoanProductsListController,
  getLoanProductsListControllerV2,
  updateLoanProductController,
} from "../controllers/loanProduct.controller";
import { checkDuplicateLoanProductFields } from "../middlewares/loanProduct.middleware";
import { AuthMethod } from "../types/auth";
const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateLoanProductFields,
  createLoanProductController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  updateLoanProductController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  deleteLoanProductController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getLoanProductDetails
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getLoanProductsListController,
);
router.post(
  "/pagination/v2",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getLoanProductsListControllerV2,
);

export { router as loanProuductRoutes };
