import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { ApiContainer } from './container/api.container';
import { createAuthRoutes } from './routes/authRoutes';
import { createStravaRoutes } from './routes/stravaRoutes';
import { createTrainPlanRoutes } from './routes/trainPlanRoutes';
import { createProfileRoutes } from './routes/profileRoutes';
import { createNutritionRoutes } from './routes/nutritionRoutes';
import { createSubscriptionRoutes } from './routes/subscriptionRoutes';
import { createStripeWebhookRoutes } from './routes/stripeWebhookRoutes';

export const createApp = async (container: ApiContainer): Promise<Application> => {
  const app: Application = express();

  app.use('/webhook/stripe', express.raw({ type: 'application/json' }), createStripeWebhookRoutes(container.subscriptionQueue, container.stripeCustomerRedis, container));

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));

  app.use(bodyParser.json());
  app.use(morgan('dev'));

  // Routes
  app.use('/api/auth', createAuthRoutes(container));
  app.use('/api/records', createStravaRoutes(container));
  app.use('/api/strava', createStravaRoutes(container));
  app.use('/api/trainPlans', createTrainPlanRoutes(container));
  app.use('/api/profile', createProfileRoutes(container));
  app.use('/api/nutrition', createNutritionRoutes(container));
  app.use('/api/subscription', createSubscriptionRoutes(container));

  return app;
};
