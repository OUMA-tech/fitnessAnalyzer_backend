// src/index.ts
import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import stravaRoutes from './routes/stravaRoutes'
import trainPlanRoutes from './routes/trainPlanRoutes'
import profileRoutes from './routes/profileRoutes'


const app: Application = express();

// Middleware
app.use(cors({
  origin: 'https://fitness-analyzer-fronend-59mzv667m-ouma-techs-projects.vercel.app/',
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
// app.use('/api/books', bookRoutes);
// app.use('/api/cart', cartRoutes);

  


export default app;