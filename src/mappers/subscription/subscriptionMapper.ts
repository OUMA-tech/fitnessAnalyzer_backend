import { SubscriptionModel } from "../../models/subscriptionModel";

export interface SubscriptionMapper {
    findById: (id: string) => Promise<SubscriptionModel | null>;
    findByUserId: (userId: string) => Promise<SubscriptionModel | null>;
    create: (userId: string) => Promise<SubscriptionModel>;
    update: (id: string, subscription: SubscriptionModel) => Promise<SubscriptionModel | null>;
    delete: (id: string) => Promise<boolean>;
}