import { Router } from 'express';
import { getAllUsers, createUser } from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
// import { validateRequest } from '../middleware/validate';

const router = Router();

router.get('/', getAllUsers);

router.post('/', createUserValidator,  createUser);

export default router;
