import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: T.blue };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.045em" };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: `1px solid ${T.lineStrong}`, background: "transparent", color: T.ink, padding: "12px 13px", font: "inherit" };

const CONFIG = {
  project: { title: "PROJECT SPONSOR", min: 50_000, max: 250_000, step: 10_000, initial: 100_000, leadType: "4brands", productKey: "project_sponsor", referenceLabel: "Project / area you want to support", detail: "Support one defined project. Visibility, rights, consideration and deliverables are agreed before invoicing." },
  mission: { title: "MISSION SPONSOR", min: 250_000, max: 750_000, step: 25_000, initial: 500_000, leadType: "4brands", productKey: "mission_sponsor", referenceLabel: "Mission you want to support", detail: "Support one defined 4PLANET Mission. Sponsorship consideration and claims are agreed before invoicing." },
  package: { title: "SPONSOR PACKAGE", min: 100_000, max: 500_000, step: 25_000, initial: 250_000, leadType: "4brands", productKey: "sponsor_package", referenceLabel: "What should the package support?", detail: "Build a negotiated sponsorship package around a defined 4PLANET scope. The package becomes payable only after rights, consideration and tax/VAT treatment are agreed." },
  pilot: { title: "PILOT / FUNDER", min: 100_000, max: 300_000, step: 25_000, initial: 200_000, leadType: "4funders", productKey: "b2b_pilot_funder", referenceLabel: "Pilot / funding scope", detail: "Fund a bounded 4PLANET pilot or B2B engagement. Scope, deliverables, counterparty and invoice terms are agreed before payment." },
  patron: { title: "FOUNDING PATRON", min: 250_000, max: 1_500_000, step: 50_000, initial: 500_000, leadType: "4funders", productKey: "founding_patron", referenceLabel: "What draws you to 4PLANET?", detail: "Founding support for the shared build, intended primarily for private patrons, philanthropists and family offices. It is not presented as tax-deductible." },
} as const;

type Kind = keyof typeof CONFIG;
const nok = (value: number) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);

function readKind(value: string | null): Kind {
  return value && Object.prototype.hasOwnProperty.call(CONFIG, value) ? value as Kind : "project";
}

export default function Sponsor() {
  const [params] = useSearchParams();
  const kind = readKind(params.get("type"));
  const cfg = CONFIG[kind];
  const [amount, setAmount] = useState(() => cfg.initial);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const mailto = useMemo(() => `mailto:odin.skogen@gmail.com?subject=${encodeURIComponent(`4PLANET ${cfg.title} enquiry`)}&body=${encodeURIComponent(`Intended amount: ${nok(amount)}\n\n`)}`, [amount, cfg.title]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      type: cfg.leadType,
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      company: String(form.get("company") || ""),
      interest: String(form.get("reference") || ""),
      message: String(form.get("message") || ""),
      consent: form.get("consent") === "on",
      sourceRoute: `/sponsor?type=${kind}`,
      offerType: cfg.productKey,
      intendedAmountNok: amount,
      referenceKey: String(form.get("reference") || ""),
    };
    setState("sending");
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.delivered === true) setState("sent");
      else if (response.ok && body.delivered === false) setState("fallback");
      else setState("error");
    } catch { setState("error"); }
  }

  return (
    <PublicShell>
      <Seo title={`${cfg.title} | 4PLANET`} description="Choose an intended support level. Payment happens through a reviewed Stripe invoice after scope and terms are agreed." path={`/sponsor?type=${kind}`} />
      <Section pad="clamp(56px,8vw,112px)">
        <div style={mono}>4PLANET · NEGOTIATED SUPPORT</div>
        <h1 style={{ ...display, color: T.ink, marginTop: 18, fontSize: "clamp(42px,7vw,88px)", lineHeight: .92, maxWidth: 900 }}>{cfg.title}</h1>
        <p style={{ maxWidth: 740, color: T.dim, fontSize: 18, lineHeight: 1.6, marginTop: 24 }}>{cfg.detail}</p>

        <div style={{ marginTop: 48, maxWidth: 820, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "baseline" }}><span style={mono}>INTENDED PAYMENT LEVEL</span><strong style={{ color: T.ink, fontSize: 30 }}>{nok(amount)}</strong></div>
          <input aria-label="Intended payment amount" type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: "100%", marginTop: 24 }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: T.faint, fontFamily: T.mono, fontSize: 10.5, marginTop: 8 }}><span>{nok(cfg.min)}</span><span>{nok(cfg.max)}</span></div>
          <p style={{ color: T.dim, lineHeight: 1.55, marginTop: 18 }}>This selector does not charge you and is not a binding order. It sets the amount you want 4PLANET to review for a later Stripe invoice.</p>
        </div>

        {state === "sent" ? (
          <div style={{ marginTop: 42, maxWidth: 720, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 24 }}>
            <div style={mono}>ENQUIRY RECEIVED</div>
            <p style={{ color: T.ink, lineHeight: 1.6 }}>4PLANET received your enquiry. No payment has been taken. The next step is agreement on scope, counterparty, consideration, tax/VAT and terms. After approval, a Stripe Invoice can be created for the agreed amount and paid on Stripe's hosted invoice page.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 42, maxWidth: 720, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 24, display: "grid", gap: 16 }}>
            <div style={mono}>TELL US WHO YOU ARE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><input name="name" required placeholder="Name" style={field} /><input name="email" required type="email" placeholder="Email" style={field} /></div>
            <input name="company" placeholder={kind === "patron" ? "Organisation / family office (optional)" : "Company / organisation"} style={field} />
            <input name="reference" required placeholder={cfg.referenceLabel} style={field} />
            <textarea name="message" placeholder="Anything we should know?" rows={4} style={{ ...field, resize: "vertical" }} />
            <label style={{ display: "flex", gap: 10, color: T.dim, lineHeight: 1.5, fontSize: 13 }}><input required type="checkbox" name="consent" style={{ marginTop: 3 }} /><span>I agree that 4PLANET may use these details to respond to this enquiry. This is not marketing consent and no payment is taken by this form.</span></label>
            <button type="submit" disabled={state === "sending"} style={{ justifySelf: "start", border: `1px solid ${T.ink}`, background: T.ink, color: T.paper, padding: "12px 16px", font: "inherit", fontWeight: 600, cursor: "pointer" }}>{state === "sending" ? "SENDING…" : "REQUEST PAYMENT AGREEMENT"}</button>
            {(state === "fallback" || state === "error") && <div role="alert" style={{ color: T.dim, lineHeight: 1.55 }}>The automated enquiry destination is not available right now. No payment was taken. <a href={mailto} className="link" style={{ color: T.blue }}>Email the enquiry directly →</a></div>}
            <p style={{ color: T.faint, fontSize: 12, lineHeight: 1.5 }}>After qualification, the internal billing path creates an exact Stripe draft invoice inside the approved amount corridor. It remains unsent until a human verifies the agreement, amount, reference and tax/VAT treatment.</p>
          </form>
        )}

        <div style={{ marginTop: 48 }}><Link to="/join" className="link" style={{ color: T.blue }}>← ALL WAYS TO SUPPORT</Link></div>
      </Section>
    </PublicShell>
  );
}
