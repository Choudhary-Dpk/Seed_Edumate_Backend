// import prisma from "../../config/prisma";
// import { LogEmailOptions } from "../../types/email.types";

// export const logEmailHistory = async (options: LogEmailOptions) => {
//   const { to, cc, bcc, type, subject } = options;

//   const emailType = await prisma.emailTypes.upsert({
//     where: { subject },
//     update: {},
//     create: {
//       subject,
//       type,
//     },
//   });

//   const history = await prisma.emailHistory.create({
//     data: {
//       reciepient: to,
//       subject,
//       cc,
//       bcc,
//       email_type_id: emailType.id,
//       sent_at: new Date(),
//     },
//   });

//   return { emailType, history };
// };
