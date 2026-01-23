import moment from "moment";
import prisma from "../../config/prisma";
import { LoginStatus } from "../../types/auth";

export const revokePreviousEmailTokens = async (userId: number) => {
  await prisma.b2BPartnersTokens.deleteMany({
    where: {
      user_id: userId,
    },
  });
};

export const revokePreviousAdminEmailTokens = async (userId: number) => {
  await prisma.adminTokens.deleteMany({
    where: {
      user_id: userId,
    },
  });
};

export const saveEmailToken = async (userId: number, emailToken: string) => {
  await prisma.b2BPartnersTokens.create({
    data: {
      user_id: userId,
      token: emailToken,
      createdOn: new Date(),
    },
  });
};

export const saveAdminEmailToken = async (
  userId: number,
  emailToken: string,
) => {
  await prisma.adminTokens.create({
    data: {
      user_id: userId,
      token: emailToken,
      createdOn: new Date(),
    },
  });
};

export const getUserDetailsFromToken = async (emailToken: string) => {
  const token = await prisma.b2BPartnersTokens.findFirst({
    select: {
      id: true,
      user_id: true,
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

export const getAdminDetailsFromToken = async (emailToken: string) => {
  const token = await prisma.adminTokens.findFirst({
    select: {
      id: true,
      user_id: true,
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
  await prisma.b2BPartnersTokens.deleteMany({
    where: {
      user_id: userId,
      token: emailToken,
    },
  });
};

export const useAdminEmailToken = async (
  userId: number,
  emailToken: string,
) => {
  await prisma.adminTokens.deleteMany({
    where: {
      user_id: userId,
      token: emailToken,
    },
  });
};

export const updatePassword = async (userId: number, passwordHash: string) => {
  const updatedUser = await prisma.b2BPartnersUsers.updateMany({
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

export const updateAdminPassword = async (
  userId: number,
  passwordHash: string,
) => {
  const updatedUser = await prisma.adminUsers.updateMany({
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
  await prisma.b2BPartnersUserOtps.deleteMany({
    where: {
      user_id: userId,
    },
  });
};

export const saveOtp = async (userId: number, otp: string) => {
  await prisma.b2BPartnersUserOtps.create({
    data: {
      user_id: userId,
      otp: otp,
      createdOn: new Date(),
    },
  });
};

export const validateOtp = async (userId: number, otp: string) => {
  const otpData = await prisma.b2BPartnersUserOtps.findFirst({
    where: {
      user_id: userId,
      otp,
      createdOn: {
        gte: moment().subtract(5, "minutes").toDate(),
      },
    },
  });

  return otpData;
};

export const useOtp = async (userId: number, otp: string) => {
  const result = await prisma.b2BPartnersUserOtps.deleteMany({
    where: {
      user_id: userId,
      otp,
    },
  });

  if (result.count === 0) {
    throw new Error("Unable to use otp");
  }
};

export const updateUserLastLoggedIn = async (
  userId: number,
  userType: "partner" | "admin",
  ip: string,
  status: LoginStatus,
  device?: string,
) => {
  const whereClause =
    userType === "admin" ? { admin_user_id: userId } : { b2b_user_id: userId };
  const lastLogin = await prisma.loginHistory.findFirst({
    where: { ...whereClause, user_type: userType },
    orderBy: { created_at: "desc" },
  });

  if (lastLogin) {
    await prisma.loginHistory.update({
      where: { id: lastLogin.id },
      data: {
        user_type: userType,
        device_info: device,
        ip_address: ip,
        created_at: new Date(),
        status,
      },
    });
  } else {
    await prisma.loginHistory.create({
      data: {
        device_info: device,
        ip_address: ip,
        status,
        user_type: userType,
        ...(userType === "admin"
          ? { admin_user_id: userId }
          : { b2b_user_id: userId }),
      },
    });
  }
};

export const getUserById = async (userId: number, isActive: boolean) => {
  const userData = await prisma.b2BPartnersUsers.findUnique({
    where: {
      id: userId,
      is_active: isActive,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
            },
          },
        },
      },
    },
  });

  return userData;
};

export const getAdminUserById = async (userId: number, isActive: boolean) => {
  const adminUserData = await prisma.adminUsers.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      admin_user_roles: {
        select: {
          role: {
            select: {
              id: true,
              role: true,
              display_name: true,
            },
          },
        },
      },
    },
  });

  // Check if user is active after fetching
  if (adminUserData && !adminUserData.is_active) {
    return null;
  }

  return adminUserData;
};

export const storeRefreshToken = async (
  userId: number,
  refreshToken: string,
  ipAddress?: string,
  deviceInfo?: string,
) => {
  await prisma.b2BPartnersSessions.deleteMany({
    where: {
      user_id: userId,
    },
  });

  const expiresAt = moment().add(7, "days").toDate();

  const session = await prisma.b2BPartnersSessions.create({
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

export const storeAdminRefreshToken = async (
  userId: number,
  refreshToken: string,
  ipAddress?: string,
  deviceInfo?: string,
) => {
  await prisma.adminSessions.deleteMany({
    where: {
      user_id: userId,
    },
  });

  const expiresAt = moment().add(7, "days").toDate();

  const session = await prisma.adminSessions.create({
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
  status: LoginStatus,
) => {
  const lastLogin = await prisma.loginHistory.findFirst({
    where: { b2b_user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const lastLoginSession = await prisma.b2BPartnersSessions.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  await prisma.b2BPartnersSessions.update({
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

export const deleteAdminSession = async (
  userId: number,
  status: LoginStatus,
) => {
  const lastLogin = await prisma.loginHistory.findFirst({
    where: { admin_user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const lastLoginSession = await prisma.adminSessions.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  await prisma.adminSessions.update({
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
  const userSession = await prisma.b2BPartnersSessions.findFirst({
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

export const getAdminUserSessionById = async (userId: number) => {
  const adminUserSession = await prisma.adminSessions.findFirst({
    select: {
      id: true,
      is_valid: true,
    },
    where: {
      user_id: userId,
    },
  });

  return adminUserSession;
};
