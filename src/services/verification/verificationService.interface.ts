
import { Queue } from "bullmq";
import Redis from "ioredis";

export interface VerificationService {
    sendVerificationCode(email: string, type: 'verification' | 'password_reset'): Promise<boolean>;
    verifyCode(email: string, code: string): Promise<boolean>;
}

export interface VerificationServiceDependencies {
    emailQueue: Queue;
    redisClient: Redis;
}

