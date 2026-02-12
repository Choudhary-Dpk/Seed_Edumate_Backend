import { Router } from "express";
import {
  changePasswordValidationRules,
  createUserValidationRules,
  forgotPasswordValidationRules,
  loginValidationRules,
  passwordValidationRules,
  validateReqParams,
} from "../middlewares/validators/validator";
import {
  authenticate,
  validateChangePassword,
  validateCreateUser,
  validateEmail,
  validateEmailToken,
  validateInactivity,
  validatePassword,
  validateRefreshToken,
} from "../middlewares";
import { changePassword, createUser } from "../controllers/user.controller";
import {
  login,
  sendOtp,
  forgotPassword,
  resetPassword,
  setPassword,
  logout,
  getAccessToken,
} from "../controllers/common/auth.controller";
import { AuthMethod } from "../types/auth";

const router = Router();

router.post(
  "/create",
  createUserValidationRules(),
  validateReqParams,
  validateCreateUser,
  createUser,
);
router.post(
  "/login",
  loginValidationRules(),
  validateReqParams,
  validateEmail,
  validatePassword,
  // getUserIpDetails,
  validateInactivity,
  login,
);
router.post(
  "/otp",
  loginValidationRules(),
  validateReqParams,
  validateEmail,
  validatePassword,
  sendOtp,
);
router.post(
  "/forgot-password",
  forgotPasswordValidationRules(),
  validateReqParams,
  validateEmail,
  forgotPassword,
);
router.post(
  "/reset-password",
  passwordValidationRules(),
  validateReqParams,
  validateEmailToken,
  resetPassword,
);
router.post(
  "/set-password",
  passwordValidationRules(),
  validateReqParams,
  validateEmailToken,
  setPassword,
);
router.put(
  "/change-password",
  changePasswordValidationRules(),
  validateReqParams,
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  validateChangePassword,
  changePassword,
);
router.post(
  "/logout",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User", "super_admin", "Admin", "commission_reviewer", "commission_approver", "commission_viewer"],
  }),
  logout,
);
router.post("/token", validateRefreshToken, getAccessToken);

export default router;
