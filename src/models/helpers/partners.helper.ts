import prisma from "../../config/prisma";

export const getPartners = async () => {
  const partnersList = await prisma.b2BPartner.findMany({
    select: {
      id: true,
      partner_name: true,
    },
  });

  return partnersList;
};

export const getPartnerById = async (partnerId: number) => {
  const partner = await prisma.b2BPartner.findFirst({
    select: {
      id: true,
    },
    where: {
      id: partnerId,
    },
  });
  return partner;
};

export const getUserRoles = async () => {
  const rolesList = await prisma.role.findMany({
    select: {
      id: true,
      display_name: true,
    },
  });

  return rolesList;
};

export const getUserRoleById = async(roleId:number)=>{
const role = await prisma.role.findFirst({
  select: {
    id: true,
  },
  where: {
    id: roleId,
  },
});

return role;
}

export const getPartnerIdByUserId = async (userId: number) => {
  const partnerId = await prisma.user.findFirst({
    select: {
      b2b_id: true,
    },
    where: {
      id: userId,
    },
  });
  return partnerId;
};
