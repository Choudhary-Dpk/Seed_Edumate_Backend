export type ResetPasswordPayload = {
  id: number;
};

export type ProtectedPayload = {
  id: string;
  email: string;
  passwordHash?: string | null;
};