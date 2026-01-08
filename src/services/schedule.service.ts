import {
  CalculationResult,
  MonthlyPayment,
  YearlyBreakdown,
  LoanDetails,
  StrategyConfig,
  StrategyType,
} from "../types/loan-schedule.types";
import logger from "../utils/logger";

const roundTo2 = (num: number): number => Math.round(num * 100) / 100;

/**
 * Calculate standard EMI using compound interest formula
 */
export const calculateStandardEMI = (
  principal: number,
  annualRate: number,
  tenureYears: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;

  return numerator / denominator;
};

/**
 * MAIN FUNCTION - Original calculateRepaymentSchedule for backward compatibility
 * This maintains the exact same signature as your existing function
 */
export const calculateRepaymentSchedule = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  emi: number
): CalculationResult => {
  const tenureMonths = tenureYears * 12;
  const monthlyRate = annualRate / 100 / 12;

  // Initialize tracking variables
  let remainingBalance = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  const monthlySchedule: MonthlyPayment[] = [];

  // Calculate monthly payments
  for (let month = 1; month <= tenureMonths; month++) {
    let interestPayment = roundTo2(remainingBalance * monthlyRate);
    let principalPayment = roundTo2(emi - interestPayment);

    // Final month adjustment to ensure remaining balance = 0.00
    if (month === tenureMonths) {
      principalPayment = roundTo2(remainingBalance);
      emi = roundTo2(principalPayment + interestPayment);
    }

    remainingBalance = roundTo2(remainingBalance - principalPayment);
    cumulativePrincipal = roundTo2(cumulativePrincipal + principalPayment);
    cumulativeInterest = roundTo2(cumulativeInterest + interestPayment);

    monthlySchedule.push({
      month,
      emi: roundTo2(emi),
      principalPayment,
      interestPayment,
      remainingBalance: month === tenureMonths ? 0.0 : remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  return generateCalculationResult(
    principal,
    annualRate,
    tenureYears,
    emi,
    monthlySchedule
  );
};

/**
 * FUNCTION - Enhanced calculation with strategy support
 */
export const calculateRepaymentScheduleWithStrategy = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  strategyType?: StrategyType,
  strategyConfig?: StrategyConfig
): CalculationResult => {
  // If no strategy, use standard calculation
  if (!strategyType) {
    const standardEMI = calculateStandardEMI(
      principal,
      annualRate,
      tenureYears
    );
    return calculateRepaymentSchedule(
      principal,
      annualRate,
      tenureYears,
      standardEMI
    );
  }

  // Handle different strategy types
  switch (strategyType) {
    case "stepup":
      const stepUpAmount = strategyConfig?.stepup?.annualIncrease || 0;
      return calculateStepUpSchedule(
        principal,
        annualRate,
        tenureYears,
        stepUpAmount
      );

    case "prepayment":
      const prepaymentConfig = strategyConfig?.prepayment;
      if (prepaymentConfig) {
        return calculatePrepaymentSchedule(
          principal,
          annualRate,
          tenureYears,
          prepaymentConfig.amount,
          prepaymentConfig.year
        );
      }
      break;

    case "secured":
      const securedRate = strategyConfig?.secured?.newRate || annualRate;
      const securedEMI = calculateStandardEMI(
        principal,
        securedRate,
        tenureYears
      );
      return calculateRepaymentSchedule(
        principal,
        securedRate,
        tenureYears,
        securedEMI
      );

    default:
      logger.debug(
        "Unknown strategy type, falling back to standard calculation"
      );
      break;
  }

  // Fallback to standard calculation
  const fallbackEMI = calculateStandardEMI(principal, annualRate, tenureYears);
  return calculateRepaymentSchedule(
    principal,
    annualRate,
    tenureYears,
    fallbackEMI
  );
};

/**
 * Step-up EMI schedule calculation
 */
export const calculateStepUpSchedule = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  annualIncrease: number
): CalculationResult => {
  const monthlyRate = annualRate / 100 / 12;
  const initialEMI = calculateStandardEMI(principal, annualRate, tenureYears);

  let remainingBalance = principal;
  let currentEMI = initialEMI;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  const monthlySchedule: MonthlyPayment[] = [];
  let month = 1;

  logger.debug(
    "Step-up calculation starting with EMI:",
    initialEMI,
    "Annual increase:",
    annualIncrease
  );

  while (remainingBalance > 0.01 && month <= tenureYears * 12) {
    // Increase EMI at start of each year (except first year)
    if (month > 1 && (month - 1) % 12 === 0) {
      currentEMI += annualIncrease;
      logger.debug(`Month ${month}: EMI increased to ${currentEMI}`);
    }

    let interestPayment = roundTo2(remainingBalance * monthlyRate);
    let principalPayment = roundTo2(currentEMI - interestPayment);

    // Handle final payment
    if (principalPayment >= remainingBalance) {
      principalPayment = roundTo2(remainingBalance);
      currentEMI = roundTo2(principalPayment + interestPayment);
      remainingBalance = 0;
    } else {
      remainingBalance = roundTo2(remainingBalance - principalPayment);
    }

    cumulativePrincipal = roundTo2(cumulativePrincipal + principalPayment);
    cumulativeInterest = roundTo2(cumulativeInterest + interestPayment);

    monthlySchedule.push({
      month,
      emi: roundTo2(currentEMI),
      principalPayment,
      interestPayment,
      remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });

    month++;
  }

  const actualTenureYears = (month - 1) / 12;
  logger.debug(
    "Step-up calculation completed. Actual tenure:",
    actualTenureYears,
    "years"
  );

  return generateCalculationResult(
    principal,
    annualRate,
    actualTenureYears,
    initialEMI,
    monthlySchedule
  );
};

/**
 * Prepayment schedule calculation
 */
export const calculatePrepaymentSchedule = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  prepaymentAmount: number,
  prepaymentYear: number
): CalculationResult => {
  logger.debug("calculatePrepaymentSchedule called with:", {
    principal,
    annualRate,
    tenureYears,
    prepaymentAmount,
    prepaymentYear,
  });

  const monthlyRate = annualRate / 100 / 12;
  const standardEMI = calculateStandardEMI(principal, annualRate, tenureYears);
  const prepaymentMonth = prepaymentYear * 12;

  let remainingBalance = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  const monthlySchedule: MonthlyPayment[] = [];
  let month = 1;

  logger.debug(
    "Prepayment calculation starting. EMI:",
    standardEMI,
    "Prepayment in month:",
    prepaymentMonth
  );

  while (remainingBalance > 0.01 && month <= tenureYears * 12) {
    let interestPayment = roundTo2(remainingBalance * monthlyRate);
    let principalPayment = roundTo2(standardEMI - interestPayment);

    // Handle final payment
    if (principalPayment >= remainingBalance) {
      principalPayment = roundTo2(remainingBalance);
      remainingBalance = 0;
    } else {
      remainingBalance = roundTo2(remainingBalance - principalPayment);
    }

    cumulativePrincipal = roundTo2(cumulativePrincipal + principalPayment);
    cumulativeInterest = roundTo2(cumulativeInterest + interestPayment);

    monthlySchedule.push({
      month,
      emi: roundTo2(standardEMI),
      principalPayment,
      interestPayment,
      remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });

    // Apply prepayment at specified month
    if (month === prepaymentMonth && remainingBalance > 0) {
      const effectivePrepayment = Math.min(prepaymentAmount, remainingBalance);
      remainingBalance = roundTo2(remainingBalance - effectivePrepayment);
      cumulativePrincipal = roundTo2(cumulativePrincipal + effectivePrepayment);

      // Update the current month's remaining balance
      monthlySchedule[monthlySchedule.length - 1].remainingBalance =
        remainingBalance;

      logger.debug(
        `Month ${month}: Applied prepayment of ${effectivePrepayment}. New balance: ${remainingBalance}`
      );
    }

    month++;
  }

  const actualTenureYears = (month - 1) / 12;
  logger.debug(
    "Prepayment calculation completed. Actual tenure:",
    actualTenureYears,
    "years"
  );

  return generateCalculationResult(
    principal,
    annualRate,
    actualTenureYears,
    standardEMI,
    monthlySchedule
  );
};

/**
 * Generate yearly breakdown from monthly schedule
 */
const generateYearlyBreakdown = (
  monthlySchedule: MonthlyPayment[]
): YearlyBreakdown[] => {
  const yearlyBreakdown: YearlyBreakdown[] = [];
  const actualYears = Math.ceil(monthlySchedule.length / 12);

  for (let year = 1; year <= actualYears; year++) {
    const yearStartMonth = (year - 1) * 12 + 1;
    const yearEndMonth = Math.min(year * 12, monthlySchedule.length);

    const yearMonths = monthlySchedule.slice(yearStartMonth - 1, yearEndMonth);

    const totalEMI = roundTo2(
      yearMonths.reduce((sum, month) => sum + month.emi, 0)
    );
    const totalPrincipal = roundTo2(
      yearMonths.reduce((sum, month) => sum + month.principalPayment, 0)
    );
    const totalInterest = roundTo2(
      yearMonths.reduce((sum, month) => sum + month.interestPayment, 0)
    );
    const remainingBalance =
      yearMonths[yearMonths.length - 1]?.remainingBalance || 0;

    yearlyBreakdown.push({
      year,
      totalEMI,
      totalPrincipal,
      totalInterest,
      remainingBalance: roundTo2(remainingBalance),
    });
  }

  return yearlyBreakdown;
};

/**
 * Generate complete calculation result
 */
const generateCalculationResult = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  monthlyEMI: number,
  monthlySchedule: MonthlyPayment[]
): CalculationResult => {
  const totalAmount = roundTo2(
    monthlySchedule.reduce((sum, month) => sum + month.emi, 0)
  );
  const totalInterest = roundTo2(
    monthlySchedule.reduce((sum, month) => sum + month.interestPayment, 0)
  );

  const yearlyBreakdown = generateYearlyBreakdown(monthlySchedule);

  const loanDetails: LoanDetails = {
    principal: roundTo2(principal),
    annualRate: roundTo2(annualRate),
    tenureYears: roundTo2(tenureYears),
    monthlyEMI: roundTo2(monthlyEMI),
    totalAmount,
    totalInterest,
  };

  logger.debug("Calculation result generated:", {
    monthlyScheduleLength: monthlySchedule.length,
    yearlyBreakdownLength: yearlyBreakdown.length,
    totalAmount,
    totalInterest,
  });

  return {
    loanDetails,
    monthlySchedule,
    yearlyBreakdown,
  };
};
