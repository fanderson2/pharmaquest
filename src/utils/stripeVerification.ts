import { AppError } from './errors';

// Stripe checkout success URL pattern
const STRIPE_SUCCESS_PATTERN = /^https:\/\/buy\.stripe\.com/;

export function verifyStripeCheckout(): boolean {
  const referrer = document.referrer;
  return STRIPE_SUCCESS_PATTERN.test(referrer);
}

export function validateCheckoutSuccess(): void {
  if (!verifyStripeCheckout()) {
    throw new AppError(
      'Invalid signup attempt. Please complete the checkout process first.',
      'INVALID_CHECKOUT'
    );
  }
}