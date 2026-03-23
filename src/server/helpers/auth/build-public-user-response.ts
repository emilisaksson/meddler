import type { HydratedDocument } from 'mongoose';
import type { User } from '../../integrations/mongodb/models/user-model';
import { getUserCredits } from '../../services/billing/credits';
import { resolveLocale } from '../../utils/locale';
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
  const locale = resolveLocale({
    language: user.language,
    country: user.country
  });

  return {
    id: user.id,
    email: user.email,
    name: normalizedName,
    language: locale.language,
    country: locale.country,
    credits: getUserCredits(user),
    hasPersonality: hasSavedPersonality(user),
    requiresProfileCompletion: normalizedName === null
  };
}
