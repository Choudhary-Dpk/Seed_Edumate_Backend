import { Router } from "express";
import {
  forgotPassword,
  getAccessToken,
  login,
  resetPassword,
  setPassword,
} from "../../controllers/common/auth.controller";
import {
  validatePassword,
  validateChangePassword,
  validateAdminRefreshToken,
  validateCreateAdminUser,
  validateEmail,
  validateEmailToken,
  authenticate,
} from "../../middlewares";
import {
  validateReqParams,
  loginValidationRules,
  forgotPasswordValidationRules,
  passwordValidationRules,
  changePasswordValidationRules,
} from "../../middlewares/validators/validator";
import {
  getAdminProfile,
  logoutAdmin,
} from "../../controllers/admin/common/auth.controller";
import { createAdminController } from "../../controllers/admin/user.controller";
import { changePassword } from "../../controllers/user.controller";
import { AuthMethod } from "../../types/auth";

const router = Router();

router.post("/create", validateCreateAdminUser, createAdminController);
router.post(
  "/login",
  loginValidationRules(),
  validateReqParams,
  validateEmail,
  validatePassword,
  // getUserIpDetails,
  login
);
router.post(
  "/forgot-password",
  forgotPasswordValidationRules(),
  validateReqParams,
  validateEmail,
  forgotPassword
);
router.post(
  "/reset-password",
  passwordValidationRules(),
  validateReqParams,
  validateEmailToken,
  resetPassword
);
router.post(
  "/set-password",
  passwordValidationRules(),
  validateReqParams,
  validateEmailToken,
  setPassword
);
router.put(
  "/change-password",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  changePasswordValidationRules(),
  validateReqParams,
  validateChangePassword,
  changePassword
);
router.post(
  "/logout",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  logoutAdmin
);
router.get(
  "/profile",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  getAdminProfile
);
router.post("/token", validateAdminRefreshToken, getAccessToken);

export { router as adminAuthRoutes };
