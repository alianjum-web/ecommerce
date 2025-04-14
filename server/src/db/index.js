import mongoose from 'mongoose';
import env from '../config/env.js';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;