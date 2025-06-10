// config/index.ts
// import { createDatabaseConfig } from './database';
// import { createRedisConfig } from './redis';
// import { createSwaggerConfig } from './swagger';


export interface JwtConfig {
    secret: string;
    expiresIn: number;
}

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}

export interface SesConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    source: string;
}

export const createConfig = () => {
  return {
    // database: createDatabaseConfig(),
    // redis: createRedisConfig(),
    // swagger: createSwaggerConfig(),
    jwtConfig: {
      secret: process.env.JWT_SECRET || '',
      expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    } as JwtConfig,
    redisConfig: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    } as RedisConfig,
    sesConfig: {
      region: process.env.AWS_REGION || 'ap-southeast-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      source: `noreply@${process.env.DOMAIN_NAME}` || ''
    } as SesConfig,
  };
};
