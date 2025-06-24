// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import helmet from 'helmet';

import { createApiContainer, ApiContainer } from './container/api.container';
import { createAuthRoutes } from './routes/authRoutes';
import { createStravaRoutes } from './routes/stravaRoutes';
import { createTrainPlanRoutes } from './routes/trainPlanRoutes';
import { createProfileRoutes } from './routes/profileRoutes';
import { createNutritionRoutes } from './routes/nutritionRoutes';
import { createSubscriptionRoutes } from './routes/subscriptionRoutes';
import { createStripeWebhookRoutes } from './routes/stripeWebhookRoutes';

export const createApp = async (): Promise<Application> => {
  const container: ApiContainer = await createApiContainer();

  const app: Application = express();

  // Load Swagger document
  const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

  app.use('/webhook/stripe', express.raw({ type: 'application/json' }), createStripeWebhookRoutes(container.subscriptionQueue, container.stripeCustomerRedis));

  // ----- Security Middleware -----
  // Uncomment and configure as needed
  // app.use(helmet());
  // app.use(mongoSanitize());
  // app.use(rateLimit({
  //   windowMs: 15 * 60 * 1000,
  //   max: 100,
  //   message: 'Too many requests from this IP, please try again later.'
  // }));

// // 5. Body size limits
// app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));



  app.use(cors({
    origin: 'https://fit-tracker.fyi',
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use((req, res, next) => {
      console.log('--- Incoming Request ---');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Params:', JSON.stringify(req.params, null, 2));
      console.log('Query:', JSON.stringify(req.query, null, 2));
      console.log('------------------------');
      next();
    });

  // CORS
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));

  // Logging
  app.use(morgan('dev'));



  // JSON Body parser
  app.use(bodyParser.json());
  // or simply:
  // app.use(express.json());

  // ----- Routes -----
  app.use('/api/auth', createAuthRoutes(container));
  app.use('/api/records', createStravaRoutes(container));
  app.use('/api/strava', createStravaRoutes(container));
  app.use('/api/trainPlans', createTrainPlanRoutes(container));
  app.use('/api/profile', createProfileRoutes(container));
  app.use('/api/nutrition', createNutritionRoutes(container));
  app.use('/api/subscription', createSubscriptionRoutes(container));

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  return app;
};
