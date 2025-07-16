import { Router } from 'express';
import { getAllUsers, createUser, getIpInfo } from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
// import { validateRequest } from '../middleware/validate';

const router = Router();

router.get('/', getAllUsers);

router.post('/', createUserValidator,  createUser);

router.get('/ip-info', getIpInfo);

export { router as userRoutes };
