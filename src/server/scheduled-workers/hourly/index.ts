import mongoose from 'mongoose';
import { pruneExpiredArtifacts } from '../../helpers/maintenance/prune-expired-artifacts';
import { connectToDatabase } from '../../integrations/mongodb/connect-to-database';

async function runHourlyWorker() {
  await connectToDatabase();
  const result = await pruneExpiredArtifacts();

  console.log('oliveaccord hourly worker completed.', result);

  await mongoose.disconnect();
}

void runHourlyWorker().catch((error) => {
  console.error('oliveaccord hourly worker failed.', error);
  queueMicrotask(() => {
    throw error;
  });
});
