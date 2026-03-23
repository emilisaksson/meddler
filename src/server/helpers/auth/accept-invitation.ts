import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { INITIAL_USER_CREDITS } from '../../services/billing/credits';
import { issueAccessToken } from '../../services/tokens/jwt-service';
import { AppError } from '../../utils/app-error';
import { hashSecret } from '../../utils/crypto';
import { ensureUserLocale } from '../../utils/locale';
import { buildPublicUserResponse } from './build-public-user-response';
import { getEffectiveConversationStatus, getParticipantByKey } from '../conversations/shared';

export async function acceptInvitation(input: {
  token: string;
  language?: string | null;
  country?: string | null;
}) {
  const conversation = await ConversationModel.findOne({
    'invitation.tokenHash': hashSecret(input.token),
    'invitation.expiresAt': {
      $gt: new Date()
    }
  }).exec();

  if (!conversation) {
    throw new AppError('The invitation link is invalid or expired.', 404, {
      code: 'invitation_not_found'
    });
  }

  if (getEffectiveConversationStatus(conversation) === 'closed') {
    throw new AppError('This conversation is closed.', 409, {
      code: 'conversation_closed'
    });
  }

  const invitee = getParticipantByKey(conversation, 'invitee');
  const inviter = getParticipantByKey(conversation, 'inviter');
  const now = new Date();
  const inviterUser = inviter.userId ? await UserModel.findById(inviter.userId).exec() : null;

  const user = await UserModel.findOneAndUpdate(
    { email: invitee.email },
    {
      $set: {
        lastLoggedInAt: now
      },
      $setOnInsert: {
        email: invitee.email,
        credits: INITIAL_USER_CREDITS,
        personality: null,
        personalityResponses: []
      }
    },
    {
      upsert: true,
      new: true
    }
  ).exec();

  if (!user) {
    throw new AppError('Unable to sign in the invited participant.', 500, {
      code: 'invitee_sign_in_failed'
    });
  }

  ensureUserLocale(user, {
    language: input.language ?? inviterUser?.language ?? null,
    country: input.country ?? inviterUser?.country ?? null
  });

  await user.save();

  invitee.userId = user._id;
  invitee.joinedAt = invitee.joinedAt ?? now;
  conversation.status = 'active';
  conversation.activeParticipantKey = 'invitee';
  conversation.mediatorState = 'idle';
  conversation.lastMediatorError = null;
  conversation.lastActivityAt = now;
  conversation.invitation.acceptedAt = conversation.invitation.acceptedAt ?? now;

  await conversation.save();

  return {
    accessToken: issueAccessToken({
      id: user.id,
      email: user.email
    }),
    user: buildPublicUserResponse(user),
    conversationId: conversation.id
  };
}
