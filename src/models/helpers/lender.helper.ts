import prisma from "../../config/prisma";

export const getLendersList = async () => {
  const lendersList = await prisma.hSLenders.findMany();
  return lendersList;
};

export const checkLenderFields = async (criteria: Record<string, any>) => {
  const orConditions: any[] = [];

  if (criteria.lender_name)
    orConditions.push({ lender_name: criteria.lender_name });
  if (criteria.lender_display_name)
    orConditions.push({ lender_display_name: criteria.lender_display_name });

  if (orConditions.length === 0) {
    return null;
  }

  return await prisma.hSLenders.findFirst({
    where: {
      is_active: true,
      is_deleted: false,
      OR: orConditions,
    },
  });
};
