// src/services/hubspotService.ts
import * as hubspotClient from './hubspotClient';
import { HubSpotMapper } from '../mappers/hubspotMapper';
import { logger } from "../utils/logger";
import {
  MappedEdumateContact,
  PaginationOptions
} from '../types';
import { createHubSpotError, createNotFoundError } from '../middlewares/errorHandler';
import { convertCurrency } from './loan.service';
import { ContactsLead } from '../types/contact.types';

// Edumate Contact Service Functions

export const getEdumateContacts = async (options: PaginationOptions = {}): Promise<{
  contacts: MappedEdumateContact[];
  hasMore: boolean;
  nextCursor?: string;
}> => {
  try {
    const response = await hubspotClient.getEdumateContacts(options);
    
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapEdumateContact(contact)
    );

    logger.info('Retrieved and mapped Edumate contacts', { count: contacts.length });

    return {
      contacts,
      hasMore: !!response.paging?.next,
      nextCursor: response.paging?.next?.after
    };
  } catch (error) {
    logger.error('Error in getEdumateContacts service', { error, options });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getEdumateContacts'
    );
  }
};

export const getEdumateContactById = async (contactId: string): Promise<MappedEdumateContact> => {
  try {
    const contact = await hubspotClient.getEdumateContactById(contactId);
    const mappedContact = HubSpotMapper.mapEdumateContact(contact);
    
    logger.info('Retrieved and mapped Edumate contact by ID', { contactId });
    return mappedContact;
  } catch (error) {
    logger.error('Error in getEdumateContactById service', { contactId, error });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Edumate Contact', contactId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getEdumateContactById'
    );
  }
};

export const createEdumateContact = async (contactData: Partial<MappedEdumateContact>): Promise<MappedEdumateContact> => {
  try {
    // Convert mapped data back to HubSpot properties format
    const properties = await mapToHubSpotProperties(contactData);
    
    const hubspotContact = await hubspotClient.createEdumateContact(properties);
    const mappedContact = HubSpotMapper.mapEdumateContact(hubspotContact);
    
    logger.info('Created and mapped Edumate contact', { contactId: mappedContact.id });
    return mappedContact;
  } catch (error) {
    logger.error('Error in createEdumateContact service', { error, contactData });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'createEdumateContact'
    );
  }
};

export const updateEdumateContact = async (contactId: string, contactData: Partial<MappedEdumateContact>): Promise<MappedEdumateContact> => {
  try {
    // Convert mapped data back to HubSpot properties format
    const properties = await mapToHubSpotProperties(contactData);
    
    const hubspotContact = await hubspotClient.updateEdumateContact(contactId, properties);
    const mappedContact = HubSpotMapper.mapEdumateContact(hubspotContact);
    
    logger.info('Updated and mapped Edumate contact', { contactId });
    return mappedContact;
  } catch (error) {
    logger.error('Error in updateEdumateContact service', { contactId, error, contactData });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Edumate Contact', contactId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'updateEdumateContact'
    );
  }
};

export const deleteEdumateContact = async (contactId: string): Promise<void> => {
  try {
    await hubspotClient.deleteEdumateContact(contactId);
    
    logger.info('Deleted Edumate contact', { contactId });
  } catch (error) {
    logger.error('Error in deleteEdumateContact service', { contactId, error });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Edumate Contact', contactId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'deleteEdumateContact'
    );
  }
};

export const batchCreateEdumateContacts = async (contactsData: Partial<MappedEdumateContact>[]): Promise<{ 
  success: number; 
  failed: number; 
  results: any[] 
}> => {
  try {
    // Convert all mapped data to HubSpot properties format
    const propertiesArray = await Promise.all(contactsData.map(contactData => 
      mapToHubSpotProperties(contactData)
    ));
    
    const response = await hubspotClient.batchCreateEdumateContacts(propertiesArray);
    
    const successCount = response.results?.length || 0;
    const failedCount = contactsData.length - successCount;
    
    logger.info('Batch created Edumate contacts', { 
      total: contactsData.length,
      success: successCount,
      failed: failedCount
    });
    
    return {
      success: successCount,
      failed: failedCount,
      results: response.results || []
    };
  } catch (error) {
    logger.error('Error in batchCreateEdumateContacts service', { 
      count: contactsData.length, 
      error 
    });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'batchCreateEdumateContacts'
    );
  }
};

export const batchUpdateEdumateContacts = async (updates: Array<{ 
  id: string; 
  data: Partial<MappedEdumateContact> 
}>): Promise<{ 
  success: number; 
  failed: number; 
  results: any[] 
}> => {
  try {
    // Convert all mapped data to HubSpot format
    const formattedUpdates = await Promise.all(updates.map(async update => ({
      id: update.id,
      properties: await mapToHubSpotProperties(update.data)
    })));
    
    const response = await hubspotClient.batchUpdateEdumateContacts(formattedUpdates);
    
    const successCount = response.results?.length || 0;
    const failedCount = updates.length - successCount;
    
    logger.info('Batch updated Edumate contacts', { 
      total: updates.length,
      success: successCount,
      failed: failedCount
    });
    
    return {
      success: successCount,
      failed: failedCount,
      results: response.results || []
    };
  } catch (error) {
    logger.error('Error in batchUpdateEdumateContacts service', { 
      count: updates.length, 
      error 
    });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'batchUpdateEdumateContacts'
    );
  }
};

export const searchEdumateContactsByEmail = async (email: string): Promise<MappedEdumateContact[]> => {
  try {
    const searchRequest = hubspotClient.createSearchRequest([{
      propertyName: 'email',
      operator: 'EQ',
      value: email
    }], {
      properties: [
        'first_name', 'last_name', 'email', 'phone_number', 'admission_status',
        'current_education_level', 'target_degree_level', 'preferred_study_destination'
      ]
    });

    const response = await hubspotClient.searchEdumateContacts(searchRequest);
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapEdumateContact(contact)
    );

    logger.info('Searched and mapped Edumate contacts by email', { email, count: contacts.length });
    return contacts;
  } catch (error) {
    logger.error('Error in searchEdumateContactsByEmail service', { email, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'searchEdumateContactsByEmail'
    );
  }
};

export const searchEdumateContactsByPhone = async (phoneNumber: string): Promise<MappedEdumateContact[]> => {
  try {
    const searchRequest = hubspotClient.createSearchRequest([{
      propertyName: 'phone_number',
      operator: 'EQ',
      value: phoneNumber
    }], {
      properties: [
        'first_name', 'last_name', 'email', 'phone_number', 'admission_status',
        'current_education_level', 'target_degree_level', 'preferred_study_destination'
      ]
    });

    const response = await hubspotClient.searchEdumateContacts(searchRequest);
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapEdumateContact(contact)
    );

    logger.info('Searched and mapped Edumate contacts by phone', { phoneNumber, count: contacts.length });
    return contacts;
  } catch (error) {
    logger.error('Error in searchEdumateContactsByPhone service', { phoneNumber, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'searchEdumateContactsByPhone'
    );
  }
};

export const searchEdumateContactsByAdmissionStatus = async (status: string): Promise<MappedEdumateContact[]> => {
  try {
    const searchRequest = hubspotClient.createSearchRequest([{
      propertyName: 'admission_status',
      operator: 'EQ',
      value: status
    }], {
      properties: [
        'first_name', 'last_name', 'email', 'phone_number', 'admission_status',
        'current_education_level', 'target_degree_level', 'preferred_study_destination',
        'assigned_counselor', 'priority_level'
      ]
    });

    const response = await hubspotClient.searchEdumateContacts(searchRequest);
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapEdumateContact(contact)
    );

    logger.info('Searched and mapped Edumate contacts by admission status', { status, count: contacts.length });
    return contacts;
  } catch (error) {
    logger.error('Error in searchEdumateContactsByAdmissionStatus service', { status, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'searchEdumateContactsByAdmissionStatus'
    );
  }
};

export const searchEdumateContactsByStudyDestination = async (destination: string): Promise<MappedEdumateContact[]> => {
  try {
    const searchRequest = hubspotClient.createSearchRequest([{
      propertyName: 'preferred_study_destination',
      operator: 'EQ',
      value: destination
    }], {
      properties: [
        'first_name', 'last_name', 'email', 'phone_number', 'admission_status',
        'current_education_level', 'target_degree_level', 'preferred_study_destination',
        'target_universities', 'intended_start_date'
      ]
    });

    const response = await hubspotClient.searchEdumateContacts(searchRequest);
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapEdumateContact(contact)
    );

    logger.info('Searched and mapped Edumate contacts by study destination', { destination, count: contacts.length });
    return contacts;
  } catch (error) {
    logger.error('Error in searchEdumateContactsByStudyDestination service', { destination, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'searchEdumateContactsByStudyDestination'
    );
  }
};

/**
 * Convert mapped contact data back to HubSpot properties format
 */
const mapToHubSpotProperties = async (contactData: Partial<ContactsLead>): Promise<Record<string, any>> => {
  const properties: Record<string, any> = {};
  const loanAmount = contactData?.selectedLoanCurrency != 'INR' && contactData?.loanAmount ? await convertCurrency(Number(contactData?.loanAmount) || 0, contactData?.selectedLoanCurrency || 'INR', 'INR') : contactData?.loanAmount;
  const coApplicantAnnualIncome = contactData?.baseCurrency != 'INR' && contactData?.coApplicantAnnualIncome ? await convertCurrency(Number(contactData?.coApplicantAnnualIncome), contactData?.baseCurrency || 'INR', 'INR') : contactData?.coApplicantAnnualIncome;
  
  // Map personal information
  if (contactData.firstName) properties.first_name = contactData.firstName;
  if (contactData.lastName) properties.last_name = contactData.lastName;
  if (contactData.email) properties.email = contactData.email;
  if (contactData.phoneNumber) properties.phone_number = contactData.phoneNumber;
  if (contactData.dateOfBirth) properties.date_of_birth = contactData.dateOfBirth.toISOString().split('T')[0];
  if (contactData.gender) properties.gender = contactData.gender;
  if (contactData.selectedLoanCurrency) properties.user_selected_currency = contactData.selectedLoanCurrency;
  if (contactData.baseCurrency) properties.base_currency = contactData.baseCurrency;
  if (contactData.studyDestinationCurrency) properties.study_destination_currency = contactData.studyDestinationCurrency;
  
  if (contactData.levelOfEducation) properties.current_education_level = contactData.levelOfEducation;
  if (contactData.studyDestination || contactData.countryOfStudy)
    properties.preferred_study_destination =
      contactData.studyDestination || contactData.countryOfStudy;
  // if (contactData.nonUsaCountry) properties.nationality = contactData.nonUsaCountry;
  if (contactData.courseType) properties.course_type = contactData.courseType;
  if (contactData.loanPreference) properties.loan_type_preference = contactData.loanPreference;
  if (contactData.intakeMonth) properties.intake_month = contactData.intakeMonth;
  if (contactData.intakeYear) properties.intake_year = contactData.intakeYear;
  if (contactData?.loanAmount) properties.loan_amount_required = loanAmount || contactData?.loanAmount;
  
  // if (contactData.loanAmount) properties.co_applicant_1_name = contactData.loanAmount;
  if (contactData.coApplicant) properties.co_applicant_1_relationship = contactData.coApplicant;
  if (contactData.coApplicantIncomeType) properties.co_applicant_1_occupation = contactData.coApplicantIncomeType;
  if (contactData.coApplicantAnnualIncome) properties.co_applicant_1_income = coApplicantAnnualIncome;
  if (contactData.coApplicantMobile) properties.co_applicant_1_mobile_number = contactData.coApplicantMobile;
  if (contactData.coApplicantEmail) properties.co_applicant_1_email = contactData.coApplicantEmail;

  if (contactData?.analyticalExam?.GRE) properties.gre_score = contactData?.analyticalExam?.GRE;
  if (contactData?.analyticalExam?.GMAT) properties.gmat_score = contactData?.analyticalExam?.GMAT;
  if (contactData?.analyticalExam?.SAT) properties.sat_score = contactData?.analyticalExam?.SAT;
  if (contactData?.analyticalExam?.CAT) properties.cat_score = contactData?.analyticalExam?.CAT;
  if (contactData?.analyticalExam?.NMAT) properties.nmat_score = contactData?.analyticalExam?.NMAT;
  if (contactData?.analyticalExam?.XAT) properties.xat_score = contactData?.analyticalExam?.XAT;
  if (contactData?.languageExam?.TOEFL) properties.toefl_score = contactData?.languageExam?.TOEFL;
  if (contactData?.languageExam?.IELTS) properties.ielts_score = contactData?.languageExam?.IELTS;
  if (contactData?.languageExam?.Duolingo) properties.duolingo_score = contactData?.languageExam?.Duolingo;

  if (contactData.utm_campaign) properties.utm_campaign = contactData.utm_campaign;
  if (contactData.utm_medium) properties.loan_amount_required = contactData.utm_medium;
  if (contactData.utm_source) properties.utm_source = contactData.utm_source;

  if(contactData.targetDegreeLevel) properties.target_degree_level = contactData.targetDegreeLevel;
  if(contactData.admissionStatus) properties.admission_status = contactData.admissionStatus;
  if(contactData.educationLevel) properties.current_education_level = contactData.educationLevel;
  if(contactData.studyDestination) properties.preferred_study_destination = contactData.studyDestination;
  if(contactData.partnerName) properties.b2b_partner_name = contactData.partnerName;
  if (contactData.phone) properties.phone_number = contactData.phone;
  if (contactData.b2bHubspotId)
    properties.b2b_partner_id = contactData.b2bHubspotId;

  return properties;
};

/**
 * Search B2B Partners By Email
 */
export const fetchPartnerByEmail = async (
  email: string
):Promise<any> => {
 const searchRequest = hubspotClient.createSearchRequest(
   [
     {
       propertyName: "primary_contact_email",
       operator: "EQ",
       value: email,
     },
   ],
   {
     properties: [
       "partner_display_name",
       "primary_contact_email",
       "primary_contact_phone",
     ],
   }
 );

  try {
    const response = await hubspotClient.getPartnerByEmail(searchRequest);
    return response;
  } catch (error) {
    logger.error("Error in fetchPartnerByEmail service", { error });
        throw createHubSpotError(
          error instanceof Error ? error.message : "Unknown error",
          error,
          "fetchPartnerByEmail"
        );
  }
};

export const fetchLeadByEmail = async (email: string): Promise<any> => {
  const searchRequest = hubspotClient.createSearchRequest(
    [
      {
        propertyName: "student_email",
        operator: "EQ",
        value: email,
      },
    ],
    {
      properties: [
        "student_name",
        "student_email",
        "loan_amount_approved",
        "loan_amount_requested",
        "loan_tenure_years",
      ],
    }
  );

  try {
    const response = await hubspotClient.getLeadsByEmail(searchRequest);
    return response;
  } catch (error) {
    logger.error("Error in fetchLeadByEmail service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "fetchLeadByEmail"
    );
  }
};

export const createPartner = async (email: string, name: string) => {
  try {
    const response = await hubspotClient.createHubspotPartner({
      primary_contact_email: email,
      partner_name: name,
    });
    return response;
  } catch (error) {
    logger.error("Error in createPartner service", {
      error,
    });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "createPartner"
    );
  }
};

export const createLoanLeads = async (
  leads: {
    email: string;
    name: string;
    applicationStatus: string;
    loanAmountRequested: number;
    loanAmountApproved: number;
    loanTenureYears: number;
  }[]
) => {
  try {
    const response = await hubspotClient.createLoanApplicationLeads(
      leads.map((lead) => ({
        student_email: lead.email,
        student_name: lead.name,
        application_status: lead.applicationStatus,
        loan_amount_approved: lead.loanAmountApproved,
        loan_amount_requested: lead.loanAmountRequested,
        loan_tenure_years: lead.loanTenureYears,
      }))
    );

    return response;
  } catch (error) {
    logger.error("Error in createLoanLeads service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "createLoanLeads"
    );
  }
};

export const upateLoanLead = async (
  leadId: number,
  lead: {
    email: string;
    name: string;
    applicationStatus: string;
    loanAmountRequested: number;
    loanAmountApproved: number;
    loanTenureYears: number;
  }
) => {
  try {
    const response = await hubspotClient.updateLoanLeadInHubspot(leadId, {
      student_email: lead.email,
      student_name: lead.name,
      application_status: lead.applicationStatus,
      loan_amount_approved: lead.loanAmountApproved,
      loan_amount_requested: lead.loanAmountRequested,
      loan_tenure_years: lead.loanTenureYears,
    });
    return response;
  } catch (error) {
    logger.error("Error in updateLoanLead service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "updateLoanLead"
    );
  }
};

export const deleteHubspotByLeadId = async (hubspotId: string) => {
  try {
    await hubspotClient.deleteLoanApplication(hubspotId);

    logger.info("Deleted Loan application", { hubspotId });
  } catch (error) {
    logger.error("Error in deleteHubspotByLeadId service", {
      hubspotId,
      error,
    });

    if (error instanceof Error && error.message.includes("not found")) {
      throw createNotFoundError("Loan application", hubspotId);
    }

    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "deleteHubspotByLeadId"
    );
  }
};

export const createEdumateContactsLeads = async (
  leads: ContactsLead[]
) => {
  try {
    const response = await hubspotClient.createContactsLeads(
      await Promise.all(leads?.map((lead) => mapToHubSpotProperties(lead)))
    );

    return response;
  } catch (error) {
    logger.error("Error in createLoanLeads service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "createLoanLeads"
    );
  }
};

export const deleteHubspotByContactsLeadId = async (hubspotId: string) => {
  try {
    await hubspotClient.deleteContactsLead(hubspotId);

    logger.info("Deleted contact lead application", { hubspotId });
  } catch (error) {
    logger.error("Error in deleteHubspotByContactsLeadId service", {
      hubspotId,
      error,
    });

    if (error instanceof Error && error.message.includes("not found")) {
      throw createNotFoundError("Loan application", hubspotId);
    }

    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "deleteHubspotByContactsLeadId"
    );
  }
};

export const mapLeadToHubSpotProperties = (lead: ContactsLead): Record<string, any> => {
  const properties: Record<string, any> = {};

  if (lead.firstName) properties.first_name = lead.firstName;
  if (lead.lastName) properties.last_name = lead.lastName;
  if (lead.email) properties.email = lead.email;
  if (lead.phone) properties.phone_number = lead.phone;
  if (lead.partnerName) properties.b2b_partner_name = lead.partnerName;
  if (lead.educationLevel) properties.current_education_level = lead.educationLevel;
  if (lead.admissionStatus) properties.admission_status = lead.admissionStatus;
  if (lead.targetDegreeLevel) properties.target_degree_level = lead.targetDegreeLevel;
  if (lead.courseType) properties.course_type = lead.courseType;
  if (lead.studyDestination) properties.preferred_study_destination = lead.studyDestination;
  if (lead.dateOfBirth) properties.date_of_birth = lead.dateOfBirth.toISOString().split("T")[0];
  if (lead.gender) properties.gender = lead.gender;
  if (lead.intakeYear) properties.intake_year = lead.intakeYear;
  if (lead.intakeMonth) properties.intake_month = lead.intakeMonth;

  return properties;
};


export const updateContactsLoanLead = async (
  leadId: string,
  leads: ContactsLead
) => {
  try {
    // const hubspotMappedData = await mapToHubSpotProperties(leads);
    // console.log("hubspotMappedData",hubspotMappedData)
    const response = await hubspotClient.updateContactsLoanLeadInHubspot(leadId, leads);
    return response;
  } catch (error) {
    logger.error("Error in upateContactsLoanLead service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "upateContactsLoanLead"
    );
  }
};

export const createContactsLoanLeads = async (leads: ContactsLead[]) => {
  try {
    const response = await hubspotClient.createMultiContactsLead(leads);

    return response;
  } catch (error) {
    logger.error("Error in createContactsLoanLeads service", { error });
    throw createHubSpotError(
      error instanceof Error ? error.message : "Unknown error",
      error,
      "createContactsLoanLeads"
    );
  }
};

