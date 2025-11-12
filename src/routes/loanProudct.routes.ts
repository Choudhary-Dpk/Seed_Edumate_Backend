import { Router } from "express";
import { validateApiKey, validateToken } from "../middlewares";
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
  validateApiKey,
  checkDuplicateLoanProductFields,
  createLoanProductController
);
router.put("/:id", validateApiKey, updateLoanProductController);
router.delete("/:id", validateApiKey, deleteLoanProductController);
router.get("/details/:id", validateApiKey, getLoanProductDetails);
router.get("/pagination", validateApiKey, getLoanProductsListController);

export { router as loanProuductRoutes };
