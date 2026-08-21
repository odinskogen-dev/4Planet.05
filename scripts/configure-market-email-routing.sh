#!/usr/bin/env bash
set -euo pipefail

DESTINATION_EMAIL="${DESTINATION_EMAIL:-odin.skogen@gmail.com}"
DOMAINS=("4planetmarket.com" "cre4tors.com")
LOCAL_PART="hello"

TOKEN="${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_TOKEN:-${CF_API_TOKEN:-${CF_TOKEN:-}}}}"
TOKEN="$(printf '%s' "$TOKEN" | tr -d '\r\n')"
TOKEN="${TOKEN#Bearer }"; TOKEN="${TOKEN#bearer }"
TOKEN="${TOKEN#CLOUDFLARE_API_TOKEN=}"; TOKEN="${TOKEN#CF_API_TOKEN=}"
TOKEN="${TOKEN#\"}"; TOKEN="${TOKEN%\"}"; TOKEN="${TOKEN#\'}"; TOKEN="${TOKEN%\'}"
if [[ -z "$TOKEN" ]]; then echo "FAIL — no supported Cloudflare API token secret available."; exit 2; fi
echo "::add-mask::$TOKEN"

cf_get() {
  curl -fsS -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' "$1"
}
cf_post_json() {
  local url="$1" body="${2:-}"
  local tmp status
  tmp="$(mktemp)"
  if [[ -n "$body" ]]; then
    status="$(curl -sS -o "$tmp" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' --data "$body" "$url")"
  else
    status="$(curl -sS -o "$tmp" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' "$url")"
  fi
  cat "$tmp"
  rm -f "$tmp"
  [[ "$status" =~ ^2 ]] || return 22
}

ACCOUNT_ID=""
ZONE_IDS=()
for domain in "${DOMAINS[@]}"; do
  zone_json="$(cf_get "https://api.cloudflare.com/client/v4/zones?name=${domain}&status=active")"
  jq -e '.success == true' <<<"$zone_json" >/dev/null
  zone_id="$(jq -r '.result[0].id // empty' <<<"$zone_json")"
  account_id="$(jq -r '.result[0].account.id // empty' <<<"$zone_json")"
  [[ -n "$zone_id" && -n "$account_id" ]] || { echo "FAIL — active Cloudflare zone unavailable for $domain."; exit 3; }
  if [[ -n "$ACCOUNT_ID" && "$ACCOUNT_ID" != "$account_id" ]]; then echo "FAIL — domains are not in the same Cloudflare account."; exit 4; fi
  ACCOUNT_ID="$account_id"; ZONE_IDS+=("$zone_id")
  echo "PASS — zone resolved: $domain"
done

addresses_json="$(cf_get "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/email/routing/addresses")"
jq -e '.success == true' <<<"$addresses_json" >/dev/null
destination_id="$(jq -r --arg email "$DESTINATION_EMAIL" '.result[]? | select((.email|ascii_downcase)==($email|ascii_downcase)) | .id' <<<"$addresses_json" | head -n1)"
destination_verified="$(jq -r --arg email "$DESTINATION_EMAIL" '.result[]? | select((.email|ascii_downcase)==($email|ascii_downcase)) | (.verified // "")' <<<"$addresses_json" | head -n1)"
if [[ -z "$destination_id" ]]; then
  body="$(jq -nc --arg email "$DESTINATION_EMAIL" '{email:$email}')"
  if ! create_json="$(cf_post_json "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/email/routing/addresses" "$body")"; then
    echo "FAIL — destination creation rejected: $(jq -c '{errors,messages}' <<<"$create_json" 2>/dev/null || echo 'non-JSON response')"; exit 6
  fi
  jq -e '.success == true' <<<"$create_json" >/dev/null
  destination_id="$(jq -r '.result.id // empty' <<<"$create_json")"; destination_verified="$(jq -r '.result.verified // ""' <<<"$create_json")"
  echo "ACTION — Cloudflare destination address created for $DESTINATION_EMAIL."
fi
if [[ -z "$destination_verified" || "$destination_verified" == "null" ]]; then
  echo "PENDING_DESTINATION_VERIFICATION — verification required for $DESTINATION_EMAIL; no MX/rule mutation performed."; exit 0
fi
echo "PASS — destination address is verified."

for i in "${!DOMAINS[@]}"; do
  domain="${DOMAINS[$i]}"; zone_id="${ZONE_IDS[$i]}"; address="${LOCAL_PART}@${domain}"

  mx_json="$(cf_get "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records?type=MX&per_page=100")"
  jq -e '.success == true' <<<"$mx_json" >/dev/null
  echo "INFO — $domain existing MX count: $(jq -r '.result|length' <<<"$mx_json")"
  foreign_mx="$(jq -r '[.result[]?.content | ascii_downcase | select((contains("route1.mx.cloudflare.net") or contains("route2.mx.cloudflare.net") or contains("route3.mx.cloudflare.net"))|not)] | length' <<<"$mx_json")"
  if [[ "$foreign_mx" != "0" ]]; then echo "FAIL — $domain already has non-Cloudflare MX records; refusing overwrite."; exit 5; fi

  routing_json="$(cf_get "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing")"
  jq -e '.success == true' <<<"$routing_json" >/dev/null
  routing_enabled="$(jq -r '.result.enabled // false' <<<"$routing_json")"; routing_status="$(jq -r '.result.status // "unknown"' <<<"$routing_json")"
  echo "INFO — $domain Email Routing state: enabled=$routing_enabled status=$routing_status"

  if [[ "$routing_enabled" != "true" || "$routing_status" != "ready" ]]; then
    # Current Cloudflare Email Routing API accepts an empty POST; avoid stale/wizard-specific body fields.
    if ! enable_json="$(cf_post_json "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing/dns")"; then
      echo "FAIL — Email Routing DNS enable rejected for $domain: $(jq -c '{errors,messages,result}' <<<"$enable_json" 2>/dev/null || echo 'non-JSON response')"
      exit 7
    fi
    jq -e '.success == true' <<<"$enable_json" >/dev/null
    echo "ACTION — Email Routing DNS enabled for $domain."
  else
    echo "PASS — Email Routing already ready for $domain."
  fi

  rules_json="$(cf_get "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing/rules?per_page=100")"
  jq -e '.success == true' <<<"$rules_json" >/dev/null
  existing_id="$(jq -r --arg address "$address" '.result[]? | select(any(.matchers[]?; .type=="literal" and .field=="to" and ((.value|ascii_downcase)==($address|ascii_downcase)))) | .id' <<<"$rules_json" | head -n1)"
  if [[ -z "$existing_id" ]]; then
    payload="$(jq -nc --arg address "$address" --arg dest "$DESTINATION_EMAIL" --arg name "4PLANET operational inbox — $address" '{name:$name,enabled:true,matchers:[{type:"literal",field:"to",value:$address}],actions:[{type:"forward",value:[$dest]}]}')"
    if ! rule_json="$(cf_post_json "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing/rules" "$payload")"; then
      echo "FAIL — routing-rule creation rejected for $address: $(jq -c '{errors,messages}' <<<"$rule_json" 2>/dev/null || echo 'non-JSON response')"; exit 8
    fi
    jq -e '.success == true' <<<"$rule_json" >/dev/null
    echo "ACTION — routing rule created: $address -> $DESTINATION_EMAIL"
  else
    echo "PASS — routing rule already exists for $address."
  fi
done

for i in "${!DOMAINS[@]}"; do
  domain="${DOMAINS[$i]}"; zone_id="${ZONE_IDS[$i]}"; address="${LOCAL_PART}@${domain}"
  settings="$(cf_get "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing")"
  rules="$(cf_get "https://api.cloudflare.com/client/v4/zones/${zone_id}/email/routing/rules?per_page=100")"
  jq -e '.success == true and .result.enabled == true and .result.status == "ready"' <<<"$settings" >/dev/null
  jq -e --arg address "$address" --arg dest "$DESTINATION_EMAIL" 'any(.result[]?; .enabled == true and any(.matchers[]?; .type=="literal" and .field=="to" and ((.value|ascii_downcase)==($address|ascii_downcase))) and any(.actions[]?; .type=="forward" and any(.value[]?; ((.|ascii_downcase)==($dest|ascii_downcase)))))' <<<"$rules" >/dev/null
  echo "VERIFIED — $address forwards to the verified Gmail destination."
done

echo "PASS — CRE4TORS_ + 4MARKET_ inbound email routing configured without touching web routing."
