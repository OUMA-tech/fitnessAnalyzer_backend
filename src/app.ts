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

  // XSS sanitize middleware
  app.use((req, res, next) => {
    if (req.body) {
      const sanitizeObject = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            obj[key] = xss(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };
      sanitizeObject(req.body);
    }
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
