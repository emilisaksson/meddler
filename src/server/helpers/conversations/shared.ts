import type { HydratedDocument } from 'mongoose';
import type {
  Conversation,
  ConversationStatus,
  ParticipantKey
} from '../../integrations/mongodb/models/conversation-model';
import type { ConversationMessage } from '../../integrations/mongodb/models/conversation-message-model';
import { AppError } from '../../utils/app-error';
import { isSameObjectId } from '../../utils/object-id';

export type ConversationTurnState =
  | 'pending-acceptance'
  | 'your-turn'
  | 'waiting'
  | 'mediating'
  | 'failed'
  | 'expired'
  | 'closed';

export interface ConversationMessageResponse {
  id: string;
  authorType: 'participant' | 'mediator';
  content: string;
  createdAt: string;
}

export interface ConversationSummaryResponse {
  id: string;
  status: ConversationStatus;
  mediatorState: Conversation['mediatorState'];
  turnState: ConversationTurnState;
  stateLabel: string;
  canSend: boolean;
  goal: Conversation['goal'];
  issueDescription: string;
  selfRole: ParticipantKey;
  selfEmail: string;
  counterpartEmail: string;
  counterpartJoinedAt: string | null;
  invitationAcceptedAt: string | null;
  lastMediatorError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetailResponse extends ConversationSummaryResponse {
  thread: ConversationMessageResponse[];
}

type ConversationDocument = HydratedDocument<Conversation>;
type ConversationMessageDocument = HydratedDocument<ConversationMessage>;

export function getOtherParticipantKey(participantKey: ParticipantKey): ParticipantKey {
  return participantKey === 'inviter' ? 'invitee' : 'inviter';
}

export function getEffectiveConversationStatus(conversation: ConversationDocument): ConversationStatus {
  if (conversation.status === 'pending' && conversation.invitation.expiresAt.getTime() < Date.now()) {
    return 'expired';
  }

  return conversation.status;
}

export function getParticipantByKey(conversation: ConversationDocument, participantKey: ParticipantKey) {
  const participant = conversation.participants.find((entry) => entry.key === participantKey);

  if (!participant) {
    throw new AppError('Conversation participant is missing.', 500, {
      code: 'conversation_participant_missing'
    });
  }

  return participant;
}

export function getParticipantKeyForUser(
  conversation: ConversationDocument,
  userId: string
): ParticipantKey {
  const participant = conversation.participants.find((entry) => isSameObjectId(entry.userId, userId));

  if (!participant) {
    throw new AppError('Conversation not found.', 404, {
      code: 'conversation_not_found'
    });
  }

  return participant.key;
}

function getTurnStatus(conversation: ConversationDocument, selfKey: ParticipantKey) {
  const effectiveStatus = getEffectiveConversationStatus(conversation);

  if (effectiveStatus === 'pending') {
    return {
      canSend: false,
      turnState: 'pending-acceptance' as const,
      stateLabel:
        selfKey === 'inviter'
          ? 'Invitation sent. Waiting for the other person to accept.'
          : 'Accept the invitation to begin.'
    };
  }

  if (effectiveStatus === 'expired') {
    return {
      canSend: false,
      turnState: 'expired' as const,
      stateLabel: 'This invitation expired before the conversation started.'
    };
  }

  if (effectiveStatus === 'closed') {
    return {
      canSend: false,
      turnState: 'closed' as const,
      stateLabel: 'This conversation is closed.'
    };
  }

  if (conversation.mediatorState === 'processing') {
    return {
      canSend: false,
      turnState: 'mediating' as const,
      stateLabel: 'Olive is preparing the next reply.'
    };
  }

  if (conversation.mediatorState === 'failed') {
    return {
      canSend: false,
      turnState: 'failed' as const,
      stateLabel: 'Olive could not prepare the next reply.'
    };
  }

  if (conversation.activeParticipantKey === selfKey) {
    return {
      canSend: true,
      turnState: 'your-turn' as const,
      stateLabel: 'Your turn to reply.'
    };
  }

  return {
    canSend: false,
    turnState: 'waiting' as const,
    stateLabel: 'Waiting for the other person to reply.'
  };
}

export function buildConversationSummary(
  conversation: ConversationDocument,
  selfKey: ParticipantKey
): ConversationSummaryResponse {
  const self = getParticipantByKey(conversation, selfKey);
  const counterpart = getParticipantByKey(conversation, getOtherParticipantKey(selfKey));
  const turnStatus = getTurnStatus(conversation, selfKey);

  return {
    id: conversation.id,
    status: getEffectiveConversationStatus(conversation),
    mediatorState: conversation.mediatorState,
    turnState: turnStatus.turnState,
    stateLabel: turnStatus.stateLabel,
    canSend: turnStatus.canSend,
    goal: {
      key: conversation.goal.key,
      label: conversation.goal.label
    },
    issueDescription: conversation.issueDescription,
    selfRole: selfKey,
    selfEmail: self.email,
    counterpartEmail: counterpart.email,
    counterpartJoinedAt: counterpart.joinedAt ? counterpart.joinedAt.toISOString() : null,
    invitationAcceptedAt: conversation.invitation.acceptedAt
      ? conversation.invitation.acceptedAt.toISOString()
      : null,
    lastMediatorError: conversation.lastMediatorError ?? null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString()
  };
}

export function buildThread(messages: ConversationMessageDocument[]): ConversationMessageResponse[] {
  return messages.map((message) => ({
    id: message.id,
    authorType: message.authorType,
    content: message.content,
    createdAt: message.createdAt.toISOString()
  }));
}

export function buildConversationDetail(
  conversation: ConversationDocument,
  selfKey: ParticipantKey,
  threadMessages: ConversationMessageDocument[]
): ConversationDetailResponse {
  return {
    ...buildConversationSummary(conversation, selfKey),
    thread: buildThread(threadMessages)
  };
}
