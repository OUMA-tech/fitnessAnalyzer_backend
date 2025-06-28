// src/config/database.ts
import mongoose from 'mongoose';
import { DatabaseConfig } from '.';

const connectDB = async (config:DatabaseConfig) => {
  try {
    await mongoose.connect(config.uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
