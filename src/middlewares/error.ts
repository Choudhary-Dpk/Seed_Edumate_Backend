import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/api";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const errStatus = (typeof err?.code === "number" ? err.code : 500) as number;
  const errMsg = err?.message || "Something went wrong";

  sendResponse(res, errStatus, errMsg);
};
