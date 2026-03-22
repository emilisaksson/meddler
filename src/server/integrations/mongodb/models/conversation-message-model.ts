import { Model, model, models, Schema, Types } from 'mongoose';
import { participantKeys, type ParticipantKey } from './conversation-model';

export const messageAuthorTypes = ['participant', 'mediator'] as const;
export type MessageAuthorType = (typeof messageAuthorTypes)[number];

export interface ConversationMessage {
  conversationId: Types.ObjectId;
  threadOwnerKey: ParticipantKey;
  authorType: MessageAuthorType;
  authorParticipantKey?: ParticipantKey | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationMessageSchema = new Schema<ConversationMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    threadOwnerKey: {
      type: String,
      enum: participantKeys,
      required: true
    },
    authorType: {
      type: String,
      enum: messageAuthorTypes,
      required: true
    },
    authorParticipantKey: {
      type: String,
      enum: participantKeys,
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

conversationMessageSchema.index({ conversationId: 1, createdAt: 1 });
conversationMessageSchema.index({ conversationId: 1, threadOwnerKey: 1, createdAt: 1 });

export const ConversationMessageModel =
  (models.ConversationMessage as Model<ConversationMessage>) ||
  model<ConversationMessage>('ConversationMessage', conversationMessageSchema);
