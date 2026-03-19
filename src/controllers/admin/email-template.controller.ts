import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/api";
import logger from "../../utils/logger";
import {
  createEmailTemplate,
  getEmailTemplateById,
  listEmailTemplates,
  updateEmailTemplate,
  softDeleteEmailTemplate,
} from "../../models/helpers/email-template.helper";
import { sendUnifiedEmail } from "../../services/unified-email.service";

// ============================================================================
// LIST ALL TEMPLATES (with pagination, search, category filter)
// ============================================================================

export const listEmailTemplatesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, category, is_active, page, size } = req.query;

    const result = await listEmailTemplates({
      search: search as string,
      category: category as any,
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      size: size ? parseInt(size as string, 10) : 20,
    });

    return sendResponse(res, 200, "Email templates fetched successfully", result);
  } catch (error: any) {
    logger.error("[EmailTemplate] List error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// GET SINGLE TEMPLATE BY ID (includes html_content for editing)
// ============================================================================

export const getEmailTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendResponse(res, 400, "Invalid template ID");
    }

    const template = await getEmailTemplateById(id);
    if (!template) {
      return sendResponse(res, 404, "Email template not found");
    }

    return sendResponse(res, 200, "Email template fetched successfully", template);
  } catch (error: any) {
    logger.error("[EmailTemplate] Get error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// CREATE TEMPLATE
// ============================================================================

export const createEmailTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug, name, subject, html_content, variables, category } = req.body;

    if (!slug || !name || !subject || !html_content) {
      return sendResponse(
        res,
        400,
        "slug, name, subject, and html_content are required",
      );
    }

    // Validate slug format (lowercase, hyphens, underscores only)
    if (!/^[a-z0-9_-]+$/.test(slug)) {
      return sendResponse(
        res,
        400,
        "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
      );
    }

    const user = (req as any).user;

    const template = await createEmailTemplate({
      slug,
      name,
      subject,
      html_content,
      variables,
      category,
      created_by: user?.id,
    });

    logger.info("[EmailTemplate] Created", {
      templateId: template.id,
      slug: template.slug,
      createdBy: user?.id,
    });

    return sendResponse(res, 201, "Email template created successfully", template);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendResponse(res, 409, "A template with this slug already exists");
    }
    logger.error("[EmailTemplate] Create error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// UPDATE TEMPLATE (HTML, subject, name, variables, category, is_active)
// ============================================================================

export const updateEmailTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendResponse(res, 400, "Invalid template ID");
    }

    const existing = await getEmailTemplateById(id);
    if (!existing) {
      return sendResponse(res, 404, "Email template not found");
    }

    const { name, subject, html_content, variables, category, is_active } =
      req.body;

    // At least one field must be provided
    if (
      name === undefined &&
      subject === undefined &&
      html_content === undefined &&
      variables === undefined &&
      category === undefined &&
      is_active === undefined
    ) {
      return sendResponse(res, 400, "At least one field must be provided to update");
    }

    const user = (req as any).user;

    const updated = await updateEmailTemplate(id, {
      name,
      subject,
      html_content,
      variables,
      category,
      is_active,
      updated_by: user?.id,
    });

    logger.info("[EmailTemplate] Updated", {
      templateId: id,
      slug: existing.slug,
      updatedBy: user?.id,
      fieldsUpdated: Object.keys(req.body),
    });

    return sendResponse(res, 200, "Email template updated successfully", updated);
  } catch (error: any) {
    logger.error("[EmailTemplate] Update error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// DELETE TEMPLATE (soft delete)
// ============================================================================

export const deleteEmailTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendResponse(res, 400, "Invalid template ID");
    }

    const existing = await getEmailTemplateById(id);
    if (!existing) {
      return sendResponse(res, 404, "Email template not found");
    }

    const user = (req as any).user;

    await softDeleteEmailTemplate(id, user?.id);

    logger.info("[EmailTemplate] Deleted", {
      templateId: id,
      slug: existing.slug,
      deletedBy: user?.id,
    });

    return sendResponse(res, 200, "Email template deleted successfully");
  } catch (error: any) {
    logger.error("[EmailTemplate] Delete error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// PREVIEW TEMPLATE (replace variables with sample data and return HTML)
// ============================================================================

export const previewEmailTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendResponse(res, 400, "Invalid template ID");
    }

    const template = await getEmailTemplateById(id);
    if (!template) {
      return sendResponse(res, 404, "Email template not found");
    }

    // Replace variables with sample values from request body or defaults
    const sampleData = req.body.variables || {};
    let previewHtml = template.html_content;

    // Replace {%variable%} placeholders with sample data
    previewHtml = previewHtml.replace(
      /\{%(\w[\w-]*)%\}/g,
      (match, varName) => {
        return sampleData[varName] || `[${varName}]`;
      },
    );

    // Always replace currentYear
    previewHtml = previewHtml.replace(
      /\{%currentYear%\}/g,
      new Date().getFullYear().toString(),
    );

    return sendResponse(res, 200, "Template preview generated", {
      id: template.id,
      slug: template.slug,
      name: template.name,
      subject: template.subject,
      preview_html: previewHtml,
    });
  } catch (error: any) {
    logger.error("[EmailTemplate] Preview error", { error: error.message });
    next(error);
  }
};

// ============================================================================
// SEND TEST EMAIL (send template to a given email for real preview)
// ============================================================================

export const sendTestEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendResponse(res, 400, "Invalid template ID");
    }

    const { email, variables: sampleData } = req.body;

    if (!email) {
      return sendResponse(res, 400, "email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, "Invalid email address");
    }

    const template = await getEmailTemplateById(id);
    if (!template) {
      return sendResponse(res, 404, "Email template not found");
    }

    // Replace {%variable%} placeholders with sample data
    const replacements = sampleData || {};
    let emailHtml = template.html_content.replace(
      /\{%(\w[\w-]*)%\}/g,
      (match: string, varName: string) => {
        return replacements[varName] || `[${varName}]`;
      },
    );

    // Always replace currentYear
    emailHtml = emailHtml.replace(
      /\{%currentYear%\}/g,
      new Date().getFullYear().toString(),
    );

    // Replace subject placeholders too
    let emailSubject = template.subject.replace(
      /\{%(\w[\w-]*)%\}/g,
      (match: string, varName: string) => {
        return replacements[varName] || `[${varName}]`;
      },
    );
    emailSubject = `[TEST] ${emailSubject}`;

    const result = await sendUnifiedEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      metadata: {
        type: "test_email_template",
        emailSource: "manual",
        templateId: template.id,
        templateSlug: template.slug,
      },
    });

    if (!result.success) {
      logger.error("[EmailTemplate] Test email failed", {
        templateId: id,
        email,
        error: result.error,
      });
      return sendResponse(res, 500, "Failed to send test email", {
        error: result.error,
      });
    }

    const user = (req as any).user;
    logger.info("[EmailTemplate] Test email sent", {
      templateId: id,
      slug: template.slug,
      sentTo: email,
      sentBy: user?.id,
    });

    return sendResponse(res, 200, "Test email sent successfully", {
      template_id: template.id,
      template_slug: template.slug,
      sent_to: email,
      subject: emailSubject,
      message_id: result.messageId,
    });
  } catch (error: any) {
    logger.error("[EmailTemplate] Send test email error", {
      error: error.message,
    });
    next(error);
  }
};
