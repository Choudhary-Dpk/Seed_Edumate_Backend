import prisma from "../config/prisma";
import {
  SendDashboardEmailRequest,
  SendBulkDashboardEmailRequest,
  DashboardEmailLog,
  EmailHistoryFilters,
} from "../types/dashboard-email.types";
import logger from "../utils/logger";
import { validateSingleEmail } from "./unified-email.service";

//  NEW: Import unified email services
import { queueEmail } from "./email-queue.service";
import { 
  EmailType, 
  EmailCategory, 
  SenderType 
} from "./email-log.service";

/**
 * Generate HTML email template for dashboard report
 * (Unchanged - reused as-is)
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
 * Validate email format (using unified validation)
 */
export function isValidEmail(email: string): boolean {
  const validation = validateSingleEmail(email);
  return validation.valid;
}

/**
 * Get partner details
 * (Unchanged - reused as-is)
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
 *  UPDATED: Send dashboard email to single partner
 * 
 * Changes:
 * - Uses queueEmail() instead of manual Prisma operations
 * - Automatically creates entry in email_log (via queueEmail)
 * - Automatic transaction handling
 * - No more dashboardEmailLog table
 * - Type-safe enums
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
    htmlContent,
    filters,
    emailSource = "manual",
  } = request;

  // Validate: Must have either PDF or HTML
  if (!pdfBase64 && !htmlContent) {
    throw new Error("Either pdfBase64 or htmlContent must be provided");
  }

  // Validate email
  if (!isValidEmail(recipientEmail)) {
    throw new Error("Invalid email format");
  }

  // Get partner details (read-only, outside transaction)
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
  const actualEmailSource = autoEmail === recipientEmail ? "auto" : emailSource;

  // Prepare email HTML
  const emailHtml = htmlContent || generateDashboardEmailHtml(
    partnerName,
    message,
    adminUser?.full_name || "Admin"
  );

  // Prepare attachments
  const attachments = pdfBase64
    ? [
        {
          filename: `${partnerName.replace(/[^a-z0-9]/gi, "_")}_Dashboard_Report.pdf`,
          content: pdfBase64, // Keep as base64 string
          contentType: "application/pdf"
        },
      ]
    : [];

  //  NEW: Determine email type based on content
  const emailType = htmlContent ? EmailType.MONTHLY_REPORT : EmailType.DASHBOARD_REPORT;

  try {
    //  NEW: Use unified queueEmail service
    // This automatically:
    // - Creates entry in email_log table
    // - Creates entry in email_queue table
    // - Links them together
    // - Does everything in a transaction
    const result = await queueEmail({
      to: recipientEmail,
      subject,
      html: emailHtml,
      attachments, // queueEmail handles attachment conversion
      email_type: emailType,
      category: EmailCategory.DASHBOARD,
      sent_by_user_id: adminUser.id,
      sent_by_name: adminUser.full_name || "Admin",
      sent_by_type: SenderType.ADMIN,
      reference_type: partner ? "partner" : undefined,
      reference_id: partner?.id,
      metadata: {
        emailSource: actualEmailSource,
        autoEmail: autoEmail || null,
        reportType: htmlContent ? "monthly_report" : "dashboard_pdf",
        partnerName,
        filters: filters || null,
      },
      priority: 0,
    });

    logger.info("Dashboard email queued via unified system", {
      emailLogId: result.emailLog.id,
      queueItemId: result.queueItem.id,
      recipient: recipientEmail,
      partnerId,
      reportType: htmlContent ? "monthly_report" : "dashboard_pdf",
    });

    return {
      success: true,
      message: `Email queued successfully to ${recipientEmail}`,
      data: {
        emailLogId: result.emailLog.id,
        queueItemId: result.queueItem.id,
        emailSource: actualEmailSource,
        recipientEmail,
      },
    };
  } catch (error) {
    logger.error("Failed to queue dashboard email", {
      error: error instanceof Error ? error.message : "Unknown error",
      partnerId,
      recipientEmail,
    });
    throw error;
  }
}

/**
 *  UPDATED: Send bulk dashboard emails
 * 
 * Changes:
 * - Uses queueEmail() in loop instead of manual Prisma batch operations
 * - Each email logged individually to email_log
 * - Simplified code with better error handling
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

  // Validate recipients
  if (!recipients || recipients.length === 0) {
    throw new Error("Recipients array is required and must not be empty");
  }

  // Batch fetch all partners in one query
  const partnerIds = recipients.map(r => r.partnerId);
  
  const partners = await prisma.hSB2BPartners.findMany({
    where: {
      id: { in: partnerIds }
    },
    select: {
      id: true,
      partner_name: true,
      partner_display_name: true,
      contact_info: true
    }
  });

  // Create lookup map for O(1) access
  const partnerMap = new Map(
    partners.map(p => [p.id, p])
  );

  // Process emails
  const results: any[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    try {
      const partner = partnerMap.get(recipient.partnerId);
      
      if (!partner) {
        logger.warn('Partner not found for bulk email', { 
          partnerId: recipient.partnerId 
        });
        failedCount++;
        results.push({
          partnerId: recipient.partnerId,
          email: recipient.email,
          status: 'failed',
          error: 'Partner not found',
        });
        continue;
      }

      const partnerName = partner.partner_display_name || partner.partner_name || '';
      
      const emailHtml = generateDashboardEmailHtml(
        partnerName,
        message,
        adminUser.full_name || "Admin"
      );

      //  NEW: Use queueEmail for each recipient
      const result = await queueEmail({
        to: recipient.email,
        subject,
        html: emailHtml,
        email_type: EmailType.DASHBOARD_REPORT,
        category: EmailCategory.DASHBOARD,
        sent_by_user_id: adminUser.id,
        sent_by_name: adminUser.full_name || "Admin",
        sent_by_type: SenderType.ADMIN,
        reference_type: "partner",
        reference_id: partner.id,
        metadata: {
          emailSource: recipient.emailSource,
          autoEmail: partner.contact_info?.primary_contact_email || null,
          reportType: "bulk_dashboard",
          partnerName,
          filters: filters || null,
        },
        priority: 0,
      });

      successCount++;
      results.push({
        partnerId: partner.id,
        partnerName,
        email: recipient.email,
        status: 'queued',
        emailLogId: result.emailLog.id,
        queueItemId: result.queueItem.id,
      });

    } catch (error) {
      failedCount++;
      results.push({
        partnerId: recipient.partnerId,
        email: recipient.email,
        status: 'failed',
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      logger.error("Failed to queue bulk dashboard email", {
        partnerId: recipient.partnerId,
        email: recipient.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  logger.info("Bulk dashboard emails processed", {
    total: recipients.length,
    success: successCount,
    failed: failedCount,
    adminUser: adminUser.id
  });

  return {
    success: failedCount === 0,
    message: `${successCount} emails queued successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
    data: {
      sent: successCount,
      failed: failedCount,
      results,
    }
  };
}

/**
 *  UPDATED: Get email history
 * 
 * Changes:
 * - Now queries email_log table instead of dashboardEmailLog
 * - Filters by category = DASHBOARD
 * - Returns unified email log format
 */
export async function getEmailHistory(
  filters: EmailHistoryFilters
): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const { partnerId, status, startDate, endDate, page = 1, limit = 20 } = filters;

  const where: any = {
    category: EmailCategory.DASHBOARD, //  Filter by dashboard emails only
  };

  if (partnerId) {
    where.reference_type = "partner";
    where.reference_id = partnerId;
  }

  if (status) {
    // Map old status strings to new EmailLogStatus enum
    const statusMap: any = {
      'pending': 'pending',
      'queued': 'queued',
      'sent': 'sent',
      'failed': 'failed',
    };
    where.status = statusMap[status.toLowerCase()] || status;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = new Date(startDate);
    }
    if (endDate) {
      where.created_at.lte = new Date(endDate);
    }
  }

  const [data, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        queue_item: {
          select: {
            id: true,
            status: true,
            sent_at: true,
          }
        }
      }
    }),
    prisma.emailLog.count({ where }),
  ]);

  // Transform to match old DashboardEmailLog format for backward compatibility
  const transformedData = data.map(log => ({
    id: log.id,
    partnerId: log.reference_type === 'partner' ? log.reference_id : null,
    partnerName: (log.metadata as any)?.partnerName || 'Unknown',
    recipient: log.recipient,
    subject: log.subject,
    status: log.status,
    sentBy: log.sent_by_user_id,
    sentByName: log.sent_by_name,
    sentAt: log.sent_at,
    createdAt: log.created_at,
    metadata: log.metadata,
    filters: (log.metadata as any)?.filters || null,
  }));

  return {
    data: transformedData,
    total,
    page,
    limit,
  };
}

/**
 *  NEW: Get dashboard email analytics
 * 
 * Provides statistics specifically for dashboard emails
 */
export async function getDashboardEmailAnalytics(filters?: {
  startDate?: Date;
  endDate?: Date;
  partnerId?: number;
}): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  delivery_rate: number;
  by_partner: any[];
}> {
  const where: any = {
    category: EmailCategory.DASHBOARD,
  };

  if (filters?.partnerId) {
    where.reference_type = "partner";
    where.reference_id = filters.partnerId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at.gte = filters.startDate;
    if (filters.endDate) where.created_at.lte = filters.endDate;
  }

  const [total, sent, failed, pending, byPartner] = await Promise.all([
    // Total dashboard emails
    prisma.emailLog.count({ where }),
    
    // Sent emails
    prisma.emailLog.count({ 
      where: { ...where, status: 'sent' } 
    }),
    
    // Failed emails
    prisma.emailLog.count({ 
      where: { ...where, status: 'failed' } 
    }),
    
    // Pending emails
    prisma.emailLog.count({ 
      where: { ...where, status: { in: ['pending', 'queued'] } } 
    }),
    
    // Group by partner (using reference_id)
    prisma.emailLog.groupBy({
      by: ["reference_id"],
      where: { ...where, reference_type: "partner" },
      _count: true,
    }),
  ]);

  // Calculate delivery rate
  const delivery_rate = total > 0 ? (sent / total) * 100 : 0;

  return {
    total,
    sent,
    failed,
    pending,
    delivery_rate: Math.round(delivery_rate * 100) / 100,
    by_partner: byPartner.map(item => ({
      partnerId: item.reference_id,
      count: item._count,
    })),
  };
}