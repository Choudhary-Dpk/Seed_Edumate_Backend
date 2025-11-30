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
  getUserIpDetails,
  validateChangePassword,
  validateAdminEmail,
  validateAdminRefreshToken,
  validateAdminEmailToken,
  validateCreateAdminUser,
  validateEmail,
  validateEmailToken,
  authenticate,
  AuthMethod,
} from "../../middlewares";
import {
  validateReqParams,
  loginValidationRules,
  forgotPasswordValidationRules,
  passwordValidationRules,
  changePasswordValidationRules,
} from "../../middlewares/validators/validator";
import {
  adminLoginController,
  changeAdminPassword,
  forgotAdminPassword,
  getAdminProfile,
  logoutAdmin,
  resetAdminPassword,
  setAdminPassword,
} from "../../controllers/admin/common/auth.controller";
import { createAdminController } from "../../controllers/admin/user.controller";
import { changePassword } from "../../controllers/user.controller";

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
    allowedRoles: ["Admin"],
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
    allowedRoles: ["Admin"],
  }),
  logoutAdmin
);
router.get(
  "/profile",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getAdminProfile
);
router.post("/token", validateAdminRefreshToken, getAccessToken);

export { router as adminAuthRoutes };
