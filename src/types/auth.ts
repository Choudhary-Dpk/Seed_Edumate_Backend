export type LoginPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
  passwordSetOn?: Date | null;
};

export type ResetPasswordPayload = {
  id: number;
};

export type ProtectedPayload = {
  id: number;
  email: string;
  passwordHash?: string | null;
};
