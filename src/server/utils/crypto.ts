import { createHash, randomBytes, randomInt } from 'node:crypto';

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function createInvitationToken(): string {
  return randomBytes(32).toString('hex');
}
