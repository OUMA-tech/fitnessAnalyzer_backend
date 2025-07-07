import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";
import { SubscriptionDto } from "../../interfaces/entity/subscription";
import { StripeService } from "../stripe/stripeService.interface";
export interface SubscriptionServiceDependencies {
    subscriptionMapper: SubscriptionMapper;
    stripeService: StripeService;
}

export interface SubscriptionService {
    createSubscription(subscription: Partial<SubscriptionDto>): Promise<SubscriptionDto | null>;
    getUserSubscription(userId: string): Promise<SubscriptionDto | null>;
    updateSubscription(userId: string, subscription: SubscriptionDto): Promise<SubscriptionDto | null>;
    deleteSubscriptionByStripeSubscriptionId(subscriptionId: string): Promise<void>;
    updateSubscriptionFromStripe(sessionId: string): Promise<boolean>;
    getSubscriptionHistory(userId: string): Promise<SubscriptionDto[]>;
}

