import { Router } from "express";
import {
  authenticate,
  AuthMethod,
  validateApiKey,
} from "../../middlewares";
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
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  createLoanApplicationsController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  updateLoanApplicationController
);
router.put(
  "/edit/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  updateLoanApplicationController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  deleteLoanApplicationController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLoanApplicationDetailsController
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getLoanApplicationsListController
);
router.get(
  "/list",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  loanApplicationPaginationValidationRules(),
  validateReqParams,
  getLoanApplicationsList
);

export { router as loanApplicationRouter };
