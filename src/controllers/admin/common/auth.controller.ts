import { Response, NextFunction } from "express";
import { deleteAdminSession } from "../../../models/helpers/auth";
import { RequestWithPayload } from "../../../types/api.types";
import { LoginPayload, ProtectedPayload } from "../../../types/auth";
import { sendResponse } from "../../../utils/api";
import logger from "../../../utils/logger";
import { getAdminUserProfile } from "../../../models/helpers/user.helper";

export const logoutAdmin = async (
  req: RequestWithPayload<ProtectedPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.payload!;

    logger.debug(`Deleting sesssion for userId: ${id}`);
    await deleteAdminSession(id, "logout");
    logger.debug(`Session deleted successfully`);

    sendResponse(res, 200, "User logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.payload!;

    const profile = await getAdminUserProfile(id);
    if (!profile) {
      return sendResponse(res, 404, "Profile not found");
    }

    const result = {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      is_active: profile.is_active,
      b2b_partner: {
        logo_url: profile.logo_url ?? null,
      },
      roles:
        profile.roles?.map((r: any) => ({
          role: {
            id: r.id,
            role: r.role,
            display_name: r.display_name,
            description: r.description,
          },
        })) ?? [],
    };

    sendResponse(res, 200, "Profile fetched successfully", result);
  } catch (error) {
    next(error);
  }
};
