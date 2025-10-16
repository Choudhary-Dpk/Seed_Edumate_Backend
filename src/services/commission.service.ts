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
  statusData: any
) => {
  if (!statusData || Object.keys(statusData).length === 0) {
    return null;
  }

  const status = await tx.hSCommissionSettlementsSettlementStatus.create({
    data: {
      settlement_id: settlementId,
      ...statusData,
    },
  });

  return status;
};

export const createCommissionSettlementSystemTracking = async (
  tx: any,
  settlementId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSCommissionSettlementsSystemTracking.create({
    data: {
      settlement_id: settlementId,
      created_by: systemTrackingData.created_by || userId.toString(),
      last_modified_by:
        systemTrackingData.last_modified_by || userId.toString(),
      ...systemTrackingData,
    },
  });

  return systemTracking;
};

export const createCommissionSettlementTransactionDetails = async (
  tx: any,
  settlementId: number,
  transactionData: any
) => {
  if (!transactionData || Object.keys(transactionData).length === 0) {
    return null;
  }

  const transaction = await tx.hSCommissionSettlementsTransactionDetails.create(
    {
      data: {
        settlement_id: settlementId,
        ...transactionData,
      },
    }
  );

  return transaction;
};

export const createCommissionSettlementCalculation = async (
  tx: any,
  settlementId: number,
  calculationData: any
) => {
  if (!calculationData || Object.keys(calculationData).length === 0) {
    return null;
  }

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
  communicationData: any
) => {
  if (!communicationData || Object.keys(communicationData).length === 0) {
    return null;
  }

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
  loanData: any
) => {
  if (!loanData || Object.keys(loanData).length === 0) {
    return null;
  }

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
  paymentData: any
) => {
  if (!paymentData || Object.keys(paymentData).length === 0) {
    return null;
  }

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
  taxData: any
) => {
  if (!taxData || Object.keys(taxData).length === 0) {
    return null;
  }

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
  documentData: any
) => {
  if (!documentData || Object.keys(documentData).length === 0) {
    return null;
  }

  const documentation = await tx.hSCommissionSettlementsDocumentation.create({
    data: {
      settlement_id: settlementId,
      ...documentData,
    },
  });

  return documentation;
};

export const createCommissionSettlementHoldDisputes = async (
  tx: any,
  settlementId: number,
  holdData: any
) => {
  if (!holdData || Object.keys(holdData).length === 0) {
    return null;
  }

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
  reconciliationData: any
) => {
  if (!reconciliationData || Object.keys(reconciliationData).length === 0) {
    return null;
  }

  const reconciliation = await tx.hSCommissionSettlementsReconciliations.create(
    {
      data: {
        settlement_id: settlementId,
        ...reconciliationData,
      },
    }
  );

  return reconciliation;
};

export const createCommissionSettlementPerformanceAnalytics = async (
  tx: any,
  settlementId: number,
  performanceData: any
) => {
  if (!performanceData || Object.keys(performanceData).length === 0) {
    return null;
  }

  const performance =
    await tx.hSCommissionSettlementsPerformanceAnalytics.create({
      data: {
        settlement_id: settlementId,
        ...performanceData,
      },
    });

  return performance;
};
