import { Model, model, models, Schema } from 'mongoose';
import { INITIAL_USER_CREDITS } from '../../../services/billing/credits';

export interface UserPersonalityResponse {
  questionId: string;
  question: string;
  answer?: string | null;
}

export interface User {
  email: string;
  name?: string | null;
  language?: string | null;
  country?: string | null;
  personality?: string | null;
  personalityResponses: UserPersonalityResponse[];
  credits: number;
  lastLoggedInAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const personalityResponseSchema = new Schema<UserPersonalityResponse>(
  {
    questionId: {
      type: String,
      required: true,
      trim: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    _id: false
  }
);

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null,
      trim: true
    },
    language: {
      type: String,
      default: null,
      trim: true
    },
    country: {
      type: String,
      default: null,
      trim: true
    },
    personality: {
      type: String,
      default: null,
      trim: true
    },
    personalityResponses: {
      type: [personalityResponseSchema],
      default: []
    },
    credits: {
      type: Number,
      required: true,
      default: INITIAL_USER_CREDITS,
      min: 0
    },
    lastLoggedInAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = (models.User as Model<User>) || model<User>('User', userSchema);
