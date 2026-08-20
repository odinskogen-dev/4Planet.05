import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";

type OfferId = "mission-supporter" | "project-supporter" | "pilot-funder";
type Stage = "offers" | "details" | "ready" | "sending" | "unavailable" | "error";

type Offer = {
  id: OfferId;
  code: string;
  name: string;
  price: string;
  amountNok: number;
  bestFor: string;
  promise: string;
  funds: string[];
  receives: string[];
  excludes: string;
};

const TERMS_VERSION = "ZFC-PROTOTYPE-2026-08-20";

const OFFERS: Offer[] = [
  {
    id: "mission-supporter",
    code: "01_",
    name: "MISSION SUPPORTER_",
    price: "NOK 25,000",
    amountNok: 25000,
    bestFor: "A company that wants a credible first way into 4PLANET without a bespoke partnership process.",
    promise: "Support one named 4PLANET Mission and the shared public infrastructure that makes its work understandable and actionable.",
    funds: ["Bounded Mission development", "Public intelligence and participation infrastructure", "Source, claim and reporting discipline"],
    receives: ["Named supporter record, public or private", "Approved supporter language", "Digital confirmation and funding record", "Relevant progress/reporting updates"],
    excludes: "No ecological outcome, carbon, offset or exclusivity claim is included unless separately verified and contracted.",
  },
  {
    id: "project-supporter",
    code: "02_",
    name: "PROJECT SUPPORTER_",
    price: "NOK 100,000",
    amountNok: 100000,
    bestFor: "A company that wants to help make one concrete 4PLANET project or proof object real.",
    promise: "Fund a bounded project with a defined scope, budget allocation and evidence path — not a generic sustainability donation.",
    funds: ["A named project work package", "Product, evidence or public-action delivery", "Transparent allocation and project reporting"],
    receives: ["Project supporter attribution, public or private", "Defined funded scope", "Approved communication language", "Project progress and completion record"],
    excludes: "Field-partner outcomes and separately funded ecological units are never attributed to the supporter unless explicitly included in the funded scope.",
  },
  {
    id: "pilot-funder",
    code: "03_",
    name: "PILOT FUNDER_",
    price: "NOK 250,000",
    amountNok: 250000,
    bestFor: "A company or funder that wants to help prove a repeatable piece of 4PLANET infrastructure.",
    promise: "Fund a tightly scoped live pilot designed to produce a reusable proof: product, transaction, data, participation or reporting.",
    funds: ["Pilot build and launch", "Measurement and proof architecture", "Reusable learning for the next 4PLANET deployment"],
    receives: ["Pilot funder record", "Bounded pilot scope and success criteria", "Approved communication package", "Proof / learning report when complete"],
    excludes: "No control over independent evidence, editorial conclusions or ecological claims. Custom scope belongs in a separate strategic-partner process.",
  },
];

const revenueRails = [
  ["COMPANIES_", "Mission, Project and Pilot support"],
  ["MEMBERS_", "Free and paid recurring participation"],
  ["DONORS_", "Restricted or unrestricted support where legally appropriate"],
  ["IMPACT_", "Verified ecological action and field-partner units"],
  ["DIGITAL_", "Future intelligence, data and product revenue"],
];

function Money({ children }: { children: string }) {
  return <span className="mono" style={{ fontSize: 12, letterSpacing: ".08em", color: T.blue }}>{children}</span>;
}

function OfferCard({ offer, active, onSelect }: { offer: Offer; active: boolean; onSelect: () => void }) {
  return (
    <article style={{ border: `1px solid ${active ? T.blue : T.lineStrong}`, background: active ? "rgba(30,101,255,.035)" : "#fff", padding: "clamp(22px,3vw,34px)", display: "grid", alignContent: "space-between", minHeight: 430 }}>
      <div>
        <Money>{offer.code}</Money>
        <h2 style={{ fontSize: "clamp(25px,3vw,36px)", letterSpacing: "-.035em", lineHeight: 1.02, fontWeight: 500, marginTop: 18 }}>{offer.name}</h2>
        <div style={{ marginTop: 18, fontSize: 20, fontWeight: 500 }}>{offer.price}</div>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.62, color: T.dim }}>{offer.promise}</p>
        <div style={{ marginTop: 26, borderTop: `1px solid ${T.line}`, paddingTop: 20 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: T.faint }}>BEST FOR</div>
          <p style={{ marginTop: 9, fontSize: 13.5, lineHeight: 1.55, color: T.ink }}>{offer.bestFor}</p>
        </div>
      </div>
      <button onClick={onSelect} style={{ marginTop: 28, height: 46, border: `1px solid ${active ? T.blue : T.ink}`, background: active ? T.blue : T.ink, color: "#fff", padding: "0 18px", fontFamily: T.sans, fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: ".04em" }}>
        {active ? "SELECTED" : "CHOOSE THIS OFFER"} →
      </button>
    </article>
  );
}

export default function Support() {
  const hero = img("participationField");
  const [selectedId, setSelectedId] = useState<OfferId>("project-supporter");
  const [stage, setStage] = useState<Stage>("offers");
  const [message, setMessage] = useState("");
  const selected = useMemo(() => OFFERS.find((o) => o.id === selectedId)!, [selectedId]);

  const field: CSSProperties = { width: "100%", border: `1px solid ${T.lineStrong}`, background: "#fff", padding: "13px 14px", fontSize: 15, fontFamily: T.sans, color: T.ink, borderRadius: 0, boxSizing: "border-box" };

  function choose(id: OfferId) {
    setSelectedId(id);
    setStage("details");
    requestAnimationFrame(() => document.getElementById("funding-details")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      offerId: selectedId,
      company: String(fd.get("company") || "").trim(),
      orgNumber: String(fd.get("orgNumber") || "").trim(),
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      attribution: String(fd.get("attribution") || "private"),
      website: String(fd.get("website") || "").trim(),
      termsAccepted: fd.get("terms") === "on",
      termsVersion: TERMS_VERSION,
      company_hp: String(fd.get("company_hp") || ""),
    };
    setStage("sending");
    setMessage("");
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.configured === false) {
        setStage("unavailable");
        setMessage("Checkout is intentionally closed until Stripe test mode and the accounting path are configured. No payment was taken and no order was created.");
        return;
      }
      if (res.ok && typeof data.url === "string" && data.url.startsWith("https://")) {
        window.location.assign(data.url);
        return;
      }
      setStage("error");
      setMessage("The checkout test could not be started. Nothing was charged.");
    } catch {
      setStage("error");
      setMessage("The checkout test could not be started. Nothing was charged.");
    }
  }

  return (
    <PublicShell>
      <main style={{ background: "#fff", color: T.ink }}>
        <section style={{ position: "relative", minHeight: "92svh", display: "flex", alignItems: "flex-end", overflow: "hidden", background: "#080808", color: "#fff" }}>
          <img src={hero.src} alt="" aria-hidden loading="eager" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: hero.objectPosition || "50% 50%", opacity: .42 }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(4,8,10,.24),rgba(4,8,10,.86))" }} />
          <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 84, height: 4, background: T.blue }} />
          <div style={{ position: "relative", width: "100%", maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,12vw,158px) clamp(20px,5vw,72px) clamp(58px,8vw,90px)" }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "rgba(255,255,255,.66)" }}>ZERO FOUNDER CASH_ / B2B PROTOTYPE 01</div>
            <h1 style={{ fontWeight: 500, fontSize: "clamp(44px,7.5vw,94px)", lineHeight: .93, letterSpacing: "-.055em", maxWidth: 980, marginTop: 18 }}>Fund something real.<br />Know what happens next.</h1>
            <p style={{ fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.5, maxWidth: 700, marginTop: 26, color: "rgba(255,255,255,.86)" }}>A self-serve route for companies and funders to support a 4PLANET Mission, Project or Pilot — with bounded scope, transparent attribution and no meeting required.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
              <a href="#offers" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 18px", background: "#fff", color: T.ink, fontSize: 13, fontWeight: 500 }}>EXPLORE OFFERS →</a>
              <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 14px", border: "1px solid rgba(255,255,255,.34)", color: "rgba(255,255,255,.72)", fontSize: 10.5, letterSpacing: ".08em" }}>PROTOTYPE · TEST CHECKOUT ONLY</span>
            </div>
          </div>
        </section>

        <section style={{ borderBottom: `1px solid ${T.line}` }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 1 }} className="zfc-rails">
            {revenueRails.map(([name, desc]) => <div key={name} style={{ padding: "16px 18px", borderLeft: `1px solid ${T.line}` }}><div className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: T.blue }}>{name}</div><div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.45, marginTop: 8 }}>{desc}</div></div>)}
          </div>
        </section>

        <section id="offers" style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(64px,9vw,112px) clamp(20px,5vw,72px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: "clamp(28px,6vw,80px)", alignItems: "end" }} className="zfc-intro">
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: T.blue }}>STANDARDISED SUPPORT_</div>
              <h2 style={{ fontSize: "clamp(34px,5vw,62px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 500, marginTop: 16 }}>Three ways in.<br />One clean transaction.</h2>
            </div>
            <p style={{ color: T.dim, fontSize: 16, lineHeight: 1.65 }}>The buyer should not need to decode 4PLANET, negotiate a bespoke package or schedule a founder call. Each offer has a fixed purpose, explicit boundaries and a standard digital path.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: "clamp(38px,5vw,60px)" }} className="zfc-offers">
            {OFFERS.map((offer) => <OfferCard key={offer.id} offer={offer} active={selectedId === offer.id} onSelect={() => choose(offer.id)} />)}
          </div>
        </section>

        <section id="funding-details" style={{ background: "#f4f5f3", borderTop: `1px solid ${T.lineStrong}`, borderBottom: `1px solid ${T.lineStrong}` }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(64px,9vw,110px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(340px,.9fr)", gap: "clamp(30px,7vw,90px)" }} className="zfc-detail-grid">
            <div>
              <Money>SELECTED OFFER_</Money>
              <h2 style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500, marginTop: 16 }}>{selected.name}</h2>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 14 }}>{selected.price}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 38 }} className="zfc-two">
                <div><div className="mono" style={{ fontSize: 10.5, color: T.blue, letterSpacing: ".08em" }}>YOUR FUNDING SUPPORTS</div><div style={{ display: "grid", gap: 11, marginTop: 15 }}>{selected.funds.map((x) => <div key={x} style={{ fontSize: 14, lineHeight: 1.5, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 11 }}>{x}</div>)}</div></div>
                <div><div className="mono" style={{ fontSize: 10.5, color: T.blue, letterSpacing: ".08em" }}>YOUR COMPANY RECEIVES</div><div style={{ display: "grid", gap: 11, marginTop: 15 }}>{selected.receives.map((x) => <div key={x} style={{ fontSize: 14, lineHeight: 1.5, borderTop: `1px solid ${T.lineStrong}`, paddingTop: 11 }}>{x}</div>)}</div></div>
              </div>
              <div style={{ marginTop: 34, borderLeft: `3px solid ${T.blue}`, padding: "4px 0 4px 18px" }}><div className="mono" style={{ fontSize: 10.5, color: T.faint, letterSpacing: ".08em" }}>CLAIMS BOUNDARY</div><p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.dim, marginTop: 8 }}>{selected.excludes}</p></div>
            </div>

            <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,32px)", alignSelf: "start" }}>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: T.blue }}>DIGITAL FUNDING CHECKOUT_</div>
              <h3 style={{ fontSize: 25, letterSpacing: "-.025em", fontWeight: 500, marginTop: 12 }}>No meeting required.</h3>
              <p style={{ fontSize: 13.5, color: T.dim, lineHeight: 1.55, marginTop: 10 }}>Prototype flow. It will only open Stripe if test mode is explicitly configured server-side.</p>
              <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px" }} />
              <div style={{ display: "grid", gap: 13, marginTop: 24 }}>
                <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>COMPANY *</span><input name="company" required style={field} /></label>
                <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>ORGANISATION NUMBER</span><input name="orgNumber" style={field} /></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="zfc-two">
                  <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>CONTACT *</span><input name="name" required style={field} /></label>
                  <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>EMAIL *</span><input name="email" type="email" required style={field} /></label>
                </div>
                <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>WEBSITE</span><input name="website" type="url" placeholder="https://" style={field} /></label>
                <label><span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".07em", color: T.faint, marginBottom: 7 }}>ATTRIBUTION</span><select name="attribution" style={field} defaultValue="public"><option value="public">Public supporter record</option><option value="private">Private supporter record</option></select></label>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: T.dim, lineHeight: 1.5, marginTop: 4 }}><input name="terms" type="checkbox" required style={{ marginTop: 3 }} /><span>I accept the prototype standard terms and the claims boundary for {selected.name}. Terms version: {TERMS_VERSION}.</span></label>
              </div>
              {message && <div role="status" style={{ marginTop: 16, border: `1px solid ${stage === "error" ? "#a23" : T.lineStrong}`, padding: 13, fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>{message}</div>}
              <button type="submit" disabled={stage === "sending"} style={{ width: "100%", height: 48, marginTop: 20, border: 0, background: T.blue, color: "#fff", fontFamily: T.sans, fontSize: 13, fontWeight: 500, cursor: stage === "sending" ? "default" : "pointer", opacity: stage === "sending" ? .65 : 1 }}>
                {stage === "sending" ? "OPENING TEST CHECKOUT…" : `CONTINUE — ${selected.price} →`}
              </button>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".07em", color: T.faint, textAlign: "center", marginTop: 11 }}>NO LIVE PAYMENT UNLESS EXPLICITLY ENABLED SERVER-SIDE</div>
            </form>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(64px,9vw,110px) clamp(20px,5vw,72px)" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: T.blue }}>THE ZERO-FOUNDER JOURNEY_</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,54px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 500, marginTop: 14, maxWidth: 760 }}>Pitch to accounted revenue without founder intervention.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginTop: 42, borderTop: `1px solid ${T.lineStrong}`, borderLeft: `1px solid ${T.lineStrong}` }} className="zfc-journey">
            {["01 / QUALIFIED PITCH", "02 / DIGITAL DUE DILIGENCE", "03 / TERMS + PAYMENT", "04 / ORDER + ACCOUNTING", "05 / ALLOCATION", "06 / DELIVERY", "07 / REPORTING", "08 / RETENTION"].map((x, i) => <div key={x} style={{ minHeight: 130, padding: 20, borderRight: `1px solid ${T.lineStrong}`, borderBottom: `1px solid ${T.lineStrong}` }}><div className="mono" style={{ fontSize: 10, letterSpacing: ".06em", color: i < 3 ? T.blue : T.faint }}>{x}</div><p style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.5, marginTop: 20 }}>{["Actor-specific value proposition passes the Patagonia Quality Gate.", "Buyer sees scope, evidence, rights, exclusions, FAQ and price asynchronously.", "Standard terms + Stripe test/live checkout or invoice rail.", "Payment truth enters order ledger and accounting truth enters Fiken.", "Every NOK is attached to one funding object and one allocation key.", "Defined digital/project deliverables trigger without founder handling.", "Supporter receives truthful progress, proof and completion records.", "Renewal or next relevant offer is driven by actual fit, not spam."][i]}</p></div>)}
          </div>
        </section>

        <section style={{ background: T.ink, color: "#fff" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(58px,8vw,92px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 40 }} className="zfc-intro">
            <div><div className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "rgba(255,255,255,.54)" }}>QUALITY BEFORE AUTONOMY_</div><h2 style={{ fontSize: "clamp(32px,5vw,58px)", lineHeight: .98, letterSpacing: "-.04em", fontWeight: 500, marginTop: 14 }}>No autonomous outbound until the offer is worth receiving.</h2></div>
            <div style={{ alignSelf: "end" }}><p style={{ color: "rgba(255,255,255,.72)", fontSize: 15, lineHeight: 1.65 }}>Truth, actor intelligence, self-interest, incentive design, narrative, brand, visual quality, friction, red-team and recipient QA are hard gates. Fail one hard gate: do not send.</p><Link to="/brands" style={{ display: "inline-block", marginTop: 22, color: "#fff", borderBottom: "1px solid rgba(255,255,255,.5)", paddingBottom: 4, fontSize: 13 }}>Current 4Brands route →</Link></div>
          </div>
        </section>
      </main>

      <style>{`
        html{scroll-behavior:smooth}
        @media(max-width:900px){
          .zfc-rails{grid-template-columns:1fr 1fr!important}
          .zfc-offers{grid-template-columns:1fr!important}
          .zfc-intro,.zfc-detail-grid{grid-template-columns:1fr!important}
          .zfc-journey{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:620px){
          .zfc-rails,.zfc-journey,.zfc-two{grid-template-columns:1fr!important}
        }
      `}</style>
    </PublicShell>
  );
}
