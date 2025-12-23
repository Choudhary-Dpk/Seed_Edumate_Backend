import { Router } from "express";
import { redirectShortUrl } from "../controllers/shortUrl.controller";

const router = Router();

router.get("/:code", redirectShortUrl);

export { router as redirectRoutes };
