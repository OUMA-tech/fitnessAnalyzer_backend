import { Request, Response } from 'express';
import Stripe from 'stripe';
import Subscription from '../models/subscriptionModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

export const handleWebhook = async (req: Request, res: Response) => {
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
      case 'customer.subscription.deleted':
        console.log('customer.subscription.deleted');
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'invoice.payment_succeeded':
        console.log('invoice.payment_succeeded'); 
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice received:', invoice);
        await handleSuccessfulPayment(invoice);
        break;

      case 'invoice.payment_failed':
        console.log('invoice.payment_failed');
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(failedInvoice);
        break;
    }

    res.send({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send({ message: 'Webhook error' });
  }
};

const handleSubscriptionUpdate = async (subscription: Stripe.Subscription) => {
  try {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000)
      }
    );
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

const handleSuccessfulPayment = async (invoice: Stripe.Invoice & { subscription?: string }) => {
  if (!invoice.subscription) return;
  try {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      { status: 'active' }
    );
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

const handleFailedPayment = async (invoice: Stripe.Invoice & { subscription?: string }) => {
  if (!invoice.subscription) return;

  try {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      { status: 'past_due' }
    );
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}; 