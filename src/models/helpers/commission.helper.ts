import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export const updateCommissionSettlement = async (
  tx: any,
  settlementId: number,
  mainData: any
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
  statusData: any
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
  userId: number
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
      last_modified_by: userId.toString(),
      last_modified_date: new Date(),
      updated_at: new Date(),
    },
  });

  return systemTracking;
};

export const updateCommissionSettlementTransactionDetails = async (
  tx: any,
  settlementId: number,
  transactionData: any
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
    }
  );

  return transaction;
};

export const updateCommissionSettlementCalculation = async (
  tx: any,
  settlementId: number,
  calculationData: any
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
  communicationData: any
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
  loanData: any
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
  paymentData: any
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
  taxData: any
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
  documentData: any
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
  holdData: any
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
  reconciliationData: any
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
    }
  );

  return reconciliation;
};

export const updateCommissionSettlementPerformanceAnalytics = async (
  tx: any,
  settlementId: number,
  performanceData: any
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
      documentaion: true,
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
  search: string | null
) => {
  const where: Prisma.HSCommissionSettlementsWhereInput = {
    is_active: true,
    OR: search
      ? [
          { lead_reference_id: { contains: search, mode: "insensitive" } },
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
        documentaion: true,
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

export const checkCommissionSettlementFields = async (
  lead_reference_id?: string,
  student_id?: string,
  settlement_reference_number?: string,
  hs_object_id?: string,
  partner_id?: number,
  settlement_month?: string,
  settlement_year?: number
) => {
  const conditions: any[] = [];

  if (lead_reference_id) conditions.push({ lead_reference_id });
  if (student_id) conditions.push({ student_id });
  if (settlement_reference_number)
    conditions.push({ settlement_reference_number });
  if (hs_object_id) conditions.push({ hs_object_id });

  if (partner_id && student_id && settlement_month && settlement_year) {
    conditions.push({
      AND: [
        { partner_id },
        { student_id },
        { settlement_month },
        { settlement_year },
      ],
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = await prisma.hSCommissionSettlements.findFirst({
    where: {
      OR: conditions,
      is_deleted: false,
    },
    select: {
      id: true,
      lead_reference_id: true,
      student_id: true,
      settlement_reference_number: true,
      hs_object_id: true,
      partner_id: true,
      partner_name: true,
      student_name: true,
      settlement_month: true,
      settlement_year: true,
    },
  });

  return result;
};
