import type { ParticipantKey } from '../../integrations/mongodb/models/conversation-model';

export interface MediatorHistoryEntry {
  kind: 'participant' | 'mediator';
  actorKey?: ParticipantKey;
  recipientKey?: ParticipantKey;
  createdAt: Date;
  content: string;
}

export interface MediatorTurnInput {
  issueDescription: string;
  goalLabel: string;
  senderKey: ParticipantKey;
  recipientKey: ParticipantKey;
  senderPersonality: string | null;
  recipientPersonality: string | null;
  latestSenderMessage: string;
  history: MediatorHistoryEntry[];
}

export interface MediatorUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  totalTokens: number;
}

export interface MediatorReplyResult {
  content: string;
  provider: string;
  model: string;
  usage: MediatorUsage;
}

export interface MediatorProvider {
  generateParticipantReply(input: MediatorTurnInput): Promise<MediatorReplyResult>;
}
