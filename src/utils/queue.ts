// import { queue } from "async";
// import sendMail from "./mail";
// import { de } from "zod/v4/locales/index.cjs";

// interface EmailTask {
//   to: string;
//   subject: string;
//   html: string;
//   from?: string;
//   cc?: string;
//   bcc?: string;
//   retry: number;
//   attachments?: Array<{
//     filename: string;
//     path?: string;  
//     content?: Buffer | string;
//     contentType?: string;
//   }>;
// }

// const emailQueue = queue(async (task: EmailTask) => {
//   try {
//     const { to, subject, html, from, cc, bcc, attachments } = task;

//     console.log("Processing email task:", {
//       to,
//       cc: cc || "none",
//       bcc: bcc || "none",
//       subject,
//       retry: task.retry,
//     });

//     await sendMail({
//       to,
//       subject,
//       html,
//       from,
//       cc,
//       bcc,
//       attachments,
//     });

//     console.log("Email sent successfully via queue");
//   } catch (error) {
//     console.error("Email queue error:", error);

//     if (task.retry <= 3) {
//       console.log(`Retrying email (attempt ${task.retry + 1}/3)...`);
//       setTimeout(() => {
//         emailQueue.push({ ...task, retry: task.retry + 1 });
//       }, task.retry * 10 * 1000);
//     } else {
//       console.error("Email task failed after 3 retries");
//     }
//   }
// }, 50);

// export { emailQueue };
