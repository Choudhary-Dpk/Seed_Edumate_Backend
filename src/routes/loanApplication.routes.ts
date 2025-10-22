import { Router } from "express";
import {
  createLoanApplication,
  downloadTemplate,
  uploadCSV,
  editLoanApplication,
  deleteLoanApplication,
  getLoanApplicationsList,
  getLoanApplicationDetails,
} from "../controllers/loanApplication.controller";
import { validateToken } from "../middlewares";
import {
  validateAndParseCSVFile,
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
  // validateToken(["Admin", "Manager", "User"]),
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
  getLoanApplicationsList
);
router.get(
  "/details/:id",
  validateToken(["Admin", "Manager", "User"]),
  validateId(),
  validateReqParams,
  validateLoanApplicationById,
  getLoanApplicationDetails
);
router.post(
  "/upload-csv",
  validateToken(["Admin", "Manager", "User"]),
  validateAndParseCSVFile("CSV"),
  uploadCSV
);
router.get(
  "/download-template",
  validateToken(["Admin", "Manager", "User"]),
  downloadTemplate
);

export { router as loanApplicationRouter };
