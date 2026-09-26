import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  bridgeSessionTo,
  consumeBridgeFromLocation,
  getIdentityClient,
  identityCallbackUrl,
  readProfile,
  safeReturnTo,
  saveProfile,
  type FourPlanetSession,
  type OAuthAuthorizationDetails,
} from "@/identity/identityClient";

type Mode = "login" | "signup" | "forgot" | "reset" | "account" | "callback" | "consent";

function modeFromLocation(): Mode {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const q = new URLSearchParams(window.location.search).get("mode");
  if (path === "/auth/4planet/callback") return "callback";
  if (path === "/oauth/consent") return "consent";
  if (path.endsWith("/account") || q === "account") return "account";
  if (q === "signup") return "signup";
  if (q === "forgot") return "forgot";
  if (q === "reset") return "reset";
  return "login";
}

function friendlyError(message: string) {
  if (/Invalid login credentials/i.test(message)) return "E-post eller passord er ikke riktig.";
  if (/Email not confirmed/i.test(message)) return "Bekreft e-postadressen din før du logger inn.";
  if (/User already registered/i.test(message)) return "Det finnes allerede en konto med denne e-postadressen.";
  if (/Password should be at least|weak password/i.test(message)) return "Velg et sterkere passord med minst 8 tegn.";
  if (/rate limit/i.test(message)) return "For mange forsøk. Vent litt og prøv igjen.";
  if (/expired|invalid.*token|otp/i.test(message)) return "Lenken er ugyldig eller utløpt. Be om en ny.";
  return "Noe gikk galt. Prøv igjen.";
}

export default function IdentityApp() {
  const [mode, setMode] = useState<Mode>(modeFromLocation());
  const [session, setSession] = useState<FourPlanetSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [identities, setIdentities] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"ok" | "err" | "">("");
  const [busy, setBusy] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthDetails, setOauthDetails] = useState<OAuthAuthorizationDetails | null>(null);

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const fallback = mode === "account" ? "https://id.4planet.org/account" : "https://4planet.org/";
    return safeReturnTo(params.get("return_to"), fallback);
  }, [mode]);

  function showStatus(message: string, kind: "ok" | "err" | "" = "") {
    setStatus(message);
    setStatusKind(kind);
  }

  async function continueWith(active: FourPlanetSession, destination = returnTo) {
    const target = safeReturnTo(destination, "https://4planet.org/");
    if (new URL(target).origin === window.location.origin && new URL(target).pathname === window.location.pathname) {
      setSession(active);
      setMode("account");
      return;
    }
    await bridgeSessionTo(target, active);
  }

  async function hydrateAccount(active: FourPlanetSession) {
    try {
      const [profile, identityResult] = await Promise.all([
        readProfile(active),
        (await getIdentityClient()).auth.getUserIdentities(),
      ]);
      setDisplayName(profile?.display_name || "");
      setIdentities((identityResult.data?.identities || []).map((item) => item.provider || "email").filter(Boolean));
    } catch {
      setIdentities([]);
    }
  }

  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    (async () => {
      try {
        const client = await getIdentityClient();
        const listener = client.auth.onAuthStateChange((event, next) => {
          if (!alive) return;
          setSession(next);
          if (event === "PASSWORD_RECOVERY") setMode("reset");
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();

        if (mode === "callback") {
          const bridged = await consumeBridgeFromLocation();
          if (!bridged) throw new Error("Secure sign-in handoff is missing");
          if (!alive) return;
          setSession(bridged.session);
          const params = new URLSearchParams(window.location.search);
          const final = safeReturnTo(params.get("final") || bridged.returnTo, bridged.returnTo);
          await continueWith(bridged.session, final);
          return;
        }

        const result = await client.auth.getSession();
        if (!alive) return;
        setSession(result.data.session);

        if (mode === "consent") {
          const authorizationId = new URLSearchParams(window.location.search).get("authorization_id");
          if (!authorizationId) throw new Error("Missing authorization request");
          if (!result.data.session) {
            window.location.replace(`https://id.4planet.org/login?return_to=${encodeURIComponent(window.location.href)}`);
            return;
          }
          const details = await client.auth.oauth.getAuthorizationDetails(authorizationId);
          if (details.error || !details.data) throw new Error(details.error?.message || "Invalid authorization request");
          if (details.data.redirect_url && !details.data.authorization_id) {
            window.location.replace(details.data.redirect_url);
            return;
          }
          setOauthDetails(details.data);
          setBusy(false);
          return;
        }

        if (result.data.session) {
          setEmail(result.data.session.user.email || "");
          await hydrateAccount(result.data.session);
          if (mode === "login") {
            await continueWith(result.data.session);
            return;
          }
          if (mode === "account") setMode("account");
        } else if (mode === "account") {
          setMode("login");
        }
      } catch (error) {
        if (alive) showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => { alive = false; unsubscribe(); };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    showStatus("");
    setBusy(true);
    try {
      const client = await getIdentityClient();
      if (mode === "login") {
        const result = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error || !result.data.session) throw new Error(result.error?.message || "Login failed");
        await continueWith(result.data.session);
        return;
      }
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Password should be at least 8 characters");
        if (password !== confirm) throw new Error("Passordene er ikke like.");
        const result = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: identityCallbackUrl("login", returnTo) },
        });
        if (result.error) throw new Error(result.error.message);
        if (result.data.session) {
          await continueWith(result.data.session);
          return;
        }
        showStatus("Konto opprettet. Sjekk e-posten din for å bekrefte adressen.", "ok");
        return;
      }
      if (mode === "forgot") {
        const result = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: identityCallbackUrl("reset", returnTo),
        });
        if (result.error) throw new Error(result.error.message);
        showStatus("Hvis adressen finnes hos oss, er en sikker tilbakestillingslenke sendt.", "ok");
        return;
      }
      if (mode === "reset") {
        if (password.length < 8) throw new Error("Password should be at least 8 characters");
        if (password !== confirm) throw new Error("Passordene er ikke like.");
        const result = await client.auth.updateUser({ password });
        if (result.error) throw new Error(result.error.message);
        showStatus("Passordet er oppdatert.", "ok");
        const current = await client.auth.getSession();
        if (current.data.session) setTimeout(() => continueWith(current.data.session as FourPlanetSession, "https://id.4planet.org/account"), 500);
      }
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    showStatus("");
    try {
      const client = await getIdentityClient();
      const result = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: identityCallbackUrl("login", returnTo) },
      });
      if (result.error) throw new Error(result.error.message);
      if (result.data.url) window.location.assign(result.data.url);
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
      setBusy(false);
    }
  }

  async function saveAccount() {
    if (!session) return;
    setBusy(true);
    try {
      await saveProfile(session, displayName);
      showStatus("Profilen er lagret.", "ok");
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
    } finally {
      setBusy(false);
    }
  }

  async function signOut(scope: "local" | "global") {
    setBusy(true);
    try {
      const client = await getIdentityClient();
      const result = await client.auth.signOut({ scope });
      if (result.error) throw new Error(result.error.message);
      setSession(null);
      setMode("login");
      showStatus(scope === "global" ? "Du er logget ut fra alle 4PLANET-sesjoner." : "Du er logget ut på denne enheten.", "ok");
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset() {
    if (!session?.user.email) return;
    setBusy(true);
    try {
      const client = await getIdentityClient();
      const result = await client.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: identityCallbackUrl("reset", "https://id.4planet.org/account"),
      });
      if (result.error) throw new Error(result.error.message);
      showStatus("Sikker lenke for passordendring er sendt.", "ok");
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
    } finally {
      setBusy(false);
    }
  }

  async function decideAuthorization(decision: "approve" | "deny") {
    const authorizationId = new URLSearchParams(window.location.search).get("authorization_id");
    if (!authorizationId) return;
    setBusy(true);
    showStatus("");
    try {
      const client = await getIdentityClient();
      const result = decision === "approve"
        ? await client.auth.oauth.approveAuthorization(authorizationId)
        : await client.auth.oauth.denyAuthorization(authorizationId);
      if (result.error || !result.data?.redirect_url) throw new Error(result.error?.message || "Authorization failed");
      window.location.replace(result.data.redirect_url);
    } catch (error) {
      showStatus(friendlyError(error instanceof Error ? error.message : String(error)), "err");
      setBusy(false);
    }
  }

  const title = mode === "signup" ? "Opprett 4PLANET ID" : mode === "forgot" ? "Tilbakestill passord" : mode === "reset" ? "Velg nytt passord" : mode === "account" ? "Din 4PLANET ID" : mode === "consent" ? "Gi tilgang" : "Logg inn";
  const lead = mode === "account"
    ? "Én identitet for 4PLANET, 4SAPIEN og tilknyttede 4PLANET-tjenester."
    : mode === "consent"
      ? "Kontroller hvilken 4PLANET-tjeneste som får tilgang til identiteten din."
      : "Én sikker innlogging på tvers av 4PLANET.";

  if (busy && mode === "callback") return <main className="identity-shell"><div className="identity-card"><div className="identity-brand">4PLANET ID</div><p>Fullfører sikker innlogging…</p><IdentityStyles /></div></main>;

  return (
    <main className="identity-shell">
      <section className="identity-card" aria-labelledby="identity-title" data-return-to={returnTo}>
        <a className="identity-brand" href="https://4planet.org/">4PLANET_</a>
        <div className="identity-kicker">ID · ONE ACCOUNT</div>
        <h1 id="identity-title">{title}</h1>
        <p className="identity-lead">{lead}</p>

        {mode === "consent" ? (
          <div className="identity-account">
            <div className="identity-section">
              <div className="identity-meta-label">Tjeneste</div>
              <div className="identity-value">{oauthDetails?.client?.name || "4PLANET service"}</div>
              <div className="identity-meta-label">Ber om</div>
              <div className="identity-value">{(oauthDetails?.scope || "openid profile email").split(" ").filter(Boolean).join(" · ")}</div>
            </div>
            <div className="identity-section">
              <button className="identity-primary" type="button" onClick={() => decideAuthorization("approve")} disabled={busy}>Fortsett</button>
              <button className="identity-secondary" type="button" onClick={() => decideAuthorization("deny")} disabled={busy}>Avbryt</button>
            </div>
          </div>
        ) : mode === "account" && session ? (
          <div className="identity-account">
            <div className="identity-section">
              <label htmlFor="display-name">Navn</label>
              <input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
              <button className="identity-primary" type="button" onClick={saveAccount} disabled={busy}>Lagre profil</button>
            </div>
            <div className="identity-section">
              <div className="identity-meta-label">E-post</div>
              <div className="identity-value">{session.user.email || "—"}</div>
              <div className="identity-meta-label">Innloggingsmetoder</div>
              <div className="identity-value">{identities.length ? Array.from(new Set(identities)).join(" · ") : "E-post"}</div>
            </div>
            <div className="identity-section">
              <h2>Sikkerhet</h2>
              <button className="identity-secondary" type="button" onClick={sendPasswordReset} disabled={busy}>Endre passord sikkert</button>
              <button className="identity-secondary" type="button" onClick={() => signOut("local")} disabled={busy}>Logg ut på denne enheten</button>
              <button className="identity-secondary identity-danger" type="button" onClick={() => signOut("global")} disabled={busy}>Logg ut overalt</button>
            </div>
            <div className="identity-links">
              <a href="https://4planet.org/">Til 4PLANET</a>
              <a href="https://4sapien.com/">Til 4SAPIEN</a>
              <a href="https://4planet.org/privacy">Personvern</a>
            </div>
          </div>
        ) : (
          <>
            {mode !== "forgot" && mode !== "reset" && (
              <>
                <button className="identity-google" type="button" onClick={google} disabled={busy}>Fortsett med Google</button>
                <div className="identity-divider"><span>ELLER</span></div>
              </>
            )}
            <form onSubmit={submit} noValidate>
              {mode !== "reset" && (
                <div className="identity-field">
                  <label htmlFor="identity-email">E-post</label>
                  <input id="identity-email" name="username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete={mode === "signup" ? "email" : "username"} inputMode="email" autoCapitalize="none" required />
                </div>
              )}
              {mode !== "forgot" && (
                <div className="identity-field">
                  <div className="identity-label-row">
                    <label htmlFor="identity-password">Passord</label>
                    {mode === "login" && <button className="identity-link" type="button" onClick={() => setMode("forgot")}>Glemt passord?</button>}
                  </div>
                  <div className="identity-password">
                    <input id="identity-password" name={mode === "login" ? "password" : "new-password"} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Skjul passord" : "Vis passord"}>{showPassword ? "Skjul" : "Vis"}</button>
                  </div>
                </div>
              )}
              {(mode === "signup" || mode === "reset") && (
                <div className="identity-field">
                  <label htmlFor="identity-confirm">Bekreft passord</label>
                  <input id="identity-confirm" name="new-password-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} autoComplete="new-password" required />
                </div>
              )}
              <button className="identity-primary" type="submit" disabled={busy}>
                {mode === "signup" ? "Opprett konto" : mode === "forgot" ? "Send sikker lenke" : mode === "reset" ? "Lagre nytt passord" : "Logg inn"}
              </button>
            </form>
            <div className="identity-switch">
              {mode === "signup" ? <>Har du konto? <button className="identity-link" type="button" onClick={() => setMode("login")}>Logg inn</button></> :
               mode === "forgot" ? <button className="identity-link" type="button" onClick={() => setMode("login")}>Tilbake til innlogging</button> :
               mode === "reset" ? null :
               <>Ny her? <button className="identity-link" type="button" onClick={() => setMode("signup")}>Opprett konto</button></>}
            </div>
          </>
        )}

        <div className={`identity-status ${statusKind}`} role="status" aria-live="polite">{status}</div>
        <p className="identity-fine">4PLANET ID bruker Supabase Auth. Passord lagres aldri av 4PLANET-nettsidene.</p>
      </section>
      <IdentityStyles />
    </main>
  );
}

function IdentityStyles() {
  return <style>{`
    :root{color-scheme:light}
    .identity-shell{min-height:100svh;display:grid;place-items:center;background:#fff;color:#080808;padding:42px 20px calc(42px + env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif}
    .identity-card{width:min(100%,500px)}
    .identity-brand{display:inline-block;color:#080808;text-decoration:none;font-size:25px;font-weight:760;letter-spacing:-.035em}
    .identity-kicker{margin-top:8px;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;color:#666}
    .identity-card h1{font-size:clamp(38px,7vw,52px);line-height:1;letter-spacing:-.05em;margin:48px 0 12px;font-weight:760}
    .identity-lead{font-size:18px;line-height:1.5;color:#333;margin:0 0 30px}
    .identity-google,.identity-primary,.identity-secondary{width:100%;min-height:54px;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer}
    .identity-google{background:#fff;border:1px solid #d8d8d4;color:#080808}
    .identity-primary{background:#39e86f;border:0;color:#07170b;margin-top:8px}
    .identity-secondary{background:#fff;border:1px solid #d8d8d4;color:#080808;margin-top:10px}
    .identity-danger{border-color:#e2b6b2;color:#9b1c12}
    button:disabled{opacity:.55;cursor:wait}
    .identity-divider{display:flex;align-items:center;gap:14px;margin:24px 0;color:#777;font-size:12px;letter-spacing:.09em}
    .identity-divider:before,.identity-divider:after{content:"";height:1px;background:#ddd;flex:1}
    .identity-field{margin-bottom:18px}
    .identity-field label{display:block;font-size:13px;font-weight:700;margin-bottom:8px}
    .identity-field input{width:100%;height:56px;border:1px solid #d8d8d4;border-radius:14px;background:#f7f7f4;padding:0 16px;font:inherit;font-size:17px;outline:none;box-sizing:border-box}
    .identity-field input:focus{border-color:#111;box-shadow:0 0 0 3px rgba(0,0,0,.07)}
    .identity-label-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
    .identity-password{position:relative}.identity-password input{padding-right:76px}.identity-password>button{position:absolute;right:8px;top:8px;height:40px;border:0;background:transparent;font-weight:700;cursor:pointer}
    .identity-link{border:0;background:transparent;padding:0;color:#159c46;font:inherit;cursor:pointer;text-decoration:none}
    .identity-link:hover{text-decoration:underline}
    .identity-switch{text-align:center;margin-top:25px;color:#666}
    .identity-status{min-height:22px;margin-top:16px;font-size:14px;line-height:1.45}.identity-status.err{color:#b42318}.identity-status.ok{color:#137333}
    .identity-fine{font-size:12px;line-height:1.55;color:#777;margin-top:24px}
    .identity-section{padding:22px 0;border-top:1px solid #e2e2de}.identity-section:first-child{border-top:0}.identity-section h2{font-size:20px;margin:0 0 14px}
    .identity-section>label{display:block;font-size:13px;font-weight:700;margin-bottom:8px}.identity-section>input{width:100%;height:54px;border:1px solid #d8d8d4;border-radius:14px;background:#f7f7f4;padding:0 16px;font:inherit;font-size:17px;box-sizing:border-box}
    .identity-meta-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#777;margin-top:14px}.identity-value{font-size:16px;margin-top:5px;overflow-wrap:anywhere}
    .identity-links{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px}.identity-links a{color:#159c46;text-decoration:none;font-size:14px}
    @media(max-width:560px){.identity-shell{place-items:start center;padding-top:36px}.identity-card h1{margin-top:42px}}
    @media(prefers-color-scheme:dark){:root{color-scheme:dark}.identity-shell{background:#000;color:#fff}.identity-brand{color:#fff}.identity-lead{color:#e8e8e8}.identity-google,.identity-secondary{background:#080808;border-color:#333;color:#fff}.identity-field input,.identity-section>input{background:#0d0d0d;border-color:#333;color:#fff}.identity-password>button{color:#ddd}.identity-section{border-color:#333}.identity-divider:before,.identity-divider:after{background:#333}}
  `}</style>;
}
