import { ConversationMessageModel } from '../../integrations/mongodb/models/conversation-message-model';
import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { AppError } from '../../utils/app-error';
import { buildConversationDetail, getParticipantKeyForUser } from './shared';

export async function getConversationByIdForUser(conversationId: string, userId: string) {
  const conversation = await ConversationModel.findById(conversationId).exec();

  if (!conversation) {
    throw new AppError('Conversation not found.', 404, {
      code: 'conversation_not_found'
    });
  }

  const selfKey = getParticipantKeyForUser(conversation, userId);
  const threadMessages = await ConversationMessageModel.find({
    conversationId: conversation._id,
    threadOwnerKey: selfKey
  })
    .sort({ createdAt: 1 })
    .exec();

  return buildConversationDetail(conversation, selfKey, threadMessages);
}
