import { Model, model, models, Schema, Types } from 'mongoose';
import type { SupportedTopUpCurrency } from '../../../app-config';

export interface CreditTopUp {
  userId: Types.ObjectId;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  currency: SupportedTopUpCurrency;
  amountTotal: number;
  credits: number;
  status: 'pending' | 'paid';
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const creditTopUpSchema = new Schema<CreditTopUp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stripeCheckoutSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
      trim: true
    },
    currency: {
      type: String,
      required: true,
      trim: true
    },
    amountTotal: {
      type: Number,
      required: true,
      min: 0
    },
    credits: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

creditTopUpSchema.index({ userId: 1, createdAt: -1 });

export const CreditTopUpModel =
  (models.CreditTopUp as Model<CreditTopUp>) ||
  model<CreditTopUp>('CreditTopUp', creditTopUpSchema);
