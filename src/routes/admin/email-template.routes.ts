import { Router } from "express";
import { authenticate } from "../../middlewares";
import { AuthMethod } from "../../types/auth";
import {
  listEmailTemplatesController,
  getEmailTemplateController,
  createEmailTemplateController,
  updateEmailTemplateController,
  deleteEmailTemplateController,
  previewEmailTemplateController,
} from "../../controllers/admin/email-template.controller";

const router = Router();

// ============================================================================
// ALL ROUTES ARE PROTECTED - SUPER_ADMIN ONLY
// ============================================================================

const superAdminAuth = authenticate({
  method: AuthMethod.JWT,
  allowedRoles: ["super_admin"],
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route   GET /admin/email-templates
 * @desc    List all email templates (with pagination, search, category filter)
 * @query   search, category, is_active, page, size
 * @access  Super Admin only
 */
router.get("/", superAdminAuth, listEmailTemplatesController);

/**
 * @route   GET /admin/email-templates/:id
 * @desc    Get single email template by ID (includes html_content)
 * @access  Super Admin only
 */
router.get("/:id", superAdminAuth, getEmailTemplateController);

/**
 * @route   POST /admin/email-templates
 * @desc    Create a new email template
 * @body    { slug, name, subject, html_content, variables?, category? }
 * @access  Super Admin only
 */
router.post("/", superAdminAuth, createEmailTemplateController);

/**
 * @route   PUT /admin/email-templates/:id
 * @desc    Update an email template (HTML, subject, name, variables, etc.)
 * @body    { name?, subject?, html_content?, variables?, category?, is_active? }
 * @access  Super Admin only
 */
router.put("/:id", superAdminAuth, updateEmailTemplateController);

/**
 * @route   DELETE /admin/email-templates/:id
 * @desc    Soft delete an email template
 * @access  Super Admin only
 */
router.delete("/:id", superAdminAuth, deleteEmailTemplateController);

/**
 * @route   POST /admin/email-templates/:id/preview
 * @desc    Preview email template with sample variable data
 * @body    { variables?: { name: "John", otp: "1234", ... } }
 * @access  Super Admin only
 */
router.post("/:id/preview", superAdminAuth, previewEmailTemplateController);

export { router as emailTemplateRoutes };
