import { SubscriptionPlansMapper } from "../mappers/subscriptionPlans/subscriptionPlansMapper";

export const seedDefaultPlans = async (subscriptionPlansMapper:SubscriptionPlansMapper) => {
  const count = await subscriptionPlansMapper.countDocuments();
  console.log(count);
  if (count > 0) return;

  await subscriptionPlansMapper.insertMany([
    {
      name: 'Basic',
      price: 0.00,
      priceId: 'price_1RfHEXQOwHpTtH5MZ4ksSKwa',
      description: 'Basic plan with essential features',
      features: ['Access to basic features', 'Email support'],
      interval: 'month',
      displayOrder: 1
    },
    {
      name: 'Pro',
      price: 5.00,
      priceId: 'price_1RbKgnQOwHpTtH5MYWGc9w6E',
      description: 'Pro plan with full features and priority support',
      features: ['Everything in Basic', 'Advanced analytics', 'Priority support'],
      interval: 'year',
      displayOrder: 2
    }
  ]);

  console.log('✅ Subscription plans seeded');
};
