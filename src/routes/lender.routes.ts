import { Router } from "express";
import {
  getLenderListController,
  getLoanProductsByLenderController,
} from "../controllers/lender.controller";
const router = Router();

router.get("/list", getLenderListController);
router.get("/filter", getLoanProductsByLenderController);

export { router as lenderRoutes };
