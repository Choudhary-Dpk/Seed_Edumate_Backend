import { Router } from "express";
import { getAccessToken } from "../../controllers/common/auth.controller";
import {
  validatePassword,
  getUserIpDetails,
  validateChangePassword,
  validateAdminEmail,
  validateAdminRefreshToken,
  validateAdminEmailToken,
  validateAdminToken,
  validateCreateAdminUser,
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

const router = Router();

router.post("/create", validateCreateAdminUser, createAdminController);
router.post(
  "/login",
  loginValidationRules(),
  validateReqParams,
  validateAdminEmail,
  validatePassword,
  // getUserIpDetails,
  adminLoginController
);
router.post(
  "/forgot-password",
  forgotPasswordValidationRules(),
  validateReqParams,
  validateAdminEmail,
  forgotAdminPassword
);
router.post(
  "/reset-password",
  passwordValidationRules(),
  validateReqParams,
  validateAdminEmailToken,
  resetAdminPassword
);
router.post(
  "/set-password",
  passwordValidationRules(),
  validateReqParams,
  validateAdminEmailToken,
  setAdminPassword
);
router.put(
  "/change-password",
  validateAdminToken(["Admin"]),
  changePasswordValidationRules(),
  validateReqParams,
  validateChangePassword,
  changeAdminPassword
);
router.post("/logout", validateAdminToken(["Admin"]), logoutAdmin);
router.get("/profile", validateAdminToken(["Admin"]), getAdminProfile);
router.post("/token", validateAdminRefreshToken, getAccessToken);

export { router as adminAuthRoutes };
