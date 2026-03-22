import { Model, model, models, Schema, Types } from 'mongoose';

export const participantKeys = ['inviter', 'invitee'] as const;
export type ParticipantKey = (typeof participantKeys)[number];

export const conversationStatuses = ['pending', 'active', 'expired', 'closed'] as const;
export type ConversationStatus = (typeof conversationStatuses)[number];

export const mediatorStates = ['idle', 'processing', 'failed'] as const;
export type MediatorState = (typeof mediatorStates)[number];

export interface ConversationParticipant {
  key: ParticipantKey;
  email: string;
  userId?: Types.ObjectId | null;
  joinedAt?: Date | null;
}

export interface ConversationGoal {
  key: string;
  label: string;
}

export interface ConversationInvitation {
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
}

export interface Conversation {
  issueDescription: string;
  goal: ConversationGoal;
  status: ConversationStatus;
  activeParticipantKey?: ParticipantKey | null;
  mediatorState: MediatorState;
  lastMediatorError?: string | null;
  lastActivityAt?: Date | null;
  participants: ConversationParticipant[];
  invitation: ConversationInvitation;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<ConversationParticipant>(
  {
    key: {
      type: String,
      enum: participantKeys,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    joinedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const goalSchema = new Schema<ConversationGoal>(
  {
    key: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

const invitationSchema = new Schema<ConversationInvitation>(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const conversationSchema = new Schema<Conversation>(
  {
    issueDescription: {
      type: String,
      required: true,
      trim: true
    },
    goal: {
      type: goalSchema,
      required: true
    },
    status: {
      type: String,
      enum: conversationStatuses,
      required: true,
      default: 'pending'
    },
    activeParticipantKey: {
      type: String,
      enum: participantKeys,
      default: null
    },
    mediatorState: {
      type: String,
      enum: mediatorStates,
      required: true,
      default: 'idle'
    },
    lastMediatorError: {
      type: String,
      default: null
    },
    lastActivityAt: {
      type: Date,
      default: null
    },
    participants: {
      type: [participantSchema],
      required: true
    },
    invitation: {
      type: invitationSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ 'participants.email': 1 });
conversationSchema.index({ updatedAt: -1 });

export const ConversationModel =
  (models.Conversation as Model<Conversation>) ||
  model<Conversation>('Conversation', conversationSchema);
