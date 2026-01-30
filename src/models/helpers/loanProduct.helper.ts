import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { LoanProductFilters } from "../../types/loanProduct.types";
import logger from "../../utils/logger";

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
  competitiveData: any,
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
  criteriaData: any,
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
  collateralData: any,
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
  repaymentData: any,
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
  processingData: any,
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
  geographicData: any,
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
  featuresData: any,
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
  metricsData: any,
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
  integrationData: any,
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
  financialData: any,
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
  mainData: any,
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
  competitiveData: any,
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
  criteriaData: any,
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
  collateralData: any,
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
  repaymentData: any,
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
  processingData: any,
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
  geographicData: any,
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
  featuresData: any,
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
  metricsData: any,
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
  integrationData: any,
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
  financialData: any,
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

export const fetchLoanProductsList = async (
  limit: number,
  offset: number,
  sortKey: string | null,
  sortDir: "asc" | "desc" | null,
  search: string | null,
  filters: LoanProductFilters,
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

  if (Array.isArray(filters.ids) && filters.ids.length === 0) {
    return { rows: [], count: 0 };
  }

  if (filters.ids && filters.ids.length > 0) {
    where.id = {
      in: filters.ids,
    };
  }

  // Apply basic filters
  if (filters.lender_name) {
    where.lender_name = { contains: filters.lender_name, mode: "insensitive" };
  }

  if (filters.product_type) {
    where.product_type = { equals: filters.product_type, mode: "insensitive" };
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

  // Interest and loan amount
  if (
    filters.interest_rate !== null ||
    filters.interest_rate_max !== null ||
    filters.loan_amount_min !== null ||
    filters.loan_amount_max !== null
  ) {
    where.financial_terms = {};

    // Initialize AND array to collect all conditions
    const financialTermsConditions: any[] = [];

    // Interest Rate Filtering - Product Type Aware
    if (filters.interest_rate !== null && filters.interest_rate_max !== null) {
      // Both min and max specified
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        // Secured loans only - show products where ENTIRE range is within user's budget
        financialTermsConditions.push({
          interest_rate_range_min_secured: {
            gte: filters.interest_rate,
          },
        });
        financialTermsConditions.push({
          interest_rate_range_max_secured: {
            lte: filters.interest_rate_max,
          },
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        // Unsecured loans only
        financialTermsConditions.push({
          interest_rate_range_min_unsecured: {
            gte: filters.interest_rate,
          },
        });
        financialTermsConditions.push({
          interest_rate_range_max_unsecured: {
            lte: filters.interest_rate_max,
          },
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            {
              AND: [
                {
                  interest_rate_range_min_secured: {
                    gte: filters.interest_rate,
                  },
                },
                {
                  interest_rate_range_max_secured: {
                    lte: filters.interest_rate_max,
                  },
                },
              ],
            },
            {
              AND: [
                {
                  interest_rate_range_min_unsecured: {
                    gte: filters.interest_rate,
                  },
                },
                {
                  interest_rate_range_max_unsecured: {
                    lte: filters.interest_rate_max,
                  },
                },
              ],
            },
          ],
        });
      }
    } else if (filters.interest_rate !== null) {
      // Only min specified - products starting at or above this rate
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        financialTermsConditions.push({
          interest_rate_range_max_secured: {
            gte: filters.interest_rate,
          },
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        financialTermsConditions.push({
          interest_rate_range_max_unsecured: {
            gte: filters.interest_rate,
          },
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            {
              interest_rate_range_max_secured: {
                gte: filters.interest_rate,
              },
            },
            {
              interest_rate_range_max_unsecured: {
                gte: filters.interest_rate,
              },
            },
          ],
        });
      }
    } else if (filters.interest_rate_max !== null) {
      // Only max specified - products ending at or below this rate
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        financialTermsConditions.push({
          interest_rate_range_max_secured: {
            lte: filters.interest_rate_max,
          },
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        financialTermsConditions.push({
          interest_rate_range_max_unsecured: {
            lte: filters.interest_rate_max,
          },
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            {
              interest_rate_range_max_secured: {
                lte: filters.interest_rate_max,
              },
            },
            {
              interest_rate_range_max_unsecured: {
                lte: filters.interest_rate_max,
              },
            },
          ],
        });
      }
    }

    // Loan Amount Filtering - Product Type Aware
    if (filters.loan_amount_min !== null && filters.loan_amount_max !== null) {
      // Determine which loan amount fields to check based on product_type
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        // Secured loans only
        financialTermsConditions.push({
          maximum_loan_amount_secured: { gte: filters.loan_amount_min },
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_secured: null },
          ],
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        // Unsecured loans only
        financialTermsConditions.push({
          maximum_loan_amount_unsecured: { gte: filters.loan_amount_min },
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_unsecured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            { maximum_loan_amount_secured: { gte: filters.loan_amount_min } },
            { maximum_loan_amount_unsecured: { gte: filters.loan_amount_min } },
          ],
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_unsecured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_secured: null },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      }
    } else if (filters.loan_amount_min !== null) {
      // Only min specified
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        // Secured loans only
        financialTermsConditions.push({
          maximum_loan_amount_secured: { gte: filters.loan_amount_min },
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_secured: null },
          ],
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        // Unsecured loans only
        financialTermsConditions.push({
          maximum_loan_amount_unsecured: { gte: filters.loan_amount_min },
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_unsecured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            { maximum_loan_amount_secured: { gte: filters.loan_amount_min } },
            { maximum_loan_amount_unsecured: { gte: filters.loan_amount_min } },
          ],
        });
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_unsecured: { lte: filters.loan_amount_min } },
            { minimum_loan_amount_secured: null },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      }
    } else if (filters.loan_amount_max !== null) {
      // Only max specified
      if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("secured")
      ) {
        // Secured loans only
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_max } },
            { minimum_loan_amount_secured: null },
          ],
        });
      } else if (
        filters.product_type &&
        filters.product_type.toLowerCase().startsWith("unsecured")
      ) {
        // Unsecured loans only
        financialTermsConditions.push({
          OR: [
            {
              minimum_loan_amount_unsecured: { lte: filters.loan_amount_max },
            },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      } else {
        // No product type specified - check both
        financialTermsConditions.push({
          OR: [
            { minimum_loan_amount_secured: { lte: filters.loan_amount_max } },
            {
              minimum_loan_amount_unsecured: { lte: filters.loan_amount_max },
            },
            { minimum_loan_amount_secured: null },
            { minimum_loan_amount_unsecured: null },
          ],
        });
      }
    }

    // ✅ Apply all collected conditions
    if (financialTermsConditions.length > 0) {
      where.financial_terms.AND = financialTermsConditions;
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

    //  Map study_level to target_segment
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
    filters.program_name ||
    filters.supported_countries ||
    filters.supported_nationality
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

    if (filters.supported_countries) {
      where.geographic_coverage.supported_countries = {
        equals: filters.supported_countries,
        mode: "insensitive",
      };
    }

    if (filters.supported_nationality) {
      where.geographic_coverage.supported_nationality = {
        contains: filters.supported_nationality,
        mode: "insensitive",
      };
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
    filters.repayment_period_max !== null
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
        // Product type aware sorting for interest rates
        if (
          filters.product_type &&
          filters.product_type.toLowerCase().startsWith("secured")
        ) {
          // Secured loans - sort by secured interest rate
          orderBy = {
            financial_terms: {
              interest_rate_range_min_secured: sortDir || "asc",
            },
          };
        } else if (
          filters.product_type &&
          filters.product_type.toLowerCase().startsWith("unsecured")
        ) {
          // Unsecured loans - sort by unsecured interest rate
          orderBy = {
            financial_terms: {
              interest_rate_range_min_unsecured: sortDir || "asc",
            },
          };
        } else {
          // No product type specified - sort in post-fetch
          orderBy = { created_at: "desc" };
        }
        break;
      case "max_loan_amount":
        // Will sort in post-fetch to handle both secured/unsecured
        orderBy = { created_at: "desc" };
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

  console.log("FOUND RECORDS:", count);
  console.log(
    "RECORD IDs:",
    rows.map((r) => r.id),
  );

  // ✅ POST-FETCH FILTERING for string fields that store numeric values
  let filteredRows = rows;

  // Filter by processing fee (string field that contains numeric value)
  if (filters.processing_fee_max !== null) {
    filteredRows = filteredRows.filter((row) => {
      const feeStr = row.financial_terms?.processing_fee_percentage;
      if (!feeStr) return true; // Include products with no fee specified
      const fee = parseFloat(feeStr);
      return !isNaN(fee) && fee <= filters.processing_fee_max!;
    });
  }

  // Filter by moratorium availability (string field that contains numeric value)
  if (filters.moratorium_available !== null && filters.moratorium_available) {
    filteredRows = filteredRows.filter((row) => {
      const periodStr = row.repayment_terms?.moratorium_period;
      if (!periodStr) return false; // Exclude if no moratorium period
      const period = parseFloat(periodStr);
      return !isNaN(period) && period > 0;
    });
  }

  // ✅ POST-FETCH SORTING for max_loan_amount (handles both secured and unsecured)
  if (sortKey === "max_loan_amount") {
    filteredRows = filteredRows.sort((a, b) => {
      // Get max amount from both secured and unsecured, pick the higher one
      const aSecured = Number(
        a.financial_terms?.maximum_loan_amount_secured || 0,
      );
      const aUnsecured = Number(
        a.financial_terms?.maximum_loan_amount_unsecured || 0,
      );
      const aMax = Math.max(aSecured, aUnsecured);

      const bSecured = Number(
        b.financial_terms?.maximum_loan_amount_secured || 0,
      );
      const bUnsecured = Number(
        b.financial_terms?.maximum_loan_amount_unsecured || 0,
      );
      const bMax = Math.max(bSecured, bUnsecured);

      // Sort based on direction
      if (sortDir === "asc") {
        return aMax - bMax;
      } else {
        return bMax - aMax;
      }
    });
  }

  return { rows: filteredRows, count: count };
};

export const checkLoanProductFields = async (
  lender_id?: number,
  product_display_name?: string,
  hs_object_id?: string,
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
      lender: true,
    },
  });

  return loanProducts;
};
