export type DeviceInfo = {
  browser: string;
  os: string;
  device: string;
};

export type LoginPayload = {
  id: number;
  email: string;
  name?: string;
  passwordHash?: string | null;
  passwordSetOn?: Date | null;
  ipDetails?: any;
  deviceDetails?: DeviceInfo;
};

export type ResetPasswordPayload = {
  id: number;
  email: string;
};

export type ProtectedPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
  roles?: string[];
};

export type AdminProtectedPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
  roles?: string[];
};

export type LoginStatus = "success" | "failed" | "logout";

export type AllowedRoles = "Admin" | "Manager" | "User";

export type AllowedAdminRoles = "Admin";

// Portal types
export enum PortalType {
  ADMIN = "ADMIN",
  PARTNER = "PARTNER",
}

// Auth method types
export enum AuthMethod {
  JWT = "JWT",
  API_KEY = "API_KEY",
  BOTH = "BOTH",
}

export type AuthOptions = {
  method?: AuthMethod;
  allowedRoles?: string[]; // Works for both admin and partner roles
};

export type JwtPayload = {
  id: number;
  email: string;
  portalType?: PortalType;
  sessionId?: string;
  iat?: number;
  exp?: number;
};
