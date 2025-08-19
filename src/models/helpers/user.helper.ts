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