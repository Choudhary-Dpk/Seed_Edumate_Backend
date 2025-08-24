import { Request } from "express";

export type ServerResponse = {
  success: boolean;
  message: string;
  data: any[];
  errors: any[];
};

export interface RequestWithPayload<T, F = undefined> extends Request {
  payload?: T;
  fileData?: F;
}
