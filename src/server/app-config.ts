import { config as loadEnvironment } from 'dotenv';
import { z } from 'zod';

export interface CreditTopUpPrice {
  credits: number;
  price: number;
}

export const CREDIT_TOP_UP_PRICES = {
  EUR: [
    {
      credits: 100,
      price: 0.99
    },
    {
      credits: 500,
      price: 4.49
    },
    {
      credits: 1200,
      price: 9.99
    }
  ],
  SEK: [
    {
      credits: 100,
      price: 9.9
    },
    {
      credits: 500,
      price: 44.5
    },
    {
      credits: 1200,
      price: 99
    }
  ],
  NOK: [
    {
      credits: 100,
      price: 11.9
    },
    {
      credits: 500,
      price: 54.9
    },
    {
      credits: 1200,
      price: 119
    }
  ],
  DKK: [
    {
      credits: 100,
      price: 7.5
    },
    {
      credits: 500,
      price: 34.5
    },
    {
      credits: 1200,
      price: 79
    }
  ]
} satisfies Record<string, CreditTopUpPrice[]>;

export type SupportedTopUpCurrency = keyof typeof CREDIT_TOP_UP_PRICES;

loadEnvironment();

const optionalNonEmptyString = z.preprocess((value) => {
    if (typeof value === 'string' && value.trim().length === 0) {
        return undefined;
    }

    return value;
}, z.string().min(1).optional());

const envSchema = z.object({
    PORT: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    MAILGUN_API_KEY: z.string().min(1),
    MAILGUN_DOMAIN: z.string().min(1),
    MAILGUN_BASE_URL: optionalNonEmptyString,
    EMAIL_FROM: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
    OTP_EXPIRY_MINUTES: z.string().min(1),
    OTP_MAX_ATTEMPTS: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1),
    AGENT_MODEL: z.string().min(1),
    MONGO_URL: z.string().min(1),
    STRIPE_API_KEY: optionalNonEmptyString,
    STRIPE_WEBHOOK_SECRET: optionalNonEmptyString
});

const env = envSchema.parse(process.env);

function toNumber(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig = {
    port: toNumber(env.PORT ?? '4000', 4000),
    frontendUrl: env.FRONTEND_URL ?? 'http://localhost:4200',
    email: {
        apiKey: env.MAILGUN_API_KEY,
        domain: env.MAILGUN_DOMAIN,
        baseUrl: env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net',
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
    mongoUrl: env.MONGO_URL,
    stripe: {
        secretKey: env.STRIPE_API_KEY ?? null,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? null
    }
};

export const isProduction = process.env.NODE_ENV === 'production';
