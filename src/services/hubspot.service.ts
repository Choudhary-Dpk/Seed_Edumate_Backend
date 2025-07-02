// src/services/hubspotService.ts
import * as hubspotClient from './hubspotClient';
import { HubSpotMapper } from '../mappers/hubspotMapper';
import { logger } from '../utils/looger';
import { 
  MappedContact, 
  MappedCompany, 
  MappedDeal,
  MappedEdumateContact,
  PaginationOptions
} from '../types';
import { createHubSpotError, createNotFoundError } from '../middlewares/errorHandler';

// Standard HubSpot Objects Service Functions

export const getContacts = async (options: PaginationOptions = {}): Promise<{
  contacts: MappedContact[];
  hasMore: boolean;
  nextCursor?: string;
}> => {
  try {
    const response = await hubspotClient.getContacts(options);
    
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapContact(contact)
    );

    logger.info('Retrieved and mapped contacts', { count: contacts.length });

    return {
      contacts,
      hasMore: !!response.paging?.next,
      nextCursor: response.paging?.next?.after
    };
  } catch (error) {
    logger.error('Error in getContacts service', { error, options });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getContacts'
    );
  }
};

export const getContactById = async (contactId: string): Promise<MappedContact> => {
  try {
    const contact = await hubspotClient.getContactById(contactId);
    const mappedContact = HubSpotMapper.mapContact(contact);
    
    logger.info('Retrieved and mapped contact by ID', { contactId });
    return mappedContact;
  } catch (error) {
    logger.error('Error in getContactById service', { contactId, error });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Contact', contactId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getContactById'
    );
  }
};

export const searchContactsByEmail = async (email: string): Promise<MappedContact[]> => {
  try {
    const searchRequest = hubspotClient.createSearchRequest([{
      propertyName: 'email',
      operator: 'EQ',
      value: email
    }], {
      properties: ['email', 'firstname', 'lastname', 'phone', 'company']
    });

    const response = await hubspotClient.searchContacts(searchRequest);
    const contacts = response.results.map(contact => 
      HubSpotMapper.mapContact(contact)
    );

    logger.info('Searched and mapped contacts by email', { email, count: contacts.length });
    return contacts;
  } catch (error) {
    logger.error('Error in searchContactsByEmail service', { email, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'searchContactsByEmail'
    );
  }
};

export const getCompanies = async (options: PaginationOptions = {}): Promise<{
  companies: MappedCompany[];
  hasMore: boolean;
  nextCursor?: string;
}> => {
  try {
    const response = await hubspotClient.getCompanies(options);
    
    const companies = response.results.map(company => 
      HubSpotMapper.mapCompany(company)
    );

    logger.info('Retrieved and mapped companies', { count: companies.length });

    return {
      companies,
      hasMore: !!response.paging?.next,
      nextCursor: response.paging?.next?.after
    };
  } catch (error) {
    logger.error('Error in getCompanies service', { error, options });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getCompanies'
    );
  }
};

export const getCompanyById = async (companyId: string): Promise<MappedCompany> => {
  try {
    const company = await hubspotClient.getCompanyById(companyId);
    const mappedCompany = HubSpotMapper.mapCompany(company);
    
    logger.info('Retrieved and mapped company by ID', { companyId });
    return mappedCompany;
  } catch (error) {
    logger.error('Error in getCompanyById service', { companyId, error });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Company', companyId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getCompanyById'
    );
  }
};

export const getDeals = async (options: PaginationOptions = {}): Promise<{
  deals: MappedDeal[];
  hasMore: boolean;
  nextCursor?: string;
}> => {
  try {
    const response = await hubspotClient.getDeals(options);
    
    const deals = response.results.map(deal => 
      HubSpotMapper.mapDeal(deal)
    );

    logger.info('Retrieved and mapped deals', { count: deals.length });

    return {
      deals,
      hasMore: !!response.paging?.next,
      nextCursor: response.paging?.next?.after
    };
  } catch (error) {
    logger.error('Error in getDeals service', { error, options });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getDeals'
    );
  }
};

export const getDealById = async (dealId: string): Promise<MappedDeal> => {
  try {
    const deal = await hubspotClient.getDealById(dealId);
    const mappedDeal = HubSpotMapper.mapDeal(deal);
    
    logger.info('Retrieved and mapped deal by ID', { dealId });
    return mappedDeal;
  } catch (error) {
    logger.error('Error in getDealById service', { dealId, error });
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw createNotFoundError('Deal', dealId);
    }
    
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'getDealById'
    );
  }
};

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
    const properties = mapToHubSpotProperties(contactData);
    
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
    const properties = mapToHubSpotProperties(contactData);
    
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
    const propertiesArray = contactsData.map(contactData => 
      mapToHubSpotProperties(contactData)
    );
    
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
    const formattedUpdates = updates.map(update => ({
      id: update.id,
      properties: mapToHubSpotProperties(update.data)
    }));
    
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
const mapToHubSpotProperties = (contactData: Partial<MappedEdumateContact>): Record<string, any> => {
  const properties: Record<string, any> = {};

  // Map personal information
  if (contactData.firstName) properties.first_name = contactData.firstName;
  if (contactData.lastName) properties.last_name = contactData.lastName;
  if (contactData.email) properties.email = contactData.email;
  if (contactData.phoneNumber) properties.phone_number = contactData.phoneNumber;
  if (contactData.dateOfBirth) properties.date_of_birth = contactData.dateOfBirth.toISOString().split('T')[0];
  if (contactData.gender) properties.gender = contactData.gender;
  if (contactData.levelOfEducation) properties.current_education_level = contactData.levelOfEducation;
  if (contactData.studyDestination) properties.preferred_study_destination = contactData.studyDestination;
  // if (contactData.nonUsaCountry) properties.nationality = contactData.nonUsaCountry;
  if (contactData.courseType) properties.course_type = contactData.courseType;
  if (contactData.loanPreference) properties.loan_type_preference = contactData.loanPreference;
  if (contactData.intakeMonth) properties.intake_month = contactData.intakeMonth;
  if (contactData.intakeYear) properties.intake_year = contactData.intakeYear;
  if (contactData.loanAmount) properties.loan_amount_required = contactData.loanAmount;



  return properties;
};