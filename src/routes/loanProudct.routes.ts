import { Router } from "express";
import { validateToken } from "../middlewares";
import {
  createLoanProductController,
  deleteLoanProductController,
  getLoanProductDetails,
  getLoanProductsListController,
  updateLoanProductController,
} from "../controllers/loanProduct.controller";
import { checkDuplicateLoanProductFields } from "../middlewares/loanProduct.middleware";
const router = Router();

router.post(
  "/",
  validateToken(["Admin", "Manager", "User"]),
  checkDuplicateLoanProductFields,
  createLoanProductController
);
router.put(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  updateLoanProductController
);
router.delete(
  "/:id",
  validateToken(["Admin", "Manager", "User"]),
  deleteLoanProductController
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  getLoanProductDetails
);
router.get(
  "/pagination",
  validateToken(["Admin", "Manager", "User"]),
  getLoanProductsListController
);

export { router as loanProuductRoutes };
