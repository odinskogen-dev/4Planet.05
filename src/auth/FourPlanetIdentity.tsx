import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { T } from "@/styles/tokens";

const SUPABASE_URL = "https://ghvdzetmplqkdtfqiror.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";

type AuthMode = "signin" | "signup" | "account";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

type AuthSession = {
  user: AuthUser;
  access_token: string;
};

type AuthResult = {
  data: { session?: AuthSession | null; user?: AuthUser | null };
  error: { message?: string } | null;
};

type QueryResult = { error: { message?: string } | null };

type SupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: AuthSession | null } }>;
    onAuthStateChange: (
      callback: (event: string, session: AuthSession | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signInWithOAuth: (args: {
      provider: "google";
      options: { redirectTo: string };
    }) => Promise<{ data: unknown; error: { message?: string } | null }>;
    signInWithPassword: (args: { email: string; password: string }) => Promise<AuthResult>;
    signUp: (args: {
      email: string;
      password: string;
      options: { emailRedirectTo: string; data?: Record<string, unknown> };
    }) => Promise<AuthResult>;
    signOut: () => Promise<{ error: { message?: string } | null }>;
  };
  from: (table: string) => {
    upsert: (
      values: Record<string, unknown>,
      options: { onConflict: string },
    ) => Promise<QueryResult>;
  };
};

type SupabaseGlobal = {
  createClient: (
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ) => SupabaseClient;
};

declare global {
  interface Window {
    supabase?: SupabaseGlobal;
  }
}

type IdentityContextValue = {
  ready: boolean;
  user: AuthUser | null;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

function displayName(user: AuthUser | null) {
  if (!user) return "";
  const metadata = user.user_metadata || {};
  const candidate = metadata.full_name || metadata.name || metadata.display_name;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return user.email?.split("@")[0] || "4PLANET member";
}

function fourPlanetReturnUrl() {
  const path = `${window.location.pathname || "/"}${window.location.search || ""}`;
  return `https://4planet.org${path.startsWith("/") ? path : `/${path}`}`;
}

export function useFourPlanetIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error("useFourPlanetIdentity must be used inside FourPlanetIdentityProvider");
  return value;
}

export function FourPlanetIdentityProvider({ children }: { children: ReactNode }) {
  const [client] = useState<SupabaseClient | null>(() =>
    window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "4planet.identity.v1",
      },
    }) || null,
  );
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AuthMode | null>(null);

  const ensureProfile = useCallback(async (next: AuthSession | null) => {
    if (!client || !next?.user?.id) return;
    const name = displayName(next.user);
    await client
      .from("four_planet_profiles")
      .upsert(
        {
          user_id: next.user.id,
          display_name: name || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .catch(() => null);
  }, [client]);

  useEffect(() => {
    if (!client) {
      setReady(true);
      return;
    }
    let live = true;
    client.auth.getSession().then(({ data }) => {
      if (!live) return;
      setSession(data.session || null);
      setReady(true);
      void ensureProfile(data.session || null);
    }).catch(() => {
      if (live) setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      if (!live) return;
      setSession(next);
      if (next) {
        void ensureProfile(next);
        setMode(null);
      }
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, [client, ensureProfile]);

  const openAuth = useCallback((next: AuthMode = "signup") => {
    setMode(session ? "account" : next);
  }, [session]);
  const closeAuth = useCallback(() => setMode(null), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try { url = new URL(anchor.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (!["/join", "/members", "/ambassadors"].includes(url.pathname)) return;
      event.preventDefault();
      setMode(session ? "account" : "signup");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [session]);

  const value = useMemo<IdentityContextValue>(() => ({
    ready,
    user: session?.user || null,
    openAuth,
    closeAuth,
  }), [ready, session, openAuth, closeAuth]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
      <IdentityUtility user={session?.user || null} ready={ready} onOpen={openAuth} />
      {mode && (
        <IdentityModal
          client={client}
          mode={mode}
          user={session?.user || null}
          onMode={setMode}
          onClose={closeAuth}
        />
      )}
    </IdentityContext.Provider>
  );
}

function IdentityUtility({
  user,
  ready,
  onOpen,
}: {
  user: AuthUser | null;
  ready: boolean;
  onOpen: (mode?: AuthMode) => void;
}) {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const resolve = () => setTarget(document.querySelector(".public-header__actions"));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const styles = (
    <style>{`
      .public-header__join{display:none!important}
      .fourplanet-id-utility{display:flex;align-items:center;gap:10px;order:-1}
      .fourplanet-id-button{appearance:none;font-family:${T.mono};font-size:10px;letter-spacing:.12em;white-space:nowrap;cursor:pointer;transition:opacity .16s ease,transform .16s ease}
      .fourplanet-id-button:hover{opacity:.82}
      .fourplanet-id-login{border:0;background:transparent;color:inherit;padding:9px 0}
      .fourplanet-id-join{border:1px solid ${T.blue};background:${T.blue};color:#fff;padding:9px 12px;border-radius:999px;font-weight:600}
      .fourplanet-id-account{border:1px solid currentColor;background:transparent;color:inherit;padding:8px 11px;border-radius:999px;max-width:190px;overflow:hidden;text-overflow:ellipsis}
      .fourplanet-id-button:focus-visible{outline:3px solid currentColor;outline-offset:3px}
      @media(max-width:520px){.fourplanet-id-utility{gap:8px}.fourplanet-id-login{font-size:9px}.fourplanet-id-join{font-size:9px;padding:8px 10px}.fourplanet-id-account{font-size:9px;max-width:128px}.public-header__actions{gap:9px!important}}
      @media(max-width:380px){.fourplanet-id-login{display:none}.fourplanet-id-join::after{content:""}.fourplanet-id-join{padding-inline:9px}}
    `}</style>
  );

  if (!target) return styles;
  return (
    <>
      {styles}
      {createPortal(
        <div className="fourplanet-id-utility" aria-label="4PLANET account">
          {!ready ? null : user ? (
            <button type="button" className="fourplanet-id-button fourplanet-id-account" onClick={() => onOpen("account")} title={user.email || "4PLANET ID"}>
              4PLANET ID ✓
            </button>
          ) : (
            <>
              <button type="button" className="fourplanet-id-button fourplanet-id-login" onClick={() => onOpen("signin")}>LOG IN</button>
              <button type="button" className="fourplanet-id-button fourplanet-id-join" onClick={() => onOpen("signup")}>JOIN 4PLANET</button>
            </>
          )}
        </div>,
        target,
      )}
    </>
  );
}

function IdentityModal({
  client,
  mode,
  user,
  onMode,
  onClose,
}: {
  client: SupabaseClient | null;
  mode: AuthMode;
  user: AuthUser | null;
  onMode: (mode: AuthMode) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const google = async () => {
    if (!client) return setMessage("Identity service is not available. Please refresh and try again.");
    setBusy(true);
    setMessage("");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: fourPlanetReturnUrl() },
    });
    if (error) {
      setMessage(error.message || "Google sign-in could not start.");
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return setMessage("Identity service is not available. Please refresh and try again.");
    if (!email.trim() || password.length < 6) return setMessage("Enter your email and a password of at least 6 characters.");
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const result = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: fourPlanetReturnUrl() },
        });
        if (result.error) setMessage(result.error.message || "Account creation failed.");
        else if (!result.data.session) setMessage("Check your email to confirm your 4PLANET ID.");
      } else {
        const result = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error) setMessage(result.error.message || "Sign-in failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!client) return;
    setBusy(true);
    const { error } = await client.auth.signOut();
    setBusy(false);
    if (error) setMessage(error.message || "Could not sign out.");
    else onClose();
  };

  const isAccount = mode === "account" && user;
  const title = isAccount ? "Your 4PLANET ID" : mode === "signup" ? "Join 4PLANET" : "Welcome back";
  const intro = isAccount
    ? "One identity for your 4PLANET profile and the personal products connected to it."
    : mode === "signup"
      ? "Create a free 4PLANET ID. Explore publicly without an account; sign in when you want a personal profile and saved participation."
      : "Sign in to your 4PLANET ID.";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,.64)", backdropFilter: "blur(12px)", display: "grid", placeItems: "center", padding: 18 }}
    >
      <div style={{ width: "min(100%,460px)", maxHeight: "min(760px,calc(100vh - 36px))", overflow: "auto", background: "#fff", color: T.ink, borderRadius: 18, boxShadow: "0 28px 90px rgba(0,0,0,.3)" }}>
        <div style={{ height: 5, background: T.blue }} />
        <div style={{ padding: "26px clamp(20px,5vw,32px) 30px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".15em", color: T.blue }}>4PLANET ID_</div>
              <h2 style={{ margin: "10px 0 0", fontFamily: T.display, fontSize: 28, fontWeight: 600, letterSpacing: "-.035em" }}>{title}</h2>
            </div>
            <button type="button" aria-label="Close account dialog" onClick={onClose} style={{ border: 0, background: "transparent", color: T.dim, fontSize: 24, lineHeight: 1, cursor: "pointer", padding: 2 }}>×</button>
          </div>
          <p style={{ margin: "12px 0 24px", color: T.dim, fontSize: 14, lineHeight: 1.55 }}>{intro}</p>

          {isAccount ? (
            <>
              <div style={{ border: `1px solid ${T.line}`, padding: 16, borderRadius: 12, background: "#fafafa" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".12em", color: T.blue }}>SIGNED IN</div>
                <div style={{ marginTop: 8, fontFamily: T.display, fontSize: 18, fontWeight: 600 }}>{displayName(user)}</div>
                <div style={{ marginTop: 3, color: T.dim, fontSize: 13, wordBreak: "break-word" }}>{user.email}</div>
              </div>
              <a href="https://4sapien.com" style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "13px 15px", border: `1px solid ${T.line}`, borderRadius: 11, color: T.ink, textDecoration: "none", fontSize: 13.5 }}>
                <span>Open 4SAPIEN / Ask Embla</span><span style={{ color: T.blue }}>→</span>
              </a>
              <button type="button" onClick={signOut} disabled={busy} style={{ width: "100%", marginTop: 14, padding: "12px 14px", border: `1px solid ${T.line}`, borderRadius: 11, background: "transparent", color: T.ink, fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em", cursor: "pointer" }}>LOG OUT</button>
            </>
          ) : (
            <>
              <button type="button" disabled={busy} onClick={google} style={{ width: "100%", padding: "13px 16px", border: `1px solid ${T.line}`, borderRadius: 11, background: "#fff", color: T.ink, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Continue with Google</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: T.faint, fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".12em" }}><span style={{ height: 1, flex: 1, background: T.line }} />OR<span style={{ height: 1, flex: 1, background: T.line }} /></div>
              <form onSubmit={submit}>
                <label style={{ display: "block", fontSize: 12.5, color: T.dim }}>Email
                  <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "12px 13px", border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 15, outlineColor: T.blue }} />
                </label>
                <label style={{ display: "block", marginTop: 14, fontSize: 12.5, color: T.dim }}>Password
                  <input type="password" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "12px 13px", border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 15, outlineColor: T.blue }} />
                </label>
                <button type="submit" disabled={busy} style={{ width: "100%", marginTop: 18, padding: "13px 16px", border: `1px solid ${T.blue}`, borderRadius: 11, background: T.blue, color: "#fff", fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: ".12em", cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1 }}>{busy ? "WORKING…" : mode === "signup" ? "CREATE 4PLANET ID" : "LOG IN"}</button>
              </form>
              {message && <div role="status" style={{ marginTop: 14, padding: "10px 12px", borderRadius: 9, background: "#f5f5f5", color: T.dim, fontSize: 12.5, lineHeight: 1.45 }}>{message}</div>}
              <button type="button" onClick={() => { setMessage(""); onMode(mode === "signup" ? "signin" : "signup"); }} style={{ display: "block", margin: "17px auto 0", border: 0, background: "transparent", color: T.blue, fontSize: 13, cursor: "pointer" }}>{mode === "signup" ? "Already have a 4PLANET ID? Log in" : "New to 4PLANET? Create your ID"}</button>
              <p style={{ margin: "20px 0 0", color: T.faint, fontSize: 11.5, lineHeight: 1.5 }}>By creating an account you agree to the <a href="/terms" style={{ color: "inherit" }}>Terms</a> and acknowledge the <a href="/privacy" style={{ color: "inherit" }}>Privacy Policy</a>.</p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
