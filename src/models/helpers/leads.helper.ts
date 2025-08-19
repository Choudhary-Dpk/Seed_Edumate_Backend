import prisma from "../../config/prisma"

export const createLead = async(
    id:number,
  applicationStatus:string,
  loanAmountRequested:number,
  loanAmountApproved:number,
  loanTenureYears:number,
  email:string
)=>{
    const lead = await prisma.loan_application.create({
      data: {
        applicationStatus,
        loanAmountRequested,
        loanAmountApproved,
        loanTenureYears,
        email,
        userId: id,
        createdBy: id,
        created_at: new Date(),
      },
    });

    return lead;
}

export const getLeadByEmail = async (email: string) => {
  const lead = await prisma.loan_application.findFirst({
    select: {
      id: true,
      applicationStatus: true,
      loanAmountApproved: true,
      loanAmountRequested: true,
      loanTenureYears: true,
    },
    where: {
      email,
    },
  });

  return lead;
};