import prisma from "../../config/prisma";

export const getPartners = async () => {
  const partnersList = await prisma.hSB2BPartners.findMany({
    select: {
      id: true,
      partner_name: true,
    },
  });

  return partnersList;
};

export const getPartnerById = async (partnerId: number) => {
  const partner = await prisma.hSB2BPartners.findFirst({
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
  const rolesList = await prisma.b2BPartnersRoles.findMany({
    select: {
      id: true,
      display_name: true,
    },
  });

  return rolesList;
};

export const getUserRoleById = async (roleId: number) => {
  const role = await prisma.b2BPartnersRoles.findFirst({
    select: {
      id: true,
    },
    where: {
      id: roleId,
    },
  });

  return role;
};

export const getPartnerIdByUserId = async (userId: number) => {
  const partnerId = await prisma.b2BPartnersUsers.findFirst({
    select: {
      b2b_id: true,
    },
    where: {
      id: userId,
    },
  });
  return partnerId;
};

export const getHubspotIdByUserId = async (
  userId: number
): Promise<string | null> => {
  try {
    const user = await prisma.b2BPartnersUsers.findUnique({
      where: {
        id: userId,
      },
      select: {
        b2b_partner: {
          select: {
            hs_object_id: true,
          },
        },
      },
    });

    return user?.b2b_partner?.hs_object_id || null;
  } catch (error) {
    console.error("Error fetching Hubspot ID:", error);
    throw error;
  }
};
