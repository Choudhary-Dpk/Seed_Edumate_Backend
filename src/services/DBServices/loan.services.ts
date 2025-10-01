import prisma from "../../config/prisma";
import logger from "../../utils/logger";

export const createEligibilityCheckerLeads = async (contactId: number) => {
    try {
        const leads = await prisma.mktEligibilityCheckerLeads.create({
            data: { contact: { connect: { id: contactId } } },
            include: { contact: true },
        });
        return leads;
    } catch (error) {
        console.error("create loan eligibility checker lead error: ", error);
        return ({message: "Already exist with edumate contact id: "+contactId})
        // throw error;
    }
};

export const createEmiCalculatorLeads = async (contactId: number) => {
    try {
        const marketLead = await prisma.mktEmiCalculatorLeads.create({
            data: { contact: { connect: { id: contactId } } },
            include: { contact: true },
        });
        return marketLead;
    } catch (error) {
        console.error("create emi calculator lead error: ", error);
        return ({message: "Already exist with edumate contact id: "+contactId})
    }
};

export const handleLeadCreation = async (
  contactId: number,
  formType: string,
  email: string
): Promise<void> => {
  try {
    let leadResult;

    switch (formType) {
      case 'loan_eligibility_checker':
        leadResult = await createEligibilityCheckerLeads(contactId);
        break;
      case 'loan_emi_calculator':
        leadResult = await createEmiCalculatorLeads(contactId);
        break;
      default:
        logger.warn("Unknown form type", { formType, contactId, email });
        return;
    }

    // Check if lead creation returned an error message
    if (leadResult && 'message' in leadResult && !('id' in leadResult)) {
      logger.info("Lead already exists", {
        contactId,
        formType,
        email,
        message: leadResult.message,
      });
    } else {
      logger.info("Lead created successfully", {
        contactId,
        formType,
        email,
        leadId: leadResult?.id,
      });
    }
  } catch (error) {
    logger.error("Failed to create lead", {
      contactId,
      formType,
      email,
      error: error instanceof Error ? error.message : error,
    });
  }
}