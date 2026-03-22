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
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await mongoose.disconnect();
  };

  const handleShutdownSignal = () => {
    void shutdown().catch((error) => {
      console.error('Failed to shut down oliveaccord backend cleanly.', error);
    });
  };

  process.on('SIGINT', () => {
    handleShutdownSignal();
  });

  process.on('SIGTERM', () => {
    handleShutdownSignal();
  });
}

void startServer().catch((error) => {
  console.error('Failed to start oliveaccord backend.', error);
  queueMicrotask(() => {
    throw error;
  });
});
