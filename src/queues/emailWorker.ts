import { Job, Worker } from "bullmq";
import { sendVerificationEmail } from "../services/email/emailService";
import { EmailJob } from "./emailQueue";
import { createRedisClient } from "../config/redis";
import { createConfig } from "../config";


const config = createConfig();

const redisClient = createRedisClient(config.redisConfig);

export const createEmailWorker = () => {
    return new Worker<EmailJob>('email', async (job: Job<EmailJob>) => {
      const { to, code, type } = job.data;
  
      const sent = await sendVerificationEmail(to, code);
  
      if (!sent) {
        throw new Error(`Failed to send ${type} email to ${to}`);
      }
  
      return { success: true };
    }, {
      connection: redisClient,
    });
  };