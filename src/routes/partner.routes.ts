import { Router } from 'express';
import { getPartnersList } from '../controllers/hubspot.controller';

const router = Router();

router.get("/list",getPartnersList)

export { router as partnerRoutes };
