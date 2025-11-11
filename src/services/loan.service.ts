import prisma from "../config/prisma";
import { LoanEligibilityRequest } from "../middlewares/validators/loan.validator";
import logger from "../utils/logger";

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

    const loanRecord = await prisma.loanEligibilityMatrix.findFirst({
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

    if (
      !loanRecord ||
      !loanRecord.loan_amount ||
      !loanRecord.loan_amount_currency
    ) {
      return null;
    }

    return {
      loan_amount: Number(loanRecord.loan_amount),
      loan_amount_currency: loanRecord.loan_amount_currency,
    };
  } catch (error) {
    console.error("Error finding loan eligibility:", error);
    throw new Error("Failed to check loan eligibility");
  }
};

export const convertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<number | null> => {
  try {
    const result = await prisma.$queryRawUnsafe<{ loan_amount_usd: number }[]>(
      `SELECT $1 * exchange_rate as loan_amount_usd
          FROM currency_conversion
          WHERE from_currency = $2
            AND to_currency = $3
            AND is_active = true
          LIMIT 1
        `,
      amount,
      from,
      to
    );
    return result[0]?.loan_amount_usd ?? 0;
  } catch (error) {
    logger.error("Error in currency change", {
      amount,
      from,
      to,
      error,
    });
    return null;
  }
};
