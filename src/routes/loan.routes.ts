import { Router } from 'express';
import { checkLoanEligibility, getConvertedCurrency } from '../controllers/loan.controller';

const router = Router();

/**
 * @swagger
 * /loans/check-eligibility:
 *   post:
 *     summary: Check if the applicant is eligible for a loan
 *     tags: [Loan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country_of_study
 *               - course_duration
 *               - annual_income
 *             properties:
 *               country_of_study:
 *                 type: string
 *               course_duration:
 *                 type: number
 *               annual_income:
 *                 type: number
 *     responses:
 *       200:
 *         description: Loan eligibility result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loan_amount:
 *                   type: number
 *                 loan_amount_currency:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/check-eligibility', checkLoanEligibility);

/**
 * @swagger
 * /loans/currency-convert:
 *   get:
 *     summary: Convert an amount from one currency to another
 *     tags: [Loan]
 *     parameters:
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         required: true
 *         description: Amount to convert
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         required: true
 *         description: Currency code to convert from (e.g., USD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         required: true
 *         description: Currency code to convert to (e.g., INR)
 *     responses:
 *       200:
 *         description: Converted currency amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 convertedAmount:
 *                   type: number
 *                 from:
 *                   type: string
 *                 to:
 *                   type: string
 *       400:
 *         description: Missing or invalid query parameters
 *       500:
 *         description: Server error
 */
router.get('/currency-convert', getConvertedCurrency);

export { router as loanRoutes };