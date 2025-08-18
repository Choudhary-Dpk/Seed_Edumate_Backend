export type DeviceInfo = {
  browser: string;
  os: string;
  device: string;
};

export type LoginPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
  passwordSetOn?: Date | null;
  ipDetails?: any;
  deviceDetails?: DeviceInfo;
};

export type ResetPasswordPayload = {
  id: number;
};

export type ProtectedPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
};

export type LoginStatus = "success" | "failed" | "logout";
