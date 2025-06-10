import { Request, Response } from 'express';
import * as stripeService from '../services/stripeService';
import Subscription from '../models/subscriptionModel';
import { AuthRequest } from '../types/auth';
import { Types } from 'mongoose';

export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    res.json(stripeService.SUBSCRIPTION_PLANS);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
};

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { priceId } = req.body;
    const userId = req.user?._id as Types.ObjectId;

    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (existingSubscription) {
      res.status(400).json({
        message: 'User already has an active subscription'
      });
      return;
    }

    let customer;
    if (!req.user!.stripeCustomerId) {
      customer = await stripeService.createCustomer(req.user!);
    } else {
      customer = { id: req.user!.stripeCustomerId };
    }

    const subscription = await stripeService.createSubscription(
      customer.id,
      priceId,
      userId.toString()
    );

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      message: 'Error creating subscription'
    });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: req.user!._id
    });

    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found'
      });
      return;
    }

    const canceledSubscription = await stripeService.cancelSubscription(subscriptionId);
    res.json(canceledSubscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      message: 'Error canceling subscription'
    });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { newPriceId } = req.body;

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: req.user!._id
    });

    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found'
      });
      return;
    }

    const updatedSubscription = await stripeService.updateSubscription(
      subscriptionId,
      newPriceId
    );

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      message: 'Error updating subscription'
    });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user!._id,
      status: 'active'
    });

    res.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      message: 'Error fetching subscription status'
    });
  }
}; 