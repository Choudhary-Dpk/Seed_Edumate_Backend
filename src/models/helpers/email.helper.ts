import prisma from "../../config/prisma";
import { LogEmailOptions } from "../../types/email.types";

export const logEmailHistory = async (options: LogEmailOptions) => {
  const { userId, to, cc, bcc, type, subject } = options;

  const emailType = await prisma.emailType.upsert({
    where: { subject },
    update: {},
    create: {
      subject,
      type,
    },
  });

  const history = await prisma.emailHistory.create({
    data: {
      user_id: userId,
      reciepient: to,
      cc,
      bcc,
      email_type_id: emailType.id,
      sent_at: new Date(),
    },
  });

  return { emailType, history };
};
