import { NextFunction,Response } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import { createEdumateContactsLeads } from "../services/hubspot.service";
import prisma from "../config/prisma";
import { createEdumateAcademicProfile, createEdumateContact, createEdumateLeadAttribution,createEdumatePersonalInformation, createEdumateSystemTracking } from "../models/helpers/contacts";

export const createContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const {
      intake_year, 
      intake_month, 
      preferred_study_destination, 
      date_of_birth,
      gender, 
      course_type, 
      target_degree_level, 
      admission_status, 
      current_education_level,
      b2b_partner_name, 
      last_name, 
      first_name, 
      phone_number, 
      email,
    } = req.body;

    logger.debug(`Creating hubspot edumate contacts leads application`);
    const lead = await createEdumateContactsLeads([
      {
        email,
        phone: phone_number,
        firstName: first_name,
        lastName: last_name,
        partnerName: b2b_partner_name,
        educationLevel: current_education_level,
        admissionStatus: admission_status,
        targetDegreeLevel: target_degree_level,
        courseType: course_type,
        studyDestination: preferred_study_destination,
        dateOfBirth: date_of_birth,
        gender,
        intakeYear: intake_year,
        intakeMonth: intake_month
      },
    ]);
    logger.debug(`Hubspot loan contacts leads created successfully`);

    // Use database transaction to ensure all related records are created atomically
    const result = await prisma.$transaction(async (tx) => {
      logger.debug(`Creating edumate contact for userId: ${id}`);
      const contact = await createEdumateContact(tx, course_type, lead[0]?.id, id);
      logger.debug(`Contact created successfully with id: ${contact.id}`);

      logger.debug(`Creating personal information for contact: ${contact.id}`);
      await createEdumatePersonalInformation(tx, contact.id, {
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        gender
      });
      logger.debug(`Personal information created successfully for contact: ${contact.id}`)

      logger.debug(`Creating academic profile for contact: ${contact.id}`);
      await createEdumateAcademicProfile(tx, contact.id, {
        admission_status,
        current_education_level,
        target_degree_level,
        preferred_study_destination,
        intake_year,
        intake_month
      });
      logger.debug(`Academic profile created successfully for contact: ${contact.id}`)

      if (b2b_partner_name) {
        logger.debug(`Creating lead attribution for contact: ${contact.id}`);
        await createEdumateLeadAttribution(tx, contact.id, b2b_partner_name);
        logger.debug(`Lead attribution created successfully for contact: ${contact.id}`)
      }

      logger.debug(`Creating system tracking for contact: ${contact.id}`);
      await createEdumateSystemTracking(tx, contact.id, id);
      logger.debug(`System tracking created successfully for contact: ${contact.id}`)

      return contact;
    });

    logger.debug(`All contact data created successfully for contactId: ${result.id}`);
    sendResponse(res, 200, "Contacts Lead created successfully");
  } catch (error) {
    next(error);
  }
};