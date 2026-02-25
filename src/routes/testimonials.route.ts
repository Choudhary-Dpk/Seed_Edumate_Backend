import { Router } from "express";
import {
    createTestimonialController,
    deleteTestimonialController,
    editTestimonialController,
    getAllTestimonialsController,
    getTestimonailByIdController,
} from "../controllers/testimonials.controller";

const router = Router();

router.post("/", createTestimonialController);
router.get("/pagination", getAllTestimonialsController);
router.get("/:id", getTestimonailByIdController);
router.put("/:id", editTestimonialController);
router.delete("/:id", deleteTestimonialController);

export { router as testimonialsRoutes };