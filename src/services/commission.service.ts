export const createCommissionSettlement = async (tx: any, mainData: any) => {
  const settlement = await tx.hSCommissionSettlements.create({
    data: {
      ...mainData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return settlement;
};

export const createCommissionSettlementStatus = async (
  tx: any,
  settlementId: number,
  statusData: any,
) => {
  const status = await tx.hSCommissionSettlementsSettlementStatus.create({
    data: {
      settlement_id: settlementId,
      ...statusData,
      verification_status: statusData?.verification_status || "Pending",
      settlement_status: statusData?.settlement_status || "Calculated",
    },
  });

  return status;
};

export const createCommissionSettlementSystemTracking = async (
  tx: any,
  settlementId: number,
  systemTrackingData: any,
) => {
  const systemTracking = await tx.hSCommissionSettlementsSystemTracking.create({
    data: {
      settlement_id: settlementId,
      ...systemTrackingData,
    },
  });

  return systemTracking;
};

export const createCommissionSettlementTransactionDetails = async (
  tx: any,
  settlementId: number,
  transactionData: any,
) => {
  const transaction = await tx.hSCommissionSettlementsTransactionDetails.create(
    {
      data: {
        settlement_id: settlementId,
        ...transactionData,
      },
    },
  );

  return transaction;
};

export const createCommissionSettlementCalculation = async (
  tx: any,
  settlementId: number,
  calculationData: any,
) => {
  const calculation =
    await tx.hSCommissionSettlementsCommissionCalculation.create({
      data: {
        settlement_id: settlementId,
        ...calculationData,
      },
    });

  return calculation;
};

export const createCommissionSettlementCommunication = async (
  tx: any,
  settlementId: number,
  communicationData: any,
) => {
  const communication = await tx.hSCommissionSettlementsCommunication.create({
    data: {
      settlement_id: settlementId,
      ...communicationData,
    },
  });

  return communication;
};

export const createCommissionSettlementLoanDetails = async (
  tx: any,
  settlementId: number,
  loanData: any,
) => {
  const loanDetails = await tx.hSCommissionSettlementsLoanDetails.create({
    data: {
      settlement_id: settlementId,
      ...loanData,
    },
  });

  return loanDetails;
};

export const createCommissionSettlementPaymentProcessing = async (
  tx: any,
  settlementId: number,
  paymentData: any,
) => {
  const payment = await tx.hSCommissionSettlementsPaymentProcessing.create({
    data: {
      settlement_id: settlementId,
      ...paymentData,
    },
  });

  return payment;
};

export const createCommissionSettlementTaxDeductions = async (
  tx: any,
  settlementId: number,
  taxData: any,
) => {
  const tax = await tx.hSCommissionSettlementsTaxAndDeductions.create({
    data: {
      settlement_id: settlementId,
      ...taxData,
    },
  });

  return tax;
};

export const createCommissionSettlementDocumentation = async (
  tx: any,
  settlementId: number,
  documentData: any,
) => {
  const documentation = await tx.hSCommissionSettlementsDocumentation.create({
    data: {
      settlement_id: settlementId,
      ...documentData,
      invoice_status: documentData?.invoice_status || "Pending",
    },
  });

  return documentation;
};

export const createCommissionSettlementHoldDisputes = async (
  tx: any,
  settlementId: number,
  holdData: any,
) => {
  const hold = await tx.hSCommissionSettlementsHoldAndDisputes.create({
    data: {
      settlement_id: settlementId,
      ...holdData,
    },
  });

  return hold;
};

export const createCommissionSettlementReconciliation = async (
  tx: any,
  settlementId: number,
  reconciliationData: any,
) => {
  const reconciliation = await tx.hSCommissionSettlementsReconciliations.create(
    {
      data: {
        settlement_id: settlementId,
        ...reconciliationData,
      },
    },
  );

  return reconciliation;
};

export const createCommissionSettlementPerformanceAnalytics = async (
  tx: any,
  settlementId: number,
  performanceData: any,
) => {
  const performance =
    await tx.hSCommissionSettlementsPerformanceAnalytics.create({
      data: {
        settlement_id: settlementId,
        ...performanceData,
      },
    });

  return performance;
};
