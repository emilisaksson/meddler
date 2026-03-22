import mongoose from 'mongoose';
import { appConfig } from '../../app-config';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(appConfig.mongoUrl);
  }

  return connectionPromise;
}
