import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export const createLoanProduct = async (tx: any, mainData: any) => {
  const product = await tx.hSLoanProducts.create({
    data: {
      ...mainData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return product;
};

export const createLoanProductSystemTracking = async (
  tx: any,
  productId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSLoanProductsSystemTracking.create({
    data: {
      loan_product_id: productId,
      change_log: systemTrackingData.change_log,
      created_by: systemTrackingData.created_by || userId.toString(),
      created_date: systemTrackingData.created_date || new Date(),
      last_modified_by:
        systemTrackingData.last_modified_by || userId.toString(),
      last_modified_date: systemTrackingData.last_modified_date || new Date(),
      next_review_date: systemTrackingData.next_review_date,
      notes: systemTrackingData.notes,
      product_record_status: systemTrackingData.product_record_status,
      review_frequency: systemTrackingData.review_frequency,
      version_number: systemTrackingData.version_number,
    },
  });

  return systemTracking;
};

export const createLoanProductCompetitiveAnalytics = async (
  tx: any,
  productId: number,
  competitiveData: any
) => {
  if (!competitiveData || Object.keys(competitiveData).length === 0) {
    return null;
  }

  const competitive = await tx.hSLoanProductsCompetitiveAnalytics.create({
    data: {
      loan_product_id: productId,
      ...competitiveData,
    },
  });

  return competitive;
};

export const createLoanProductEligibilityCriteria = async (
  tx: any,
  productId: number,
  criteriaData: any
) => {
  if (!criteriaData || Object.keys(criteriaData).length === 0) {
    return null;
  }

  // If it's a single criteria object
  const criteria = await tx.hSLoanProductsEligibilityCriteria.create({
    data: {
      loan_product_id: productId,
      ...criteriaData,
    },
  });

  return criteria;
};

export const createLoanProductCollateralSecurity = async (
  tx: any,
  productId: number,
  collateralData: any
) => {
  if (!collateralData || Object.keys(collateralData).length === 0) {
    return null;
  }

  const collateral = await tx.hSLoanProductsCollateralAndSecurity.create({
    data: {
      loan_product_id: productId,
      ...collateralData,
    },
  });

  return collateral;
};

export const createLoanProductRepaymentTerms = async (
  tx: any,
  productId: number,
  repaymentData: any
) => {
  if (!repaymentData || Object.keys(repaymentData).length === 0) {
    return null;
  }

  const repayment = await tx.hSLoanProductsRepaymentTerms.create({
    data: {
      loan_product_id: productId,
      ...repaymentData,
    },
  });

  return repayment;
};

export const createLoanProductApplicationProcessing = async (
  tx: any,
  productId: number,
  processingData: any
) => {
  if (!processingData || Object.keys(processingData).length === 0) {
    return null;
  }

  const processing = await tx.hSLoanProductsApplicationAndProcessing.create({
    data: {
      loan_product_id: productId,
      ...processingData,
    },
  });

  return processing;
};

export const createLoanProductGeographicCoverage = async (
  tx: any,
  productId: number,
  geographicData: any
) => {
  if (!geographicData || Object.keys(geographicData).length === 0) {
    return null;
  }

  const geographic = await tx.hSLoanProductsGeographicCoverage.create({
    data: {
      loan_product_id: productId,
      ...geographicData,
    },
  });

  return geographic;
};

export const createLoanProductSpecialFeatures = async (
  tx: any,
  productId: number,
  featuresData: any
) => {
  if (!featuresData || Object.keys(featuresData).length === 0) {
    return null;
  }

  const features = await tx.hSLoanProductsSpecialFeatures.create({
    data: {
      loan_product_id: productId,
      ...featuresData,
    },
  });

  return features;
};

export const createLoanProductPerformanceMetrics = async (
  tx: any,
  productId: number,
  metricsData: any
) => {
  if (!metricsData || Object.keys(metricsData).length === 0) {
    return null;
  }

  const metrics = await tx.hSLoanProductsPerformanceMetrics.create({
    data: {
      loan_product_id: productId,
      ...metricsData,
    },
  });

  return metrics;
};

export const createLoanProductSystemIntegration = async (
  tx: any,
  productId: number,
  integrationData: any
) => {
  if (!integrationData || Object.keys(integrationData).length === 0) {
    return null;
  }

  const integration = await tx.hSLoanProductsSystemIntegration.create({
    data: {
      loan_product_id: productId,
      ...integrationData,
    },
  });

  return integration;
};

export const createLoanProductFinancialTerms = async (
  tx: any,
  productId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financial = await tx.hSLoanProductsFinancialTerms.create({
    data: {
      loan_product_id: productId,
      ...financialData,
    },
  });

  return financial;
};

export const updateLoanProduct = async (
  tx: any,
  productId: number,
  mainData: any
) => {
  const product = await tx.hSLoanProducts.update({
    where: {
      id: productId,
    },
    data: {
      ...mainData,
      updated_at: new Date(),
    },
  });

  return product;
};

export const updateLoanProductSystemTracking = async (
  tx: any,
  productId: number,
  systemTrackingData: any,
  userId: number
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSLoanProductsSystemTracking.update({
    where: {
      loan_product_id: productId,
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

export const updateLoanProductCompetitiveAnalytics = async (
  tx: any,
  productId: number,
  competitiveData: any
) => {
  if (!competitiveData || Object.keys(competitiveData).length === 0) {
    return null;
  }

  const competitive = await tx.hSLoanProductsCompetitiveAnalytics.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...competitiveData,
      updated_at: new Date(),
    },
  });

  return competitive;
};

export const updateLoanProductEligibilityCriteria = async (
  tx: any,
  criteriaId: number,
  criteriaData: any
) => {
  if (!criteriaData || Object.keys(criteriaData).length === 0) {
    return null;
  }

  const criteria = await tx.hSLoanProductsEligibilityCriteria.update({
    where: {
      loan_product_id: criteriaId,
    },
    data: {
      ...criteriaData,
      updated_at: new Date(),
    },
  });

  return criteria;
};

export const updateLoanProductCollateralSecurity = async (
  tx: any,
  productId: number,
  collateralData: any
) => {
  if (!collateralData || Object.keys(collateralData).length === 0) {
    return null;
  }

  const collateral = await tx.hSLoanProductsCollateralAndSecurity.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...collateralData,
      updated_at: new Date(),
    },
  });

  return collateral;
};

export const updateLoanProductRepaymentTerms = async (
  tx: any,
  productId: number,
  repaymentData: any
) => {
  if (!repaymentData || Object.keys(repaymentData).length === 0) {
    return null;
  }

  const repayment = await tx.hSLoanProductsRepaymentTerms.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...repaymentData,
      updated_at: new Date(),
    },
  });

  return repayment;
};

export const updateLoanProductApplicationProcessing = async (
  tx: any,
  productId: number,
  processingData: any
) => {
  if (!processingData || Object.keys(processingData).length === 0) {
    return null;
  }

  const processing = await tx.hSLoanProductsApplicationAndProcessing.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...processingData,
      updated_at: new Date(),
    },
  });

  return processing;
};

export const updateLoanProductGeographicCoverage = async (
  tx: any,
  productId: number,
  geographicData: any
) => {
  if (!geographicData || Object.keys(geographicData).length === 0) {
    return null;
  }

  const geographic = await tx.hSLoanProductsGeographicCoverage.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...geographicData,
      updated_at: new Date(),
    },
  });

  return geographic;
};

export const updateLoanProductSpecialFeatures = async (
  tx: any,
  productId: number,
  featuresData: any
) => {
  if (!featuresData || Object.keys(featuresData).length === 0) {
    return null;
  }

  const features = await tx.hSLoanProductsSpecialFeatures.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...featuresData,
      updated_at: new Date(),
    },
  });

  return features;
};

export const updateLoanProductPerformanceMetrics = async (
  tx: any,
  productId: number,
  metricsData: any
) => {
  if (!metricsData || Object.keys(metricsData).length === 0) {
    return null;
  }

  const metrics = await tx.hSLoanProductsPerformanceMetrics.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...metricsData,
      updated_at: new Date(),
    },
  });

  return metrics;
};

export const updateLoanProductSystemIntegration = async (
  tx: any,
  productId: number,
  integrationData: any
) => {
  if (!integrationData || Object.keys(integrationData).length === 0) {
    return null;
  }

  const integration = await tx.hSLoanProductsSystemIntegration.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...integrationData,
      updated_at: new Date(),
    },
  });

  return integration;
};

export const updateLoanProductFinancialTerms = async (
  tx: any,
  productId: number,
  financialData: any
) => {
  if (!financialData || Object.keys(financialData).length === 0) {
    return null;
  }

  const financial = await tx.hSLoanProductsFinancialTerms.update({
    where: {
      loan_product_id: productId,
    },
    data: {
      ...financialData,
      updated_at: new Date(),
    },
  });

  return financial;
};

export const deleteLoanProduct = async (productId: number) => {
  const product = await prisma.hSLoanProducts.update({
    where: {
      id: productId,
      is_active: true,
    },
    data: {
      is_active: false,
      updated_at: new Date(),
    },
  });

  if (!product) {
    throw new Error("Loan product not found or already deleted");
  }

  return product;
};

export const getLoanProduct = async (productId: number) => {
  const product = await prisma.hSLoanProducts.findUnique({
    where: {
      id: productId,
      is_active: true,
    },
    include: {
      eligibility_criteria: true,
      financial_terms: true,
      collateral_security: true,
      repayment_terms: true,
      processing_details: true,
      geographic_coverage: true,
      special_features: true,
      performance_metrics: true,
      system_integration: true,
      loan_product_competitive_analysis: true,
      system_tracking: true,
    },
  });

  if (!product) {
    throw new Error("Loan product not found");
  }

  return product;
};

export const fetchLoanProductsList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
) => {
  const where: Prisma.HSLoanProductsWhereInput = {
    is_active: true,
    OR: search
      ? [
          { lender_name: { contains: search, mode: "insensitive" } },
          { partner_name: { contains: search, mode: "insensitive" } },
          { product_display_name: { contains: search, mode: "insensitive" } },
          { product_description: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  let orderBy: any = { created_at: "desc" };
  if (sortKey) {
    switch (sortKey) {
      case "lender_name":
        orderBy = { lender_name: sortDir || "asc" };
        break;
      case "product_type":
        orderBy = { product_type: sortDir || "asc" };
        break;
      case "product_category":
        orderBy = { product_category: sortDir || "asc" };
        break;
      case "product_status":
        orderBy = { product_status: sortDir || "asc" };
        break;
      case "created_at":
        orderBy = { created_at: sortDir || "desc" };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const [rows, count] = await Promise.all([
    prisma.hSLoanProducts.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        eligibility_criteria: true,
        financial_terms: true,
        collateral_security: true,
        repayment_terms: true,
        processing_details: true,
        geographic_coverage: true,
        special_features: true,
        performance_metrics: true,
        system_integration: true,
        loan_product_competitive_analysis: true,
        system_tracking: true,
      },
    }),
    prisma.hSLoanProducts.count({ where }),
  ]);

  return { rows, count };
};

export const checkLoanProductFields = async (
  lender_id?: number,
  product_display_name?: string,
  hs_object_id?: string
) => {
  const conditions: any[] = [];

  if (lender_id && product_display_name) {
    conditions.push({
      AND: [{ lender_id }, { product_display_name }],
    });
  }

  if (hs_object_id) {
    conditions.push({ hs_object_id });
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = await prisma.hSLoanProducts.findFirst({
    where: {
      OR: conditions,
      is_deleted: false,
    },
    select: {
      id: true,
      lender_id: true,
      lender_name: true,
      product_display_name: true,
      hs_object_id: true,
    },
  });

  return result;
};

export const getLoanProductsByLender = async (lenderId: number) => {
  if (!lenderId) return [];

  const loanProducts = await prisma.hSLoanProducts.findMany({
    where: {
      lender_id: lenderId,
      is_deleted: false,
    },
    include: {
      eligibility_criteria: true,
      financial_terms: true,
      collateral_security: true,
      repayment_terms: true,
      processing_details: true,
      geographic_coverage: true,
      special_features: true,
      performance_metrics: true,
      system_integration: true,
      loan_product_competitive_analysis: true,
      system_tracking: true,
      lender: true, // optional: includes basic lender info if needed
    },
  });

  return loanProducts;
};
