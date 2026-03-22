import mongoose from 'mongoose';
import { appConfig } from './app-config';
import { createApp } from './api/app';
import { connectToDatabase } from './integrations/mongodb/connect-to-database';

async function startServer() {
  await connectToDatabase();

  const app = createApp();
  const server = app.listen(appConfig.port, () => {
    console.log(`oliveaccord backend listening on port ${appConfig.port}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void startServer().catch((error) => {
  console.error('Failed to start oliveaccord backend.', error);
  process.exit(1);
});
