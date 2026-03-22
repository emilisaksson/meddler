import { Model, model, models, Schema, Types } from 'mongoose';

export interface AiTransaction {
  userId: Types.ObjectId;
  conversationId: Types.ObjectId;
  messageId: Types.ObjectId;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  totalTokens: number;
  cost: number;
  creditsBalanceBefore: number;
  creditsBalanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiTransactionSchema = new Schema<AiTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'ConversationMessage',
      required: true,
      index: true
    },
    provider: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    inputTokens: {
      type: Number,
      required: true,
      min: 0
    },
    outputTokens: {
      type: Number,
      required: true,
      min: 0
    },
    cacheCreationInputTokens: {
      type: Number,
      required: true,
      min: 0
    },
    cacheReadInputTokens: {
      type: Number,
      required: true,
      min: 0
    },
    totalTokens: {
      type: Number,
      required: true,
      min: 0
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    creditsBalanceBefore: {
      type: Number,
      required: true,
      min: 0
    },
    creditsBalanceAfter: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

aiTransactionSchema.index({ conversationId: 1, createdAt: -1 });
aiTransactionSchema.index({ userId: 1, createdAt: -1 });

export const AiTransactionModel =
  (models.AiTransaction as Model<AiTransaction>) ||
  model<AiTransaction>('AiTransaction', aiTransactionSchema);
