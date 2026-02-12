import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createLoanApplicationsController,
  updateLoanApplicationController,
  deleteLoanApplicationController,
  getLoanApplicationDetailsController,
  getLoanApplicationsListController,
  getLoanApplicationsList,
} from "../controllers/loanApplication.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  createLoanApplicationsController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
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
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  deleteLoanApplicationController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  getLoanApplicationDetailsController
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  getLoanApplicationsListController
);
router.get(
  "/list",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  getLoanApplicationsList
);

export { router as loanApplicationRouter };
