// src/services/loan.service.ts
import prisma from '../config/prisma';
import { LoanEligibilityRequest } from '../middlewares/validators/loan.validator';
import logger from '../utils/looger';

export interface LoanEligibilityResult {
  loan_amount: number;
  loan_amount_currency: string;
}

export const findLoanEligibility = async (
  data: LoanEligibilityRequest
): Promise<LoanEligibilityResult | null> => {
  try {
    const {
      country_of_study,
      level_of_education,
      course_type,
      analytical_exam_name,
      language_exam_name,
      preference,
    } = data;

    const loanRecord = await prisma.loan_eligibility_matrix.findFirst({
      where: {
        country_of_study,
        level_of_education,
        course_type,
        analytical_exam_name,
        language_exam_name,
        preference,
        loan_amount: { not: null },
        loan_amount_currency: { not: null },
      },
      select: {
        loan_amount: true,
        loan_amount_currency: true,
      },
    });

    if (!loanRecord || !loanRecord.loan_amount || !loanRecord.loan_amount_currency) {
      return null;
    }

    return {
      loan_amount: Number(loanRecord.loan_amount),
      loan_amount_currency: loanRecord.loan_amount_currency,
    };
  } catch (error) {
    console.error('Error finding loan eligibility:', error);
    throw new Error('Failed to check loan eligibility');
  }
};

export const convertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<number | null> => {
  try {
    const result = await prisma.$queryRawUnsafe<{ loan_amount_usd: number }[]>(
      `SELECT convert_currency($1, $2, $3) as loan_amount_usd`,
      amount,
      from,
      to
    );
    return result[0]?.loan_amount_usd ?? 0;
  } catch (error) {
    logger.error('Error in currency change', { 
          amount,
          from,
          to,
          error 
        });
        return null
  }
};
