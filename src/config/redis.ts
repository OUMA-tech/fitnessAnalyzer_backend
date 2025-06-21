import Redis from 'ioredis';

export const createRedisClient = (config: {
  host: string;
  port: number;
  password?: string;
}) => {
  const client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    maxRetriesPerRequest: null,
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error', err);
  });

  return client;
};
