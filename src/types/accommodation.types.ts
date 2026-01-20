/**
 * TypeScript Types and Interfaces for University Living API
 */

// ============================================================================
// Reference Data Types
// ============================================================================

export interface Provider {
  name: string;
}

export interface City {
  location: {
    lat: number;
    lng: number;
  };
  country: string;
  name: string;
  id: string;
}

export interface University {
  name: string;
  country: string;
  city: string;
  id: string;
}

// ============================================================================
// Property Types
// ============================================================================

export interface PropertyListItem {
  name: string;
  city: string;
  country: string;
  provider: string;
  id: string;
}

export interface PropertyRate {
  providerAvailability: string;
  price: number;
  discountedPrice: number;
  priceUnit: string;
  tenancy: string;
  checkInDate: string;
  checkoutDate: string;
  checkInCheckoutFlexibility: string;
  enabled: boolean;
}

export interface RoomType {
  tourlink?: string;
  area?: string;
  description: string;
  title: string;
  dualOccupancy: boolean;
  rates: PropertyRate[];
  images: string[];
  enabled: boolean;
  offers: any[];
  videos: any[];
  amenities: Amenity[];
  roomId: string;
}

export interface RoomCategory {
  category: string;
  types: RoomType[];
  categoryId: string;
}

export interface Amenity {
  type?: string;
  title: string;
  url: string;
}

export interface Offer {
  validTill: string;
  info: string;
  termsCondition: string;
}

export interface PropertyDetails {
  id: string;
  name: string;
  enabled: boolean;
  baseCurrencyCode: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  location: [number, number];
  distanceFromCityCenter: number;
  isShortTerm: boolean | null;
  minPrice: number;
  displayPrice: string;
  totalBeds: number | null;
  floorCount: number | null;
  provider: string;
  isSoldOut: boolean | null;
  thumbnail: string;
  videoUrl: string[];
  tourlink: string[];
  media: string[];
  description: string;
  offers: Offer[];
  amenities: Amenity[];
  rooms: RoomCategory[];
}

// ============================================================================
// Lead Types
// ============================================================================

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  dateOfBirth: string;
  budget: string;
  gender: string;
  nationality: string;
  universityId: string;
  message?: string;
}

export interface LeadStatusResponse {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  status: string;
  leadId: string;
}

// ============================================================================
// Booking Types
// ============================================================================

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  nationality: string;
}

export interface UniversityInfo {
  universityId: string;
  courseName: string;
  yearOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface GuardianInfo {
  fullName: string;
  email: string;
  mobile: string;
  relationship: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  nationality: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  price: number;
  tenancy: string;
  categoryId: string;
  roomId: string;
  message?: string;
  personalInfo: PersonalInfo;
  universityInfo: UniversityInfo;
  guardianInfo: GuardianInfo;
}

export interface BookingRate {
  tenancyId: string;
  providerAvailability: string;
  price: number;
  discountedPrice: number;
  priceUnit: string;
  tenancy: string;
  checkInDate: string;
  checkoutDate: string;
  checkInCheckoutFlexibility: string;
  enabled: boolean;
  checkInCheckOutText: string;
  total: string;
  displayPrice: string;
}

export interface BookingStatusResponse {
  createdAt: string;
  propertyId: string;
  tenancyId: string;
  categoryId: string;
  roomId: string;
  message?: string;
  vendorId: string;
  orderId: string;
  rate: BookingRate;
  category: string;
  roomType: string;
  status: string;
  guardianInfo: GuardianInfo;
  universityInfo: UniversityInfo & {
    name: string;
    country: string;
    cityId: string;
  };
  personalInfo: PersonalInfo;
}

// ============================================================================
// Query Parameters Types
// ============================================================================

export interface PropertyListQuery {
  city?: string;
  provider?: string;
  universityId?: string;
}

// ============================================================================
// API Response Types (for internal use)
// ============================================================================

export interface ULAPIResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
}