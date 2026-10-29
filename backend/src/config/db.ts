import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (customUri?: string): Promise<boolean> => {
  const uri = customUri || config.mongoUri;
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    return true;
  } catch (error: any) {
    console.error(`[MongoDB Connection Error] Could not connect to database.`);
    console.error(`Reason: ${error.message}`);
    console.error(`Note: To run with full database persistence, ensure MongoDB is installed locally on port 27017 or provide a valid MONGODB_URI in .env.`);
    return false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('[MongoDB] Error disconnecting:', error);
  }
};
