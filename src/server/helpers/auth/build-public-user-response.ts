import type { HydratedDocument } from 'mongoose';
import type { User } from '../../integrations/mongodb/models/user-model';
import { getUserCredits } from '../../services/billing/credits';
import { hasSavedPersonality } from './personality-profile';

export interface PublicUserResponse {
  id: string;
  email: string;
  name: string | null;
  language: string | null;
  country: string | null;
  credits: number;
  hasPersonality: boolean;
  requiresProfileCompletion: boolean;
}

export function buildPublicUserResponse(user: HydratedDocument<User>): PublicUserResponse {
  const normalizedName = user.name?.trim() || null;

  return {
    id: user.id,
    email: user.email,
    name: normalizedName,
    language: user.language?.trim() || null,
    country: user.country?.trim() || null,
    credits: getUserCredits(user),
    hasPersonality: hasSavedPersonality(user),
    requiresProfileCompletion: normalizedName === null
  };
}
