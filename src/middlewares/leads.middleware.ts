import { Response,NextFunction } from "express"
import { sendResponse } from "../utils/api";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { getLeadById } from "../models/helpers/leads.helper";

export const validateCreateLeads = async(

      req: RequestWithPayload<LoginPayload>,
      res: Response,
      next: NextFunction
)=>{
try {
    // check for leads existence in hubspot
const {id} = req.payload!;
    const existingLead = await getLeadById(id);
    if(existingLead){
        return sendResponse(res,400,"Lead already exists");
    }

    next();
} catch (error) {
    console.error(error);
    sendResponse(res,500,"Error while creating leads");
}
}