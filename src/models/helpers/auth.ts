import moment from "moment";
import prisma from "../../config/prisma";
import { LoginStatus } from "../../types/auth";

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

export const getUserDetailsFromToken = async (emailToken: string) => {
  const token = await prisma.token.findFirst({
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      token: emailToken,
    },
  });

  return token;
};


export const useEmailToken = async (userId: number, emailToken: string) => {
  await prisma.token.deleteMany({
    where: {
      userId: userId,
      token: emailToken,
    },
  });
};

export const updatePassword = async (userId: number, passwordHash: string) => {
  const updatedUser = await prisma.user.updateMany({
    data: {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
    where: {
      id: userId,
    },
  });

  if (updatedUser.count === 0) {
    throw new Error("Could not update password");
  }
};

export const deleteOtps = async (userId: number) => {
  await prisma.userOtp.deleteMany({
    where: {
      userId,
    },
  });
};

export const saveOtp = async (userId: number, otp: string) => {
  await prisma.userOtp.create({
    data: {
      userId,
      otp: otp,
      createdOn: new Date(),
    },
  });
};

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

export const updateUserLastLoggedIn = async (
  userId: number,
  ip: string,
  status: LoginStatus,
  device?: string
) => {
  const lastLogin = await prisma.loginHistory.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  if (lastLogin) {
    await prisma.loginHistory.update({
      where: { id: lastLogin.id },
      data: {
        device_info: device,
        ip_address: ip,
        created_at: new Date(),
        status,
      },
    });
  } else {
    await prisma.loginHistory.create({
      data: {
        user_id: userId,
        device_info: device,
        ip_address: ip,
        status,
      },
    });
  }
};

export const getUserById = async (userId: number, isActive: boolean) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      is_active: isActive,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
    },
  });

  return userData;
};

export const storeRefreshToken = async (
  userId: number,
  refreshToken: string,
  ipAddress?: string,
  deviceInfo?: string
) => {
  await prisma.session.deleteMany({
    where: {
      user_id: userId,
    },
  });

  const expiresAt = moment().add(7, "days").toDate();

  const session = await prisma.session.create({
    data: {
      user_id: userId,
      refresh_token_hash: refreshToken,
      device_info: deviceInfo || null,
      ip_address: ipAddress || null,
      is_valid: true,
      expires_at: expiresAt,
    },
  });

  return session;
};

export const deleteUserSession = async (
  userId: number,
  status: LoginStatus
) => {
  const lastLogin = await prisma.loginHistory.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const lastLoginSession = await prisma.session.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  await prisma.session.update({
    where: {
      id: lastLoginSession!.id,
      user_id: userId,
    },
    data: {
      is_valid: false,
    },
  });

  await prisma.loginHistory.update({
    where: { id: lastLogin!.id },
    data: {
      status,
    },
  });
};

export const getUserSessionById = async (userId: number) => {
  const userSession = await prisma.session.findFirst({
    select: {
      id: true,
      is_valid: true,
    },
    where: {
      user_id: userId,
    },
  });

  return userSession;
};