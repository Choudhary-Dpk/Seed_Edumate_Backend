// src/services/dashboard-email.service.ts

import prisma from "../config/prisma";
import { emailQueue } from "../utils/queue";
import {
  SendDashboardEmailRequest,
  SendBulkDashboardEmailRequest,
  DashboardEmailLog,
  EmailHistoryFilters,
} from "../types/dashboard-email.types";
import logger from "../utils/logger";

/**
 * Generate HTML email template for dashboard report (with PDF attachment)
 */
export function generateDashboardEmailHtml(
  partnerName: string,
  message: string = "",
  adminName: string = "Edumate Team"
): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Performance Dashboard</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e5fad 0%, #0f2744 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            Your Performance Dashboard
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px 0;">
            Dear <strong>${partnerName}</strong>,
          </p>
          
          ${
            message
              ? `
            <div style="background: #f0f9ff; border-left: 4px solid #1e5fad; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="font-size: 15px; color: #0f2744; margin: 0; line-height: 1.6;">
                ${message}
              </p>
            </div>
          `
              : ""
          }

          <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 16px 0;">
            Please find your performance dashboard report attached as a PDF. This report includes:
          </p>

          <ul style="font-size: 15px; color: #666; line-height: 1.8; margin: 16px 0; padding-left: 24px;">
            <li>Key performance metrics</li>
            <li>Application statistics</li>
            <li>Conversion rates</li>
            <li>Disbursement details</li>
          </ul>

          <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 24px 0 16px 0;">
            If you have any questions about this report, please don't hesitate to reach out to our team.
          </p>

          <p style="font-size: 14px; color: #999; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #eee;">
            Best regards,<br>
            <strong style="color: #333;">${adminName}</strong><br>
            Edumate Global
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;">
          <p style="font-size: 12px; color: #999; margin: 0 0 8px 0;">
            © ${currentYear} Edumate Global. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #999; margin: 0;">
            This is an automated report generated from your partner dashboard.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get partner details
 */
export async function getPartnerDetails(partnerId: number) {
  return await prisma.hSB2BPartners.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      partner_name: true,
      partner_display_name: true,
      contact_info: true,
    },
  });
}

/**
 * Send dashboard email to single partner
 * Supports both PDF attachment and HTML-only reports
 */
export async function sendDashboardEmail(
  request: SendDashboardEmailRequest,
  adminUser: { id: number; full_name?: string }
): Promise<{ success: boolean; message: string; data?: any }> {
  const {
    partnerId,
    recipientEmail,
    subject,
    message,
    pdfBase64,
    htmlContent, // NEW: HTML content for text-based reports
    filters,
  } = request;

  // Validate: Must have either PDF or HTML
  if (!pdfBase64 && !htmlContent) {
    throw new Error("Either pdfBase64 or htmlContent must be provided");
  }

  // Validate email
  if (!isValidEmail(recipientEmail)) {
    throw new Error("Invalid email format");
  }

  // Get partner details
  let partner = null;
  let partnerName = "Partner";

  if (partnerId) {
    partner = await getPartnerDetails(partnerId);
    if (!partner) {
      throw new Error("Partner not found");
    }
    partnerName = partner.partner_display_name || partner.partner_name || "";
  }

  // Determine email source
  const autoEmail = partner?.contact_info?.primary_contact_email;
  const emailSource = autoEmail === recipientEmail ? "auto" : "manual";

  // Create email log
  const emailLog = await prisma.dashboardEmailLog.create({
    data: {
      partnerId: partner?.id,
      partnerName,
      recipient: recipientEmail,
      subject,
      status: "pending",
      sentBy: adminUser?.id || 0,
      sentByName: adminUser?.full_name || "Admin",
      filters: filters as any,
      metadata: {
        emailSource,
        autoEmail: autoEmail || null,
        reportType: htmlContent ? "monthly_report" : "dashboard_pdf", // Track type
      },
    },
  });

  try {
    // Determine email HTML
    let emailHtml: string;

    if (htmlContent) {
      // Use provided HTML content (for monthly reports)
      emailHtml = htmlContent;
    } else {
      // Generate wrapper HTML for PDF attachment (existing behavior)
      emailHtml = generateDashboardEmailHtml(
        partnerName,
        message,
        adminUser?.full_name || "Admin"
      );
    }

    // Prepare attachments (only if PDF provided)
    const attachments = pdfBase64
      ? [
          {
            filename: `${partnerName.replace(/[^a-z0-9]/gi, "_")}_Dashboard_Report.pdf`,
            content: Buffer.from(pdfBase64, "base64"),
          },
        ]
      : []; // No attachment for HTML-only reports

    // Add to email queue
    emailQueue.push({
      to: recipientEmail,
      subject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
      retry: 0,
    });

    // Update log status
    await prisma.dashboardEmailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    logger.info("Dashboard email sent successfully", {
      emailId: emailLog.id,
      recipient: recipientEmail,
      partnerId,
      reportType: htmlContent ? "monthly_report" : "dashboard_pdf",
    });

    return {
      success: true,
      message: `Email sent successfully to ${recipientEmail}`,
      data: {
        emailId: emailLog.id,
        emailSource,
        recipientEmail,
      },
    };
  } catch (error: any) {
    // Update log with error
    await prisma.dashboardEmailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "failed",
        errorMsg: error.message,
      },
    });

    logger.error("Failed to send dashboard email", {
      emailId: emailLog.id,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Send bulk dashboard emails
 */
export async function sendBulkDashboardEmails(
  request: SendBulkDashboardEmailRequest,
  adminUser: { id: number; full_name?: string }
): Promise<{
  success: boolean;
  message: string;
  data: { sent: number; failed: number; results: any[] };
}> {
  const { recipients, subject, message, filters } = request;

  const results: any[] = [];
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    try {
      // Get partner details
      const partner = await getPartnerDetails(recipient.partnerId);
      if (!partner) {
        throw new Error("Partner not found");
      }

      const partnerName =
        partner.partner_display_name || partner.partner_name || "";

      // Create email log
      const emailLog = await prisma.dashboardEmailLog.create({
        data: {
          partnerId: partner.id,
          partnerName,
          recipient: recipient.email,
          subject,
          status: "pending",
          sentBy: adminUser.id,
          sentByName: adminUser.full_name || "Admin",
          filters: filters as any,
          metadata: {
            emailSource: recipient.emailSource,
            autoEmail: partner.contact_info?.primary_contact_email || null,
          },
        },
      });

      // Generate email HTML
      const emailHtml = generateDashboardEmailHtml(
        partnerName,
        message,
        adminUser.full_name
      );

      // Note: For bulk emails, we'll send without PDF attachment
      // to avoid generating PDFs for each partner (performance)
      emailQueue.push({
        to: recipient.email,
        subject,
        html: emailHtml,
        retry: 0,
      });

      // Update log status
      await prisma.dashboardEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });

      sentCount++;
      results.push({
        partnerId: recipient.partnerId,
        partnerName,
        email: recipient.email,
        status: "sent",
      });
    } catch (error: any) {
      failedCount++;
      results.push({
        partnerId: recipient.partnerId,
        email: recipient.email,
        status: "failed",
        error: error.message,
      });

      logger.error("Failed to send bulk email to partner", {
        partnerId: recipient.partnerId,
        error: error.message,
      });
    }
  }

  logger.info("Bulk dashboard emails processed", {
    total: recipients.length,
    sent: sentCount,
    failed: failedCount,
  });

  return {
    success: true,
    message: `Emails sent: ${sentCount}, Failed: ${failedCount}`,
    data: {
      sent: sentCount,
      failed: failedCount,
      results,
    },
  };
}

/**
 * Get email history with filters
 */
export async function getEmailHistory(
  filters: EmailHistoryFilters
): Promise<{
  data: DashboardEmailLog[];
  total: number;
  page: number;
  limit: number;
}> {
  const { partnerId, status, startDate, endDate, page = 1, limit = 20 } = filters;

  const where: any = {};

  if (partnerId) {
    where.partnerId = partnerId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.sentAt = {};
    if (startDate) {
      where.sentAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.sentAt.lte = new Date(endDate);
    }
  }

  const [data, total] = await Promise.all([
    prisma.dashboardEmailLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dashboardEmailLog.count({ where }),
  ]);

  return {
    data: data as any,
    total,
    page,
    limit,
  };
}