export interface SubscriptionPlanDto {
  id: string;              // = _id from MongoDB
  name: string;
  price: number;
  priceId: string;         // Stripe 对应的 price_xxx
  description: string;
  features: string[];
  interval: 'month' | 'year';
  displayOrder:number;
}