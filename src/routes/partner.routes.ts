import { Router } from "express";
import { getPartnersList } from "../controllers/hubspot.controller";
import { validateToken } from "../middlewares";
import {
  createB2bPartner,
  deletePartner,
  getB2bPartnerDetails,
  getB2bPartnersList,
  getLeadsByPartnerFieldsController,
  updateB2bPartner,
} from "../controllers/partner.controller";
import {
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import { checkDuplicateB2BPartnerFields } from "../middlewares/partner.middleware";

const router = Router();

router.get("/list", getPartnersList);
router.post(
  "/",
  // validateToken(["Admin", "Manager", "User"]),
  checkDuplicateB2BPartnerFields,
  createB2bPartner
);
router.put(
  "/:id",
  validateId(),
  validateReqParams,
  validateToken(["Admin", "Manager", "User"]),
  updateB2bPartner
);
router.delete(
  "/:id",
  validateId(),
  validateReqParams,
  validateToken(["Admin", "Manager", "User"]),
  deletePartner
);
router.get(
  "/details/:id",
  validateId(),
  validateReqParams,
  validateToken(["Admin", "Manager", "User"]),
  getB2bPartnerDetails
);
router.get(
  "/pagination",
  validateToken(["Admin", "Manager", "User"]),
  getB2bPartnersList
);
router.get(
  "/filter",
  validateToken(["Admin", "Manager", "User"], false),
  getLeadsByPartnerFieldsController
);

export { router as partnerRoutes };
