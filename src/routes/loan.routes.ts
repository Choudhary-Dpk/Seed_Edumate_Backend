import { Router } from 'express';
import { checkLoanEligibility, generateRepaymentScheduleAndEmail, getConvertedCurrency } from '../controllers/loan.controller';

const router = Router();

router.post('/check-eligibility', checkLoanEligibility);
router.get('/currency-convert', getConvertedCurrency);
router.post('/repaymentSchedule-and-email', generateRepaymentScheduleAndEmail);

export { router as loanRoutes };