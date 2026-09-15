#!/usr/bin/env bash
set -euo pipefail

: "${STRIPE_LIVE_SECRET_KEY:?STRIPE_LIVE_SECRET_KEY is required}"
: "${MARKET_WEBHOOK_URL:=https://4planetmarket.com/api/market-stripe-webhook}"

[[ "$STRIPE_LIVE_SECRET_KEY" == sk_live_* ]] || { echo 'Expected Stripe LIVE secret key' >&2; exit 2; }
echo "::add-mask::$STRIPE_LIVE_SECRET_KEY"

payload=$(curl -fsS -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_LIVE_SECRET_KEY:" \
  -d "url=$MARKET_WEBHOOK_URL" \
  -d 'enabled_events[0]=checkout.session.completed' \
  -d 'enabled_events[1]=checkout.session.async_payment_succeeded' \
  -d 'description=4PLANET MARKET Stripe to Prodigi v1')

endpoint_id=$(jq -r '.id // empty' <<<"$payload")
signing_secret=$(jq -r '.secret // empty' <<<"$payload")
[[ "$endpoint_id" == we_* ]] || { echo 'Stripe webhook endpoint was not created' >&2; exit 3; }
[[ "$signing_secret" == whsec_* ]] || { echo 'Stripe webhook signing secret was not returned' >&2; exit 3; }
echo "::add-mask::$signing_secret"

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "endpoint_id=$endpoint_id" >> "$GITHUB_OUTPUT"
  echo "signing_secret=$signing_secret" >> "$GITHUB_OUTPUT"
else
  echo "endpoint_id=$endpoint_id"
  echo 'signing_secret=[masked]'
fi
