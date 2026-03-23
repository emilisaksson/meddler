import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import {
  confirmCreditTopUpCheckoutSession,
  createCreditTopUpCheckoutSession,
  getCreditTopUpCatalogForUser,
  handleStripeWebhook
} from '../../services/billing/stripe-top-ups';
import { AppError } from '../../utils/app-error';
import { asyncHandler } from '../../utils/async-handler';
import { ensureUserLocale } from '../../utils/locale';
import { authenticateRequest, requireAuth } from '../middlewares/authenticate-request';

const createCheckoutSessionSchema = z.object({
  packageId: z.string().trim().min(1),
  returnPath: z.string().trim().startsWith('/').max(1_000).nullable().optional()
});

const confirmCheckoutSessionSchema = z.object({
  sessionId: z.string().trim().min(1)
});

export const billingRoutes = Router();

billingRoutes.use(authenticateRequest);

billingRoutes.get(
  '/top-up-options',
  asyncHandler('billing.topUpOptions', async (request, response) => {
    const user = await getAuthenticatedBillingUser(request);

    response.json({
      topUp: getCreditTopUpCatalogForUser(user)
    });
  })
);

billingRoutes.post(
  '/checkout-session',
  asyncHandler('billing.checkoutSession', async (request, response) => {
    const user = await getAuthenticatedBillingUser(request);
    const payload = createCheckoutSessionSchema.parse(request.body);
    const result = await createCreditTopUpCheckoutSession({
      user,
      packageId: payload.packageId,
      returnPath: payload.returnPath
    });

    response.status(201).json(result);
  })
);

billingRoutes.post(
  '/checkout-session/confirm',
  asyncHandler('billing.checkoutConfirm', async (request, response) => {
    const auth = requireAuth(request);
    const payload = confirmCheckoutSessionSchema.parse(request.body);
    const result = await confirmCreditTopUpCheckoutSession({
      sessionId: payload.sessionId,
      userId: auth.sub
    });

    response.json(result);
  })
);

export const stripeWebhookHandler = asyncHandler(
  'billing.stripeWebhook',
  async (request, response) => {
    if (!Buffer.isBuffer(request.body)) {
      throw new AppError('Stripe webhook expects a raw request body.', 400, {
        code: 'invalid_stripe_webhook_body'
      });
    }

    await handleStripeWebhook(request.body, request.header('stripe-signature') ?? undefined);

    response.json({
      received: true
    });
  }
);

async function getAuthenticatedBillingUser(request: Request) {
  const auth = requireAuth(request);
  const user = await UserModel.findById(auth.sub).exec();

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const locale = ensureUserLocale(user);

  if (locale.changed) {
    await user.save();
  }

  return user;
}
