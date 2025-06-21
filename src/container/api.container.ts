// src/container.ts
import { createMongoUserMapper } from '../mappers/user/userMapper.mongo';
import { createAuthService } from '../services/auth/authService';
import { createConfig, JwtConfig } from '../config/index';
import User from '../models/userModel';
import Subscription from '../models/subscriptionModel';
import { createMongoSubscriptionMapper } from '../mappers/subscription/subscriptionMapper.mongo';
import { createSubscriptionService } from '../services/subscription/subscriptionService';
import { createRedisClient } from '../config/redis';
import { createVerificationService } from '../services/verification/verificationService';
import { createEmailQueue } from '../queues/emailQueue';
import connectDB from '../config/database';
import StravaActivity from '../models/stravaActivityModel';
import { createMongoStravaActivityMapper } from '../mappers/stravaActivity/stravaActivityMapper.mongo';
import { createStravaService } from '../services/stravaActivity/stravaService';
import { createMongoTrainPlanMapper } from '../mappers/trainPlan/trainPlanMapper.mongo';
import TrainPlan from '../models/trainPlanModel';
import { createTrainPlanService } from '../services/trainPlan/trainPlanService';
import SubTask from '../models/subTaskModel';
import { createMongoSubTaskMapper } from '../mappers/subTask/subTaskMapper.mongo';
import { createNutritionService } from '../services/nutrition/nutritionService';
import { createStripeClient } from '../config/stripe';
import { createStripeService } from '../services/stripe/stripeService';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { createStripeCustomerRedis } from '../mappers/stripeCustomer/stripeCustomerRedisMapper';
import { createSubscriptionQueue } from '../queues/subscriptionQueue';

export const createApiContainer = async () => {

  await connectDB();

  const config = createConfig();

  const redisClient = createRedisClient(config.redisConfig);

  const { emailQueue } = createEmailQueue(redisClient);

  const { subscriptionQueue } = createSubscriptionQueue(redisClient);

  const {stripe, SUBSCRIPTION_PLANS, appUrl} = createStripeClient(config.stripeConfig);

 
  // 1. create mappers
  const userMapper = createMongoUserMapper(User);

  const subscriptionMapper = createMongoSubscriptionMapper(Subscription);

  const stravaActivityMapper = createMongoStravaActivityMapper(StravaActivity);

  const trainPlanMapper = createMongoTrainPlanMapper(TrainPlan);

  const subTaskMapper = createMongoSubTaskMapper(SubTask);

  const stripeCustomerRedis = createStripeCustomerRedis(redisClient, userMapper);

  // 2. create services
  const subscriptionService = createSubscriptionService({
    subscriptionMapper
  });

  const verificationService = createVerificationService({
    emailQueue,
    redisClient
  });

  const authService = createAuthService({
    userMapper,
    subscriptionService,
    jwtConfig: config.jwtConfig,
    verificationService
  });

  const stravaService = createStravaService({
    stravaActivityMapper,
    userMapper
  });

  const trainPlanService = createTrainPlanService({
    trainPlanMapper,
    subTaskMapper
  });

  const nutritionService = createNutritionService({
    stravaActivityMapper
  });

  const stripeService = createStripeService({
    stripe,
    appUrl,
    subscriptionMapper,
    userMapper,
    stripeCustomerRedis
  });

  // middleware
  const authMiddleware = createAuthMiddleware(config.jwtConfig, userMapper);


  // 3. 返回容器
  return {
    // redis
    redisClient,
    // queues
    emailQueue,
    subscriptionQueue,
    // mappers
    userMapper,
    subscriptionMapper,
    stripeCustomerRedis,
    // services
    authService,
    subscriptionService,
    stravaService,
    trainPlanService,
    nutritionService,
    stripeService,
    // config
    config,
    authMiddleware
  };
};

export type ApiContainer = Awaited<ReturnType<typeof createApiContainer>>;