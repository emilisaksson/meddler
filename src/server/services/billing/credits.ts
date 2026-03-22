import type { User } from '../../integrations/mongodb/models/user-model';

export const INITIAL_USER_CREDITS = 100;
export const CREDITS_PER_TOKEN = 0.01;

export function getUserCredits(user: Pick<User, 'credits'>): number {
  return typeof user.credits === 'number' && Number.isFinite(user.credits)
    ? Math.max(0, user.credits)
    : INITIAL_USER_CREDITS;
}

export function calculateCreditCost(totalTokens: number): number {
  return Number((Math.max(0, totalTokens) * CREDITS_PER_TOKEN).toFixed(2));
}
