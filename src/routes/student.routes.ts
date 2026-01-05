import { Router } from "express";
import {
  studentProfileController,
  studentSigninController,
  studentSignupController,
  updateStudentController,
} from "../controllers/student/auth.controller";

const router = Router();

router.post("/signup", studentSignupController);
router.post("/login", studentSigninController);
router.get("/profile/:id", studentProfileController);
router.put("/:id", updateStudentController);

export { router as studentRoutes };
