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
  systemTrackingData: any
) => {
  const systemTracking = await tx.hSLoanProductsSystemTracking.create({
    data: {
      product_id: productId,
      ...systemTrackingData,
    },
  });

  return systemTracking;
};

export const createLoanProductCompetitiveAnalytics = async (
  tx: any,
  productId: number,
  competitiveData: any
) => {
  const competitive = await tx.hSLoanProductsCompetitiveAnalytics.create({
    data: {
      product_id: productId,
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
  const criteria = await tx.hSLoanProductsEligibilityCriteria.create({
    data: {
      product_id: productId,
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
  const collateral = await tx.hSLoanProductsCollateralAndSecurity.create({
    data: {
      product_id: productId,
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
  const repayment = await tx.hSLoanProductsRepaymentTerms.create({
    data: {
      product_id: productId,
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
  const processing = await tx.hSLoanProductsApplicationAndProcessing.create({
    data: {
      product_id: productId,
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
  const geographic = await tx.hSLoanProductsGeographicCoverage.create({
    data: {
      product_id: productId,
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
  const features = await tx.hSLoanProductsSpecialFeatures.create({
    data: {
      product_id: productId,
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
  const metrics = await tx.hSLoanProductsPerformanceMetrics.create({
    data: {
      product_id: productId,
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
  const integration = await tx.hSLoanProductsSystemIntegration.create({
    data: {
      product_id: productId,
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
  const financial = await tx.hSLoanProductsFinancialTerms.create({
    data: {
      product_id: productId,
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
  systemTrackingData: any
) => {
  if (!systemTrackingData || Object.keys(systemTrackingData).length === 0) {
    return null;
  }

  const systemTracking = await tx.hSLoanProductsSystemTracking.update({
    where: {
      product_id: productId,
    },
    data: {
      ...systemTrackingData,
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
      product_id: productId,
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
      product_id: criteriaId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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
      product_id: productId,
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

// export const fetchLoanProductsList = async (
//   limit: number,
//   offset: number,
//   sortKey: string | null,
//   sortDir: "asc" | "desc" | null,
//   search: string | null,
//   filters: {
//     lender_name: string | null;
//     product_type: string | null;
//     product_category: string | null;
//     product_status: string | null;
//     partner_name: string | null;
//   }
// ) => {
//   const where: Prisma.HSLoanProductsWhereInput = {
//     is_active: true,
//   };

//   // Add search filter
//   if (search) {
//     where.OR = [
//       { lender_name: { contains: search, mode: "insensitive" } },
//       { partner_name: { contains: search, mode: "insensitive" } },
//       { product_display_name: { contains: search, mode: "insensitive" } },
//       { product_description: { contains: search, mode: "insensitive" } },
//     ];
//   }

//   // Apply filters
//   if (filters.lender_name) {
//     where.lender_name = filters.lender_name;
//   }

//   if (filters.product_type) {
//     where.product_type = filters.product_type;
//   }

//   if (filters.product_category) {
//     where.product_category = filters.product_category;
//   }

//   if (filters.product_status) {
//     where.product_status = filters.product_status;
//   }

//   if (filters.partner_name) {
//     where.partner_name = filters.partner_name;
//   }

//   let orderBy: any = { created_at: "desc" };
//   if (sortKey) {
//     switch (sortKey) {
//       case "lender_name":
//         orderBy = { lender_name: sortDir || "asc" };
//         break;
//       case "product_type":
//         orderBy = { product_type: sortDir || "asc" };
//         break;
//       case "product_category":
//         orderBy = { product_category: sortDir || "asc" };
//         break;
//       case "product_status":
//         orderBy = { product_status: sortDir || "asc" };
//         break;
//       case "partner_name":
//         orderBy = { partner_name: sortDir || "asc" };
//         break;
//       case "created_at":
//         orderBy = { created_at: sortDir || "desc" };
//         break;
//       default:
//         orderBy = { created_at: "desc" };
//     }
//   }

//   const [rows, count] = await Promise.all([
//     prisma.hSLoanProducts.findMany({
//       where,
//       skip: offset,
//       take: limit,
//       orderBy,
//       include: {
//         eligibility_criteria: true,
//         financial_terms: true,
//         collateral_security: true,
//         repayment_terms: true,
//         processing_details: true,
//         geographic_coverage: true,
//         special_features: true,
//         performance_metrics: true,
//         system_integration: true,
//         loan_product_competitive_analysis: true,
//         system_tracking: true,
//       },
//     }),
//     prisma.hSLoanProducts.count({ where }),
//   ]);

//   return { rows, count };
// };

interface LoanProductFilters {
  // Existing filters
  lender_name?: string | null;
  product_type?: string | null;
  product_category?: string | null;
  product_status?: string | null;
  partner_name?: string | null;

  // Financial filters
  interest_rate_min?: number | null;
  interest_rate_max?: number | null;
  loan_amount_min?: number | null;
  loan_amount_max?: number | null;
  processing_fee_max?: number | null;

  // Eligibility filters
  study_level?: string | null;
  target_segment?: string | null;
  minimum_age?: number | null;
  maximum_age?: number | null;
  nationality_restrictions?: string | null;

  // Geographic filters
  supported_course_types?: string | null;
  restricted_countries?: string | null;
  course_duration_min?: number | null;
  course_duration_max?: number | null;

  // Intake period filters
  intake_month?: string | null;
  intake_year?: number | null;

  // Application filters
  school_name?: string | null;
  program_name?: string | null;

  // Additional financial filters
  total_tuition_fee?: number | null;
  cost_of_living?: number | null;

  // Collateral filters
  collateral_required?: string | null;
  guarantor_required?: string | null;

  // Repayment filters
  repayment_period_min?: number | null;
  repayment_period_max?: number | null;
  moratorium_available?: boolean | null;

  // Special features
  tax_benefits_available?: string | null;
  digital_features?: string | null;
}

export const fetchLoanProductsList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  filters: LoanProductFilters
) => {
  const where: Prisma.HSLoanProductsWhereInput = {
    is_active: true,
    is_deleted: false,
  };

  // Add search filter
  if (search) {
    where.OR = [
      { lender_name: { contains: search, mode: "insensitive" } },
      { partner_name: { contains: search, mode: "insensitive" } },
      { product_display_name: { contains: search, mode: "insensitive" } },
      { product_description: { contains: search, mode: "insensitive" } },
      { product_name: { contains: search, mode: "insensitive" } },
    ];
  }

  // Apply basic filters
  if (filters.lender_name) {
    where.lender_name = { contains: filters.lender_name, mode: "insensitive" };
  }

  if (filters.product_type) {
    where.product_type = filters.product_type;
  }

  if (filters.product_category) {
    where.product_category = filters.product_category;
  }

  if (filters.product_status) {
    where.product_status = filters.product_status;
  }

  if (filters.partner_name) {
    where.partner_name = {
      contains: filters.partner_name,
      mode: "insensitive",
    };
  }

  // Financial terms filters
  if (
    filters.interest_rate_min !== null ||
    filters.interest_rate_max !== null ||
    filters.loan_amount_min !== null ||
    filters.loan_amount_max !== null ||
    filters.processing_fee_max !== null
  ) {
    where.financial_terms = {};

    if (filters.interest_rate_min !== null) {
      where.financial_terms.interest_rate_range_min = {
        gte: filters.interest_rate_min,
      };
    }

    if (filters.interest_rate_max !== null) {
      where.financial_terms.interest_rate_range_max = {
        lte: filters.interest_rate_max,
      };
    }

    // ✅ FIXED LOAN AMOUNT LOGIC
    if (filters.loan_amount_min !== null && filters.loan_amount_max !== null) {
      // Both min and max provided
      where.financial_terms.AND = [
        {
          OR: [
            { maximum_loan_amount_secured: { gte: filters.loan_amount_min } },
            { maximum_loan_amount_unsecured: { gte: filters.loan_amount_min } },
          ],
        },
        {
          OR: [
            { maximum_loan_amount_secured: { lte: filters.loan_amount_max } },
            { maximum_loan_amount_unsecured: { lte: filters.loan_amount_max } },
          ],
        },
      ];
    } else if (filters.loan_amount_min !== null) {
      // Only min provided
      where.financial_terms.OR = [
        { maximum_loan_amount_secured: { gte: filters.loan_amount_min } },
        { maximum_loan_amount_unsecured: { gte: filters.loan_amount_min } },
      ];
    } else if (filters.loan_amount_max !== null) {
      // Only max provided - THIS WAS THE BUG!
      where.financial_terms.OR = [
        { maximum_loan_amount_secured: { lte: filters.loan_amount_max } },
        { maximum_loan_amount_unsecured: { lte: filters.loan_amount_max } },
      ];
    }

    if (filters.processing_fee_max !== null) {
      where.financial_terms.processing_fee_percentage = {
        lte: filters.processing_fee_max,
      };
    }
  }

  // Eligibility criteria filters
  if (
    filters.study_level ||
    filters.target_segment ||
    filters.minimum_age !== null ||
    filters.maximum_age !== null ||
    filters.nationality_restrictions
  ) {
    where.eligibility_criteria = {};

    // ✅ Map study_level to target_segment
    if (filters.study_level) {
      where.eligibility_criteria.target_segment = {
        contains: filters.study_level,
        mode: "insensitive",
      };
    }

    // Also handle direct target_segment filter
    if (filters.target_segment) {
      where.eligibility_criteria.target_segment = {
        contains: filters.target_segment,
        mode: "insensitive",
      };
    }

    if (filters.minimum_age !== null) {
      where.eligibility_criteria.minimum_age = {
        lte: filters.minimum_age,
      };
    }

    if (filters.maximum_age !== null) {
      where.eligibility_criteria.maximum_age = {
        gte: filters.maximum_age,
      };
    }

    if (filters.nationality_restrictions) {
      where.eligibility_criteria.nationality_restrictions = {
        contains: filters.nationality_restrictions,
        mode: "insensitive",
      };
    }
  }
  // Geographic coverage filters
  if (
    filters.supported_course_types ||
    filters.restricted_countries ||
    filters.course_duration_min !== null ||
    filters.course_duration_max !== null ||
    filters.school_name ||
    filters.program_name
  ) {
    where.geographic_coverage = {};

    if (filters.supported_course_types) {
      where.geographic_coverage.supported_course_types = {
        contains: filters.supported_course_types,
        mode: "insensitive",
      };
    }

    if (filters.restricted_countries) {
      // Check if the country is NOT in the restricted list
      where.geographic_coverage.OR = [
        {
          restricted_countries: {
            not: {
              contains: filters.restricted_countries,
            },
          },
        },
        {
          restricted_countries: null,
        },
      ];
    }

    if (filters.course_duration_min !== null) {
      where.geographic_coverage.course_duration_minimum = {
        lte: filters.course_duration_min,
      };
    }

    if (filters.course_duration_max !== null) {
      where.geographic_coverage.course_duration_maximum = {
        gte: filters.course_duration_max,
      };
    }

    if (filters.school_name) {
      // Check if school is NOT in the not_supported list
      where.geographic_coverage.OR = [
        {
          not_supported_universities: {
            not: {
              contains: filters.school_name,
            },
          },
        },
        {
          not_supported_universities: null,
        },
      ];
    }

    if (filters.program_name) {
      // Check if program is NOT in the restricted list
      where.geographic_coverage.OR = [
        {
          course_restrictions: {
            not: {
              contains: filters.program_name,
            },
          },
        },
        {
          course_restrictions: null,
        },
      ];
    }
  }

  // Collateral and security filters
  if (filters.collateral_required || filters.guarantor_required) {
    where.collateral_security = {};

    if (filters.collateral_required) {
      where.collateral_security.collateral_required =
        filters.collateral_required;
    }

    if (filters.guarantor_required) {
      where.collateral_security.guarantor_required = filters.guarantor_required;
    }
  }

  // Repayment terms filters
  if (
    filters.repayment_period_min !== null ||
    filters.repayment_period_max !== null ||
    filters.moratorium_available !== null
  ) {
    where.repayment_terms = {};

    if (filters.repayment_period_min !== null) {
      where.repayment_terms.repayment_period_minimum = {
        gte: filters.repayment_period_min,
      };
    }

    if (filters.repayment_period_max !== null) {
      where.repayment_terms.repayment_period_maximum = {
        lte: filters.repayment_period_max,
      };
    }

    if (filters.moratorium_available !== null && filters.moratorium_available) {
      where.repayment_terms.moratorium_period = {
        gt: 0,
      };
    }
  }

  // Special features filters
  if (filters.tax_benefits_available || filters.digital_features) {
    where.special_features = {};

    if (filters.tax_benefits_available) {
      where.special_features.tax_benefits_available = {
        contains: filters.tax_benefits_available,
        mode: "insensitive",
      };
    }

    if (filters.digital_features) {
      where.special_features.digital_features = {
        contains: filters.digital_features,
        mode: "insensitive",
      };
    }
  }

  // Determine sorting
  let orderBy: any = { created_at: "desc" };

  if (sortKey) {
    switch (sortKey) {
      case "interest_rate":
        orderBy = {
          financial_terms: {
            interest_rate_range_min: sortDir || "asc",
          },
        };
        break;
      case "max_loan_amount":
        orderBy = {
          financial_terms: {
            maximum_loan_amount_unsecured: sortDir || "desc",
          },
        };
        break;
      case "processing_fee":
        orderBy = {
          financial_terms: {
            processing_fee_percentage: sortDir || "asc",
          },
        };
        break;
      case "rating":
        orderBy = {
          performance_metrics: {
            customer_satisfaction_rating: sortDir || "desc",
          },
        };
        break;
      case "lender_name":
        orderBy = { lender_name: sortDir || "asc" };
        break;
      case "product_name":
        orderBy = { product_display_name: sortDir || "asc" };
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
      case "partner_name":
        orderBy = { partner_name: sortDir || "asc" };
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
        lender: {
          select: {
            id: true,
            lender_name: true,
            lender_type: true,
          },
        },
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
      is_active: true,
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
