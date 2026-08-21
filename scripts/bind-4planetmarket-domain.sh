#!/usr/bin/env bash
set -euo pipefail

UPSTREAM="https://4482f621.4planet-05.pages.dev"
MARKER="4market-gold-01-cad5f58"
DOMAIN="4planetmarket.com"

TOKEN=""
for candidate in "${TOKEN_1:-}" "${TOKEN_2:-}" "${TOKEN_3:-}" "${TOKEN_4:-}"; do
  if [ -n "$candidate" ]; then TOKEN="$candidate"; break; fi
done
if [ -z "$TOKEN" ]; then
  echo "No supported Cloudflare API token secret is available in this repository."
  exit 2
fi
TOKEN=$(printf '%s' "$TOKEN" | tr -d '\r\n')
TOKEN="${TOKEN#Bearer }"
TOKEN="${TOKEN#bearer }"
TOKEN="${TOKEN#CLOUDFLARE_API_TOKEN=}"
TOKEN="${TOKEN#CF_API_TOKEN=}"
TOKEN="${TOKEN#\"}"
TOKEN="${TOKEN%\"}"
TOKEN="${TOKEN#\'}"
TOKEN="${TOKEN%\'}"
test -n "$TOKEN"
echo "::add-mask::$TOKEN"
export CLOUDFLARE_API_TOKEN="$TOKEN"
echo "PASS — Cloudflare credential resolved from repository Actions secrets."

zones_file="$RUNNER_TEMP/cf-zones.json"
status=$(curl -sS -o "$zones_file" -w '%{http_code}' \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}&status=active")
test "$status" = "200"
jq -e '.success == true' "$zones_file" >/dev/null
ZONE_ID=$(jq -r '.result[0].id // empty' "$zones_file")
ACCOUNT_ID=$(jq -r '.result[0].account.id // empty' "$zones_file")
if [ -z "$ZONE_ID" ] || [ -z "$ACCOUNT_ID" ]; then
  echo "$DOMAIN is not yet an active zone accessible to the configured token."
  exit 3
fi
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
echo "PASS — $DOMAIN active zone resolved."

for url in "$UPSTREAM/" "$UPSTREAM/market" "$UPSTREAM/cre4tors"; do
  code=$(curl -L -sS -o /dev/null -w '%{http_code}' --connect-timeout 10 --max-time 30 "$url" || true)
  echo "$url -> HTTP $code"
  test "$code" = "200"
done

echo "PASS — immutable QA-passed Market upstream reachable."

cat > "$RUNNER_TEMP/4planetmarket-worker.mjs" <<'EOF'
const UPSTREAM = "https://4482f621.4planet-05.pages.dev";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const upstream = new URL(incoming.pathname || "/", UPSTREAM);
    upstream.search = incoming.search;

    const upstreamRequest = new Request(upstream.toString(), request);
    const response = await fetch(upstreamRequest);
    const headers = new Headers(response.headers);
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    headers.set("x-4planet-prototype", "4market-gold-01-cad5f58");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
};
EOF

cat > "$RUNNER_TEMP/4planetmarket-wrangler.toml" <<EOF
name = "4planetmarket-prototype"
main = "$RUNNER_TEMP/4planetmarket-worker.mjs"
compatibility_date = "2026-08-21"
account_id = "$CLOUDFLARE_ACCOUNT_ID"

[[routes]]
pattern = "4planetmarket.com"
custom_domain = true

[[routes]]
pattern = "www.4planetmarket.com"
custom_domain = true
EOF

npx --yes wrangler@latest deploy --config "$RUNNER_TEMP/4planetmarket-wrangler.toml"
echo "PASS — isolated 4MARKET Worker deployed."

check_live() {
  local url="$1"
  local safe_name
  safe_name=$(printf '%s' "$url" | tr '/:' '__')
  for attempt in $(seq 1 30); do
    headers="$RUNNER_TEMP/headers-${safe_name}-${attempt}.txt"
    code=$(curl -sS -D "$headers" -o /dev/null -w '%{http_code}' --connect-timeout 10 --max-time 30 "$url" || true)
    marker=$(grep -i '^x-4planet-prototype:' "$headers" | tr -d '\r' || true)
    robots=$(grep -i '^x-robots-tag:' "$headers" | tr -d '\r' || true)
    echo "$url -> HTTP $code · $marker · $robots (attempt $attempt/30)"
    if [ "$code" = "200" ] && echo "$marker" | grep -q "$MARKER"; then
      return 0
    fi
    sleep 10
  done
  return 1
}

check_live "https://4planetmarket.com/"
check_live "https://www.4planetmarket.com/"
check_live "https://4planetmarket.com/market"
check_live "https://4planetmarket.com/cre4tors"
echo "PASS — apex, www and controlled routes resolve over HTTPS with exact proxy marker."

npm ci
npx playwright install --with-deps chromium
node --input-type=module <<'NODE'
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('https://4planetmarket.com/', { waitUntil: 'networkidle', timeout: 60000 });
const body = (await page.locator('body').innerText()).toLowerCase();
if (!body.includes('art that') || !body.includes('something') || !body.includes('demo · not live commerce')) {
  throw new Error('4MARKET host-aware root did not render the expected Market Gold surface.');
}
if (new URL(page.url()).hostname !== '4planetmarket.com') {
  throw new Error(`Unexpected live hostname: ${page.url()}`);
}
const bridge = page.locator('a[href="https://cre4tors.com"]').first();
if (await bridge.count() === 0) {
  throw new Error('Expected 4MARKET → CRE4TORS domain bridge is missing.');
}
console.log('PASS — live 4MARKET root renders Market Gold and links back to CRE4TORS.');
await browser.close();
NODE

echo "PASS — DOMAIN LAUNCH VERIFIED."
echo "4planetmarket.com + www.4planetmarket.com -> isolated Cloudflare Worker -> immutable QA-passed Market preview 4482f621."
echo "4planet.org/main unchanged. Market remains noindex / DEMO commerce."
