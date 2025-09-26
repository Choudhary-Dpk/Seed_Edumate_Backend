import prisma from "../../config/prisma";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
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
  fullName: string
) => {
  const user = await prisma.user.create({
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

export const assignRole = async (userId: number, roleId: number) => {
  await prisma.userRole.create({
    data: {
      user_id: userId,
      role_id: roleId,
    },
  });
};

export const getUserProflie = async (userId: number) => {
  const userProfileDetails = await prisma.user.findFirst({
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
