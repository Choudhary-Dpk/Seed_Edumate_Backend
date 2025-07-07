// src/routes/gupshup.routes.ts
import { Router } from 'express';
import * as gupshupController from '../controllers/gupshup.controller';

const router = Router();

router.post('/assignment-webhook', 
  gupshupController.processAssignmentWebhook
);

export { router as gupshupRoutes };