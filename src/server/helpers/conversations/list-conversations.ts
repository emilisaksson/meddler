import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { buildConversationSummary, getParticipantKeyForUser } from './shared';

export async function listConversations(userId: string) {
  const conversations = await ConversationModel.find({
    'participants.userId': userId
  })
    .sort({ updatedAt: -1 })
    .exec();

  return conversations.map((conversation) =>
    buildConversationSummary(conversation, getParticipantKeyForUser(conversation, userId))
  );
}
