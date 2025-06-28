import { createConfig } from "../config";
import { createRedisClient } from "../config/redis";
import { createSesClient } from "../config/AWS";
import { createEmailWorker } from "../queues/emailWorker";
import { createEmailService } from "../services/email/emailService";
import { createSubscriptionWorker } from "../queues/subscriptionWorker";
import { createMongoSubscriptionMapper } from "../mappers/subscription/subscriptionMapper.mongo";
import Subscription from "../models/subscriptionModel";

export const createWorkerContainer = () => {
    const config = createConfig();
    const sesClient = createSesClient(config.sesConfig);
    const redisClient = createRedisClient(config.redisConfig);
    const subscriptionMapper = createMongoSubscriptionMapper(Subscription);
    const emailService = createEmailService({
        sesClient,
        source: config.sesConfig.source
    });
    
    return {
        redisClient,
        emailService,
        subscriptionMapper
    };
}
