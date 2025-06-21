import { Job, Worker } from "bullmq";
import { EmailJob } from "./emailQueue";
import { Redis } from "ioredis";
import { EmailService } from "../services/email/emailService.interface";


export const createEmailWorker = (emailService: EmailService, redisClient: Redis) => {
    return new Worker<EmailJob>('email', async (job: Job<EmailJob>) => {
      const { to, code, type } = job.data;
  
      const sent = await emailService.sendVerificationEmail(to, code);
  
      if (!sent) {
        throw new Error(`Failed to send ${type} email to ${to}`);
      }
  
      return { success: true };
    }, {
      connection: redisClient,
    });
};