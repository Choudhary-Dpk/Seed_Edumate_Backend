import prisma from "../../config/prisma";

export const createCheckerLeads = (contactId: number) => {
  const leads = prisma.mktEligibilityCheckerLeads.create({
    data: {
      contact: {
        connect: { id: contactId },
      },
    },
    include: { contact: true },
  });
  return leads;
};

export const createMarketLeads = (contactId: number) => {
  const marketLead = prisma.mktEmiCalculatorLeads.create({
    data: {
      contact: {
        connect: { id: contactId },
      },
    },
    include: { contact: true },
  });

  return marketLead;
};
