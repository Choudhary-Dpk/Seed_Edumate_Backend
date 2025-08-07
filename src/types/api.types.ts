export type ServerResponse = {
  success: boolean;
  message: string;
  data: any[];
  errors: any[];
};

// export interface RequestWithPayload<T> extends Request {
//   payload?: T;
// }

export interface ProtectedPayload {
  id: number;
  email: string;
  passwordHash: string;
}

export interface RequestWithPayload<T = ProtectedPayload> extends Request {
  payload?: T;
}