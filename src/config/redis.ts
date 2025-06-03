import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// 初始化连接
const initRedis = async () => {
  await redisClient.connect();
};

// 执行连接
initRedis().catch(console.error);

export default redisClient; 