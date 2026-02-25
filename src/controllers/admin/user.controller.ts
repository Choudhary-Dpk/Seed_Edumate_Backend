import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { getEmailTemplate } from "../../models/helpers";
import {
  revokePreviousAdminEmailTokens,
  saveAdminEmailToken,
} from "../../models/helpers/auth";
import {
  createAdmin,
  assignAdminRole,
} from "../../models/helpers/user.helper";
import { FRONTEND_URL } from "../../setup/secrets";
import { sendResponse } from "../../utils/api";
import { generateEmailToken } from "../../utils/auth";
import logger from "../../utils/logger";
import { queueEmail } from "../../services/email-queue.service";
import { 
  EmailType, 
  EmailCategory, 
  SenderType 
} from "../../services/email-log.service";

export const createAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, phone } = req.body;

    logger.debug(`Creating user in database`);
    const user = await createAdmin(fullName, email, phone);
    logger.debug(`Admin created successfully`);

    logger.debug(`Assigning role to user`);
    await assignAdminRole(user.id, 1);
    logger.debug(`Role assigned to user succesfully`);

    logger.debug(`Generating refresh token`);
    const emailToken = await generateEmailToken(30);
    logger.debug(`Email token generated successfully`);

    logger.debug(`Getting template for set password`);
    let content = await getEmailTemplate("Set Password");
    logger.debug(`Email template fetched successfully`);
    if (!content) {
      throw new Error("Set Password - Email template not found");
    }

    const expiry = moment().add(2, "days").toDate().toISOString();
    const redirectUri = `${FRONTEND_URL}/admin/set-password?token=${emailToken}&expiry=${expiry}`;
    content = content.replace(/{%currentYear%}/, moment().format("YYYY"));
    content = content.replace(
      /{%name%}/g,
      fullName.charAt(0).toUpperCase() + fullName.slice(1),
    );
    const html = content.replace("{%set-password-url%}", redirectUri);
    const subject = "Set Password";

    logger.debug(`Revoking previous email tokens`);
    await revokePreviousAdminEmailTokens(user.id);
    logger.debug(
      `Previous email tokens revoked successfully for userId: ${user.id}`,
    );

    logger.debug(`Saving email token for userId: ${user.id}`);
    await saveAdminEmailToken(user.id, emailToken);
    logger.debug(`Email token saved successfully`);

    //  NEW: Use unified email queue service
    logger.debug(`Queueing email for userId: ${user.id}`);
    await queueEmail({
      to: email,
      subject,
      html,
      email_type: EmailType.SET_PASSWORD,
      category: EmailCategory.TRANSACTIONAL,
      sent_by_user_id: req.user?.id, // If available from auth middleware
      sent_by_name: req.user?.full_name, // If available from auth middleware
      sent_by_type: SenderType.ADMIN,
      reference_type: "user",
      reference_id: user.id,
      metadata: {
        action: "admin_creation",
        createdBy: req.user?.id,
        expiry,
      },
    });
    logger.debug(`Email queued successfully`);

    sendResponse(res, 201, "Admin created successfully");
  } catch (error) {
    next(error);
  }
};