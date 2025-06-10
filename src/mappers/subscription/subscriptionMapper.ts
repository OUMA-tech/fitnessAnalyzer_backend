import { SubscriptionModel } from "../../interfaces/entity/subscription";

export interface SubscriptionMapper {
    findById: (id: string) => Promise<SubscriptionModel | null>;
    findByUserId: (userId: string) => Promise<SubscriptionModel | null>;
    create: (userId: string) => Promise<SubscriptionModel>;
    update: (id: string, subscription: SubscriptionModel) => Promise<SubscriptionModel | null>;
    delete: (id: string) => Promise<void>;
}