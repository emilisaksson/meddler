import { Model, model, models, Schema } from 'mongoose';

export interface OtpChallenge {
  email: string;
  codeHash: string;
  attemptCount: number;
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const otpChallengeSchema = new Schema<OtpChallenge>(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    },
    codeHash: {
      type: String,
      required: true
    },
    attemptCount: {
      type: Number,
      required: true,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    consumedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const OtpChallengeModel =
  (models.OtpChallenge as Model<OtpChallenge>) ||
  model<OtpChallenge>('OtpChallenge', otpChallengeSchema);
