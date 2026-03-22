import { ConversationMessageModel } from '../../integrations/mongodb/models/conversation-message-model';
import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { buildPublicUserResponse } from '../auth/build-public-user-response';
import { getUserCredits } from '../../services/billing/credits';
import { AppError } from '../../utils/app-error';
import { getConversationByIdForUser } from './get-conversation';
import {
  getEffectiveConversationStatus,
  getParticipantKeyForUser
} from './shared';
import { processConversationTurn } from '../../services/mediator/process-conversation-turn';

export async function sendConversationMessage(input: {
  conversationId: string;
  userId: string;
  content: string;
}) {
  const conversation = await ConversationModel.findById(input.conversationId).exec();
  const user = await UserModel.findById(input.userId).exec();

  if (!conversation) {
    throw new AppError('Conversation not found.', 404, {
      code: 'conversation_not_found'
    });
  }

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  if (getUserCredits(user) <= 0) {
    throw new AppError('You have no credits left. Please top up before sending more replies.', 402, {
      code: 'insufficient_credits'
    });
  }

  const selfKey = getParticipantKeyForUser(conversation, input.userId);
  const effectiveStatus = getEffectiveConversationStatus(conversation);

  if (effectiveStatus !== 'active') {
    throw new AppError('This conversation is not ready for replies.', 409, {
      code: 'conversation_not_active'
    });
  }

  if (conversation.mediatorState === 'processing') {
    throw new AppError('Olive is still preparing the next reply.', 409, {
      code: 'mediator_already_processing'
    });
  }

  if (conversation.mediatorState === 'failed') {
    throw new AppError('Olive is temporarily unavailable for this conversation.', 409, {
      code: 'mediator_failed'
    });
  }

  if (conversation.activeParticipantKey !== selfKey) {
    throw new AppError('It is not your turn to reply.', 409, {
      code: 'not_your_turn'
    });
  }

  await ConversationMessageModel.create({
    conversationId: conversation._id,
    threadOwnerKey: selfKey,
    authorType: 'participant',
    authorParticipantKey: selfKey,
    content: input.content.trim()
  });

  conversation.activeParticipantKey = null;
  conversation.mediatorState = 'processing';
  conversation.lastMediatorError = null;
  conversation.lastActivityAt = new Date();
  await conversation.save();

  try {
    await processConversationTurn(conversation.id, selfKey);
  } catch (error) {
    console.error('Olive turn processing failed.', error);
  }

  const [updatedConversation, updatedUser] = await Promise.all([
    getConversationByIdForUser(input.conversationId, input.userId),
    UserModel.findById(input.userId).exec()
  ]);

  return {
    conversation: updatedConversation,
    user: buildPublicUserResponse(updatedUser ?? user)
  };
}
