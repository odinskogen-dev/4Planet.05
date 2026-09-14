#!/usr/bin/env bash
set -euo pipefail

: "${CF_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
CF_API="https://api.cloudflare.com/client/v4"
WORKER_NAME="4planet-product-domains"
AUTH=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

cf_get() { curl -fsS "${AUTH[@]}" "$CF_API$1"; }

verify=$(cf_get "/user/tokens/verify")
[ "$(jq -r '.success' <<<"$verify")" = "true" ]

planet_zone_json=$(cf_get "/zones?name=4planet.org")
[ "$(jq -r '.success' <<<"$planet_zone_json")" = "true" ]
CF_ACCOUNT_ID=$(jq -r '.result[0].account.id // empty' <<<"$planet_zone_json")
ZONE_PLANET=$(jq -r '.result[0].id // empty' <<<"$planet_zone_json")
[ -n "$CF_ACCOUNT_ID" ] && [ -n "$ZONE_PLANET" ]

zone_id() {
  local name="$1" json id status
  json=$(cf_get "/zones?name=$name")
  [ "$(jq -r '.success' <<<"$json")" = "true" ]
  id=$(jq -r '.result[0].id // empty' <<<"$json")
  status=$(jq -r '.result[0].status // empty' <<<"$json")
  [ -n "$id" ]
  [ "$status" = "active" ]
  printf '%s' "$id"
}
ZONE_ATLAS=$(zone_id 4planetatlas.com)
ZONE_SPECIES=$(zone_id 4species.com)

curl -fsSI --max-time 20 https://4planet-05.pages.dev/ >/dev/null

echo "Uploading edge router..."
metadata=$(jq -nc '{main_module:"worker.mjs",compatibility_date:"2026-09-14"}')
upload=$(curl -fsS -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -F "metadata=$metadata;type=application/json" \
  -F "worker.mjs=@.ops/domain-router/worker.mjs;filename=worker.mjs;type=application/javascript+module" \
  "$CF_API/accounts/$CF_ACCOUNT_ID/workers/scripts/$WORKER_NAME")
[ "$(jq -r '.success' <<<"$upload")" = "true" ]

echo "Configuring DNS..."
reset_host() {
  local zone="$1" name="$2" type="$3" content="$4" existing ids payload
  existing=$(cf_get "/zones/$zone/dns_records?name=$name")
  [ "$(jq -r '.success' <<<"$existing")" = "true" ]
  ids=$(jq -r '.result[] | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | .id' <<<"$existing")
  if [ -n "$ids" ]; then
    while read -r id; do
      [ -z "$id" ] && continue
      curl -fsS -X DELETE "${AUTH[@]}" "$CF_API/zones/$zone/dns_records/$id" | jq -e '.success == true' >/dev/null
    done <<<"$ids"
  fi
  payload=$(jq -nc --arg type "$type" --arg name "$name" --arg content "$content" '{type:$type,name:$name,content:$content,proxied:true,ttl:1}')
  curl -fsS -X POST "${AUTH[@]}" --data "$payload" "$CF_API/zones/$zone/dns_records" | jq -e '.success == true' >/dev/null
}
reset_host "$ZONE_ATLAS" "4planetatlas.com" "A" "192.0.2.1"
reset_host "$ZONE_ATLAS" "www.4planetatlas.com" "CNAME" "4planetatlas.com"
reset_host "$ZONE_SPECIES" "4species.com" "A" "192.0.2.1"
reset_host "$ZONE_SPECIES" "www.4species.com" "CNAME" "4species.com"

echo "Binding worker routes..."
ensure_route() {
  local zone="$1" pattern="$2" routes id payload
  routes=$(cf_get "/zones/$zone/workers/routes")
  [ "$(jq -r '.success' <<<"$routes")" = "true" ]
  id=$(jq -r --arg p "$pattern" '.result[] | select(.pattern == $p) | .id' <<<"$routes" | head -n1)
  payload=$(jq -nc --arg pattern "$pattern" --arg script "$WORKER_NAME" '{pattern:$pattern,script:$script}')
  if [ -n "$id" ]; then
    curl -fsS -X PUT "${AUTH[@]}" --data "$payload" "$CF_API/zones/$zone/workers/routes/$id" | jq -e '.success == true' >/dev/null
  else
    curl -fsS -X POST "${AUTH[@]}" --data "$payload" "$CF_API/zones/$zone/workers/routes" | jq -e '.success == true' >/dev/null
  fi
}
ensure_route "$ZONE_ATLAS" "4planetatlas.com/*"
ensure_route "$ZONE_ATLAS" "www.4planetatlas.com/*"
ensure_route "$ZONE_SPECIES" "4species.com/*"
ensure_route "$ZONE_SPECIES" "www.4species.com/*"
ensure_route "$ZONE_PLANET" "4planet.org/atlas*"
ensure_route "$ZONE_PLANET" "4planet.org/species*"

probe_redirect() {
  local url="$1" prefix="$2" headers status location
  for _ in $(seq 1 24); do
    headers=$(curl -sS -D - -o /dev/null --max-time 20 "$url" || true)
    status=$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}' <<<"$headers")
    location=$(awk 'BEGIN{IGNORECASE=1} /^location:/ {sub(/\r$/,""); print substr($0,11)}' <<<"$headers" | tail -n1 | xargs || true)
    if [[ "$status" =~ ^30[1278]$ && "$location" == "$prefix"* ]]; then
      echo "PASS $url -> $location"
      return 0
    fi
    sleep 5
  done
  echo "FAIL $url status=$status location=$location expected=$prefix" >&2
  return 1
}
probe_2xx() {
  local url="$1" code
  for _ in $(seq 1 24); do
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url" || true)
    if [[ "$code" =~ ^2 ]]; then
      echo "PASS $url -> $code"
      return 0
    fi
    sleep 5
  done
  echo "FAIL $url status=$code" >&2
  return 1
}

probe_redirect "https://4planet.org/atlas" "https://4planetatlas.com/"
probe_redirect "https://4planet.org/species/orca" "https://4species.com/orca"
probe_2xx "https://4planetatlas.com/"
probe_2xx "https://4species.com/"
probe_2xx "https://4species.com/orca"
probe_redirect "https://www.4species.com/orca" "https://4species.com/orca"

echo "DOMAIN_ROUTING_OK"
