import { Redis } from "ioredis";
import { Job, Worker } from "bullmq";
import { SubscriptionJob } from "./subscriptionQueue";
import { SubscriptionMapper } from "../mappers/subscription/subscriptionMapper";

export const createSubscriptionWorker = (redisClient: Redis, subscriptionMapper: SubscriptionMapper) => {
   return new Worker('subscriptionQueue', async (job: Job<SubscriptionJob>) => {
    console.log(`Processing subscription job: ${job.id}`);
    console.log('Job data:', job.data);
    
    const { subscriptionId } = job.data;
    
    try {
      // 模拟处理订阅同步
      await new Promise(resolve => setTimeout(resolve, 1000));
      await subscriptionMapper.updateSubscription(subscriptionId, { status: 'active' });
      
      console.log(`✅ Successfully processed subscription ${subscriptionId}`);
      return { success: true, subscriptionId };
    } catch (error) {
      console.error(`❌ Failed to process subscription ${subscriptionId}:`, error);
      throw error;
    }
    
   }, 
   { 
     connection: redisClient,
     concurrency: 5, // 并发处理5个任务
     removeOnComplete: { count: 100 }, // 保留最近100个完成的任务
     removeOnFail: { count: 50 }, // 保留最近50个失败的任务
   });
};