import { useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, StatusLabel } from "@/components/ui";
import { CinematicImage } from "@/components/Cinematic";
import { img, type ImageKey, type ImageMeta } from "@/content/imageRegistry";

type AudienceId = "people" | "brands" | "partners" | "funders";
type HowPoint = [string, string];
type FieldDef = { name: string; label: string; type?: string; required?: boolean; half?: boolean };

interface Audience {
  id: AudienceId; code: string; title: string; heroKey: ImageKey;
  lead: string; why: string[]; how: HowPoint[]; building: string;
  status: string; statusLabel: string; supporting: string;
  submitLabel: string; secondaryNote: string;
  fields: FieldDef[]; interests?: boolean;
  related: [string, string][]; next: string;
  bottomKey?: ImageKey;   // v25: extra full-bleed image at the bottom to enrich the page
}

// Client posts ONLY to the server-side endpoint. The server decides (and truthfully reports)
// whether a real destination is configured. No client secrets, ever.
const LEADS_ENDPOINT = "/api/leads";
const CALENDAR_URL = (import.meta.env.VITE_PUBLIC_CALENDAR_URL as string | undefined) || "";
const leadType = (id: AudienceId) => "4" + id; // 4people / 4brands / 4partners / 4funders

function EntryHero({ code, title, lead, meta }: { code: string; title: string; lead: string; meta: ImageMeta }) {
  return (
    <section style={{ position: "relative", background: T.ink, color: "#fff", overflow: "hidden", minHeight: "100svh", display: "flex", alignItems: "flex-end" }}>
      <img src={meta.src} alt="" aria-hidden loading="eager" decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: meta.objectPosition || "50% 50%", opacity: .46 }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,8,.42), rgba(8,8,8,.74))" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 4, background: T.blue }} />
      <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "clamp(64px,11vw,150px) clamp(20px,5vw,72px)" }}>
        <span className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,.72)", letterSpacing: ".08em" }}>{code}</span>
        <h1 style={{ fontWeight: 500, color: "#fff", fontSize: "clamp(34px,5vw,62px)", letterSpacing: "-.04em", lineHeight: 1, marginTop: 16, maxWidth: 900 }}>{title}</h1>
        <p style={{ fontSize: "clamp(17px,2.2vw,22px)", color: "rgba(255,255,255,.9)", marginTop: 22, maxWidth: 640, lineHeight: 1.5 }}>{lead}</p>
      </div>
    </section>
  );
}

const PEOPLE_INTERESTS = ["Oceans", "Land & forests", "Human systems", "Culture", "Impact Pathways"];

function ActionForm({ a }: { a: Audience }) {
  const [state, setState] = useState<"idle" | "sending" | "delivered" | "pending" | "error">("idle");
  const [picks, setPicks] = useState<string[]>([]);
  const field: CSSProperties = { width: "100%", border: `1px solid ${T.lineStrong}`, background: "#fff", padding: "13px 14px", fontSize: 15, fontFamily: T.sans, color: T.ink, borderRadius: 0, boxSizing: "border-box" };
  const toggle = (x: string) => setPicks((p) => p.includes(x) ? p.filter((i) => i !== x) : [...p, x]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = { type: leadType(a.id), sourceRoute: `/${a.id}` };
    fd.forEach((v, k) => { data[k] = String(v); });
    data.consent = fd.get("consent") === "on";
    if (a.interests) data.interests = picks;
    setState("sending");
    try {
      const res = await fetch(LEADS_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.delivered === true) setState("delivered");
      else if (res.ok && body.delivered === false) setState("pending");
      else setState("error");
    } catch { setState("error"); }
  }

  if (state === "delivered") return (
    <div style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)", maxWidth: 640 }}>
      <StatusLabel>You're on the list</StatusLabel>
      <p style={{ fontSize: 16, color: T.ink, marginTop: 14, lineHeight: 1.6 }}>You're on the list. We'll be in touch as this part of 4Planet opens.</p>
    </div>
  );
  if (state === "pending") return (
    <div style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)", maxWidth: 640 }}>
      <StatusLabel>Opening soon</StatusLabel>
      <p style={{ fontSize: 16, color: T.ink, marginTop: 14, lineHeight: 1.6 }}>Interest registration is opening soon. This form is not collecting information yet — nothing was stored or sent. The Domains and Missions below are open to explore now.</p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)", maxWidth: 640, display: "grid", gap: 14 }}>
      {a.id === "brands" && CALENDAR_URL && (
        <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer" className="btn4" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 22px", fontSize: 13.5, fontWeight: 500, background: T.blue, color: "#fff", border: `1px solid ${T.blue}`, textDecoration: "none", width: "fit-content" }}>REQUEST A CONVERSATION →</a>
      )}
      {state === "error" && <p className="mono" style={{ fontSize: 12, color: T.red }}>Something went wrong — please try again in a moment.</p>}
      {/* honeypot — hidden from real users */}
      <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {a.fields.filter((f) => f.half).map((f) => (
          <div key={f.name}><Label style={{ marginBottom: 8 }}>{f.label}</Label><input name={f.name} required={f.required} type={f.type || "text"} style={field} /></div>
        ))}
      </div>
      {a.fields.filter((f) => !f.half).map((f) => (
        <div key={f.name}><Label style={{ marginBottom: 8 }}>{f.label}</Label><input name={f.name} required={f.required} type={f.type || "text"} style={field} /></div>
      ))}
      {a.interests && (
        <div>
          <Label style={{ marginBottom: 8 }}>What do you care about?</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PEOPLE_INTERESTS.map((x) => { const on = picks.includes(x); return (
              <button type="button" key={x} onClick={() => toggle(x)} className="mono" style={{ fontSize: 12, letterSpacing: ".04em", padding: "8px 12px", cursor: "pointer", background: on ? T.blue : "#fff", color: on ? "#fff" : T.ink, border: `1px solid ${on ? T.blue : T.lineStrong}` }}>{x}</button>
            ); })}
          </div>
        </div>
      )}
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: T.dim, lineHeight: 1.5 }}>
        <input required type="checkbox" name="consent" style={{ marginTop: 3 }} />
        <span>I agree to be contacted about 4Planet. No account is created and no payment is taken.</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button type="submit" disabled={state === "sending"} className="btn4 hov" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 22px", fontSize: 13.5, fontWeight: 500, background: T.blue, color: "#fff", border: `1px solid ${T.blue}`, cursor: state === "sending" ? "default" : "pointer", opacity: state === "sending" ? .6 : 1, fontFamily: T.sans, ["--acc" as keyof CSSProperties]: T.blue, ["--acc-fg" as keyof CSSProperties]: "#fff" }}>{state === "sending" ? "SENDING…" : a.submitLabel}</button>
        <span className="mono" style={{ fontSize: 11, color: T.faint, letterSpacing: ".06em" }}>{a.secondaryNote}</span>
      </div>
      <p style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.5, marginTop: 2 }}>We use your information to process your enquiry and contact you about 4Planet. We use carefully selected service providers to operate this process. You can ask us to remove your details at any time — see our <Link to="/privacy" className="link" style={{ color: T.blue }}>Privacy note</Link>.</p>
    </form>
  );
}

function AudiencePage(a: Audience) {
  return (
    <PublicShell>
      <EntryHero code={a.code} title={a.title} lead={a.lead} meta={img(a.heroKey)} />
      <Section pad="clamp(48px,7vw,90px)">
        <Label style={{ marginBottom: 14 }}>Why this matters</Label>
        <div style={{ maxWidth: 760, display: "grid", gap: 16 }}>
          {a.why.map((para, i) => <p key={i} style={{ fontSize: i === 0 ? "clamp(20px,2.4vw,28px)" : "clamp(16px,1.6vw,18px)", fontWeight: i === 0 ? 500 : 400, letterSpacing: i === 0 ? "-.02em" : "normal", color: i === 0 ? T.ink : T.dim, lineHeight: i === 0 ? 1.35 : 1.62 }}>{para}</p>)}
        </div>

        <div style={{ marginTop: "clamp(40px,6vw,68px)" }}>
          <Label style={{ marginBottom: 18 }}>What you can do</Label>
          <div className="tw" style={{ border: `1px solid ${T.line}` }}>
            {a.how.map(([h, d], i) => (
              <div key={h} style={{ padding: "clamp(22px,3vw,34px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
                <span className="mono" style={{ fontSize: 11, color: T.blue }}>{`0${i + 1}`}</span>
                <div style={{ fontWeight: 500, fontSize: 17, marginTop: 12 }}>{h}</div>
                <p style={{ fontSize: 14, color: T.dim, marginTop: 10, lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "clamp(40px,6vw,68px)", borderTop: `1px solid ${T.lineStrong}`, paddingTop: 30 }}>
          <Label style={{ marginBottom: 14 }}>What 4Planet builds with you</Label>
          <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.ink, lineHeight: 1.65, maxWidth: 760 }}>{a.building}</p>
          <p style={{ fontSize: 15, color: T.blue, marginTop: 16, maxWidth: 620, lineHeight: 1.55 }}>{a.supporting}</p>
        </div>

        <div style={{ marginTop: "clamp(36px,5vw,56px)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <StatusLabel>{a.statusLabel}</StatusLabel>
          <span style={{ fontSize: 14.5, color: T.dim, maxWidth: 620 }}>{a.status}</span>
        </div>

        <div style={{ marginTop: "clamp(28px,4vw,40px)" }}><ActionForm a={a} /></div>

        <div style={{ marginTop: "clamp(40px,6vw,68px)", borderTop: `1px solid ${T.lineStrong}`, paddingTop: 30 }}>
          <Label style={{ marginBottom: 14 }}>Where to go next</Label>
          <p style={{ fontSize: 15.5, color: T.ink, maxWidth: 680, lineHeight: 1.6 }}>{a.next}</p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 18 }}>
            {a.related.map(([t, to]) => <Link key={to + t} to={to} className="ul" style={{ fontSize: 14, color: T.blue }}>{t} →</Link>)}
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}

export function People() {
  return <AudiencePage
    id="people" code="4People_" title="Become part of the public movement for a living planet." heroKey="participationField" bottomKey="participationField2"
    submitLabel="JOIN 4PLANET" secondaryNote="FREE TO BEGIN · NO PAYMENT"
    lead="You do not need to be a scientist, activist or organisation to care about the living world. You need a clearer way in."
    why={[
      "4Planet gives people a place to understand environmental challenges, follow the Domains they care about and participate as credible pathways open.",
      "As a member, you help build the public side of 4Planet: the stories, missions, tools and future Impact Pathways that make environmental action easier to join.",
      "Membership is free to begin. More access opens as the system develops.",
    ]}
    how={[["Understand", "Follow domains, missions and living systems, explained without jargon."], ["Join free", "Register now and be first when participation and Impact Pathways open."], ["Participate", "Take part in 4Culture — film, sound, editorial and events that make the work visible."], ["Support", "Back the platform and proof infrastructure credible action depends on."]]}
    building="4Planet is building the public layer of a living-planet institution: where understanding, culture and credible action meet. Members shape which missions gain momentum and are first to access pathways as they open."
    supporting="Join free now and be first to access Domains, Field Notes and future Impact Pathways as they open."
    status="Anyone can register interest now. Membership access opens with the first secure public release — and registered members are contacted first."
    statusLabel="Membership — Opening soon / Join free"
    fields={[{ name: "name", label: "Name", required: true, half: true }, { name: "email", label: "Email", type: "email", required: true, half: true }]}
    interests
    related={[["Enter Domains", "/domains"], ["Explore Missions", "/missions"], ["Impact Pathways", "/impact"]]}
    next="Start by entering a domain that matters to you, then register your interest above. Join free now and be first to access Domains, Field Notes and future Impact Pathways as they open."
  />;
}

export function Brands() {
  return <AudiencePage
    id="brands" code="4Brands_" title="Help build credible environmental action people can understand and believe in." heroKey="s4piensDomainHero" bottomKey="cultureAnchor"
    submitLabel="BUILD WITH 4PLANET" secondaryNote="STRATEGIC COLLABORATION"
    lead="People expect more from brands than statements. They expect action that can be seen, understood and trusted."
    why={[
      "4Planet works with aligned companies to support missions, domains, campaigns and public environmental participation.",
      "A brand can help fund mission development, sponsor a Domain, support cultural work or build campaigns around credible action.",
      "Done well, this creates value both ways: more support for the living world, more trust for the brand, more meaningful participation for the audience.",
    ]}
    how={[["Sponsor a mission", "Support the development of a specific mission within a domain."], ["Sponsor a domain", "Back an entire domain or part of the system's infrastructure."], ["Campaign together", "Work with 4Culture on honest storytelling and employee engagement."], ["Earn credibility", "Engage only with claims that meet 4Planet's proof standard — never inflated impact."]]}
    building="4Planet builds strategic collaborations around real environmental missions: mission and domain sponsorship, campaigns and cultural work, employee engagement, and long-term credibility grounded in proof rather than messaging."
    supporting="Help build credible environmental action your audience can understand, follow and believe in."
    status="Brand partnership conversations are opening selectively. No public claims are made on a partner's behalf until they meet the proof standard."
    statusLabel="Brand partnerships — Partner validation"
    fields={[{ name: "name", label: "Contact name", required: true, half: true }, { name: "email", label: "Email", type: "email", required: true, half: true }, { name: "company", label: "Company", required: true, half: true }, { name: "role", label: "Role", half: true }, { name: "website", label: "Website (optional)" }, { name: "interest", label: "Area of interest" }]}
    related={[["4Culture — culture for action", "/domains/4culture"], ["Impact Pathways", "/impact"], ["Explore Missions", "/missions"]]}
    next="Tell us which missions or domains align with your purpose, and we'll open a brand dialogue. You can also start by exploring how 4Culture distributes the work."
  />;
}

export function Partners() {
  return <AudiencePage
    id="partners" code="4Partners_" title="Bring real environmental work into a system people can understand, support and follow." heroKey="e4rthDomainHero" bottomKey="whyImage"
    submitLabel="EXPLORE PARTNERSHIP" secondaryNote="MISSION ALIGNMENT"
    lead="Many organisations already do the work the world needs. They restore land, plant trees, remove waste, protect species, monitor ecosystems, build tools and conduct research in places most people never see."
    why={[
      "4Planet does not replace field organisations.",
      "It helps translate credible work into public understanding, support, evidence, stories and reporting.",
      "4Partners is for NGOs, field operators, scientists, universities, cleanup projects, restoration initiatives, technology builders, monitoring groups and local organisations that want to build missions together where there is real alignment.",
    ]}
    how={[["Deliver", "Run the field work behind future Impact Pathways."], ["Verify", "Help define the evidence and reporting standards claims are held to."], ["Research", "Contribute the science and monitoring behind missions."], ["Build", "Develop the tools, data and infrastructure the system needs."]]}
    building="4Planet builds Missions together with field partners where there is real alignment — translating credible work into public understanding, participation, proof and reporting, without overstating what has been done."
    supporting="Let's explore whether our missions align."
    status="4Planet is developing implementation and knowledge partnerships. Nothing is presented as delivered, verified or approved until it is."
    statusLabel="Partnerships — In development"
    fields={[{ name: "name", label: "Contact name", required: true, half: true }, { name: "email", label: "Email", type: "email", required: true, half: true }, { name: "organisation", label: "Organisation", required: true, half: true }, { name: "role", label: "Role", half: true }, { name: "website", label: "Website" }, { name: "workArea", label: "Relevant work area" }]}
    related={[["Living Systems", "/living-systems"], ["Explore Missions", "/missions"], ["Proof & Reports", "/reports"]]}
    next="If your work aligns with a domain or mission, start a partnership dialogue above. The goal is to build Missions together where there is real alignment."
  />;
}

export function Funders() {
  return <AudiencePage
    id="funders" code="4Funders_" title="Help build long-term public infrastructure for environmental action." heroKey="heroEarth" bottomKey="earthrise"
    submitLabel="START A DIALOGUE" secondaryNote="INSTITUTIONAL BACKING"
    lead="Environmental work needs more than campaigns. It needs infrastructure."
    why={[
      "Systems that help people understand what matters. Partners that can deliver. Evidence that can be trusted. Stories that can move culture. Funding that lets the work become durable.",
      "4Planet is being built as public infrastructure for a living planet.",
      "Strategic funding can help develop Domains, Missions, Impact Pathways, evidence models, editorial systems and the operating layer required to make credible action easier to join.",
    ]}
    how={[["Fund the platform", "Back the infrastructure credible public action depends on."], ["Fund missions", "Support the development of specific domains and missions."], ["Fund proof", "Back the evidence and reporting layer that makes claims trustworthy."], ["Help it scale", "Enable the first Impact Pathways to open responsibly."]]}
    building="4Planet builds long-term public infrastructure for environmental action: domains, missions, evidence, culture and Impact Pathways — designed to last, not to chase a single campaign cycle."
    supporting="Help build long-term public infrastructure for environmental action."
    status="4Planet is preparing its first mission and infrastructure funding pathways. No active funding pathway is presented as open until it is."
    statusLabel="Funding — In development"
    fields={[{ name: "name", label: "Contact name", required: true, half: true }, { name: "email", label: "Email", type: "email", required: true, half: true }, { name: "organisation", label: "Organisation / foundation", required: true, half: true }, { name: "role", label: "Role", half: true }, { name: "fundingInterest", label: "Funding interest" }]}
    related={[["The System", "/about"], ["Enter Domains", "/domains"], ["Proof & Reports", "/reports"]]}
    next="If long-term environmental infrastructure fits your mandate, request a funding dialogue above, or read how the whole system fits together."
  />;
}
