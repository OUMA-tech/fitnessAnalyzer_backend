import { Queue, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

export interface SubscriptionJob {
  subscriptionId: string;
}

export const createSubscriptionQueue = (redisClient: Redis) => {
  const subscriptionQueue = new Queue<SubscriptionJob>('subscriptionQueue', {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
    }
  });
  const subscriptionQueueEvents = new QueueEvents('subscriptionQueue', {
    connection: redisClient,
  });

  subscriptionQueueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Subscription job ${jobId} completed`);
  });

  subscriptionQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Subscription job ${jobId} failed:`, failedReason);
  });

  subscriptionQueueEvents.on('error', (err) => {
    console.error('❌ Queue error:', err);
  });

  return {
    subscriptionQueue,
    subscriptionQueueEvents,
  };
};

// 入队封装函数
export const enqueueSubscriptionSync = async (
    subscriptionQueue: Queue<SubscriptionJob>,
    subscriptionId: string,
) => {
    try {
        await subscriptionQueue.add('sync-subscription', { subscriptionId });
        return true;
    } catch (error) {
        console.error('❌ Failed to add subscription to queue:', error);
        return false;
    }

};
