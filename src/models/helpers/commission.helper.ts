import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export const updateCommissionSettlement = async (
  tx: any,
  settlementId: number,
  mainData: any,
) => {
  const settlement = await tx.hSCommissionSettlements.update({
    where: {
      id: settlementId,
    },
    data: {
      ...mainData,
      updated_at: new Date(),
    },
  });

  return settlement;
};

export const updateCommissionSettlementStatus = async (
  tx: any,
  settlementId: number,
  statusData: any,
) => {
  if (!statusData || Object.keys(statusData).length === 0) {
    return null;
  }

  const status = await tx.hSCommissionSettlementsSettlementStatus.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...statusData,
      updated_at: new Date(),
    },
  });

  return status;
};

export const updateCommissionSettlementSystemTracking = async (
  tx: any,
  settlementId: number,
  systemTrackingData: any,
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSCommissionSettlementsSystemTracking.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...systemTrackingData,
      last_modified_date: new Date(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

export const updateCommissionSettlementTransactionDetails = async (
  tx: any,
  settlementId: number,
  transactionData: any,
) => {
  if (!transactionData || Object.keys(transactionData).length === 0) {
    return null;
  }

  const transaction = await tx.hSCommissionSettlementsTransactionDetails.update(
    {
      where: {
        settlement_id: settlementId,
      },
      data: {
        ...transactionData,
        updated_at: new Date(),
      },
    },
  );

  return transaction;
};

export const updateCommissionSettlementCalculation = async (
  tx: any,
  settlementId: number,
  calculationData: any,
) => {
  if (!calculationData || Object.keys(calculationData).length === 0) {
    return null;
  }

  const calculation =
    await tx.hSCommissionSettlementsCommissionCalculation.update({
      where: {
        settlement_id: settlementId,
      },
      data: {
        ...calculationData,
        updated_at: new Date(),
      },
    });

  return calculation;
};

export const updateCommissionSettlementCommunication = async (
  tx: any,
  settlementId: number,
  communicationData: any,
) => {
  if (!communicationData || Object.keys(communicationData).length === 0) {
    return null;
  }

  const communication = await tx.hSCommissionSettlementsCommunication.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...communicationData,
      updated_at: new Date(),
    },
  });

  return communication;
};

export const updateCommissionSettlementLoanDetails = async (
  tx: any,
  settlementId: number,
  loanData: any,
) => {
  if (!loanData || Object.keys(loanData).length === 0) {
    return null;
  }

  const loanDetails = await tx.hSCommissionSettlementsLoanDetails.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...loanData,
      updated_at: new Date(),
    },
  });

  return loanDetails;
};

export const updateCommissionSettlementPaymentProcessing = async (
  tx: any,
  settlementId: number,
  paymentData: any,
) => {
  if (!paymentData || Object.keys(paymentData).length === 0) {
    return null;
  }

  const payment = await tx.hSCommissionSettlementsPaymentProcessing.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...paymentData,
      updated_at: new Date(),
    },
  });

  return payment;
};

export const updateCommissionSettlementTaxDeductions = async (
  tx: any,
  settlementId: number,
  taxData: any,
) => {
  if (!taxData || Object.keys(taxData).length === 0) {
    return null;
  }

  const tax = await tx.hSCommissionSettlementsTaxAndDeductions.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...taxData,
      updated_at: new Date(),
    },
  });

  return tax;
};

export const updateCommissionSettlementDocumentation = async (
  tx: any,
  settlementId: number,
  documentData: any,
) => {
  if (!documentData || Object.keys(documentData).length === 0) {
    return null;
  }

  const documentation = await tx.hSCommissionSettlementsDocumentation.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...documentData,
      updated_at: new Date(),
    },
  });

  return documentation;
};

export const updateCommissionSettlementHoldDisputes = async (
  tx: any,
  settlementId: number,
  holdData: any,
) => {
  if (!holdData || Object.keys(holdData).length === 0) {
    return null;
  }

  const hold = await tx.hSCommissionSettlementsHoldAndDisputes.update({
    where: {
      settlement_id: settlementId,
    },
    data: {
      ...holdData,
      updated_at: new Date(),
    },
  });

  return hold;
};

export const updateCommissionSettlementReconciliation = async (
  tx: any,
  settlementId: number,
  reconciliationData: any,
) => {
  if (!reconciliationData || Object.keys(reconciliationData).length === 0) {
    return null;
  }

  const reconciliation = await tx.hSCommissionSettlementsReconciliations.update(
    {
      where: {
        settlement_id: settlementId,
      },
      data: {
        ...reconciliationData,
        updated_at: new Date(),
      },
    },
  );

  return reconciliation;
};

export const updateCommissionSettlementPerformanceAnalytics = async (
  tx: any,
  settlementId: number,
  performanceData: any,
) => {
  if (!performanceData || Object.keys(performanceData).length === 0) {
    return null;
  }

  const performance =
    await tx.hSCommissionSettlementsPerformanceAnalytics.update({
      where: {
        settlement_id: settlementId,
      },
      data: {
        ...performanceData,
        updated_at: new Date(),
      },
    });

  return performance;
};

export const deleteCommissionSettlement = async (settlementId: number) => {
  const settlement = await prisma.hSCommissionSettlements.update({
    where: {
      id: settlementId,
      is_active: true,
    },
    data: {
      is_active: false,
      updated_at: new Date(),
    },
  });

  if (!settlement) {
    throw new Error("Commission settlement not found or already deleted");
  }

  return settlement;
};

export const getCommissionSettlement = async (settlementId: number) => {
  const settlement = await prisma.hSCommissionSettlements.findUnique({
    where: {
      id: settlementId,
      is_active: true,
    },
    include: {
      calculation_details: true,
      communication: true,
      tax_deductions: true,
      documentation: true,
      hold_dispute: true,
      loan_details: true,
      payment_details: true,
      performance_metrics: true,
      reconciliation: true,
      status_history: true,
      system_tracking: true,
      transaction: true,
    },
  });

  if (!settlement) {
    throw new Error("Commission settlement not found");
  }

  return settlement;
};

export const fetchCommissionSettlementsList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  filters?: {
    partner: number | null;
    lead: string | null;
    invoiceStatus: string | null;
    paymentStatus: string | null;
    settlementStatus: string | null;
    verificationStatus: string | null;
    startDate: string | null;
    endDate: string | null;
  },
) => {
  const where: Prisma.HSCommissionSettlementsWhereInput = {
    is_active: true,
    OR: search
      ? [
          { student_id: { contains: search, mode: "insensitive" } },
          { student_name: { contains: search, mode: "insensitive" } },
          { partner_name: { contains: search, mode: "insensitive" } },
          {
            settlement_reference_number: {
              contains: search,
              mode: "insensitive",
            },
          },
        ]
      : undefined,
  };

  // Apply partner filter
  if (filters?.partner) {
    where.b2b_partner_id = Number(filters.partner);
  }

  // Apply lead filter
  if (filters?.lead) {
    where.lead_reference_id = Number(filters.lead);
  }

  // Apply invoice status filter (in documentation table)
  if (filters?.invoiceStatus) {
    where.documentation = {
      invoice_status: filters.invoiceStatus,
    };
  }

  // Apply payment status filter (in payment_details table)
  if (filters?.paymentStatus) {
    where.payment_details = {
      payment_status: filters.paymentStatus,
    };
  }

  // Apply settlement status filter (in status_history table)
  if (filters?.settlementStatus) {
    where.status_history = {
      ...((where.status_history as any) || {}),
      settlement_status: filters.settlementStatus,
    };
  }

  // Apply verification status filter (in status_history table)
  if (filters?.verificationStatus) {
    where.status_history = {
      ...((where.status_history as any) || {}),
      verification_status: filters.verificationStatus,
    };
  }

  // Apply date range filter on created_at (always populated, AND logic with search)
  if (filters?.startDate || filters?.endDate) {
    const dateFilter: any = {};

    if (filters.startDate) {
      dateFilter.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      dateFilter.lte = endDate;
    }

    where.created_at = dateFilter;
  }

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "id":
        orderBy = { id: sortDir || "asc" };
        break;
      case "partner_name":
        orderBy = { partner_name: sortDir || "asc" };
        break;
      case "student_name":
        orderBy = { student_name: sortDir || "asc" };
        break;
      case "settlement_period":
        orderBy = { settlement_period: sortDir || "asc" };
        break;
      case "settlement_year":
        orderBy = { settlement_year: sortDir || "desc" };
        break;
      case "settlement_date":
        orderBy = { settlement_date: sortDir || "desc" };
        break;
      case "created_at":
        orderBy = { created_at: sortDir || "desc" };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSCommissionSettlements.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        calculation_details: true,
        communication: true,
        tax_deductions: true,
        documentation: true,
        hold_dispute: true,
        loan_details: true,
        payment_details: true,
        performance_metrics: true,
        reconciliation: true,
        status_history: true,
        system_tracking: true,
        transaction: true,
        edumate_contacts: {
          select: {
            id: true,
            personal_information: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.hSCommissionSettlements.count({ where }),
  ]);

  return { rows, count };
};

export const checkCommissionSettlementFields = async (
  student_id?: string,
  settlement_reference_number?: string,
  hs_object_id?: string,
) => {
  const conditions: any[] = [];

  if (student_id) conditions.push({ student_id });
  if (settlement_reference_number)
    conditions.push({ settlement_reference_number });
  if (hs_object_id) conditions.push({ hs_object_id });

  if (student_id) {
    conditions.push({
      AND: [{ student_id }],
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = await prisma.hSCommissionSettlements.findFirst({
    where: {
      OR: conditions,
      is_deleted: false,
      is_active: true,
    },
    select: {
      id: true,
      lead_reference_id: true,
      student_id: true,
      settlement_reference_number: true,
      hs_object_id: true,
      partner_name: true,
      student_name: true,
    },
  });

  return result;
};

// ============================================================================
// COMMISSION SUMMARY — period-based dashboard metrics
// ============================================================================

const getDateRange = (
  period: string,
): { current: { gte?: Date; lte?: Date }; previous: { gte?: Date; lte?: Date } } => {
  const now = new Date();

  switch (period) {
    case "this_month": {
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        current: { gte: currentStart, lte: now },
        previous: { gte: previousStart, lte: previousEnd },
      };
    }
    case "last_month": {
      const currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return {
        current: { gte: currentStart, lte: currentEnd },
        previous: { gte: previousStart, lte: previousEnd },
      };
    }
    case "3_months": {
      const currentStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const previousEnd = new Date(currentStart.getTime() - 1);
      return {
        current: { gte: currentStart, lte: now },
        previous: { gte: previousStart, lte: previousEnd },
      };
    }
    case "6_months": {
      const currentStart = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
      const previousEnd = new Date(currentStart.getTime() - 1);
      return {
        current: { gte: currentStart, lte: now },
        previous: { gte: previousStart, lte: previousEnd },
      };
    }
    case "all_time":
    default:
      return { current: {}, previous: {} };
  }
};

const calcPercentChange = (current: number, previous: number): number => {
  if (previous === 0 && current > 0) return 100;
  if (previous === 0 && current === 0) return 0;
  if (previous > 0 && current === 0) return -100;
  return Math.round(((current - previous) / previous) * 100);
};

export const getCommissionSummary = async (
  period: string,
  partnerId?: number,
) => {
  const { current, previous } = getDateRange(period);

  // Base where clause for settlements
  const baseWhere: any = { is_active: true, is_deleted: false };
  if (partnerId) baseWhere.b2b_partner_id = partnerId;

  // Settlement date filter for current and previous period
  const currentSettlementWhere: any = { ...baseWhere };
  const previousSettlementWhere: any = { ...baseWhere };
  if (current.gte) currentSettlementWhere.created_at = { gte: current.gte, lte: current.lte };
  if (previous.gte) previousSettlementWhere.created_at = { gte: previous.gte, lte: previous.lte };

  // Payment date filter for settled amount
  const currentPaymentWhere: any = {
    payment_status: { in: ["Completed", "Settled", "Paid"] },
    settlement: { ...baseWhere },
  };
  const previousPaymentWhere: any = {
    payment_status: { in: ["Completed", "Settled", "Paid"] },
    settlement: { ...baseWhere },
  };
  if (current.gte) currentPaymentWhere.payment_completion_date = { gte: current.gte, lte: current.lte };
  if (previous.gte) previousPaymentWhere.payment_completion_date = { gte: previous.gte, lte: previous.lte };

  const [
    // Current period
    currentTotalEarnings,
    currentPendingPayout,
    currentSettledPayments,
    currentTranchesCount,
    currentStatusBreakdown,
    currentInvoicePending,
    currentTotalCount,
    // Previous period (for % change)
    previousTotalEarnings,
    previousPendingPayout,
    previousSettledPayments,
    previousTranchesCount,
  ] = await Promise.all([
    // 1. Total Earnings — SUM of net_payable_amount for settlements created in period
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: { settlement: currentSettlementWhere },
      _sum: { net_payable_amount: true },
    }),

    // 2. Pending Payout — SUM where settlement is NOT yet paid/settled
    //    Only exclude: Settled, Paid (actually paid out) — everything else is still pending
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: {
        settlement: {
          ...currentSettlementWhere,
          status_history: {
            settlement_status: {
              notIn: ["Settled", "Paid"],
            },
          },
        },
      },
      _sum: { net_payable_amount: true },
    }),

    // 3. Settled — SUM where payment was actually completed in period
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: {
        settlement: {
          ...baseWhere,
          payment_details: {
            payment_status: { in: ["Completed", "Settled", "Paid"] },
            ...(current.gte ? { payment_completion_date: { gte: current.gte, lte: current.lte } } : {}),
          },
        },
      },
      _sum: { net_payable_amount: true },
    }),

    // 4. Tranches — total commission settlements count in current period
    prisma.hSCommissionSettlements.count({ where: currentSettlementWhere }),

    // 5. Status breakdown — groupBy on current status for settlements in period
    prisma.hSCommissionSettlementsSettlementStatus.groupBy({
      by: ["settlement_status"],
      where: { settlement: currentSettlementWhere },
      _count: { settlement_status: true },
    }),

    // 6. Invoice pending — settlements in period where status is Verified but no invoice
    prisma.hSCommissionSettlements.count({
      where: {
        ...currentSettlementWhere,
        status_history: {
          settlement_status: { in: ["Verified", "Calculated"] },
        },
        OR: [
          { documentation: null },
          { documentation: { invoice_url: null } },
          { documentation: { invoice_url: "" } },
          { documentation: { invoice_status: { in: ["Pending", "Not Received"] } } },
        ],
      },
    }),

    // 7. Total settlements count in period
    prisma.hSCommissionSettlements.count({ where: currentSettlementWhere }),

    // --- Previous period for % change ---
    // 8. Previous total earnings
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: { settlement: previousSettlementWhere },
      _sum: { net_payable_amount: true },
    }),

    // 9. Previous pending payout
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: {
        settlement: {
          ...previousSettlementWhere,
          status_history: {
            settlement_status: {
              notIn: ["Settled", "Paid"],
            },
          },
        },
      },
      _sum: { net_payable_amount: true },
    }),

    // 10. Previous settled
    prisma.hSCommissionSettlementsTaxAndDeductions.aggregate({
      where: {
        settlement: {
          ...baseWhere,
          payment_details: {
            payment_status: { in: ["Completed", "Settled", "Paid"] },
            ...(previous.gte ? { payment_completion_date: { gte: previous.gte, lte: previous.lte } } : {}),
          },
        },
      },
      _sum: { net_payable_amount: true },
    }),

    // 11. Previous tranches count
    prisma.hSCommissionSettlements.count({ where: previousSettlementWhere }),
  ]);

  // Build status breakdown object
  const statusBreakdown: Record<string, number> = {};
  for (const row of currentStatusBreakdown) {
    if (row.settlement_status) {
      statusBreakdown[row.settlement_status] = row._count.settlement_status;
    }
  }

  const curEarnings = Number(currentTotalEarnings._sum.net_payable_amount || 0);
  const prevEarnings = Number(previousTotalEarnings._sum.net_payable_amount || 0);
  const curPending = Number(currentPendingPayout._sum.net_payable_amount || 0);
  const prevPending = Number(previousPendingPayout._sum.net_payable_amount || 0);
  const curSettled = Number(currentSettledPayments._sum.net_payable_amount || 0);
  const prevSettled = Number(previousSettledPayments._sum.net_payable_amount || 0);

  return {
    period,
    total_earnings: {
      amount: curEarnings,
      change_percent: calcPercentChange(curEarnings, prevEarnings),
    },
    pending_payout: {
      amount: curPending,
      change_percent: calcPercentChange(curPending, prevPending),
    },
    settled: {
      amount: curSettled,
      change_percent: calcPercentChange(curSettled, prevSettled),
    },
    tranches: {
      count: currentTranchesCount,
      change_percent: calcPercentChange(currentTranchesCount, previousTranchesCount),
    },
    status_breakdown: statusBreakdown,
    invoices_pending_upload: currentInvoicePending,
    total_settlements: currentTotalCount,
  };
};

export const fetchCommissionSettlementsByLead = async (leadId: number) => {
  const where: Prisma.HSCommissionSettlementsWhereInput = {
    is_active: true,
    is_deleted: false,
    lead_reference_id: leadId,
  };

  const orderBy: Prisma.HSCommissionSettlementsOrderByWithRelationInput = {
    created_at: "desc",
  };

  const [rows, count] = await Promise.all([
    prisma.hSCommissionSettlements.findMany({
      where,
      orderBy,
      include: {
        calculation_details: true,
        communication: true,
        tax_deductions: true,
        documentation: true,
        hold_dispute: true,
        loan_details: true,
        payment_details: true,
        performance_metrics: true,
        reconciliation: true,
        status_history: true,
        system_tracking: true,
        transaction: true,
      },
    }),
    prisma.hSCommissionSettlements.count({ where }),
  ]);

  return { rows, count };
};