import { URL } from 'node:url';
import { Types } from 'mongoose';
import { appConfig, isProduction } from '../../app-config';
import { sendEmail } from '../../integrations/email/email-client';
import { buildInvitationEmailTemplate } from '../../integrations/email/email-templates';
import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { INITIAL_USER_CREDITS } from '../../services/billing/credits';
import { AppError } from '../../utils/app-error';
import { createInvitationToken, hashSecret } from '../../utils/crypto';
import { addHours } from '../../utils/dates';
import { normalizeEmail } from '../../utils/email';
import { ensureUserLocale } from '../../utils/locale';
import { findConversationGoal } from './goal-options';
import { buildConversationDetail, type ConversationDetailResponse } from './shared';

export async function createConversation(input: {
  inviterUserId: string;
  inviterEmail: string;
  inviteeEmail: string;
  issueDescription: string;
  goalKey: string;
}): Promise<{
  conversation: ConversationDetailResponse;
  acceptUrl?: string;
}> {
  const inviterEmail = normalizeEmail(input.inviterEmail);
  const inviteeEmail = normalizeEmail(input.inviteeEmail);

  if (inviterEmail === inviteeEmail) {
    throw new AppError('You cannot invite your own email address.', 400, {
      code: 'self_invitation_not_allowed'
    });
  }

  const goal = findConversationGoal(input.goalKey);

  if (!goal) {
    throw new AppError('The selected conversation goal is invalid.', 400, {
      code: 'invalid_goal'
    });
  }

  const inviterUser = await UserModel.findById(input.inviterUserId).exec();

  if (!inviterUser) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const inviterLocale = ensureUserLocale(inviterUser);
  const inviteeUser = await UserModel.findOneAndUpdate(
    { email: inviteeEmail },
    {
      $setOnInsert: {
        email: inviteeEmail,
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

  if (!inviteeUser) {
    throw new AppError('Unable to prepare the invited participant.', 500, {
      code: 'invitee_upsert_failed'
    });
  }

  const inviteeLocale = ensureUserLocale(inviteeUser, {
    language: inviterUser.language,
    country: inviterUser.country
  });

  await Promise.all([
    inviterLocale.changed ? inviterUser.save() : Promise.resolve(),
    inviteeLocale.changed ? inviteeUser.save() : Promise.resolve()
  ]);

  const invitationToken = createInvitationToken();
  const now = new Date();

  const conversation = await ConversationModel.create({
    issueDescription: input.issueDescription.trim(),
    goal,
    status: 'pending',
    activeParticipantKey: null,
    mediatorState: 'idle',
    lastMediatorError: null,
    lastActivityAt: now,
    participants: [
      {
        key: 'inviter',
        email: inviterEmail,
        userId: new Types.ObjectId(input.inviterUserId),
        joinedAt: now
      },
      {
        key: 'invitee',
        email: inviteeEmail,
        userId: null,
        joinedAt: null
      }
    ],
    invitation: {
      tokenHash: hashSecret(invitationToken),
      expiresAt: addHours(now, appConfig.invite.expiryHours),
      acceptedAt: null
    }
  });

  const acceptUrl = new URL('/accept-invitation', appConfig.frontendUrl);
  acceptUrl.searchParams.set('token', invitationToken);
  acceptUrl.searchParams.set('conversationId', conversation.id);

  const invitationTemplate = buildInvitationEmailTemplate({
    goalKey: conversation.goal.key,
    language: inviteeUser.language,
    issueDescription: conversation.issueDescription,
    goalLabel: conversation.goal.label,
    acceptUrl: acceptUrl.toString()
  });

  await sendEmail({
    to: inviteeEmail,
    ...invitationTemplate
  });

  return {
    conversation: buildConversationDetail(conversation, 'inviter', []),
    acceptUrl: isProduction ? undefined : acceptUrl.toString()
  };
}
