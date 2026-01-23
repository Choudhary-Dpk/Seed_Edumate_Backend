import prisma from "../../config/prisma";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.b2BPartnersUsers.findFirst({
    select: {
      id: true,
      b2b_id: true,
      email: true,
      password_hash: true,
      full_name: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      source: true,
    },
    where: {
      email: email,
    },
  });

  return user;
};

export const getAdminUserByEmail = async (email: string) => {
  const user = await prisma.adminUsers.findFirst({
    select: {
      id: true,
    },
    where: {
      email: email,
    },
  });

  return user;
};

export const createUsers = async (
  email: string,
  b2bId: number,
  passwordHash: string | null,
  fullName: string,
  tx?: any,
) => {
  const prismaClient = tx || prisma;
  const user = await prismaClient.b2BPartnersUsers.create({
    data: {
      full_name: fullName,
      b2b_id: b2bId,
      email,
      password_hash: passwordHash,
      created_at: new Date(),
      ...(passwordHash && {
        passwordHash,
      }),
    },
  });

  return user;
};

export const createAdmin = async (
  fullName: string,
  email: string,
  phone: number,
) => {
  const user = await prisma.adminUsers.create({
    data: {
      full_name: fullName,
      email,
      password_hash: null,
      phone: phone.toString(),
      created_at: new Date(),
    },
  });

  return user;
};

export const assignRole = async (userId: number, roleId: number) => {
  await prisma.b2BPartnersUserRoles.create({
    data: {
      user_id: userId,
      role_id: roleId,
    },
  });
};

export const assignAdminRole = async (userId: number, roleId: number) => {
  await prisma.adminUserRoles.create({
    data: {
      user_id: userId,
      role_id: roleId,
    },
  });
};

export const getUserProfile = async (userId: number) => {
  const userProfileDetails = await prisma.b2BPartnersUsers.findFirst({
    select: {
      id: true,
      b2b_id: true,
      full_name: true,
      email: true,
      is_active: true,
      b2b_partner: {
        select: {
          id: true,
          partner_name: true,
          partner_display_name: true,
          is_commission_applicable: true,
          logo_url: true,
        },
      },
      roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
              description: true,
            },
          },
        },
      },
    },
    where: {
      id: userId,
    },
  });

  return userProfileDetails;
};

export const getAdminUserProfile = async (userId: number) => {
  const userProfileDetails = await prisma.adminUsers.findFirst({
    select: {
      id: true,
      full_name: true,
      email: true,
      is_active: true,
      logo_url: true,
      admin_user_roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
              description: true,
            },
          },
        },
      },
    },
    where: {
      id: userId,
    },
  });

  if (!userProfileDetails) {
    return null;
  }

  const { admin_user_roles, ...rest } = userProfileDetails;

  return {
    ...rest,
    roles: admin_user_roles.map((ur) => ur.role),
  };
};
