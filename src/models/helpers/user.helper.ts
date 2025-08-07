import prisma from "../../config/prisma";

export const getUserByEmail = async (
  email: string,
  exceptionId: number | null = null
) => {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      email: email,
      isDeleted: false,
      ...(exceptionId && {
        id: {
          not: exceptionId,
        },
      }),
    },
  });

  return user;
};

export const getUserByPhone = async (
  phone: string,
  exceptionId: number | null
) => {
  const user = await prisma.user.findFirst({
    select: { id: true },
    where: {
      phone,
      isDeleted: false,
      ...(exceptionId && {
        id: {
          not: exceptionId,
        },
      }),
    },
  });

  return user;
};

export const createUsers = async (
  createdBy: number | null,
  email: string,
  passwordHash: string | null,
  firstName: string,
  lastName: string,
  phone: string,
  address: string | null
) => {
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
      createdOn: new Date(),
      createdBy,
      ...(address && { address }),
      ...(passwordHash && {
        passwordHash,
        passwordSetOn: new Date(),
      }),
    },
  });

  return user;
};
