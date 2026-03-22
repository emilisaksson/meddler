export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  language: string | null;
  country: string | null;
  credits: number;
  hasPersonality: boolean;
  requiresProfileCompletion: boolean;
}

export interface ConversationGoalOption {
  key: string;
  label: string;
}

export interface ConversationGoal {
  key: string;
  label: string;
}

export interface ConversationMessage {
  id: string;
  authorType: 'participant' | 'mediator';
  content: string;
  createdAt: string;
}

export type ConversationStatus = 'pending' | 'active' | 'expired' | 'closed';
export type MediatorState = 'idle' | 'processing' | 'failed';
export type ConversationTurnState =
  | 'pending-acceptance'
  | 'your-turn'
  | 'waiting'
  | 'mediating'
  | 'failed'
  | 'expired'
  | 'closed';

export interface ConversationSummary {
  id: string;
  status: ConversationStatus;
  mediatorState: MediatorState;
  turnState: ConversationTurnState;
  stateLabel: string;
  canSend: boolean;
  goal: ConversationGoal;
  issueDescription: string;
  selfRole: 'inviter' | 'invitee';
  selfEmail: string;
  counterpartEmail: string;
  counterpartJoinedAt: string | null;
  invitationAcceptedAt: string | null;
  lastMediatorError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  thread: ConversationMessage[];
}

export interface SessionResponse {
  accessToken: string;
  user: AppUser;
  conversationId?: string;
}
