// Re-export all types for easier importing
export * from './hubspot.types';
export * from './mapped.types';
export * from './common.types';

// Type guards for runtime type checking
export const isHubSpotContact = (obj: any): obj is import('./hubspot.types').HubSpotContact => {
  return obj && typeof obj.id === 'string' && obj.properties && obj.createdAt && obj.updatedAt;
};

export const isHubSpotEdumateContact = (obj: any): obj is import('./hubspot.types').HubSpotEdumateContact => {
  return obj && typeof obj.id === 'string' && obj.properties && obj.createdAt && obj.updatedAt;
};

export const isMappedEdumateContact = (obj: any): obj is import('./mapped.types').MappedEdumateContact => {
  return obj && typeof obj.id === 'string' && obj.firstName && obj.lastName && obj.createdAt && obj.updatedAt;
};