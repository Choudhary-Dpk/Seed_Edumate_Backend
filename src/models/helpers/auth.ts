import moment from "moment";
import prisma from "../../config/prisma";

export const revokePreviousEmailTokens = async (userId: number) => {
  await prisma.token.deleteMany({
    where: {
      userId: userId,
    },
  });
};

export const saveEmailToken = async (userId: number, emailToken: string) => {
  await prisma.token.create({
    data: {
      userId,
      token: emailToken,
      createdOn: new Date(),
    },
  });
};

export const getUserDetailsFromToken = async (
  emailToken: string,
) => {
  const token = await prisma.token.findFirst({
    select:{
        id:true,
        userId:true
    },
    where: {
      token:emailToken
    },
  });

  return token;
};

export const useEmailToken = async(userId:number,emailToken:string)=>{
  await prisma.token.deleteMany({
    where: {
      userId: userId,
      token:emailToken
    },
  });
}

export const updatePassword = async(userId:number,passwordHash:string)=>{
const updatedUser = await prisma.user.updateMany({
  data: {
    passwordHash: passwordHash,
    passwordSetOn: new Date(),
  },
  where: {
    id: userId,
  },
});

if (updatedUser.count === 0) {
  throw new Error("Could not update password");
}

}

export const deleteOtps = async (
  userId: number,
) => {
  await prisma.userOtp.deleteMany({
    where: {
      userId,
    },
  });
};

export const saveOtp = async(userId:number,otp:string)=>{
    await prisma.userOtp.create({
      data: {
        userId,
        otp: otp,
        createdOn: new Date(),
      },
    });
}

export const validateOtp = async (userId: number, otp: string) => {
  const otpData = await prisma.userOtp.findFirst({
    where: {
      userId,
      otp,
      createdOn: {
        gte: moment().subtract(5, "minutes").toDate(),
      },
    },
  });

  return otpData;
};

export const useOtp = async (userId: number, otp: string) => {
  const result = await prisma.userOtp.deleteMany({
    where: {
      userId,
      otp,
    },
  });

  if (result.count === 0) {
    throw new Error("Unable to use otp");
  }
};

export const updateUserLastLoggedIn = async(userId:number)=>{
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoggedInOn: new Date(),
      },
    });
}

export const updateUserSession = async (userId: number, sessionId: string | null) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      sessionId: sessionId,
    },
  });
};

export const deleteUserSession = async (userId: number) => {
    await prisma.user.update({
    where: {
        id: userId,
    },
    data: {
        sessionId: null,
    },
    });
};

export const getUserById = async (
  userId: number,
  deleted: boolean,
  activation: boolean | null,
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: deleted,
      ...(activation !== null ? { activationStatus: activation } : {}),
    },
    select: {
      id: true,
      activationStatus: true,
      email: true,
      passwordHash: true,
      sessionId: true,
    },
  });

  return userData;
};
