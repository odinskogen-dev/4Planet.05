const SUPABASE_URL = "https://ghvdzetmplqkdtfqiror.supabase.co";
const SUPABASE_KEY = "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";
const SDK_SRC = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js";

export type FourPlanetUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type FourPlanetSession = {
  access_token: string;
  refresh_token: string;
  user: FourPlanetUser;
};

type AuthError = { message: string } | null;
type SessionResponse = { data: { session: FourPlanetSession | null }; error: AuthError };
type UserIdentity = { id?: string; provider?: string; identity_id?: string };
export type OAuthAuthorizationDetails = {
  authorization_id?: string;
  redirect_url?: string;
  redirect_uri?: string;
  scope?: string;
  client?: { name?: string; client_id?: string };
};
type SupabaseClientLike = {
  auth: {
    getSession(): Promise<SessionResponse>;
    signInWithPassword(input: { email: string; password: string }): Promise<SessionResponse>;
    signUp(input: { email: string; password: string; options?: { emailRedirectTo?: string } }): Promise<SessionResponse>;
    resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{ data: unknown; error: AuthError }>;
    updateUser(input: { password?: string; data?: Record<string, unknown> }): Promise<{ data: { user?: FourPlanetUser | null }; error: AuthError }>;
    signInWithOAuth(input: { provider: string; options?: { redirectTo?: string } }): Promise<{ data: { url?: string | null }; error: AuthError }>;
    signOut(input?: { scope?: "global" | "local" | "others" }): Promise<{ error: AuthError }>;
    verifyOtp(input: { token_hash: string; type: "email" }): Promise<SessionResponse>;
    getUserIdentities(): Promise<{ data: { identities: UserIdentity[] } | null; error: AuthError }>;
    onAuthStateChange(callback: (event: string, session: FourPlanetSession | null) => void): {
      data: { subscription: { unsubscribe(): void } };
    };
    oauth: {
      getAuthorizationDetails(authorizationId: string): Promise<{ data: OAuthAuthorizationDetails | null; error: AuthError }>;
      approveAuthorization(authorizationId: string): Promise<{ data: { redirect_url?: string } | null; error: AuthError }>;
      denyAuthorization(authorizationId: string): Promise<{ data: { redirect_url?: string } | null; error: AuthError }>;
    };
  };
};

declare global {
  interface Window {
    supabase?: {
      createClient(
        url: string,
        key: string,
        options?: { auth?: { persistSession?: boolean; autoRefreshToken?: boolean; detectSessionInUrl?: boolean } }
      ): SupabaseClientLike;
    };
  }
}

let sdkPromise: Promise<void> | null = null;
let singleton: SupabaseClientLike | null = null;

function loadSdk() {
  if (window.supabase?.createClient) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-fourplanet-auth-sdk="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Auth SDK failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.dataset.fourplanetAuthSdk = "1";
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Auth SDK failed to load"));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export async function getIdentityClient(): Promise<SupabaseClientLike> {
  if (singleton) return singleton;
  await loadSdk();
  if (!window.supabase?.createClient) throw new Error("Auth SDK unavailable");
  singleton = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return singleton;
}

const TRUSTED_HOSTS = new Set([
  "id.4planet.org",
  "4planet.org",
  "www.4planet.org",
  "4sapien.com",
  "www.4sapien.com",
  "s4piens.com",
  "www.s4piens.com",
  "4brands.org",
  "www.4brands.org",
  "4nation.org",
  "www.4nation.org",
  "partners.4planet.org",
  "4planetmarket.com",
  "www.4planetmarket.com",
  "4planetmagazine.com",
  "www.4planetmagazine.com",
]);

export function safeReturnTo(value: string | null | undefined, fallback = "https://4planet.org/") {
  if (!value) return fallback;
  try {
    const url = new URL(value, window.location.origin);
    if (url.hostname === "oddekalv.org" || url.hostname.endsWith(".oddekalv.org")) return fallback;
    if (url.origin === window.location.origin || TRUSTED_HOSTS.has(url.hostname)) return url.href;
  } catch {
    return fallback;
  }
  return fallback;
}

export function identityLoginUrl(returnTo?: string) {
  const target = safeReturnTo(returnTo || (typeof window !== "undefined" ? window.location.href : "https://4planet.org/"));
  return `https://id.4planet.org/login?return_to=${encodeURIComponent(target)}`;
}

export function identityAccountUrl(returnTo?: string) {
  const target = safeReturnTo(returnTo || (typeof window !== "undefined" ? window.location.href : "https://4planet.org/"));
  return `https://id.4planet.org/account?return_to=${encodeURIComponent(target)}`;
}

export async function bridgeSessionTo(targetUrl: string, session: FourPlanetSession) {
  const target = new URL(safeReturnTo(targetUrl));
  if (target.origin === window.location.origin) {
    window.location.replace(target.href);
    return;
  }
  if (!TRUSTED_HOSTS.has(target.hostname) || target.hostname.endsWith("oddekalv.org")) {
    throw new Error("Untrusted return destination");
  }
  const response = await fetch(`${SUPABASE_URL}/functions/v1/four-planet-id-bridge`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target_origin: target.origin }),
    cache: "no-store",
    referrerPolicy: "no-referrer",
  });
  const payload = (await response.json()) as { token_hash?: string; error?: string };
  if (!response.ok || !payload.token_hash) throw new Error(payload.error || "Secure sign-in handoff failed");
  const callback = new URL("/auth/4planet/callback", target.origin);
  callback.hash = new URLSearchParams({
    token_hash: payload.token_hash,
    return_to: target.href,
  }).toString();
  window.location.replace(callback.href);
}

export async function consumeBridgeFromLocation() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const tokenHash = hash.get("token_hash");
  if (!tokenHash) return null;
  const returnTo = safeReturnTo(hash.get("return_to"), window.location.origin + "/");
  history.replaceState({}, "", window.location.pathname + window.location.search);
  const client = await getIdentityClient();
  const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data.session) throw new Error(error?.message || "Secure sign-in handoff expired");
  return { session: data.session, returnTo };
}

export async function readProfile(session: FourPlanetSession) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/four_planet_profiles?user_id=eq.${encodeURIComponent(session.user.id)}&select=user_id,display_name,avatar_url,locale`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error("Could not load account profile");
  const rows = (await response.json()) as Array<{ user_id: string; display_name?: string | null; avatar_url?: string | null; locale?: string | null }>;
  return rows[0] || null;
}

export async function saveProfile(session: FourPlanetSession, displayName: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/four_planet_profiles?on_conflict=user_id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: session.user.id,
      display_name: displayName.trim() || null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Could not save account profile");
}

export function identityCallbackUrl(mode: "login" | "reset", returnTo?: string) {
  const target = safeReturnTo(returnTo || "https://4planet.org/");
  const url = new URL("https://id.4planet.org/login");
  if (mode === "reset") url.searchParams.set("mode", "reset");
  url.searchParams.set("return_to", target);
  return url.href;
}

export const identityConstants = {
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_KEY,
  canonicalOrigin: "https://id.4planet.org",
};
