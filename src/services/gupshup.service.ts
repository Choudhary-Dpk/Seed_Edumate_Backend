// src/services/gupshup.service.ts
import * as hubspotClient from './hubspotClient';
import { logger } from "../utils/logger";
import { createHubSpotError } from '../middlewares/errorHandler';

interface AssignmentSyncParams {
  agentId: string;
  agentEmail?: string;
  customerName?: string;
  customerPhone?: string;
  sessionId: string;
}

interface SyncResult {
  contactId?: string;
  agentEmail?: string;
  hubspotOwnerId?: string;
  synced: boolean;
  reason: string;
}

export const syncContactOwnerFromAssignment = async (params: AssignmentSyncParams): Promise<SyncResult> => {
  try {
    const { agentId, agentEmail, customerName, customerPhone, sessionId } = params;
    
    // Step 1: Resolve agent email
    const resolvedAgentEmail = agentEmail;
    if (!resolvedAgentEmail) {
      logger.warn('Agent email could not be resolved', { agentId, sessionId });
      return {
        synced: false,
        reason: 'Agent email not found'
      };
    }

    // Step 2: Find contact
    const contactId = await findContactByPhone(customerPhone);
    if (!contactId) {
      logger.info('Contact not found in HubSpot', { 
        customerName, 
        customerPhone, 
        sessionId 
      });
      return {
        agentEmail: resolvedAgentEmail,
        synced: false,
        reason: 'Contact not found'
      };
    }

    // Step 3: Check if contact already has owner
    const contactDetails = await hubspotClient.getContactById(contactId, ['hubspot_owner_id']);
    const currentOwnerId = contactDetails.properties.hubspot_owner_id;
    
    if (currentOwnerId && currentOwnerId.trim() !== '') {
      logger.info('Contact already has owner, skipping sync', { 
        contactId, 
        currentOwnerId, 
        sessionId 
      });
      return {
        contactId,
        agentEmail: resolvedAgentEmail,
        synced: false,
        reason: 'Contact already has owner'
      };
    }

    // Step 4: Find HubSpot owner
    const hubspotOwner = await findHubSpotOwnerByEmail(resolvedAgentEmail);
    if (!hubspotOwner) {
      logger.warn('HubSpot owner not found for agent email', { 
        agentEmail: resolvedAgentEmail, 
        sessionId 
      });
      return {
        contactId,
        agentEmail: resolvedAgentEmail,
        synced: false,
        reason: 'HubSpot owner not found'
      };
    }

    // Step 5: Update contact owner
    await updateContactOwner(contactId, hubspotOwner.id);
    
    logger.info('Contact owner synced successfully', { 
      contactId, 
      agentEmail: resolvedAgentEmail, 
      hubspotOwnerId: hubspotOwner.id,
      sessionId 
    });

    return {
      contactId,
      agentEmail: resolvedAgentEmail,
      hubspotOwnerId: hubspotOwner.id,
      synced: true,
      reason: 'Contact owner updated successfully'
    };

  } catch (error) {
    logger.error('Error in syncContactOwnerFromAssignment', { error, params });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'syncContactOwnerFromAssignment'
    );
  }
};

export const findContactByPhone = async (phone?: string): Promise<string | null> => {
  try {
    // Try phone if email search failed
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const searchRequest = hubspotClient.createSearchRequest([{
        propertyName: 'phone',
        operator: 'EQ',
        value: cleanPhone
      }], {
        properties: ['id'],
        limit: 1
      });

      const response = await hubspotClient.searchContacts(searchRequest);
      if (response.results.length > 0) {
        logger.debug('Found contact by phone', { phone: cleanPhone, contactId: response.results[0].id });
        return response.results[0].id;
      }
    }

    logger.debug('Contact not found', { phone });
    return null;
  } catch (error) {
    logger.error('Error in findContactByEmailOrPhone', { phone, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'findContactByEmailOrPhone'
    );
  }
};

export const findHubSpotOwnerByEmail = async (email: string): Promise<{ id: string; email: string } | null> => {
  try {
    const owners = await hubspotClient.getOwnersByEmail(email);
    
    if (owners.length === 0) {
      logger.debug('HubSpot owner not found for email', { email });
      return null;
    }

    const owner = owners[0];
    logger.debug('Found HubSpot owner by email', { email, ownerId: owner.id });
    
    return {
      id: owner.id,
      email: owner.email
    };
  } catch (error) {
    logger.error('Error in findHubSpotOwnerByEmail', { email, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'findHubSpotOwnerByEmail'
    );
  }
};

export const updateContactOwner = async (contactId: string, ownerId: string): Promise<void> => {
  try {
    await hubspotClient.updateContactOwner(contactId, ownerId);
    logger.info('Contact owner updated in HubSpot', { contactId, ownerId });
  } catch (error) {
    logger.error('Error in updateContactOwner', { contactId, ownerId, error });
    throw createHubSpotError(
      error instanceof Error ? error.message : 'Unknown error',
      error,
      'updateContactOwner'
    );
  }
};