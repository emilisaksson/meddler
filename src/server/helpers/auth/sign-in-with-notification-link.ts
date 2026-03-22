import { buildPublicUserResponse } from './build-public-user-response';
import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import {
  issueAccessToken,
  verifyNotificationLinkToken
} from '../../services/tokens/jwt-service';
import { AppError } from '../../utils/app-error';
import { normalizeCountry, normalizeLanguage } from '../../utils/text';

export async function signInWithNotificationLink(input: {
  token: string;
  language?: string | null;
  country?: string | null;
}) {
  const payload = verifyNotificationLinkToken(input.token);
  const [user, conversation] = await Promise.all([
    UserModel.findById(payload.sub).exec(),
    ConversationModel.findById(payload.conversationId).exec()
  ]);

  if (!user || user.email !== payload.email) {
    throw new AppError('The sign-in link is invalid or expired.', 401, {
      code: 'invalid_notification_link'
    });
  }

  if (!conversation) {
    throw new AppError('Conversation not found.', 404, {
      code: 'conversation_not_found'
    });
  }

  const isParticipant = conversation.participants.some(
    (participant) =>
      participant.userId?.toString() === user.id || participant.email === user.email
  );

  if (!isParticipant) {
    throw new AppError('You no longer have access to this conversation.', 403, {
      code: 'conversation_access_denied'
    });
  }

  const language = normalizeLanguage(input.language);
  const country = normalizeCountry(input.country);

  if (!user.language && language) {
    user.language = language;
  }

  if (!user.country && country) {
    user.country = country;
  }

  user.lastLoggedInAt = new Date();
  await user.save();

  return {
    accessToken: issueAccessToken({
      id: user.id,
      email: user.email
    }),
    user: buildPublicUserResponse(user),
    conversationId: conversation.id
  };
}
