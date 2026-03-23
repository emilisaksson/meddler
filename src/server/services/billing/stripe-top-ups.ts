import { HydratedDocument } from 'mongoose';
import type Stripe from 'stripe';
import { appConfig, CREDIT_TOP_UP_PRICES, type SupportedTopUpCurrency } from '../../app-config';
import { buildPublicUserResponse, type PublicUserResponse } from '../../helpers/auth/build-public-user-response';
import { CreditTopUpModel } from '../../integrations/mongodb/models/credit-top-up-model';
import { UserModel, type User } from '../../integrations/mongodb/models/user-model';
import { getStripeClient } from '../../integrations/stripe/get-stripe-client';
import { AppError } from '../../utils/app-error';
import {
  findCreditTopUpPackage,
  getCreditTopUpCatalog,
  type CreditTopUpPackage
} from './top-up-pricing';

const DEFAULT_RETURN_PATH = '/conversations';

interface StripeTopUpSessionMetadata {
  userId: string;
  credits: number;
  currency: SupportedTopUpCurrency;
}

export interface CreditTopUpCatalogResponse {
  currency: SupportedTopUpCurrency;
  packages: Array<{
    id: string;
    credits: number;
    price: number;
    currency: SupportedTopUpCurrency;
  }>;
}

export interface CreditTopUpConfirmationResponse {
  status: 'paid' | 'pending';
  user: PublicUserResponse;
  topUp: {
    credits: number;
    currency: SupportedTopUpCurrency;
    amountTotal: number;
  } | null;
}

export function getCreditTopUpCatalogForUser(user: Pick<User, 'country'>): CreditTopUpCatalogResponse {
  const catalog = getCreditTopUpCatalog(user.country);

  return {
    currency: catalog.currency,
    packages: catalog.packages.map((entry) => ({
      id: entry.id,
      credits: entry.credits,
      price: entry.price,
      currency: entry.currency
    }))
  };
}

export async function createCreditTopUpCheckoutSession(params: {
  user: HydratedDocument<User>;
  packageId: string;
  returnPath?: string | null;
}) {
  const stripe = getStripeClient();
  const topUpPackage = findCreditTopUpPackage(params.user.country, params.packageId);

  if (!topUpPackage) {
    throw new AppError('The selected top-up package is invalid.', 400, {
      code: 'invalid_top_up_package'
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.user.email,
    client_reference_id: params.user.id,
    success_url: buildCheckoutReturnUrl(params.returnPath, 'success'),
    cancel_url: buildCheckoutReturnUrl(params.returnPath, 'canceled'),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: topUpPackage.currency.toLowerCase(),
          unit_amount: topUpPackage.unitAmount,
          product_data: {
            name: `oliveaccord ${topUpPackage.credits} credits`,
            description: 'Top up credits for private mediated conversations.'
          }
        }
      }
    ],
    metadata: {
      userId: params.user.id,
      credits: String(topUpPackage.credits),
      currency: topUpPackage.currency
    },
    payment_intent_data: {
      metadata: {
        userId: params.user.id,
        credits: String(topUpPackage.credits),
        currency: topUpPackage.currency
      }
    }
  });

  if (!session.url) {
    throw new AppError('Stripe checkout did not return a redirect URL.', 502, {
      code: 'stripe_checkout_url_missing'
    });
  }

  await CreditTopUpModel.findOneAndUpdate(
    { stripeCheckoutSessionId: session.id },
    {
      $setOnInsert: {
        userId: params.user._id,
        stripeCheckoutSessionId: session.id,
        currency: topUpPackage.currency,
        amountTotal: topUpPackage.unitAmount,
        credits: topUpPackage.credits,
        status: 'pending'
      }
    },
    {
      upsert: true
    }
  ).exec();

  return {
    checkoutUrl: session.url
  };
}

export async function confirmCreditTopUpCheckoutSession(params: {
  sessionId: string;
  userId: string;
}): Promise<CreditTopUpConfirmationResponse> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(params.sessionId);

  ensureSessionBelongsToUser(session, params.userId);

  const metadata = parseTopUpSessionMetadata(session);
  const user = await UserModel.findById(params.userId).exec();

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  if (!metadata || session.payment_status !== 'paid') {
    return {
      status: 'pending',
      user: buildPublicUserResponse(user),
      topUp: null
    };
  }

  const result = await applyPaidTopUpSession(session, metadata);

  return {
    status: 'paid',
    user: buildPublicUserResponse(result.user),
    topUp: {
      credits: result.credits,
      currency: result.currency,
      amountTotal: result.amountTotal
    }
  };
}

export async function handleStripeWebhook(payload: Buffer, signature: string | undefined) {
  if (!appConfig.stripe.webhookSecret) {
    throw new AppError('Stripe webhook signing secret is not configured.', 503, {
      code: 'billing_not_configured'
    });
  }

  if (!signature) {
    throw new AppError('Stripe signature header is missing.', 400, {
      code: 'stripe_signature_missing'
    });
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, appConfig.stripe.webhookSecret);
  } catch (error) {
    throw new AppError('Stripe webhook signature verification failed.', 400, {
      code: 'invalid_stripe_signature',
      details: error instanceof Error ? error.message : undefined
    });
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = parseTopUpSessionMetadata(session);

    if (metadata && session.payment_status === 'paid') {
      await applyPaidTopUpSession(session, metadata);
    }
  }

  return event;
}

async function applyPaidTopUpSession(
  session: Stripe.Checkout.Session,
  metadata: StripeTopUpSessionMetadata
) {
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const updatedTopUp = await CreditTopUpModel.findOneAndUpdate(
    {
      stripeCheckoutSessionId: session.id,
      status: { $ne: 'paid' }
    },
    {
      $set: {
        stripePaymentIntentId: paymentIntentId,
        status: 'paid',
        completedAt: new Date()
      }
    },
    {
      new: true
    }
  ).exec();

  if (updatedTopUp) {
    const user = await UserModel.findByIdAndUpdate(
      metadata.userId,
      {
        $inc: {
          credits: updatedTopUp.credits
        }
      },
      {
        new: true
      }
    ).exec();

    if (!user) {
      throw new AppError('Top-up user was not found.', 404, {
        code: 'user_not_found'
      });
    }

    return {
      user,
      credits: updatedTopUp.credits,
      currency: updatedTopUp.currency,
      amountTotal: updatedTopUp.amountTotal
    };
  }

  const user = await UserModel.findById(metadata.userId).exec();

  if (!user) {
    throw new AppError('Top-up user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const existingTopUp = await CreditTopUpModel.findOne({
    stripeCheckoutSessionId: session.id
  }).exec();

  return {
    user,
    credits: existingTopUp?.credits ?? metadata.credits,
    currency: existingTopUp?.currency ?? metadata.currency,
    amountTotal: existingTopUp?.amountTotal ?? session.amount_total ?? 0
  };
}

function buildCheckoutReturnUrl(
  returnPath: string | null | undefined,
  status: 'success' | 'canceled'
): string {
  const safeReturnPath =
    typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : DEFAULT_RETURN_PATH;
  const url = new URL(safeReturnPath, appConfig.frontendUrl);

  url.searchParams.set('topUp', status);

  if (status === 'success') {
    url.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  } else {
    url.searchParams.delete('session_id');
  }

  return url.toString();
}

function ensureSessionBelongsToUser(session: Stripe.Checkout.Session, userId: string): void {
  const sessionUserId = session.client_reference_id ?? session.metadata?.userId ?? null;

  if (sessionUserId !== userId) {
    throw new AppError('This checkout session does not belong to the authenticated user.', 403, {
      code: 'top_up_forbidden'
    });
  }
}

function parseTopUpSessionMetadata(
  session: Stripe.Checkout.Session
): StripeTopUpSessionMetadata | null {
  const metadata = session.metadata;
  const userId = metadata?.userId?.trim();
  const credits = Number.parseInt(metadata?.credits ?? '', 10);
  const currency = metadata?.currency?.trim().toUpperCase() ?? '';

  if (!userId || !Number.isFinite(credits) || credits <= 0 || !isSupportedCurrency(currency)) {
    return null;
  }

  return {
    userId,
    credits,
    currency
  };
}

function isSupportedCurrency(value: string): value is SupportedTopUpCurrency {
  return value in CREDIT_TOP_UP_PRICES;
}
