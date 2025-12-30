import prisma from "../config/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, API_KEY } from "../setup/secrets";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/api";
import {
  getAdminUserByEmail,
  getUserByEmail,
} from "../models/helpers/user.helper";
import {
  getAdminDetailsFromToken,
  getUserDetailsFromToken,
} from "../models/helpers/auth";
import {
  getAdminDetailsByEmail,
  getModulePermissions,
  getUserDetailsByEmail,
} from "../models/helpers";
import { validateUserPassword } from "../utils/auth";
import { RequestWithPayload } from "../types/api.types";
import {
  AuthMethod,
  AuthOptions,
  LoginPayload,
  PortalType,
  ProtectedPayload,
  ResetPasswordPayload,
} from "../types/auth";
import {
  getPartnerById,
  getUserRoleById,
} from "../models/helpers/partners.helper";
import { fetchIpDetails } from "../services/user.service";
import { UAParser } from "ua-parser-js";
import moment from "moment";
import { AllowedPemissions } from "../types";
import { getEdumateContactByEmail } from "../models/helpers/contact.helper";

export const validateCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, b2bId, roleId } = req.body;

    const existingPartner = await getPartnerById(b2bId);
    if (!existingPartner) {
      return sendResponse(res, 400, "Partner does not exists");
    }

    const role = await getUserRoleById(roleId);
    if (!role) {
      return sendResponse(res, 400, "Role does not exists");
    }

    const userByEmail = await getUserByEmail(email);
    if (userByEmail) {
      return sendResponse(res, 400, "Email already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Error while validating creation");
  }
};

export const validateCreateAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const userByEmail = await getAdminUserByEmail(email);
    if (userByEmail) {
      return sendResponse(res, 400, "Email already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Error while validating creation");
  }
};

/**
 *  UNIFIED EMAIL TOKEN VALIDATION
 * Automatically detects portal type by checking which token table contains the token
 */
export const validateEmailToken = async (
  req: RequestWithPayload<ResetPasswordPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailToken } = req.body as { emailToken?: string };

    if (!emailToken) {
      return sendResponse(res, 400, "Email token is required");
    }

    //  Try Admin token table first
    const adminTokenDetails = await getAdminDetailsFromToken(emailToken);

    if (adminTokenDetails?.id) {
      req.portalType = PortalType.ADMIN; //  Set portal type
      req.payload = {
        id: adminTokenDetails.user_id,
        email: adminTokenDetails.user.email,
      };
      return next();
    }

    //  If not admin, try Partner token table
    const partnerTokenDetails = await getUserDetailsFromToken(emailToken);

    if (partnerTokenDetails?.id) {
      req.portalType = PortalType.PARTNER; //  Set portal type
      req.payload = {
        id: partnerTokenDetails.user_id,
        email: partnerTokenDetails.user.email,
      };
      return next();
    }

    // Token not found in either table
    return sendResponse(res, 401, "Invalid or expired token");
  } catch (error: any) {
    console.error("Validate email token error:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};

// In your validateEmail middleware (or wherever you validate credentials)
export const validateEmail = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, "Email is required");
    }

    //  Try to find in Admin table first
    const adminUser = await getAdminDetailsByEmail(email);

    if (adminUser) {
      req.portalType = PortalType.ADMIN; // Set portal type
      req.payload = {
        ...req.payload,
        id: adminUser.id,
        email: adminUser.email,
        passwordHash: adminUser.password_hash,
      };
      return next();
    }

    //  If not admin, try Partner
    const partnerUser = await getUserDetailsByEmail(email);

    if (partnerUser) {
      req.portalType = PortalType.PARTNER; // Set portal type
      req.payload = {
        ...req.payload,
        id: partnerUser.id,
        email: partnerUser.email,
        passwordHash: partnerUser.password_hash,
      };
      return next();
    }

    const edumateUser = await getEdumateContactByEmail(email);
    if (edumateUser?.personal_information?.email || edumateUser?.email) {
      return next();
    }

    return sendResponse(res, 404, "User not found");
  } catch (error: any) {
    return sendResponse(res, 500, error?.message || "Internal server error");
  }
};

export const validateAdminEmail = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    const userDetails = await getAdminDetailsByEmail(email);
    if (!userDetails) {
      return sendResponse(res, 400, "User not found");
    }

    if (!userDetails.is_active) {
      return sendResponse(res, 400, "User is disabled");
    }

    req.payload = {
      id: userDetails.id,
      email: email,
      name: userDetails.full_name!,
      passwordHash: userDetails.password_hash,
      passwordSetOn: userDetails.updated_at,
    };
    next();
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const validatePassword = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { passwordHash } = req.payload!;
    const { password } = req.body;

    if (!passwordHash) {
      return sendResponse(res, 403, "Password not set");
    }

    const isValid = await validateUserPassword(password, passwordHash);
    if (!isValid) {
      return sendResponse(res, 401, "Invalid password");
    }

    req.payload = {
      ...req.payload!,
    };

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const validateChangePassword = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const passwordHash = req.payload?.passwordHash;
    const { password } = req.body;

    if (!passwordHash) {
      return sendResponse(res, 403, "Password not set");
    }

    const isValid = await validateUserPassword(password, passwordHash);
    if (!isValid) {
      return sendResponse(res, 401, "Invalid password");
    }

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const getUserIpDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, email } = req.payload!;
    let ip =
      (req.query.ip as string) ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket?.remoteAddress ||
      "";

    // Fallback for local testing
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "8.8.8.8";
    }

    const ipDetails = await fetchIpDetails(ip);
    console.log("ipDetails", ipDetails);

    const parser = new UAParser(req.headers["user-agent"] || "");
    const uaResult = parser.getResult();

    const deviceInfo = {
      browser: `${uaResult.browser.name || "Unknown"} ${
        uaResult.browser.version || ""
      }`,
      os: `${uaResult.os.name || "Unknown"} ${uaResult.os.version || ""}`,
      device: uaResult.device.type || "desktop",
    };

    console.log("deviceInfo", deviceInfo);

    req.payload = {
      ...req.payload,
      id,
      email,
      ipDetails: ip,
      deviceDetails: deviceInfo,
    };

    next();
  } catch (error) {
    return sendResponse(res, 500, "Internal server error");
  }
};

export const validateRefreshToken = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendResponse(res, 400, "Refresh token is required");
    }

    const session = await prisma.b2BPartnersSessions.findFirst({
      where: { refresh_token_hash: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            is_active: true,
            password_hash: true,
          },
        },
      },
    });

    if (!session) {
      return sendResponse(res, 401, "Invalid or revoked refresh token");
    }

    if (session.expires_at && moment().isAfter(session.expires_at)) {
      return sendResponse(res, 401, "Refresh token expired");
    }

    if (!session.user) {
      return sendResponse(res, 401, "User not found");
    }

    req.payload = {
      id: session.user.id,
      email: session.user.email,
      passwordHash: session.user.password_hash,
    };

    next();
  } catch (error: any) {
    return sendResponse(res, 500, error?.message || "Internal server error");
  }
};

export const validateAdminRefreshToken = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendResponse(res, 400, "Refresh token is required");
    }

    const session = await prisma.adminSessions.findFirst({
      where: { refresh_token_hash: refreshToken },
      include: {
        admin_user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            is_active: true,
            password_hash: true,
          },
        },
      },
    });

    if (!session) {
      return sendResponse(res, 401, "Invalid or revoked refresh token");
    }

    if (session.expires_at && moment().isAfter(session.expires_at)) {
      return sendResponse(res, 401, "Refresh token expired");
    }

    if (!session.admin_user) {
      return sendResponse(res, 401, "User not found");
    }

    req.payload = {
      id: session.admin_user.id,
      email: session.admin_user.email,
      passwordHash: session.admin_user.password_hash,
    };

    next();
  } catch (error: any) {
    return sendResponse(res, 500, error?.message || "Internal server error");
  }
};

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientKey = req.headers["edumate-api-key"];
    if (!clientKey || clientKey !== API_KEY) {
      return sendResponse(res, 401, "Invalid or missing API Key");
    }

    next();
  } catch (error: any) {
    return sendResponse(
      res,
      500,
      error?.message?.toString() || "Internal server error"
    );
  }
};

export const validateModulePermissions = (
  requiredPermissions: AllowedPemissions[],
  module: string
) => {
  return async (
    req: RequestWithPayload<ProtectedPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.payload?.id;
      if (!userId) {
        return sendResponse(res, 401, "Unauthorized user");
      }

      const roles = await getModulePermissions(userId);

      // yaha filter + map karo
      const userPermissions = roles.flatMap((r) =>
        r.role.permissions
          .filter((rp) => rp.permission.module === module)
          .map((rp) => rp.permission.permission)
      );

      const hasAllPermissions = requiredPermissions.every((p) =>
        userPermissions.includes(p)
      );

      if (!hasAllPermissions) {
        return sendResponse(res, 403, "Access denied");
      }

      next();
    } catch (error: any) {
      return sendResponse(
        res,
        500,
        error?.message?.toString() || "Internal server error"
      );
    }
  };
};

/**
 *  UNIVERSAL AUTHENTICATION MIDDLEWARE
 *
 * Works with your existing:
 * - generateJWTToken() - no changes needed
 * - validateApiKey() - keeps single API key approach
 * - Session management - AdminSessions & B2BPartnersSessions
 *
 * Automatically detects portal type by checking which session table has the user
 *
 * Usage:
 * router.get("/", authenticate({ allowedRoles: ["Admin"] }), controller)
 * router.post("/", authenticate({ method: AuthMethod.BOTH }), controller)
 */
export const authenticate = (options: AuthOptions = {}) => {
  const { method = AuthMethod.BOTH, allowedRoles = [] } = options;

  return async (
    req: RequestWithPayload<ProtectedPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //  Step 1: Extract credentials
      const authHeader = req.headers.authorization;
      const apiKey = req.headers["edumate-api-key"] as string;

      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      //  Step 2: Determine authentication method
      let authMethod: AuthMethod;
      if (method === AuthMethod.JWT) {
        if (!token) {
          return sendResponse(
            res,
            401,
            "JWT token is required but not provided"
          );
        }
        authMethod = AuthMethod.JWT;
      } else if (method === AuthMethod.API_KEY) {
        if (!apiKey) {
          return sendResponse(res, 401, "API key is required but not provided");
        }
        authMethod = AuthMethod.API_KEY;
      } else {
        // AuthMethod.BOTH - auto-detect
        if (token) {
          authMethod = AuthMethod.JWT;
        } else if (apiKey) {
          authMethod = AuthMethod.API_KEY;
        } else {
          return sendResponse(
            res,
            401,
            "Authentication required. Provide either JWT token or API key"
          );
        }
      }

      //  Step 3: Authenticate based on method
      if (authMethod === AuthMethod.JWT) {
        // JWT authentication - full entity with roles, payload, etc.
        const authenticatedEntity = await authenticateWithJWT(
          token!,
          allowedRoles
        );

        if (!authenticatedEntity) {
          return sendResponse(res, 401, "Invalid or expired JWT token");
        }

        // Attach to request (backward compatible)
        req.user = authenticatedEntity.user;
        req.payload = authenticatedEntity.payload;
        req.authMethod = authMethod;
        req.portalType = authenticatedEntity.portalType;
      } else if (authMethod === AuthMethod.API_KEY) {
        //  API Key authentication - super simple validation only
        const isValid = await authenticateWithApiKey(apiKey!);

        if (!isValid) {
          return sendResponse(res, 401, "Invalid or missing API Key");
        }

        //  Only set authMethod, nothing else needed
        req.authMethod = authMethod;
        // No user, no payload, no portalType - just proceed
      }

      next();
    } catch (error: any) {
      console.error("Authentication error:", error);
      return sendResponse(
        res,
        500,
        error?.message?.toString() || "Internal server error"
      );
    }
  };
};

/**
 *  Authenticate with JWT
 * Uses your existing JWT_SECRET and automatically detects portal by checking sessions
 */
async function authenticateWithJWT(
  token: string,
  allowedRoles: string[]
): Promise<any | null> {
  try {
    // Decode token with your existing JWT_SECRET
    const decodedToken = jwt.verify(token, JWT_SECRET!) as JwtPayload;

    //  If token has portalType, use it to check the correct table directly
    if (decodedToken.portalType) {
      if (decodedToken.portalType === PortalType.ADMIN) {
        const adminUser = await prisma.adminUsers.findUnique({
          where: { id: decodedToken.id },
          include: {
            admin_user_roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (adminUser) {
          return await validateAdminUser(adminUser, allowedRoles);
        }
      } else if (decodedToken.portalType === PortalType.PARTNER) {
        const partnerUser = await prisma.b2BPartnersUsers.findUnique({
          where: { id: decodedToken.id },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
            b2b_partner: true,
          },
        });

        if (partnerUser) {
          return await validatePartnerUser(partnerUser, allowedRoles);
        }
      }
    }

    //  Fallback for old tokens without portalType (backward compatibility)
    console.warn(
      "Token without portalType detected, using fallback email lookup"
    );

    // Try admin first
    const adminUser = await prisma.adminUsers.findFirst({
      where: {
        id: decodedToken.id,
        email: decodedToken.email, //  Also check email to ensure correct user
      },
      include: {
        admin_user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (adminUser) {
      return await validateAdminUser(adminUser, allowedRoles);
    }

    // Try partner
    const partnerUser = await prisma.b2BPartnersUsers.findFirst({
      where: {
        id: decodedToken.id,
        email: decodedToken.email, //  Also check email to ensure correct user
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        b2b_partner: true,
      },
    });

    if (partnerUser) {
      return await validatePartnerUser(partnerUser, allowedRoles);
    }

    // User not found in either table
    console.error("User not found in admin or partner tables");
    return null;
  } catch (error) {
    console.error("JWT authentication error:", error);
    return null;
  }
}

/**
 *  Validate Admin User
 */
async function validateAdminUser(
  adminUser: any,
  allowedRoles: string[]
): Promise<any | null> {
  try {
    if (!adminUser.is_active) {
      throw new Error(
        "Your account has been disabled, please contact system administrator"
      );
    }

    // Check session validity (your existing logic)
    const session = await prisma.adminSessions.findFirst({
      where: {
        user_id: adminUser.id,
        is_valid: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!session) {
      throw new Error("Invalid admin user session");
    }

    // Check session expiration
    if (session.expires_at && new Date() > session.expires_at) {
      throw new Error("Admin session expired");
    }

    // Extract roles
    const roles = adminUser.admin_user_roles.map((ur: any) => ur.role.role);

    // Check allowed roles
    if (allowedRoles.length > 0) {
      const hasAccess = roles.some((role: string) =>
        allowedRoles.includes(role)
      );
      if (!hasAccess) {
        throw new Error("Access Denied");
      }
    }

    return {
      portalType: PortalType.ADMIN,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.full_name,
        roles: roles,
        isActive: adminUser.is_active,
      },
      payload: {
        // For backward compatibility with your existing code
        id: adminUser.id,
        email: adminUser.email,
        passwordHash: adminUser.password_hash,
        roles: roles,
      },
    };
  } catch (error) {
    console.error("Admin validation error:", error);
    throw error;
  }
}

/**
 *  Validate Partner User
 */
async function validatePartnerUser(
  partnerUser: any,
  allowedRoles: string[]
): Promise<any | null> {
  try {
    if (!partnerUser.is_active) {
      throw new Error(
        "Your account has been disabled, please contact system administrator"
      );
    }

    if (!partnerUser.b2b_partner.is_active) {
      throw new Error("Partner organization is disabled");
    }

    // Check session validity (your existing logic)
    const session = await prisma.b2BPartnersSessions.findFirst({
      where: {
        user_id: partnerUser.id,
        is_valid: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!session) {
      throw new Error("Invalid user session");
    }

    // Check session expiration
    if (session.expires_at && new Date() > session.expires_at) {
      throw new Error("Partner session expired");
    }

    // Extract roles
    const roles = partnerUser.roles.map((ur: any) => ur.role.role);

    // Check allowed roles
    if (allowedRoles.length > 0) {
      const hasAccess = roles.some((role: string) =>
        allowedRoles.includes(role)
      );
      if (!hasAccess) {
        throw new Error("Access Denied");
      }
    }

    return {
      portalType: PortalType.PARTNER,
      user: {
        id: partnerUser.id,
        email: partnerUser.email,
        fullName: partnerUser.full_name,
        roles: roles,
        isActive: partnerUser.is_active,
        partnerId: partnerUser.b2b_id,
        partnerName: partnerUser.b2b_partner.partner_name,
      },
      payload: {
        // For backward compatibility
        id: partnerUser.id,
        email: partnerUser.email,
        passwordHash: partnerUser.password_hash,
        roles: roles,
      },
    };
  } catch (error) {
    console.error("Partner validation error:", error);
    throw error;
  }
}

/**
 *  Authenticate with API Key (ULTRA-SIMPLIFIED)
 * Just validates the API key and returns true/false
 * No payload, no user entity, no roles - just validation
 */
async function authenticateWithApiKey(apiKey: string): Promise<boolean> {
  try {
    // Simple validation against your existing API_KEY environment variable
    if (!apiKey || apiKey !== API_KEY) {
      console.error("Invalid or missing API Key");
      return false;
    }

    //  API key is valid - that's all we need to know
    return true;
  } catch (error) {
    console.error("API key authentication error:", error);
    return false;
  }
}
