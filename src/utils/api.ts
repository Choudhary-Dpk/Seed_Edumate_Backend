import { randomInt } from "crypto";
import { ServerResponse } from "../types/api.types";
import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = [],
  errors: Record<string, any>[] = []
): void => {
  const response: ServerResponse = {
    success: true,
    data: [],
    message: "",
    errors: [],
  };

  if ([200, 201, 202, 203, 204].includes(statusCode)) {
    response.success = true;
  } else {
    response.success = false;
  }

  response.data = data;
  response.message = message ?? "";
  response.errors = errors;

  res.status(statusCode).json(response);
};

export const generateOtp = () => {
  return new Promise<string>((resolve, reject) => {
    randomInt(100000, 999999, (err, num) => {
      if (err) {
        reject(err);
      } else {
        resolve(num.toString());
      }
    });
  });
};
