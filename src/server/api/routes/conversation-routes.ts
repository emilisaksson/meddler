import { Router } from 'express';
import { z } from 'zod';
import { createConversation } from '../../helpers/conversations/create-conversation';
import { getConversationByIdForUser } from '../../helpers/conversations/get-conversation';
import { listConversations } from '../../helpers/conversations/list-conversations';
import { sendConversationMessage } from '../../helpers/conversations/send-message';
import { asyncHandler } from '../../utils/async-handler';
import { authenticateRequest, requireAuth } from '../middlewares/authenticate-request';

const createConversationSchema = z.object({
  inviteeEmail: z.string().trim().email(),
  issueDescription: z.string().trim().min(20).max(2_000),
  goalKey: z.string().trim().min(1)
});

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2_000)
});

export const conversationRoutes = Router();

conversationRoutes.use(authenticateRequest);

conversationRoutes.get(
  '/',
  asyncHandler('conversations.list', async (request, response) => {
    const auth = requireAuth(request);
    const conversations = await listConversations(auth.sub);
    response.json({ conversations });
  })
);

conversationRoutes.post(
  '/',
  asyncHandler('conversations.create', async (request, response) => {
    const auth = requireAuth(request);
    const payload = createConversationSchema.parse(request.body);

    const result = await createConversation({
      inviterUserId: auth.sub,
      inviterEmail: auth.email,
      inviteeEmail: payload.inviteeEmail,
      issueDescription: payload.issueDescription,
      goalKey: payload.goalKey
    });

    response.status(201).json(result);
  })
);

conversationRoutes.get(
  '/:conversationId',
  asyncHandler('conversations.getById', async (request, response) => {
    const auth = requireAuth(request);
    const conversationId = z.string().min(1).parse(request.params.conversationId);
    const conversation = await getConversationByIdForUser(conversationId, auth.sub);
    response.json({ conversation });
  })
);

conversationRoutes.post(
  '/:conversationId/messages',
  asyncHandler('conversations.sendMessage', async (request, response) => {
    const auth = requireAuth(request);
    const payload = sendMessageSchema.parse(request.body);
    const conversationId = z.string().min(1).parse(request.params.conversationId);
    const conversation = await sendConversationMessage({
      conversationId,
      userId: auth.sub,
      content: payload.content
    });

    response.status(201).json(conversation);
  })
);
