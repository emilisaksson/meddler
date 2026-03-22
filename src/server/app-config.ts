import { config as loadEnvironment } from 'dotenv';
import { z } from 'zod';

loadEnvironment();

const envSchema = z.object({
  PORT: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z.string().optional(),
  EMAIL_FROM: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  OTP_EXPIRY_MINUTES: z.string().min(1),
  OTP_MAX_ATTEMPTS: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  AGENT_MODEL: z.string().min(1),
  MONGO_URL: z.string().min(1)
});

const env = envSchema.parse(process.env);

function toNumber(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

export const appConfig = {
  port: toNumber(env.PORT ?? '4000', 4000),
  frontendUrl: env.FRONTEND_URL ?? 'http://localhost:4200',
  email: {
    host: env.SMTP_HOST,
    port: toNumber(env.SMTP_PORT, 587),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    secure: toBoolean(env.SMTP_SECURE, false),
    from: env.EMAIL_FROM
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN
  },
  otp: {
    expiryMinutes: toNumber(env.OTP_EXPIRY_MINUTES, 15),
    maxAttempts: toNumber(env.OTP_MAX_ATTEMPTS, 3)
  },
  invite: {
    expiryHours: 72
  },
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  agentModel: env.AGENT_MODEL,
  mongoUrl: env.MONGO_URL
};

export const isProduction = process.env.NODE_ENV === 'production';
