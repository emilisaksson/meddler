import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import cors from 'cors';
import express from 'express';
import { appConfig } from '../app-config';
import { apiNotFoundHandler } from './middlewares/api-not-found';
import { errorHandler } from './middlewares/error-handler';
import { requestLogging } from './middlewares/request-logging';
import { authRoutes } from './routes/auth-routes';
import { conversationRoutes } from './routes/conversation-routes';
import { metaRoutes } from './routes/meta-routes';

function resolveFrontendBuildDirectory(): string | null {
  const candidates = [
    resolve(process.cwd(), 'dist', 'client', 'browser'),
    resolve(process.cwd(), 'dist', 'client'),
    resolve(__dirname, '..', 'client', 'browser'),
    resolve(__dirname, '..', 'client'),
    resolve(__dirname, '..', '..', 'client', 'browser'),
    resolve(__dirname, '..', '..', 'client')
  ];

  return candidates.find((directory) => existsSync(resolve(directory, 'index.html'))) ?? null;
}

export function createApp() {
  const app = express();
  const frontendBuildDirectory = resolveFrontendBuildDirectory();

  app.use(
    cors({
      origin: [appConfig.frontendUrl, 'http://localhost:4200']
    })
  );
  app.use(requestLogging);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_request, response) => {
    response.locals.routeName = 'api.health';
    response.json({
      name: 'oliveaccord',
      status: 'ok'
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/meta', metaRoutes);
  app.use('/api', apiNotFoundHandler);

  if (frontendBuildDirectory) {
    app.use(express.static(frontendBuildDirectory, { index: false }));
    app.get(/^\/(?!api(?:\/|$)).*/, (_request, response) => {
      response.sendFile(resolve(frontendBuildDirectory, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
