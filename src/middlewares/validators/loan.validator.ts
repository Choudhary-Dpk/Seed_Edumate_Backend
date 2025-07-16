// src/validators/loan.validator.ts
import { z } from 'zod';

export const loanEligibilitySchema = z.object({
  country_of_study: z.string().min(1, 'Country of study is required').max(100, 'Country of study must not exceed 100 characters'),
  level_of_education: z.string().min(1, 'Level of education is required').max(50, 'Level of education must not exceed 50 characters'),
  course_type: z.string().min(1, 'Course type is required').max(100, 'Course type must not exceed 100 characters'),
  analytical_exam_name: z.string().min(1, 'Analytical exam name is required').max(50, 'Analytical exam name must not exceed 50 characters'),
  language_exam_name: z.string().min(1, 'Language exam name is required').max(50, 'Language exam name must not exceed 50 characters'),
  preference: z.string().min(1, 'Preference is required').max(20, 'Preference must not exceed 20 characters'),
});

export type LoanEligibilityRequest = z.infer<typeof loanEligibilitySchema>;

export const validateLoanEligibility = (data: unknown) => {
  return loanEligibilitySchema.safeParse(data);
};