import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";

const ROLES = [
  ["4PEOPLE_MEMBER", "4PEOPLE MEMBER_"],
  ["FOUNDING_MEMBER", "FOUNDING MEMBER_"],
  ["MISSION_BACKER", "MISSION BACKER_"],
  ["4AMBASSADOR", "4AMBASSADOR_"],
] as const;

type Session = { authenticated: boolean; user?: { id: string; email?: string | null } };
type Overview = {
  schemaReady?: boolean;
  profile?: { display_name?: string | null; member_role?: string; country_code?: string | null; locale?: string } | null;
  preferences?: { marketing_consent?: boolean } | null;
  payments?: Array<{ stripe_object_id: string; product_key?: string; product_family?: string; currency?: string; amount_minor?: number | null; financial_state?: string; mission?: string | null; updated_at?: string }>;
  impact?: Array<{ id: string; product_key: string; financial_state: string; delivery_state: string; evidence_state: string; outcome_state: string; created_at: string }>;
};

const label: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: T.blue };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 13px", border: `1px solid ${T.line}`, background: "transparent", color: T.ink, font: "inherit" };
const button: React.CSSProperties = { border: `1px solid ${T.ink}`, background: T.ink, color: T.bg, padding: "11px 14px", cursor: "pointer", font: "inherit", fontWeight: 600 };

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  return { response, body: await response.json().catch(() => ({})) as Record<string, unknown> };
}

function money(amountMinor?: number | null, currency?: string) {
  if (typeof amountMinor !== "number") return "—";
  try { return new Intl.NumberFormat("nb-NO", { style: "currency", currency: (currency || "NOK").toUpperCase() }).format(amountMinor / 100); }
  catch { return `${amountMinor / 100} ${(currency || "NOK").toUpperCase()}`; }
}

export default function Me4Planet() {
  const [session, setSession] = useState<Session | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("4PEOPLE_MEMBER");
  const [stage, setStage] = useState<"email" | "token">("email");
  const [status, setStatus] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("NO");
  const [marketing, setMarketing] = useState(false);

  const load = async () => {
    const s = await api("/api/auth/session");
    const next = s.body as unknown as Session;
    setSession(next);
    if (next.authenticated) {
      const o = await api("/api/me/overview");
      const data = o.body as unknown as Overview;
      setOverview(data);
      setDisplayName(data.profile?.display_name ?? "");
      setRole(data.profile?.member_role ?? "4PEOPLE_MEMBER");
      setCountryCode(data.profile?.country_code ?? "NO");
      setMarketing(Boolean(data.preferences?.marketing_consent));
    }
  };

  useEffect(() => { void load(); }, []);

  const requestOtp = async () => {
    setStatus("SENDER KODE…");
    const result = await api("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ email, role }) });
    if (!result.response.ok) { setStatus(String(result.body.error ?? "Kunne ikke sende kode")); return; }
    setStage("token");
    setStatus("Kode sendt. Sjekk e-posten din.");
  };

  const verifyOtp = async () => {
    setStatus("VERIFISERER…");
    const result = await api("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, token }) });
    if (!result.response.ok) { setStatus(String(result.body.error ?? "Ugyldig kode")); return; }
    setStatus("");
    await load();
  };

  const saveProfile = async () => {
    setStatus("LAGRER…");
    const result = await api("/api/me/overview", { method: "POST", body: JSON.stringify({ displayName, memberRole: role, countryCode, locale: "nb-NO", marketingConsent: marketing }) });
    setStatus(result.response.ok ? "LAGRET" : String(result.body.error ?? "Kunne ikke lagre"));
    if (result.response.ok) await load();
  };

  const signout = async () => { await api("/api/auth/signout", { method: "POST", body: "{}" }); setOverview(null); setSession({ authenticated: false }); setStage("email"); };

  const openBilling = async () => {
    setStatus("ÅPNER BILLING…");
    const result = await api("/api/stripe/portal", { method: "POST", body: "{}" });
    const url = typeof result.body.url === "string" ? result.body.url : null;
    if (url) window.location.assign(url); else setStatus(String(result.body.error ?? "Billing er ikke klar ennå"));
  };

  if (session === null) return <div style={{ minHeight: "100vh", background: T.bg }} />;

  if (!session.authenticated) {
    return (
      <PublicShell>
        <Seo title="ME4PLANET | 4PLANET" description="Din 4PLANET-konto, støtte, betalinger og personlige impact-historikk." path="/me" />
        <Section pad="clamp(56px,8vw,110px)">
          <div style={label}>ME4PLANET · ACCOUNT</div>
          <h1 style={{ marginTop: 18, fontSize: "clamp(40px,7vw,86px)", letterSpacing: "-.055em", lineHeight: .95, color: T.ink, fontWeight: 500 }}>Your place in a living planet.</h1>
          <p style={{ maxWidth: 650, marginTop: 22, color: T.dim, fontSize: 17, lineHeight: 1.6 }}>Logg inn med en engangskode på e-post. Ingen passord. Kontoen skal etter hvert samle medlemskap, betalinger og en ærlig tidslinje fra contribution til eventuell delivery, evidence og outcome.</p>
          <div style={{ maxWidth: 520, marginTop: 42, borderTop: `1px solid ${T.line}`, paddingTop: 22 }}>
            {stage === "email" ? <>
              <label style={label}>E-post</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" style={{ ...input, marginTop: 9 }} placeholder="you@example.com" />
              <label style={{ ...label, display: "block", marginTop: 20 }}>Jeg kommer inn som</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...input, marginTop: 9 }}>
                {ROLES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
              </select>
              <button type="button" onClick={requestOtp} disabled={!email} style={{ ...button, marginTop: 18 }}>SEND ENGANGSKODE</button>
            </> : <>
              <div style={label}>Kode sendt til {email}</div>
              <input value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" style={{ ...input, marginTop: 12, fontSize: 22, letterSpacing: ".18em" }} placeholder="000000" />
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" onClick={verifyOtp} disabled={token.length < 6} style={button}>LOGG INN</button>
                <button type="button" onClick={() => setStage("email")} style={{ ...button, background: "transparent", color: T.ink }}>BYTT E-POST</button>
              </div>
            </>}
            {status && <div style={{ ...label, marginTop: 16, color: T.dim }}>{status}</div>}
            <p style={{ marginTop: 22, color: T.faint, fontSize: 12.5, lineHeight: 1.55 }}>Ved å opprette konto behandles nødvendige kontoopplysninger for å levere ME4PLANET. Markedsføring er et separat valg og er av som standard. <Link to="/privacy" className="link">Personvern</Link>.</p>
          </div>
        </Section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <Seo title="ME4PLANET | 4PLANET" description="Din 4PLANET-konto, støtte, betalinger og personlige impact-historikk." path="/me" />
      <Section pad="clamp(48px,7vw,90px)">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div><div style={label}>ME4PLANET</div><h1 style={{ marginTop: 10, color: T.ink, fontWeight: 500, fontSize: "clamp(34px,5vw,64px)", letterSpacing: "-.045em" }}>Your account.</h1></div>
          <button type="button" onClick={signout} style={{ ...button, alignSelf: "flex-start", background: "transparent", color: T.ink }}>LOGG UT</button>
        </div>

        {overview?.schemaReady === false && <div style={{ marginTop: 28, border: `1px solid ${T.line}`, padding: 18, color: T.dim }}>ME4PLANET-koden er aktiv, men databaseskjemaet er ikke tilgjengelig i dette miljøet ennå. Ingen brukerdata blir funnet på eller simulert.</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28, marginTop: 42 }}>
          <section style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
            <div style={label}>PROFILE</div>
            <label style={{ ...label, display: "block", marginTop: 18 }}>Navn · valgfritt</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ ...input, marginTop: 8 }} />
            <label style={{ ...label, display: "block", marginTop: 16 }}>Rolle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...input, marginTop: 8 }}>{ROLES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
            <label style={{ ...label, display: "block", marginTop: 16 }}>Land</label>
            <input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))} style={{ ...input, marginTop: 8 }} />
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, color: T.dim, lineHeight: 1.45 }}><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> <span>Jeg vil motta 4PLANET-oppdateringer. Dette er frivillig og kan trekkes tilbake.</span></label>
            <button type="button" onClick={saveProfile} style={{ ...button, marginTop: 18 }}>LAGRE</button>
          </section>

          <section style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
            <div style={label}>BILLING</div>
            <p style={{ color: T.dim, lineHeight: 1.55 }}>Betalingskort skal administreres hos Stripe, ikke lagres i ME4PLANET.</p>
            <button type="button" onClick={openBilling} style={button}>MANAGE BILLING</button>
            <div style={{ marginTop: 18, display: "grid", gap: 8 }}><Link to="/legal/payments" className="link">Betaling og angrerett</Link><Link to="/privacy" className="link">Personvern</Link></div>
          </section>
        </div>

        <section style={{ marginTop: 52, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
          <div style={label}>PAYMENTS</div>
          {(overview?.payments?.length ?? 0) === 0 ? <p style={{ color: T.dim }}>Ingen betalinger er koblet til kontoen ennå.</p> : overview?.payments?.map((p) => <div key={p.stripe_object_id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "15px 0", borderTop: `1px solid ${T.line}` }}><div><strong>{p.product_key ?? "4PLANET"}</strong><div style={{ color: T.faint, fontSize: 12, marginTop: 4 }}>{p.financial_state}{p.mission ? ` · ${p.mission}` : ""}</div></div><div>{money(p.amount_minor, p.currency)}</div></div>)}
        </section>

        <section style={{ marginTop: 52, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
          <div style={label}>PERSONAL IMPACT</div>
          <p style={{ maxWidth: 720, color: T.dim, lineHeight: 1.55 }}>Betaling er startpunktet, ikke konklusjonen. ME4PLANET skal vise hvert steg uten å hoppe fra penger til påstått naturresultat.</p>
          {(overview?.impact?.length ?? 0) === 0 ? <div style={{ color: T.faint }}>Ingen IMPACT contributions koblet til kontoen ennå.</div> : overview?.impact?.map((item) => <div key={item.id} style={{ padding: "16px 0", borderTop: `1px solid ${T.line}` }}><strong>{item.product_key}</strong><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, fontFamily: T.mono, fontSize: 10.5, color: T.dim }}><span>{item.financial_state}</span><span>→ {item.delivery_state}</span><span>→ {item.evidence_state}</span><span>→ {item.outcome_state}</span></div></div>)}
        </section>

        {status && <div style={{ ...label, marginTop: 28, color: T.dim }}>{status}</div>}
      </Section>
    </PublicShell>
  );
}
