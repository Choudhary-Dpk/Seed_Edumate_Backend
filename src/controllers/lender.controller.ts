import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/api";
import { getLendersList } from "../models/helpers/lender.helper";
import { getLoanProductsByLender } from "../models/helpers/loanProduct.helper";

export const getLenderListController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderList = await getLendersList();
    sendResponse(res, 200, "Lenders fetched successfully", lenderList);
  } catch (error) {
    next(error);
  }
};

export const getLoanProductsByLenderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenderId = Number(req.query.id);
    if (!lenderId) {
      throw Error("Lender Id is required");
    }

    const loanProducts = await getLoanProductsByLender(lenderId);

    sendResponse(res, 200, "Loan Products fetch successfully", loanProducts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};