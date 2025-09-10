import { AdmissionStatus, CurrentEducationLevel, EdumateContactCourseType, Gender, PreferredStudyDestination, TargetDegreeLevel } from "@prisma/client";

export type ContactsLead =  {
    email: string;
    phone:string;
    firstName: string;
    lastName:string;
    partnerName?:string;
    educationLevel?:string;
    admissionStatus?:string;
    targetDegreeLevel?:string;
    courseType?:string;
    studyDestination?:string;
    dateOfBirth?:Date;
    gender?:string;
    intakeYear?:string;
    intakeMonth?:string;
}

export const genderMap: Record<string, Gender> = {
  Male: Gender.MALE,
  Female: Gender.FEMALE,
  Other: Gender.OTHER,
  "Prefer not to say": Gender.PREFER_NOT_TO_SAY,
};

export const admissionStatusMap: Record<string, AdmissionStatus> = {
  "Not Applied": AdmissionStatus.NOT_APPLIED,
  "Applied": AdmissionStatus.APPLIED,
  "Interview Scheduled": AdmissionStatus.INTERVIEW_SCHEDULED,
  "Waitlisted": AdmissionStatus.WAITLISTED,
  "Admitted": AdmissionStatus.ADMITTED,
  "Rejected": AdmissionStatus.REJECTED,
};

export const targetDegreeLevelMap: Record<string, TargetDegreeLevel> = {
  "Bachelor's": TargetDegreeLevel.BACHELORS,
  "Master's": TargetDegreeLevel.MASTERS,
  "PhD": TargetDegreeLevel.PHD,
  "Diploma": TargetDegreeLevel.DIPLOMA,
  "Certificate": TargetDegreeLevel.CERTIFICATE,
  "Professional Course": TargetDegreeLevel.PROFESSIONAL_COURSE,
};

export const courseTypeMap: Record<string, EdumateContactCourseType> = {
  STEM: EdumateContactCourseType.STEM,
  Business: EdumateContactCourseType.BUSINESS,
  Others: EdumateContactCourseType.OTHERS,
};

export const preferredStudyDestinationMap: Record<string, PreferredStudyDestination> = {
  US: PreferredStudyDestination.US,
  UK: PreferredStudyDestination.UK,
  UAE: PreferredStudyDestination.UAE,
  Canada: PreferredStudyDestination.CANADA,
  Australia: PreferredStudyDestination.AUSTRALIA,
  Germany: PreferredStudyDestination.GERMANY,
  France: PreferredStudyDestination.FRANCE,
  Singapore: PreferredStudyDestination.SINGAPORE,
  Italy: PreferredStudyDestination.ITALY,
  Japan: PreferredStudyDestination.JAPAN,
};

export const currentEducationLevelMap: Record<string, CurrentEducationLevel> = {
  "High School": CurrentEducationLevel.HIGH_SCHOOL,
  Bachelor: CurrentEducationLevel.BACHELOR,
  Master: CurrentEducationLevel.MASTER,
  PhD: CurrentEducationLevel.PHD,
  Diploma: CurrentEducationLevel.DIPLOMA,
  Other: CurrentEducationLevel.OTHER,
};
