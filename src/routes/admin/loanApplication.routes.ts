import { Router } from "express";
import { validateAdminToken, validateApiKey } from "../../middlewares";
import {
  loanApplicationPaginationValidationRules,
  validateReqParams,
} from "../../middlewares/validators/validator";
import {
  createLoanApplicationsController,
  deleteLoanApplicationController,
  getLoanApplicationDetailsController,
  getLoanApplicationsList,
  getLoanApplicationsListController,
  updateLoanApplicationController,
} from "../../controllers/loanApplication.controller";

const router = Router();

router.post(
  "/",
  validateAdminToken(["Admin"]),
  createLoanApplicationsController
);
router.put(
  "/:id",
  validateAdminToken(["Admin"]),
  updateLoanApplicationController
);
router.put(
  "/edit/:id",
  validateApiKey,
  updateLoanApplicationController
);
router.delete(
  "/:id",
  validateAdminToken(["Admin"]),
  deleteLoanApplicationController
);
router.get(
  "/details/:id",
  validateAdminToken(["Admin"]),
  getLoanApplicationDetailsController
);
router.get(
  "/pagination",
  validateAdminToken(["Admin"]),
  getLoanApplicationsListController
);
router.get(
  "/list",
  validateAdminToken(["Admin"]),
  loanApplicationPaginationValidationRules(),
  validateReqParams,
  getLoanApplicationsList
);

export { router as loanApplicationRouter };
