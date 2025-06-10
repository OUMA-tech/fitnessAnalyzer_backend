// src/config/database.ts
import mongoose from 'mongoose';

const connectDB = async (mongoUri: string) => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
