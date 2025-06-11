// src/index.ts
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

import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import stravaRoutes from './routes/stravaRoutes'
import trainPlanRoutes from './routes/trainPlanRoutes'
import profileRoutes from './routes/profileRoutes'
import nutritionRoutes from './routes/nutritionRoutes'

const app: Application = express();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

// Security Middleware
// // 1. Helmet for basic security headers
// app.use(helmet());

// // 2. Data Sanitization against NoSQL query injection
// app.use(mongoSanitize());

// // 3. Data Sanitization against XSS
// app.use((req, res, next) => {
//   if (req.body) {
//     // Recursively sanitize all string values in the request body
//     const sanitizeObject = (obj: any) => {
//       for (let key in obj) {
//         if (typeof obj[key] === 'string') {
//           obj[key] = xss(obj[key]);
//         } else if (typeof obj[key] === 'object' && obj[key] !== null) {
//           sanitizeObject(obj[key]);
//         }
//       }
//     };
//     sanitizeObject(req.body);
//   }
//   next();
// });

// // 4. Rate limiting - limits each IP to 100 requests per 15 minutes
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

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
app.use(express.json());
// app.options('*', cors());
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/strava', stravaRoutes);
app.use('/api/trainPlans', trainPlanRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/nutrition', nutritionRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/cart', cartRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;