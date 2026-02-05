import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CreateEmailLogOptions {
  // Core fields (required)
  recipient: string;
  subject: string;
  email_type: EmailType;
  category: EmailCategory;
  
  // Optional core fields
  cc?: string;
  bcc?: string;
  from?: string;
  
  // Sender tracking
  sent_by_user_id?: number;
  sent_by_name?: string;
  sent_by_type?: SenderType;
  
  // Reference tracking (what is this email about?)
  reference_type?: string;  // "partner", "loan_application", "user"
  reference_id?: number;
  
  // Content metadata
  has_attachment?: boolean;
  attachment_count?: number;
  
  // Status & queue
  status?: EmailLogStatus;
  queue_item_id?: number;
  
  // Error tracking
  error_message?: string;
  attempts?: number;
  
  // Timestamps
  sent_at?: Date;
  failed_at?: Date;
  
  // Flexible metadata (type-specific data)
  metadata?: any;
}

// ============================================================================
// ENUMS (Mirror Prisma enums for type safety)
// ============================================================================

export enum EmailCategory {
  TRANSACTIONAL = "TRANSACTIONAL",  
  DASHBOARD = "DASHBOARD",           
  SYSTEM = "SYSTEM",                
  MARKETING = "MARKETING",          
  NOTIFICATION = "NOTIFICATION",    
  LOAN = "LOAN",                    
}

export enum EmailLogStatus {
  PENDING = "PENDING",              
  QUEUED = "QUEUED",                
  SENT = "SENT",                    
  FAILED = "FAILED",                
  BOUNCED = "BOUNCED",              
  REJECTED = "REJECTED",            
}

export enum SenderType {
  ADMIN = "ADMIN",                  
  PARTNER = "PARTNER",              
  SYSTEM = "SYSTEM",                
  API = "API",                      
  CRON = "CRON",                    
}

export enum EmailType {
  OTP = "OTP",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
  SET_PASSWORD = "SET_PASSWORD",
  RESET_PASSWORD = "RESET_PASSWORD",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  DASHBOARD_REPORT = "DASHBOARD_REPORT",
  MONTHLY_REPORT = "MONTHLY_REPORT",
  LOAN_ELIGIBILITY = "LOAN_ELIGIBILITY",
  REPAYMENT_SCHEDULE = "REPAYMENT_SCHEDULE",
  CRON_NOTIFICATION = "CRON_NOTIFICATION",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  SHOW_INTEREST = "SHOW_INTEREST",
  WELCOME = "WELCOME",
  UNKNOWN = "UNKNOWN",
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Create email log entry
 * 
 * This is the PRIMARY function for logging ALL emails
 * Use this everywhere instead of direct database inserts
 * 
 * @param options - Email log configuration
 * @returns Created email log record
 */
export async function createEmailLog(
  options: CreateEmailLogOptions
): Promise<any> {
  try {
    const emailLog = await prisma.emailLog.create({
      data: {
        // Core fields
        recipient: options.recipient,
        cc: options.cc,
        bcc: options.bcc,
        from: options.from,
        subject: options.subject,
        
        // Classification
        email_type: options.email_type as any,
        category: options.category as any,
        
        // Sender tracking
        sent_by_user_id: options.sent_by_user_id,
        sent_by_name: options.sent_by_name,
        sent_by_type: options.sent_by_type as any,
        
        // Reference tracking
        reference_type: options.reference_type,
        reference_id: options.reference_id,
        
        // Content metadata
        has_attachment: options.has_attachment || false,
        attachment_count: options.attachment_count || 0,
        
        // Status & queue
        status: (options.status || EmailLogStatus.PENDING) as any,
        queue_item_id: options.queue_item_id,
        
        // Error tracking
        error_message: options.error_message,
        attempts: options.attempts || 0,
        
        // Timestamps
        sent_at: options.sent_at,
        failed_at: options.failed_at,
        
        // Metadata
        metadata: options.metadata as Prisma.InputJsonValue,
      },
    });

    logger.debug("Email log created", {
      emailLogId: emailLog.id,
      recipient: emailLog.recipient,
      email_type: emailLog.email_type,
      category: emailLog.category,
      status: emailLog.status,
    });

    return emailLog;
  } catch (error) {
    logger.error("Failed to create email log", {
      error: error instanceof Error ? error.message : "Unknown error",
      recipient: options.recipient,
      email_type: options.email_type,
      category: options.category,
    });
    throw error;
  }
}

/**
 * Update email log status
 * 
 * Called when:
 * - Email is successfully sent (QUEUED → SENT)
 * - Email fails to send (QUEUED → FAILED)
 * - Email bounces (SENT → BOUNCED)
 * 
 * @param id - Email log ID
 * @param status - New status
 * @param options - Additional update fields
 * @returns Updated email log record
 */
export async function updateEmailLogStatus(
  id: number,
  status: EmailLogStatus,
  options?: {
    sent_at?: Date;
    failed_at?: Date;
    error_message?: string;
    attempts?: number;
  }
): Promise<any> {
  try {
    const updateData: any = {
      status: status as any,
    };

    // Set timestamps based on status
    if (status === EmailLogStatus.SENT && !options?.sent_at) {
      updateData.sent_at = new Date();
    } else if (options?.sent_at) {
      updateData.sent_at = options.sent_at;
    }

    if (status === EmailLogStatus.FAILED && !options?.failed_at) {
      updateData.failed_at = new Date();
    } else if (options?.failed_at) {
      updateData.failed_at = options.failed_at;
    }

    if (options?.error_message) {
      updateData.error_message = options.error_message;
    }

    if (options?.attempts !== undefined) {
      updateData.attempts = options.attempts;
    }

    const emailLog = await prisma.emailLog.update({
      where: { id },
      data: updateData,
    });

    logger.debug("Email log status updated", {
      emailLogId: id,
      status,
      sent_at: updateData.sent_at,
      failed_at: updateData.failed_at,
    });

    return emailLog;
  } catch (error) {
    logger.error("Failed to update email log status", {
      error: error instanceof Error ? error.message : "Unknown error",
      emailLogId: id,
      status,
    });
    throw error;
  }
}

/**
 * Get email logs with filters
 * 
 * Useful for:
 * - Analytics dashboards
 * - Debugging email issues
 * - Audit trails
 * - Reporting
 * 
 * @param filters - Query filters
 * @returns Array of email logs
 */
export async function getEmailLogs(filters: {
  email_type?: EmailType;
  category?: EmailCategory;
  status?: EmailLogStatus;
  sent_by_user_id?: number;
  sent_by_type?: SenderType;
  reference_type?: string;
  reference_id?: number;
  start_date?: Date;
  end_date?: Date;
  recipient?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const where: any = {};

  // Filter by email type
  if (filters.email_type) {
    where.email_type = filters.email_type as any;
  }

  // Filter by category
  if (filters.category) {
    where.category = filters.category as any;
  }

  // Filter by status
  if (filters.status) {
    where.status = filters.status as any;
  }

  // Filter by sender
  if (filters.sent_by_user_id) {
    where.sent_by_user_id = filters.sent_by_user_id;
  }

  if (filters.sent_by_type) {
    where.sent_by_type = filters.sent_by_type as any;
  }

  // Filter by reference
  if (filters.reference_type) {
    where.reference_type = filters.reference_type;
  }

  if (filters.reference_id) {
    where.reference_id = filters.reference_id;
  }

  // Filter by recipient
  if (filters.recipient) {
    where.recipient = { contains: filters.recipient, mode: "insensitive" };
  }

  // Filter by date range
  if (filters.start_date || filters.end_date) {
    where.created_at = {};
    if (filters.start_date) {
      where.created_at.gte = filters.start_date;
    }
    if (filters.end_date) {
      where.created_at.lte = filters.end_date;
    }
  }

  try {
    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: filters.limit || 100,
      skip: filters.offset || 0,
      include: {
        queue_item: true, // Include queue relationship
      },
    });

    return logs;
  } catch (error) {
    logger.error("Failed to get email logs", {
      error: error instanceof Error ? error.message : "Unknown error",
      filters,
    });
    throw error;
  }
}

/**
 * Get email analytics
 * 
 * Returns aggregated statistics for email monitoring
 * 
 * @param filters - Date range filters
 * @returns Email analytics summary
 */
export async function getEmailAnalytics(filters: {
  start_date?: Date;
  end_date?: Date;
}): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  queued: number;
  delivery_rate: number;
  by_category: any[];
  by_type: any[];
  by_sender_type: any[];
}> {
  const where: any = {};

  // Filter by date range
  if (filters.start_date || filters.end_date) {
    where.created_at = {};
    if (filters.start_date) where.created_at.gte = filters.start_date;
    if (filters.end_date) where.created_at.lte = filters.end_date;
  }

  try {
    const [total, sent, failed, pending, queued, byCategory, byType, bySenderType] = await Promise.all([
      // Total emails
      prisma.emailLog.count({ where }),
      
      // Sent emails
      prisma.emailLog.count({ 
        where: { ...where, status: EmailLogStatus.SENT as any } 
      }),
      
      // Failed emails
      prisma.emailLog.count({ 
        where: { ...where, status: EmailLogStatus.FAILED as any } 
      }),
      
      // Pending emails
      prisma.emailLog.count({ 
        where: { ...where, status: EmailLogStatus.PENDING as any } 
      }),
      
      // Queued emails
      prisma.emailLog.count({ 
        where: { ...where, status: EmailLogStatus.QUEUED as any } 
      }),
      
      // Group by category
      prisma.emailLog.groupBy({
        by: ["category"],
        where,
        _count: true,
      }),
      
      // Group by type
      prisma.emailLog.groupBy({
        by: ["email_type"],
        where,
        _count: true,
      }),
      
      // Group by sender type
      prisma.emailLog.groupBy({
        by: ["sent_by_type"],
        where,
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
      queued,
      delivery_rate: Math.round(delivery_rate * 100) / 100,
      by_category: byCategory,
      by_type: byType,
      by_sender_type: bySenderType,
    };
  } catch (error) {
    logger.error("Failed to get email analytics", {
      error: error instanceof Error ? error.message : "Unknown error",
      filters,
    });
    throw error;
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY HELPERS
// ============================================================================

/**
 * Legacy logEmailHistory function
 * 
 * Maintains backward compatibility with old code
 * Maps old API to new unified logging
 * 
 * @deprecated Use createEmailLog() directly instead
 */
export async function logEmailHistory(options: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  type: string;
}): Promise<any> {
  logger.warn("DEPRECATED: logEmailHistory() called. Use createEmailLog() instead.", {
    type: options.type,
  });

  // Map old "type" string to new EmailType enum
  const emailType = mapLegacyTypeToEmailType(options.type);
  const category = inferCategoryFromType(emailType);

  return createEmailLog({
    recipient: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    email_type: emailType,
    category,
    sent_by_type: SenderType.SYSTEM,
  });
}

/**
 * Map legacy email type strings to new enum
 * 
 * Handles variations and typos in old type strings
 */
function mapLegacyTypeToEmailType(legacyType: string): EmailType {
  const mapping: Record<string, EmailType> = {
    "Otp": EmailType.OTP,
    "OTP": EmailType.OTP,
    "Forgot Password": EmailType.FORGOT_PASSWORD,
    "Set Password": EmailType.SET_PASSWORD,
    "Reset Password": EmailType.RESET_PASSWORD,
    "Password Change": EmailType.PASSWORD_CHANGED,
    "Password Changed": EmailType.PASSWORD_CHANGED,
    "Email Verification": EmailType.EMAIL_VERIFICATION,
    "Dashboard Report": EmailType.DASHBOARD_REPORT,
    "Monthly Report": EmailType.MONTHLY_REPORT,
    "Loan Eligibility Result": EmailType.LOAN_ELIGIBILITY,
    "Repayment Schedule Email": EmailType.REPAYMENT_SCHEDULE,
    "Repayment Schedule": EmailType.REPAYMENT_SCHEDULE,
    "Show Interest": EmailType.SHOW_INTEREST,
    "Welcome": EmailType.WELCOME,
    "Cron Notification": EmailType.CRON_NOTIFICATION,
    "System Alert": EmailType.SYSTEM_ALERT,
  };

  return mapping[legacyType] || EmailType.UNKNOWN;
}

/**
 * Infer email category from email type
 * 
 * Provides reasonable defaults for categorization
 */
function inferCategoryFromType(emailType: EmailType): EmailCategory {
  const categoryMap: Record<EmailType, EmailCategory> = {
    [EmailType.OTP]: EmailCategory.TRANSACTIONAL,
    [EmailType.FORGOT_PASSWORD]: EmailCategory.TRANSACTIONAL,
    [EmailType.SET_PASSWORD]: EmailCategory.TRANSACTIONAL,
    [EmailType.RESET_PASSWORD]: EmailCategory.TRANSACTIONAL,
    [EmailType.EMAIL_VERIFICATION]: EmailCategory.TRANSACTIONAL,
    [EmailType.PASSWORD_CHANGED]: EmailCategory.TRANSACTIONAL,
    [EmailType.DASHBOARD_REPORT]: EmailCategory.DASHBOARD,
    [EmailType.MONTHLY_REPORT]: EmailCategory.DASHBOARD,
    [EmailType.LOAN_ELIGIBILITY]: EmailCategory.LOAN,
    [EmailType.REPAYMENT_SCHEDULE]: EmailCategory.LOAN,
    [EmailType.CRON_NOTIFICATION]: EmailCategory.SYSTEM,
    [EmailType.SYSTEM_ALERT]: EmailCategory.SYSTEM,
    [EmailType.SHOW_INTEREST]: EmailCategory.MARKETING,
    [EmailType.WELCOME]: EmailCategory.TRANSACTIONAL,
    [EmailType.UNKNOWN]: EmailCategory.SYSTEM,
  };

  return categoryMap[emailType] || EmailCategory.SYSTEM;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  mapLegacyTypeToEmailType,
  inferCategoryFromType,
};