// src/mappers/hubspotMapper.ts
import { 
  HubSpotContact, 
  HubSpotCompany, 
  HubSpotDeal,
  HubSpotEdumateContact,
  MappedContact,
  MappedCompany,
  MappedDeal,
  MappedEdumateContactEduToFrontend
} from '../types';

export class HubSpotMapper {
  /**
   * Map HubSpot contact to internal contact format
   */
  static mapContact(contact: HubSpotContact): MappedContact {
    const props = contact.properties;
    return {
      id: contact.id,
      email: props.email || '',
      firstName: props.firstname || '',
      lastName: props.lastname || '',
      fullName: `${props.firstname || ''} ${props.lastname || ''}`.trim(),
      phone: props.phone,
      company: props.company,
      website: props.website,
      lifecycleStage: props.lifecyclestage,
      ownerId: props.hubspot_owner_id,
      createdAt: new Date(props.createdate || contact.createdAt),
      updatedAt: new Date(props.lastmodifieddate || contact.updatedAt),
      customProperties: this.extractCustomProperties(props, [
        'email', 'firstname', 'lastname', 'phone', 'company', 
        'website', 'lifecyclestage', 'hubspot_owner_id', 
        'createdate', 'lastmodifieddate'
      ])
    };
  }

  /**
   * Map HubSpot company to internal company format
   */
  static mapCompany(company: HubSpotCompany): MappedCompany {
    const props = company.properties;
    return {
      id: company.id,
      name: props.name || '',
      domain: props.domain,
      industry: props.industry,
      phone: props.phone,
      address: {
        city: props.city,
        state: props.state,
        country: props.country
      },
      ownerId: props.hubspot_owner_id,
      createdAt: new Date(props.createdate || company.createdAt),
      updatedAt: new Date(props.lastmodifieddate || company.updatedAt),
      customProperties: this.extractCustomProperties(props, [
        'name', 'domain', 'industry', 'phone', 'city', 'state', 
        'country', 'hubspot_owner_id', 'createdate', 'lastmodifieddate'
      ])
    };
  }

  /**
   * Map HubSpot deal to internal deal format
   */
  static mapDeal(deal: HubSpotDeal): MappedDeal {
    const props = deal.properties;
    return {
      id: deal.id,
      name: props.dealname || '',
      amount: props.amount ? parseFloat(props.amount) : undefined,
      stage: props.dealstage,
      pipeline: props.pipeline,
      closeDate: props.closedate ? new Date(props.closedate) : undefined,
      ownerId: props.hubspot_owner_id,
      createdAt: new Date(props.createdate || deal.createdAt),
      updatedAt: new Date(props.lastmodifieddate || deal.updatedAt),
      customProperties: this.extractCustomProperties(props, [
        'dealname', 'amount', 'dealstage', 'pipeline', 'closedate',
        'hubspot_owner_id', 'createdate', 'lastmodifieddate'
      ])
    };
  }

  /**
   * Map HubSpot Edumate contact to internal mapped format
   */
  static mapEdumateContact(contact: HubSpotEdumateContact): MappedEdumateContactEduToFrontend {
    const props = contact.properties;
    
    // Helper function to safely parse dates
    const parseDate = (dateStr?: string): Date | undefined => {
      if (!dateStr) return undefined;
      try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? undefined : date;
      } catch {
        return undefined;
      }
    };

    // Helper function to safely parse numbers
    const parseNumber = (numStr?: string | number): number | undefined => {
      if (numStr === undefined || numStr === null || numStr === '') return undefined;
      try {
        const num = typeof numStr === 'string' ? parseFloat(numStr) : numStr;
        return isNaN(num) ? undefined : num;
      } catch {
        return undefined;
      }
    };

    return {
      id: contact.id,
      
      // Personal Information
      firstName: props.first_name || '',
      lastName: props.last_name || '',
      fullName: `${props.first_name || ''} ${props.last_name || ''}`.trim(),
      email: props.email,
      phoneNumber: props.phone_number,
      dateOfBirth: parseDate(props.date_of_birth),
      gender: props.gender,
      nationality: props.nationality,
      
      // Address Information
      currentAddress: {
        address: props.current_address,
        city: props.city__current_address_,
        state: props.state__current_address_,
        country: props.country__current_address_,
        pincode: props.pincode__current_address_
      },
      permanentAddress: {
        address: props.permanent_address,
        city: props.city__permanent_address_,
        state: props.state__permanent_address_,
        country: props.country__permanent_address_,
        pincode: props.pincode__permanent_address_
      },
      
      // Academic Information
      currentEducation: {
        level: props.current_education_level,
        institution: props.current_institution,
        major: props.current_course_major,
        cgpaPercentage: parseNumber(props.current_cgpa_percentage),
        graduationYear: parseNumber(props.current_graduation_year)
      },
      
      targetEducation: {
        degreeLevel: props.target_degree_level,
        courseMajor: props.target_course_major,
        universities: props.target_universities,
        studyDestination: props.preferred_study_destination,
        intendedStartDate: parseDate(props.intended_start_date),
        intendedStartTerm: props.intended_start_term,
        courseDurationMonths: parseNumber(props.course_duration_months)
      },
      
      testScores: {
        gmat: parseNumber(props.gmat_score),
        gre: parseNumber(props.gre_score),
        toefl: parseNumber(props.toefl_score),
        ielts: parseNumber(props.ielts_score),
        other: props.other_test_scores
      },
      
      // Application Journey
      admissionStatus: props.admission_status,
      applicationJourney: {
        assignedCounselor: props.assigned_counselor,
        counselorNotes: props.counselor_notes,
        currentStatusDisposition: props.current_status_disposition,
        currentStatusDispositionReason: props.current_status_disposition_reason,
        priorityLevel: props.priority_level,
        firstContactDate: parseDate(props.first_contact_date),
        lastContactDate: parseDate(props.last_contact_date),
        nextFollowUpDate: parseDate(props.next_follow_up_date),
        followUpDate: parseDate(props.follow_up_date)
      },
      
      // Financial Information
      financialProfile: {
        annualFamilyIncome: parseNumber(props.annual_family_income),
        totalCourseCost: parseNumber(props.total_course_cost),
        tuitionFee: parseNumber(props.tuition_fee),
        livingExpenses: parseNumber(props.living_expenses),
        otherExpenses: parseNumber(props.other_expenses),
        loanAmountRequired: parseNumber(props.loan_amount_required),
        selfFundingAmount: parseNumber(props.self_funding_amount),
        scholarshipAmount: parseNumber(props.scholarship_amount),
        currency: props.currency
      },
      
      coApplicants: [
        props.co_applicant_1_name ? {
          name: props.co_applicant_1_name,
          relationship: props.co_applicant_1_relationship,
          occupation: props.co_applicant_1_occupation,
          income: parseNumber(props.co_applicant_1_income)
        } : undefined,
        props.co_applicant_2_name ? {
          name: props.co_applicant_2_name,
          relationship: props.co_applicant_2_relationship,
          occupation: props.co_applicant_2_occupation,
          income: parseNumber(props.co_applicant_2_income)
        } : undefined,
        props.co_applicant_3_name ? {
          name: props.co_applicant_3_name,
          relationship: props.co_applicant_3_relationship,
          occupation: props.co_applicant_3_occupation,
          income: parseNumber(props.co_applicant_3_income)
        } : undefined
      ].filter(Boolean) as Array<{
        name?: string;
        relationship?: string;
        occupation?: string;
        income?: number;
      }>,
      
      collateral: [
        props.collateral_available ? {
          available: props.collateral_available,
          type: props.collateral_type,
          value: parseNumber(props.collateral_value)
        } : undefined,
        props.collateral_2_available ? {
          available: props.collateral_2_available,
          type: props.collateral_2_type,
          value: parseNumber(props.collateral_2_value)
        } : undefined
      ].filter(Boolean) as Array<{
        available?: string;
        type?: string;
        value?: number;
      }>,
      
      // Loan Preferences
      loanPreferences: {
        loanTypePreference: props.loan_type_preference,
        preferredLenders: props.preferred_lenders,
        repaymentTypePreference: props.repayment_type_preference
      },
      
      // Lead Attribution
      leadAttribution: {
        leadSource: props.lead_source,
        leadSourceDetail: props.lead_source_detail,
        leadQualityScore: parseNumber(props.lead_quality_score),
        leadReferenceCode: props.lead_reference_code,
        b2bPartnerName: props.b2b_partner_name,
        b2bPartnerId: props.b2b_partner_id,
        partnerCommissionApplicable: props.partner_commission_applicable,
        referralPersonName: props.referral_person_name,
        referralPersonContact: props.referral_person_contact,
        utmSource: props.utm_source,
        utmMedium: props.utm_medium,
        utmCampaign: props.utm_campaign,
        utmTerm: props.utm_term,
        utmContent: props.utm_content
      },
      
      // System Information
      ownerId: props.hubspot_owner_id,
      createdAt: new Date(props.hs_createdate || contact.createdAt),
      updatedAt: new Date(props.hs_lastmodifieddate || contact.updatedAt),
      createdBy: props.created_by,
      lastModifiedBy: props.last_modified_by,
      dataSource: props.data_source,
      gdprConsent: props.gdpr_consent,
      marketingConsent: props.marketing_consent,
      studentRecordStatus: props.student_record_status,
      tags: props.tags,

      partnerName:props.b2b_partner_name ?? "",
      targetDegreeLevel: props.target_degree_level ?? "",
      educationLevel: props.current_education_level ?? "",

      
      // Extract any remaining custom properties
      customProperties: this.extractCustomProperties(props, this.getStandardEdumateProperties())
    };
  }

  /**
   * Extract custom properties that aren't in the standard property list
   */
  private static extractCustomProperties(
    properties: Record<string, any>,
    standardProperties: string[]
  ): Record<string, any> | undefined {
    const custom: Record<string, any> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (!standardProperties.includes(key) && value !== null && value !== undefined) {
        custom[key] = value;
      }
    }
    return Object.keys(custom).length > 0 ? custom : undefined;
  }

  /**
   * Get list of all standard Edumate contact properties
   */
  private static getStandardEdumateProperties(): string[] {
    return [
      // Personal Information
      'first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'gender', 'nationality',
      'current_address', 'city__current_address_', 'state__current_address_', 'country__current_address_', 'pincode__current_address_',
      'permanent_address', 'city__permanent_address_', 'state__permanent_address_', 'country__permanent_address_', 'pincode__permanent_address_',
      
      // Academic Information
      'admission_status', 'course_duration_months', 'current_cgpa_percentage', 'current_course_major',
      'current_education_level', 'current_graduation_year', 'current_institution', 'gmat_score', 'gre_score',
      'ielts_score', 'intended_start_date', 'intended_start_term', 'other_test_scores', 'preferred_study_destination',
      'target_course_major', 'target_degree_level', 'target_universities', 'toefl_score',
      
      // Application Journey
      'assigned_counselor', 'counselor_notes', 'current_status_disposition', 'current_status_disposition_reason',
      'first_contact_date', 'follow_up_date', 'last_contact_date', 'next_follow_up_date', 'priority_level',
      
      // Financial Information
      'annual_family_income', 'co_applicant_1_income', 'co_applicant_1_name', 'co_applicant_1_occupation',
      'co_applicant_1_relationship', 'co_applicant_2_income', 'co_applicant_2_name', 'co_applicant_2_occupation',
      'co_applicant_2_relationship', 'co_applicant_3_income', 'co_applicant_3_name', 'co_applicant_3_occupation',
      'co_applicant_3_relationship', 'collateral_2_available', 'collateral_2_type', 'collateral_2_value',
      'collateral_available', 'collateral_type', 'collateral_value', 'currency', 'living_expenses',
      'loan_amount_required', 'other_expenses', 'scholarship_amount', 'self_funding_amount', 'total_course_cost', 'tuition_fee',
      
      // Lead Attribution
      'b2b_partner_id', 'b2b_partner_name', 'lead_quality_score', 'lead_reference_code', 'lead_source',
      'lead_source_detail', 'partner_commission_applicable', 'referral_person_contact', 'referral_person_name',
      'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term',
      
      // Loan Preferences
      'loan_type_preference', 'preferred_lenders', 'repayment_type_preference',
      
      // System Properties
      'hs_created_by_user_id', 'hs_createdate', 'hs_lastmodifieddate', 'hs_object_id', 'hs_object_source_detail_1',
      'hs_object_source_detail_2', 'hs_object_source_detail_3', 'hs_object_source_label', 'hs_updated_by_user_id',
      'hubspot_owner_assigneddate', 'hubspot_owner_id', 'hubspot_team_id', 'created_by', 'created_date',
      'data_source', 'gdpr_consent', 'last_modified_by', 'last_modified_date', 'marketing_consent',
      'student_record_status', 'tags'
    ];
  }
}