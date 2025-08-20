export type Row = {
  name:string;
  email: string;
  loanAmountRequested: number;
  loanAmountApproved: number;
  loanTenureYears: number;
  applicationStatus: string;
  userId: number;
  createdBy: number;
};

export type ValidationResult = {
  validRows: Row[];
  errors: { row: number; reason: string }[];
};