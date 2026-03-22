import cors from 'cors';
import express from 'express';
import { appConfig } from '../app-config';
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from './routes/auth-routes';
import { conversationRoutes } from './routes/conversation-routes';
import { metaRoutes } from './routes/meta-routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [appConfig.frontendUrl, 'http://localhost:4200']
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_request, response) => {
    response.json({
      name: 'oliveaccord',
      status: 'ok'
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/meta', metaRoutes);

  app.use(errorHandler);

  return app;
}
