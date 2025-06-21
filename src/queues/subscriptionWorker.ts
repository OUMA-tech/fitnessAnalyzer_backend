import { Redis } from "ioredis";
import { Job, Worker } from "bullmq";
import { SubscriptionJob } from "./subscriptionQueue";

export const createSubscriptionWorker = (redisClient: Redis) => {
   return new Worker('subscription', async (job: Job<SubscriptionJob>) => {
    console.log(job.data);
    
   }, 
   { connection: redisClient });
};