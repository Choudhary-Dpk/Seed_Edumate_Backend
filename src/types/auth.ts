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