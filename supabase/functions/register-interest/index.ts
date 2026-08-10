import { createClient } from "npm:@supabase/supabase-js@^2";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://4planet.org",
  "https://www.4planet.org",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
];

const INTEREST_MAP: Record<string, string> = {
  "follow 4planet": "FOLLOW",
  "test the product": "PRODUCT_TEST",
  "contribute expertise or data": "EXPERTISE_DATA",
  "creative participation": "CREATIVE",
  partnership: "PARTNERSHIP",
  "funding / founding support": "FUNDING",
  "future membership": "FUTURE_MEMBERSHIP",
  FOLLOW: "FOLLOW",
  PRODUCT_TEST: "PRODUCT_TEST",
  EXPERTISE_DATA: "EXPERTISE_DATA",
  CREATIVE: "CREATIVE",
  PARTNERSHIP: "PARTNERSHIP",
  FUNDING: "FUNDING",
  FUTURE_MEMBERSHIP: "FUTURE_MEMBERSHIP",
};

const SOURCE_CHANNELS = new Set(["DIRECT", "SOCIAL", "PRESS", "PARTNER", "CAMPAIGN", "REFERRAL", "EVENT", "UNKNOWN"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

function allowedOrigins() {
  const configured = Deno.env.get("JOIN_ALLOWED_ORIGINS");
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(",").map((value) => value.trim()).filter(Boolean);
}

function response(body: unknown, status: number, origin: string | null) {
  const allow = origin && allowedOrigins().includes(origin) ? origin : DEFAULT_ALLOWED_ORIGINS[0];
  return Response.json(body, {
    status,
    headers: {
      "access-control-allow-origin": allow,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "vary": "Origin",
      "cache-control": "no-store",
    },
  });
}

function sourceDetail(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const cleaned = clean(source[key], 120);
    if (cleaned) result[key] = cleaned;
  }
  return result;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (origin && !allowedOrigins().includes(origin)) return response({ ok: false }, 403, origin);
    return response({ ok: true }, 200, origin);
  }
  if (request.method !== "POST") return response({ ok: false, error: "method_not_allowed" }, 405, origin);
  if (origin && !allowedOrigins().includes(origin)) return response({ ok: false, error: "origin_not_allowed" }, 403, origin);

  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > 16_384) {
    return response({ ok: false, error: "payload_too_large" }, 413, origin);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return response({ ok: false, error: "invalid_json" }, 400, origin);
  }

  if (clean(input.company_hp, 80)) return response({ ok: true, delivered: false, stored: false, reason: "filtered" }, 200, origin);

  const name = clean(input.name, 120);
  const email = clean(input.email, 254).toLowerCase();
  const organisation = clean(input.organisation, 160);
  const message = clean(input.message, 1200);
  const interestRaw = clean(input.interestType || input.interest, 80);
  const interestType = INTEREST_MAP[interestRaw] || INTEREST_MAP[interestRaw.toLowerCase()];
  const sourceRoute = clean(input.sourceRoute, 200) || "/join";
  const sourceChannelRaw = clean(input.sourceChannel, 30).toUpperCase() || "DIRECT";
  const sourceChannel = SOURCE_CHANNELS.has(sourceChannelRaw) ? sourceChannelRaw : "UNKNOWN";
  const privacyNoticeVersion = clean(input.privacyNoticeVersion, 60);
  const marketingConsent = input.marketingConsent === true;

  if (!name) return response({ ok: false, error: "name_required" }, 400, origin);
  if (!emailPattern.test(email)) return response({ ok: false, error: "email_invalid" }, 400, origin);
  if (!interestType) return response({ ok: false, error: "interest_invalid" }, 400, origin);
  if (input.privacyAcknowledged !== true) return response({ ok: false, error: "privacy_acknowledgement_required" }, 400, origin);
  if (!privacyNoticeVersion) return response({ ok: false, error: "privacy_notice_version_required" }, 400, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  let secretKey = "";
  const secretMapRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretMapRaw) {
    try {
      const secretMap = JSON.parse(secretMapRaw) as Record<string, string>;
      secretKey = secretMap.default || "";
    } catch {
      // Invalid project-secret map: fail closed below.
    }
  }
  if (!supabaseUrl || !secretKey) return response({ ok: false, error: "storage_not_configured" }, 503, origin);

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("register_interest_server", {
    p_email_norm: email,
    p_display_name: name,
    p_organisation: organisation,
    p_interest_type: interestType,
    p_message: message,
    p_source_route: sourceRoute,
    p_source_channel: sourceChannel,
    p_source_detail: sourceDetail(input.sourceDetail),
    p_privacy_notice_version: privacyNoticeVersion,
    p_marketing_consent: marketingConsent,
  });

  if (error) {
    console.error("register_interest_server failed", { code: error.code });
    return response({ ok: false, error: "storage_failed" }, 500, origin);
  }
  if (data?.rate_limited === true) {
    return response({ ok: false, error: "rate_limited" }, 429, origin);
  }

  return response({ ok: true, delivered: true, stored: true, enquiryId: data?.enquiry_id }, 201, origin);
});
