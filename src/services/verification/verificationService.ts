import redisClient from '../../config/redis';
import { addEmailToQueue } from '../../queues/emailQueue';

// 验证码类型
type VerificationType = 'verification' | 'password_reset';

// 验证码有效期（15分钟）
const VERIFICATION_CODE_EXPIRY = 15 * 60;

// 生成6位数字验证码
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 生成Redis key
const generateRedisKey = (email: string, type: string): string => {
  return `verification:${type}:${email}`;
};

export const sendVerificationCode = async (
  email: string, 
  type: 'verification' | 'password_reset' = 'verification'
): Promise<boolean> => {
  try {
    const code = generateVerificationCode();
    const key = generateRedisKey(email, type);
    
    // 存储验证码到Redis，设置15分钟过期
    await redisClient.setEx(key, VERIFICATION_CODE_EXPIRY, code);
    
    // 将邮件发送任务添加到队列
    const queued = await addEmailToQueue(email, code, type);
    if (!queued) {
      // 如果添加到队列失败，删除验证码
      await redisClient.del(key);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
};

export const verifyCode = async (
  email: string, 
  code: string, 
  type: VerificationType = 'verification'
): Promise<boolean> => {
  try {
    const key = generateRedisKey(email, type);
    
    // 获取存储的验证码
    const storedCode = await redisClient.get(key);
    
    if (!storedCode || storedCode !== code) {
      return false;
    }
    
    // 验证成功后删除验证码
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
}; 