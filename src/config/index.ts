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

export interface StripeConfig {
    secretKey: string;
    basicPriceId: string;
    proPriceId: string;
    appUrl: string;
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
      maxRetriesPerRequest: null,
    } as RedisConfig,
    sesConfig: {
      region: process.env.AWS_REGION || 'ap-southeast-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      source: `noreply@${process.env.DOMAIN_NAME}` || ''
    } as SesConfig,
    stripeConfig: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      basicPriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
      proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
      appUrl: process.env.APP_URL || '',
    } as StripeConfig,
  };
};
