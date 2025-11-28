import { Request } from "express";
import { AuthMethod, PortalType } from "../middlewares";

export type ServerResponse = {
  success: boolean;
  message: string;
  data: any[];
  errors: any[];
};

export interface RequestWithPayload<T, F = undefined> extends Request {
  payload?: T;
  fileData?: F;
  user?: any;
  portalType?: PortalType;
  authMethod?: AuthMethod;
}
