import { Router, Request, Response } from "express";
import path from "path";

const router = Router();

/**
 * Serve API Documentation
 * Sets CSP to allow inline scripts for password validation
 */
router.get("/", (req: Request, res: Response) => {
  // Set custom CSP for this route only
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );

  res.sendFile(
    path.join(__dirname, "../../public/docs/accommodation_api_docs.html")
  );
});

/**
 * Health check for docs
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Documentation is available",
    timestamp: new Date().toISOString(),
  });
});

export { router as docsRoutes };