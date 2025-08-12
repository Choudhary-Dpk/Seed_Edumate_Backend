// src/services/schedule.service.ts
import { 
  RepaymentScheduleRequest, 
  MonthlyPayment, 
  YearlyBreakdown, 
  LoanDetails, 
  CalculationResult 
} from '../types/loan-schedule.types';
import { roundTo2 } from '../utils/helper';

export const calculateRepaymentSchedule = (
  principal: number,
  annualRate: number,
  tenureYears: number
): CalculationResult => {
  const tenureMonths = tenureYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  
  // Calculate EMI
  let emi: number;
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
    const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
    emi = numerator / denominator;
  }
  emi = roundTo2(emi);

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
      remainingBalance: month === tenureMonths ? 0.00 : remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  // Calculate yearly breakdown
  const yearlyBreakdown: YearlyBreakdown[] = [];
  for (let year = 1; year <= tenureYears; year++) {
    const yearStartMonth = (year - 1) * 12 + 1;
    const yearEndMonth = Math.min(year * 12, tenureMonths);
    
    const yearMonths = monthlySchedule.slice(yearStartMonth - 1, yearEndMonth);
    
    const totalEMI = roundTo2(yearMonths.reduce((sum, month) => sum + month.emi, 0));
    const totalPrincipal = roundTo2(yearMonths.reduce((sum, month) => sum + month.principalPayment, 0));
    const totalInterest = roundTo2(yearMonths.reduce((sum, month) => sum + month.interestPayment, 0));
    const remainingBalance = yearMonths[yearMonths.length - 1]?.remainingBalance || 0;

    yearlyBreakdown.push({
      year,
      totalEMI,
      totalPrincipal,
      totalInterest,
      remainingBalance: roundTo2(remainingBalance),
    });
  }

  // Calculate loan details
  const totalAmount = roundTo2(monthlySchedule.reduce((sum, month) => sum + month.emi, 0));
  const totalInterest = roundTo2(monthlySchedule.reduce((sum, month) => sum + month.interestPayment, 0));

  const loanDetails: LoanDetails = {
    principal: roundTo2(principal),
    annualRate: roundTo2(annualRate),
    tenureYears,
    monthlyEMI: roundTo2(emi),
    totalAmount,
    totalInterest,
  };

  return {
    loanDetails,
    monthlySchedule,
    yearlyBreakdown,
  };
};