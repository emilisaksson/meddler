import { URL } from 'node:url';
import { appConfig } from '../../app-config';
import { sendEmail } from '../../integrations/email/email-client';
import { buildMediatorNotificationEmailTemplate } from '../../integrations/email/email-templates';
import { AiTransactionModel } from '../../integrations/mongodb/models/ai-transaction-model';
import { ConversationMessageModel } from '../../integrations/mongodb/models/conversation-message-model';
import { ConversationModel, type ParticipantKey } from '../../integrations/mongodb/models/conversation-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { calculateCreditCost, getUserCredits } from '../billing/credits';
import { AppError } from '../../utils/app-error';
import { issueNotificationLinkToken } from '../tokens/jwt-service';
import { buildMediatorReply } from './build-mediator-reply';
import { getPersonalityMarkdown } from '../../helpers/auth/personality-profile';
import { getOtherParticipantKey, getParticipantByKey } from '../../helpers/conversations/shared';

export async function processConversationTurn(
  conversationId: string,
  senderKey: ParticipantKey
): Promise<void> {
  const conversation = await ConversationModel.findById(conversationId).exec();

  if (!conversation) {
    throw new AppError('Conversation not found.', 404, {
      code: 'conversation_not_found'
    });
  }

  const recipientKey = getOtherParticipantKey(senderKey);
  const senderParticipant = getParticipantByKey(conversation, senderKey);
  const recipientParticipant = getParticipantByKey(conversation, recipientKey);
  const latestSenderMessage = await ConversationMessageModel.findOne({
    conversationId: conversation._id,
    authorType: 'participant',
    authorParticipantKey: senderKey
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!latestSenderMessage) {
    throw new AppError('No participant message was available for mediation.', 500, {
      code: 'missing_participant_message'
    });
  }

  const historyMessages = await ConversationMessageModel.find({
    conversationId: conversation._id
  })
    .sort({ createdAt: 1 })
    .exec();

  const [senderUser, recipientUser] = await Promise.all([
    senderParticipant.userId ? UserModel.findById(senderParticipant.userId).exec() : Promise.resolve(null),
    recipientParticipant.userId
      ? UserModel.findById(recipientParticipant.userId).exec()
      : Promise.resolve(null)
  ]);

  if (!senderUser) {
    throw new AppError('The sending participant could not be loaded.', 404, {
      code: 'sender_user_not_found'
    });
  }

  try {
    const mediatorReply = await buildMediatorReply({
      issueDescription: conversation.issueDescription,
      goalLabel: conversation.goal.label,
      senderKey,
      recipientKey,
      senderPersonality: getPersonalityMarkdown(senderUser),
      recipientPersonality: recipientUser ? getPersonalityMarkdown(recipientUser) : null,
      latestSenderMessage: latestSenderMessage.content,
      history: historyMessages.map((message) => ({
        kind: message.authorType,
        actorKey: message.authorParticipantKey ?? undefined,
        recipientKey: message.authorType === 'mediator' ? message.threadOwnerKey : undefined,
        createdAt: message.createdAt,
        content: message.content
      }))
    });

    const creditsBalanceBefore = getUserCredits(senderUser);
    const cost = calculateCreditCost(mediatorReply.usage.totalTokens);
    const creditsBalanceAfter = Math.max(
      0,
      Number((creditsBalanceBefore - cost).toFixed(2))
    );

    senderUser.credits = creditsBalanceAfter;
    await senderUser.save();

    await AiTransactionModel.create({
      userId: senderUser._id,
      conversationId: conversation._id,
      messageId: latestSenderMessage._id,
      provider: mediatorReply.provider,
      model: mediatorReply.model,
      inputTokens: mediatorReply.usage.inputTokens,
      outputTokens: mediatorReply.usage.outputTokens,
      cacheCreationInputTokens: mediatorReply.usage.cacheCreationInputTokens,
      cacheReadInputTokens: mediatorReply.usage.cacheReadInputTokens,
      totalTokens: mediatorReply.usage.totalTokens,
      cost,
      creditsBalanceBefore,
      creditsBalanceAfter
    });

    await ConversationMessageModel.create({
      conversationId: conversation._id,
      threadOwnerKey: recipientKey,
      authorType: 'mediator',
      authorParticipantKey: null,
      content: mediatorReply.content
    });

    conversation.activeParticipantKey = recipientKey;
    conversation.mediatorState = 'idle';
    conversation.lastMediatorError = null;
    conversation.lastActivityAt = new Date();

    await conversation.save();

    if (!recipientUser) {
      console.warn('Skipping Olive notification email because the recipient user is missing.', {
        conversationId: conversation.id,
        recipientKey,
        recipientEmail: recipientParticipant.email
      });
      return;
    }

    const recipient = getParticipantByKey(conversation, recipientKey);
    const openConversationUrl = new URL('/open-conversation', appConfig.frontendUrl);
    openConversationUrl.searchParams.set(
      'token',
      issueNotificationLinkToken({
        id: recipientUser.id,
        email: recipientUser.email,
        conversationId: conversation.id
      })
    );
    const notificationTemplate = buildMediatorNotificationEmailTemplate({
      goalLabel: conversation.goal.label,
      openConversationUrl: openConversationUrl.toString()
    });

    try {
      await sendEmail({
        to: recipient.email,
        ...notificationTemplate
      });
    } catch (error) {
      console.error('Failed to send Olive notification email.', error);
    }
  } catch (error) {
    conversation.mediatorState = 'failed';
    conversation.lastMediatorError = 'Olive is temporarily unavailable. Please try again later.';
    await conversation.save();
    throw error;
  }
}
