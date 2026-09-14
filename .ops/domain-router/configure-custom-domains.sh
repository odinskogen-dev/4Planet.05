#!/usr/bin/env bash
set -euo pipefail

: "${CF_API_TOKEN:?CLOUDFLARE_FACTORY_API_TOKEN is required}"
: "${CF_ACCOUNT_ID:?CLOUDFLARE_FACTORY_ACCOUNT_ID is required}"

CF_API="https://api.cloudflare.com/client/v4"
WORKER_NAME="4planet-product-domains"
AUTH=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

cf_get() { curl -fsS "${AUTH[@]}" "$CF_API$1"; }
cf_assert() {
  local body="$1" label="$2"
  if [ "$(jq -r '.success // false' <<<"$body")" != "true" ]; then
    echo "Cloudflare operation failed: $label" >&2
    jq '{success,errors,messages}' <<<"$body" >&2 || true
    return 1
  fi
}

verify=$(cf_get "/user/tokens/verify")
cf_assert "$verify" "token verify"

zone_json() {
  local name="$1" body
  body=$(cf_get "/zones?name=$name")
  cf_assert "$body" "zone lookup $name"
  [ "$(jq -r '.result | length' <<<"$body")" -ge 1 ]
  printf '%s' "$body"
}

PLANET_JSON=$(zone_json 4planet.org)
ATLAS_JSON=$(zone_json 4planetatlas.com)
SPECIES_JSON=$(zone_json 4species.com)
ZONE_PLANET=$(jq -r '.result[0].id' <<<"$PLANET_JSON")
ZONE_ATLAS=$(jq -r '.result[0].id' <<<"$ATLAS_JSON")
ZONE_SPECIES=$(jq -r '.result[0].id' <<<"$SPECIES_JSON")

for pair in "4planet.org:$PLANET_JSON" "4planetatlas.com:$ATLAS_JSON" "4species.com:$SPECIES_JSON"; do
  name=${pair%%:*}
  json=${pair#*:}
  status=$(jq -r '.result[0].status // empty' <<<"$json")
  account=$(jq -r '.result[0].account.id // empty' <<<"$json")
  [ "$status" = "active" ] || { echo "$name zone is not active: $status" >&2; exit 10; }
  [ "$account" = "$CF_ACCOUNT_ID" ] || { echo "$name is not in expected Cloudflare account" >&2; exit 11; }
done

echo "Uploading host-aware edge router..."
metadata=$(jq -nc '{main_module:"worker.mjs",compatibility_date:"2026-09-14"}')
upload=$(curl -fsS -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -F "metadata=$metadata;type=application/json" \
  -F "worker.mjs=@.ops/domain-router/worker.mjs;filename=worker.mjs;type=application/javascript+module" \
  "$CF_API/accounts/$CF_ACCOUNT_ID/workers/scripts/$WORKER_NAME")
cf_assert "$upload" "upload Worker $WORKER_NAME"

echo "Attaching Worker Custom Domains (Cloudflare manages DNS + TLS)..."
attach_domain() {
  local hostname="$1" zone_id="$2" zone_name="$3" payload response
  payload=$(jq -nc \
    --arg hostname "$hostname" \
    --arg service "$WORKER_NAME" \
    --arg zone_id "$zone_id" \
    --arg zone_name "$zone_name" \
    '{hostname:$hostname,service:$service,zone_id:$zone_id,zone_name:$zone_name,override_existing_origin:true}')
  response=$(curl -sS -X PUT "${AUTH[@]}" --data "$payload" "$CF_API/accounts/$CF_ACCOUNT_ID/workers/domains")
  cf_assert "$response" "attach custom domain $hostname"
  echo "ATTACHED $hostname -> $WORKER_NAME"
}
attach_domain "4planetatlas.com" "$ZONE_ATLAS" "4planetatlas.com"
attach_domain "www.4planetatlas.com" "$ZONE_ATLAS" "4planetatlas.com"
attach_domain "4species.com" "$ZONE_SPECIES" "4species.com"
attach_domain "www.4species.com" "$ZONE_SPECIES" "4species.com"

echo "Binding canonical redirects on existing 4planet.org paths..."
ensure_route() {
  local zone="$1" pattern="$2" routes id payload response
  routes=$(cf_get "/zones/$zone/workers/routes")
  cf_assert "$routes" "list Worker routes for $pattern"
  id=$(jq -r --arg p "$pattern" '.result[] | select(.pattern == $p) | .id' <<<"$routes" | head -n1)
  payload=$(jq -nc --arg pattern "$pattern" --arg script "$WORKER_NAME" '{pattern:$pattern,script:$script}')
  if [ -n "$id" ]; then
    response=$(curl -sS -X PUT "${AUTH[@]}" --data "$payload" "$CF_API/zones/$zone/workers/routes/$id")
    cf_assert "$response" "update Worker route $pattern"
    echo "UPDATED ROUTE $pattern"
  else
    response=$(curl -sS -X POST "${AUTH[@]}" --data "$payload" "$CF_API/zones/$zone/workers/routes")
    cf_assert "$response" "create Worker route $pattern"
    echo "CREATED ROUTE $pattern"
  fi
}
ensure_route "$ZONE_PLANET" "4planet.org/atlas*"
ensure_route "$ZONE_PLANET" "4planet.org/species*"

# Control-plane readback.
domains=$(cf_get "/accounts/$CF_ACCOUNT_ID/workers/domains")
cf_assert "$domains" "list Worker custom domains"
for host in 4planetatlas.com www.4planetatlas.com 4species.com www.4species.com; do
  service=$(jq -r --arg h "$host" '[.result[] | select(.hostname == $h)][0].service // empty' <<<"$domains")
  [ "$service" = "$WORKER_NAME" ] || { echo "Custom domain readback mismatch for $host: $service" >&2; exit 20; }
  echo "READBACK $host -> $service"
done

routes=$(cf_get "/zones/$ZONE_PLANET/workers/routes")
cf_assert "$routes" "readback 4planet.org Worker routes"
for pattern in '4planet.org/atlas*' '4planet.org/species*'; do
  service=$(jq -r --arg p "$pattern" '[.result[] | select(.pattern == $p)][0].script // empty' <<<"$routes")
  [ "$service" = "$WORKER_NAME" ] || { echo "Route readback mismatch for $pattern: $service" >&2; exit 21; }
  echo "READBACK $pattern -> $service"
done

probe_redirect() {
  local url="$1" expected="$2" headers status location
  for _ in $(seq 1 36); do
    headers=$(curl -sS -D - -o /dev/null --max-time 20 "$url" || true)
    status=$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}' <<<"$headers")
    location=$(awk 'BEGIN{IGNORECASE=1} /^location:/ {sub(/\r$/,""); print substr($0,11)}' <<<"$headers" | tail -n1 | xargs || true)
    if [[ "$status" =~ ^30[1278]$ && "$location" == "$expected"* ]]; then
      echo "PASS $url -> $status $location"
      return 0
    fi
    sleep 5
  done
  echo "FAIL redirect $url status=$status location=$location expected=$expected" >&2
  return 1
}
probe_2xx() {
  local url="$1" code
  for _ in $(seq 1 36); do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url" || true)
    if [[ "$code" =~ ^2 ]]; then
      echo "PASS $url -> $code"
      return 0
    fi
    sleep 5
  done
  echo "FAIL public URL $url status=$code" >&2
  return 1
}

probe_redirect "https://4planet.org/atlas" "https://4planetatlas.com/"
probe_redirect "https://4planet.org/species/orca" "https://4species.com/orca"
probe_2xx "https://4planetatlas.com/"
probe_2xx "https://4species.com/"
probe_2xx "https://4species.com/orca"
probe_redirect "https://www.4planetatlas.com/" "https://4planetatlas.com/"
probe_redirect "https://www.4species.com/orca" "https://4species.com/orca"

echo "DOMAIN_ROUTING_OK"
