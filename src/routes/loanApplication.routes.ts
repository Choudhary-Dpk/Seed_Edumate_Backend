import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createLoanApplicationsController,
  updateLoanApplicationController,
  deleteLoanApplicationController,
  getLoanApplicationDetailsController,
  getLoanApplicationsListController,
} from "../controllers/loanApplication.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  createLoanApplicationsController
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  updateLoanApplicationController
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  deleteLoanApplicationController
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  getLoanApplicationDetailsController
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  getLoanApplicationsListController
);

export { router as loanApplicationRouter };
