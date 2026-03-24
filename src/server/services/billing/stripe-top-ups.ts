import { randomUUID } from 'node:crypto';
import { HydratedDocument } from 'mongoose';
import type Stripe from 'stripe';
import { appConfig, CREDIT_TOP_UP_PRICES, type SupportedTopUpCurrency } from '../../app-config';
import { buildPublicUserResponse, type PublicUserResponse } from '../../helpers/auth/build-public-user-response';
import {
  CreditTopUpModel,
  type CreditTopUp
} from '../../integrations/mongodb/models/credit-top-up-model';
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
  returnToken?: string | null;
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

export interface CreditTopUpCheckoutStatusResponse {
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
  const returnToken = randomUUID();

  if (!topUpPackage) {
    throw new AppError('The selected top-up package is invalid.', 400, {
      code: 'invalid_top_up_package'
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.user.email,
    client_reference_id: params.user.id,
    success_url: buildCheckoutReturnUrl(params.returnPath, 'success', returnToken),
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
      currency: topUpPackage.currency,
      returnToken
    },
    payment_intent_data: {
      metadata: {
        userId: params.user.id,
        credits: String(topUpPackage.credits),
        currency: topUpPackage.currency,
        returnToken
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
        checkoutReturnToken: returnToken,
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
  topUpToken: string;
  userId: string;
}): Promise<CreditTopUpCheckoutStatusResponse> {
  const topUp = await CreditTopUpModel.findOne({
    userId: params.userId,
    checkoutReturnToken: params.topUpToken
  }).exec();
  const user = await UserModel.findById(params.userId).exec();

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  if (!topUp) {
    throw new AppError('This checkout session was not found.', 404, {
      code: 'top_up_not_found'
    });
  }

  if (topUp.status !== 'paid') {
    return {
      status: 'pending',
      user: buildPublicUserResponse(user),
      topUp: null
    };
  }

  return {
    status: 'paid',
    user: buildPublicUserResponse(user),
    topUp: {
      credits: topUp.credits,
      currency: topUp.currency,
      amountTotal: topUp.amountTotal
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
  const topUp = await CreditTopUpModel.findOneAndUpdate(
    {
      stripeCheckoutSessionId: session.id
    },
    {
      $setOnInsert: {
        userId: metadata.userId,
        stripeCheckoutSessionId: session.id,
        currency: metadata.currency,
        amountTotal: session.amount_total ?? 0,
        credits: metadata.credits,
        status: 'pending',
        ...(metadata.returnToken ? { checkoutReturnToken: metadata.returnToken } : {})
      }
    },
    {
      new: true,
      upsert: true
    }
  ).exec();

  const user = await applyTopUpCredits(topUp, metadata.userId);
  await CreditTopUpModel.updateOne(
    {
      _id: topUp._id
    },
    {
      $set: {
        stripePaymentIntentId: paymentIntentId,
        status: 'paid',
        completedAt: new Date()
      }
    }
  ).exec();

  if (!topUp.checkoutReturnToken && metadata.returnToken) {
    await CreditTopUpModel.updateOne(
      {
        _id: topUp._id,
        checkoutReturnToken: null
      },
      {
        $set: {
          checkoutReturnToken: metadata.returnToken
        }
      }
    ).exec();
  }

  return {
    user,
    credits: topUp.credits,
    currency: topUp.currency,
    amountTotal: topUp.amountTotal
  };
}

function buildCheckoutReturnUrl(
  returnPath: string | null | undefined,
  status: 'success' | 'canceled',
  topUpToken?: string
): string {
  const safeReturnPath =
    typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : DEFAULT_RETURN_PATH;
  const url = new URL(safeReturnPath, appConfig.frontendUrl);

  url.searchParams.set('topUp', status);
  url.searchParams.delete('session_id');

  if (status === 'success' && topUpToken) {
    url.searchParams.set('topUpToken', topUpToken);
  } else {
    url.searchParams.delete('topUpToken');
  }

  return url.toString();
}

function parseTopUpSessionMetadata(
  session: Stripe.Checkout.Session
): StripeTopUpSessionMetadata | null {
  const metadata = session.metadata;
  const userId = metadata?.userId?.trim();
  const credits = Number.parseInt(metadata?.credits ?? '', 10);
  const currency = metadata?.currency?.trim().toUpperCase() ?? '';
  const returnToken = metadata?.returnToken?.trim() || null;

  if (!userId || !Number.isFinite(credits) || credits <= 0 || !isSupportedCurrency(currency)) {
    return null;
  }

  return {
    userId,
    credits,
    currency,
    returnToken
  };
}

async function applyTopUpCredits(topUp: HydratedDocument<CreditTopUp>, userId: string) {
  const updatedUser = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      appliedCreditTopUpIds: {
        $ne: topUp._id
      }
    },
    {
      $inc: {
        credits: topUp.credits
      },
      $addToSet: {
        appliedCreditTopUpIds: topUp._id
      }
    },
    {
      new: true
    }
  ).exec();

  if (updatedUser) {
    return updatedUser;
  }

  const user = await UserModel.findById(userId).exec();

  if (!user) {
    throw new AppError('Top-up user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const alreadyApplied = (user.appliedCreditTopUpIds ?? []).some((appliedTopUpId) =>
    appliedTopUpId.equals(topUp._id)
  );

  if (!alreadyApplied) {
    throw new AppError('The credit top-up could not be applied reliably.', 409, {
      code: 'top_up_apply_conflict'
    });
  }

  return user;
}

function isSupportedCurrency(value: string): value is SupportedTopUpCurrency {
  return value in CREDIT_TOP_UP_PRICES;
}
