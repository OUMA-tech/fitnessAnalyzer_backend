import Stripe from "stripe";
import { UserDto } from "../../interfaces/entity/user";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";
import { UserMapper } from "../../mappers/user/userMapper";
import { createStripeCustomerRedis } from "../../mappers/stripeCustomer/stripeCustomerRedisMapper";

export interface StripeService {
    createCustomer: (user: UserDto) => Promise<string>;
    createCheckoutSession: (customerId: string, userId: string, priceId: string) => Promise<string | null>;
    createSubscription: (userId: string, priceId: string) => Promise<string | null>;
    cancelSubscription: (subscriptionId: string) => Promise<boolean>;
    updateSubscription: (userId: string, priceId: string) => Promise<string | null>;
}

export interface StripeServiceDependencies {
    stripe: Stripe;
    appUrl: string;
    subscriptionMapper: SubscriptionMapper;
    userMapper: UserMapper;
    stripeCustomerRedis: ReturnType<typeof createStripeCustomerRedis>;
}