import { queue } from "async";
import sendMail from "./mail";

const emailQueue = queue(
  async (task: {
    to: string;
    subject: string;
    html: string;
    retry: number;
  }) => {
    try {
      const { to, subject, html } = task;
      await sendMail(to, subject, html);
    } catch (error) {
      console.error(error);

      if (task.retry <= 3) {
        setTimeout(() => {
          emailQueue.push({ ...task, retry: task.retry + 1 });
        }, task.retry * 10 * 1000);
      } else {
        console.error("Email task failed after 3 retries");
      }
    }
  },
  50
);

export { emailQueue };
