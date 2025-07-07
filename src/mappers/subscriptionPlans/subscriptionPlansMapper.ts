import { SubscriptionPlanDto } from "../../interfaces/entity/subscriptionPlans";

export interface SubscriptionPlansMapper {
  countDocuments():Promise<number>,
  insertMany(subscriptionPlans:Partial<SubscriptionPlanDto>[]):Promise<Boolean>,
  findAll():Promise<SubscriptionPlanDto[] | null>,
}