import { Router } from 'express';
import { conversationGoalOptions } from '../../helpers/conversations/goal-options';
import { asyncHandler } from '../../utils/async-handler';

export const metaRoutes = Router();

metaRoutes.get(
  '/goals',
  asyncHandler('meta.goals', async (_request, response) => {
    response.json({
      goals: conversationGoalOptions
    });
  })
);
