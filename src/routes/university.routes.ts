import { Router } from "express";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";
import {
  getUniversityByCompanyController,
  getUniversityByNameController,
  searchUniversitiesController,
} from "../controllers/university.controller";

const router = Router();

router.get(
  "/search",
  authenticate({ method: AuthMethod.API_KEY }),
  searchUniversitiesController
);

router.get(
  "/by-company/:hs_company_id",
  authenticate({ method: AuthMethod.API_KEY }),
  getUniversityByCompanyController
);

// Query param form: GET /api/universities/by-name?name=Emory University
router.get(
  "/by-name",
  authenticate({ method: AuthMethod.API_KEY }),
  getUniversityByNameController
);

// Path param form: GET /api/universities/by-name/Emory%20University
router.get(
  "/by-name/:name",
  authenticate({ method: AuthMethod.API_KEY }),
  getUniversityByNameController
);

export { router as universityRoutes };
