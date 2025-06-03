import Queue from 'bull';
import { sendVerificationEmail } from '../services/emailService';

interface EmailJob {
  to: string;
  code: string;
  type: 'verification' | 'password_reset';
}

// 创建邮件队列
const emailQueue = new Queue<EmailJob>('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,            // 失败重试3次
    backoff: {              // 重试间隔
      type: 'exponential',
      delay: 1000          // 初始延迟1秒
    },
    removeOnComplete: true, // 完成后删除任务
    timeout: 30000         // 30秒超时
  }
});

// 处理邮件发送
emailQueue.process(async (job) => {
  const { to, code, type } = job.data;
  
  try {
    const sent = await sendVerificationEmail(to, code);
    if (!sent) {
      throw new Error('Failed to send email');
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to send ${type} email to ${to}:`, error);
    throw error; // 抛出错误以触发重试
  }
});

// 监听队列事件
emailQueue.on('completed', (job) => {
  console.log(`✅ Email sent successfully to ${job.data.to}`);
});

emailQueue.on('failed', (job, error) => {
  console.error(`❌ Failed to send email to ${job.data.to}:`, error);
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

// 添加邮件到队列
export const addEmailToQueue = async (to: string, code: string, type: EmailJob['type'] = 'verification'): Promise<boolean> => {
  try {
    await emailQueue.add({ to, code, type });
    return true;
  } catch (error) {
    console.error('Failed to add email to queue:', error);
    return false;
  }
}; 