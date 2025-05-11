// src/config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
