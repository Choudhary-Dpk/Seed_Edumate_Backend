import { Router } from "express";
import {
  createLoanApplication,
  downloadTemplate,
  editLoanApplication,
  deleteLoanApplication,
  getLoanApplicationDetails,
  getLeadsViewList,
} from "../controllers/loanApplication.controller";
import { validateToken } from "../middlewares";
import {
  validateLoanApplicationPayload,
  validateLoanApplicationById,
} from "../middlewares/loanApplication.middleware";
import {
  createValidationRules,
  editValidationRules,
  loanApplicationPaginationValidationRules,
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/create",
  validateToken(["Admin", "Manager", "User"]),
  createValidationRules(),
  validateReqParams,
  validateLoanApplicationPayload,
  createLoanApplication
);
router.put(
  "/edit/:id",
  validateToken(["Admin", "Manager", "User"]),
  editValidationRules(),
  validateReqParams,
  validateLoanApplicationById,
  editLoanApplication
);
router.delete(
  "/delete/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateLoanApplicationById,
  deleteLoanApplication
);
router.get(
  "/list",
  validateToken(["Admin", "Manager", "User"]),
  loanApplicationPaginationValidationRules(),
  validateReqParams,
  getLeadsViewList
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateLoanApplicationById,
  getLoanApplicationDetails
);
router.get(
  "/download-template",
  validateToken(["Admin", "Manager", "User"]),
  downloadTemplate
);

export { router as loanApplicationRouter };
