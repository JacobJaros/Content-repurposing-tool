// Stripe client initialization
// Only initializes when STRIPE_SECRET_KEY is present

let stripe: unknown = null;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set — Stripe is disabled");
    return null;
  }

  if (!stripe) {
    // Dynamic import would go here when Stripe SDK is installed
    console.warn("[Stripe] Stripe SDK not configured yet");
  }

  return stripe;
}
