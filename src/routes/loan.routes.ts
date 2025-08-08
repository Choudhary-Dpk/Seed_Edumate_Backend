import { Router } from 'express';
import { checkLoanEligibility, getConvertedCurrency } from '../controllers/loan.controller';

const router = Router();

router.post('/check-eligibility', checkLoanEligibility);
router.get('/currency-convert', getConvertedCurrency);

export { router as loanRoutes };