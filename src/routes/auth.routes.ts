import { Router } from "express";
import { changePasswordValidationRules, createUserValidationRules, forgotPasswordValidationRules, loginValidationRules, passwordValidationRules, validateReqParams } from "../middlewares/validators/validator";
import { validateCreateUser, validateEmail, validateEmailToken, validatePassword, validateToken } from "../middlewares";
import { createUser, forgotPassword, login, logout, resetPassword, sendOtp, setPassword } from "../controllers/user.controller";

const router = Router();

router.post("/create", createUserValidationRules(),validateReqParams,validateCreateUser,createUser);
router.post("/login",loginValidationRules(),validateReqParams,validateEmail,validatePassword,login);
router.post("/otp",loginValidationRules(),validateReqParams,validateEmail,validatePassword,sendOtp);
router.post("/forgot-password",forgotPasswordValidationRules(),validateReqParams,validateEmail,forgotPassword)
router.post("/reset-password",passwordValidationRules(),validateReqParams,validateEmailToken,resetPassword);
router.post("/set-password", passwordValidationRules(),validateReqParams,validateEmailToken, setPassword);
router.post("/logout",validateToken, logout);
router.put(
  "change-password",
  changePasswordValidationRules(),
  validateReqParams,
  validateChangePassword,
  changePassword
);

export default router;