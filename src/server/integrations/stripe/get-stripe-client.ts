import Stripe from 'stripe';
import { appConfig } from '../../app-config';
import { AppError } from '../../utils/app-error';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  if (!appConfig.stripe.secretKey) {
    throw new AppError('Stripe billing is not configured.', 503, {
      code: 'billing_not_configured'
    });
  }

  stripeClient = new Stripe(appConfig.stripe.secretKey);
  return stripeClient;
}
