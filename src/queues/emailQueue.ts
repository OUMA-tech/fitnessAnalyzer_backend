// emailQueue.ts

import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import { Redis } from 'ioredis';

export interface EmailJob {
  to: string;
  code: string;
  type: 'verification' | 'password_reset';
}

export const createEmailQueue = (redisClient: Redis) => {
  const emailQueue = new Queue<EmailJob>('email', {
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

  const emailQueueEvents = new QueueEvents('email', {
    connection: redisClient,
  });

  emailQueueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Email job ${jobId} completed`);
  });

  emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Email job ${jobId} failed:`, failedReason);
  });

  emailQueueEvents.on('error', (err) => {
    console.error('❌ Queue error:', err);
  });

  return {
    emailQueue,
    emailQueueEvents,
  };
};


export const addEmailToQueue = async (
  emailQueue: Queue<EmailJob>,
  to: string,
  code: string,
  type: EmailJob['type'] = 'verification',
  options?: JobsOptions
): Promise<boolean> => {
  try {
    await emailQueue.add('sendEmail', { to, code, type }, options);
    return true;
  } catch (error) {
    console.error('❌ Failed to add email to queue:', error);
    return false;
  }
};
