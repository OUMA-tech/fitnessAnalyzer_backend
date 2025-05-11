// src/index.ts
import app from './app';
import connectDB from './config/database';
import dotenv from 'dotenv';
import { createRootAdmin } from './utils/initAdmin';

dotenv.config();
const PORT = process.env.PORT||5000;

const JWT = process.env.JWT_SECRET;
console.log(JWT);
const startServer = async () => {
  try {
    await connectDB(); // Database Connection
    await createRootAdmin(); // init root admin
    // Start Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();