import Redis from "ioredis";
import { UserMapper } from "../user/userMapper";
export const createStripeCustomerRedis = (redis: Redis, userMapper: UserMapper) => {
    const PREFIX = 'stripe:customer:';
    return {
        getUserId: async (customerId: string): Promise<string | null> => {
            const key = `${PREFIX}${customerId}`;
            let userId = await redis.get(key);
            if (userId) return userId;

            // fallback 查数据库
            const user = await userMapper.getUserByStripeCustomerId(customerId);
            if (!user) return null;

            userId = user.id;
            await redis.set(key, userId); // 写回缓存
            return userId;
        },
  
        setUserId: async (customerId: string, userId: string, ttl?: number) => {
            const key = `${PREFIX}${customerId}`;
            if (ttl) {
                await redis.set(key, userId, 'EX', ttl);
            } else {
                await redis.set(key, userId);
            }
        },
  
        delete: async (customerId: string) => {
            const key = `${PREFIX}${customerId}`;
            await redis.del(key);
        },
    };
};