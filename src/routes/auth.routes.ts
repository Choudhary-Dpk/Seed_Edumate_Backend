import { Router } from "express";
import { changePasswordValidationRules, createUserValidationRules, forgotPasswordValidationRules, loginValidationRules, passwordValidationRules, validateReqParams } from "../middlewares/validators/validator";
import {
  getUserIpDetails,
  validateChangePassword,
  validateCreateUser,
  validateEmail,
  validateEmailToken,
  validatePassword,
  validateRefreshToken,
  validateToken,
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

const router = Router();

router.post(
  "/create",
  createUserValidationRules(),
  validateReqParams,
  validateCreateUser,
  createUser
);
router.post(
  "/login",
  loginValidationRules(),
  validateReqParams,
  validateEmail,
  validatePassword,
  getUserIpDetails,
  login
);
router.post(
  "/otp",
  loginValidationRules(),
  validateReqParams,
  validateEmail,
  validatePassword,
  sendOtp
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
  changePasswordValidationRules(),
  validateReqParams,
  validateToken,
  validateChangePassword,
  changePassword
);
router.post("/logout", validateToken(["Admin", "Manager", "User"]), logout);
router.post("/token", validateRefreshToken, getAccessToken);

export default router;