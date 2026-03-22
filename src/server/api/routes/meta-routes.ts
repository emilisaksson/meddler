import { Router } from 'express';
import { conversationGoalOptions } from '../../helpers/conversations/goal-options';

export const metaRoutes = Router();

metaRoutes.get('/goals', (_request, response) => {
  response.json({
    goals: conversationGoalOptions
  });
});
