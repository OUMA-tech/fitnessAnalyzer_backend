import express from "express";
import { createHandleStripeWebhookController } from "../controllers/stripeWebhookController";
import { Queue } from "bullmq";
import { SubscriptionJob } from "../queues/subscriptionQueue";
import { createStripeCustomerRedis } from "../mappers/stripeCustomer/stripeCustomerRedisMapper";
import { ApiContainer } from "../container/api.container";

export const createStripeWebhookRoutes = (subscriptionQueue: Queue<SubscriptionJob>, stripeCustomerRedis: ReturnType<typeof createStripeCustomerRedis>,container:ApiContainer) => {
    
    const router = express.Router();
    const handleStripeWebhook = createHandleStripeWebhookController(subscriptionQueue, stripeCustomerRedis, container.config.stripeConfig);

    // 注意：Stripe 要求原始 body 处理（不能使用 bodyParser.json）
    router.post("/", handleStripeWebhook.stripeWebhookHandler);

    return router;
}
