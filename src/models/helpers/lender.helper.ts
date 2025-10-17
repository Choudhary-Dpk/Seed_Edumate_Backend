import prisma from "../../config/prisma"

export const getLendersList = async () => {
  const lendersList = await prisma.hSLenders.findMany();
  return lendersList;
};
