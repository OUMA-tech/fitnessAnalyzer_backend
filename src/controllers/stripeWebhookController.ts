import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createStripeCustomerRedis } from '../mappers/stripeCustomer/stripeCustomerRedisMapper';
import { enqueueSubscriptionSync, SubscriptionJob } from '../queues/subscriptionQueue';
import { Queue } from 'bullmq';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});


export const createHandleStripeWebhookController = (subscriptionQueue: Queue<SubscriptionJob>, stripeCustomerRedis: ReturnType<typeof createStripeCustomerRedis>) => {
  return {
    stripeWebhookHandler: async (req: Request, res: Response) => {
      const sig = req.headers['stripe-signature'];
      
      if (!sig) {
        res.status(400).send({ message: 'No signature found' });
        return;
      }
    
      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
    
        switch (event.type) {
          case 'customer.subscription.updated':
            console.log('customer.subscription.updated');
            break;
          case 'customer.subscription.deleted':
            console.log('customer.subscription.deleted');
            break;
    
          case 'invoice.payment_succeeded':
            console.log('invoice.payment_succeeded'); 
            const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
            console.log('Invoice received:', invoice);
    
            const reason = invoice.billing_reason;
            if (invoice.billing_reason === 'subscription_update') {
              // Get subscription ID from the invoice
              const subscriptionId = invoice.subscription!;
              const customerId = invoice.customer as string;
              const userId = await stripeCustomerRedis.getUserId(customerId);
              if (!userId) {
                res.status(400).send({ message: 'User not found' });
                return;
              }
              // 保存订阅信息到数据库
              enqueueSubscriptionSync(subscriptionQueue,subscriptionId);
            }
          
            if (reason === "subscription_create") {
              // 🎉 用户第一次订阅成功
              console.log("New subscription created");

              // 在数据库中创建订阅记录
            } else if (reason === "subscription_update") {
              // 🔄 用户升级/降级了订阅
              console.log("User updated subscription");
              // 从 invoice.lines 中获取新 plan
              const lineItem = invoice.lines.data[0] as Stripe.InvoiceLineItem & { price?: { id: string } };
              const newPriceId = lineItem.price?.id;
          
              // 更新数据库订阅记录（如 plan、价格）
            } else if (reason === "subscription_cycle") {
              console.log("Recurring payment");
              // 更新续费时间等
            }
            break;
    
          case 'invoice.payment_failed':
            console.log('invoice.payment_failed');
            break;
        }
    
        res.send({ received: true });
      } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send({ message: 'Webhook error' });
      }
    },
  };
};