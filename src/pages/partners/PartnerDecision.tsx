import { useEffect, useState, type FormEvent } from "react";

/* A public projection of 4PLANET's approved product boundaries. This is not a CRM,
   an opportunity register or an access-control system. No partner-specific data here. */
type Actor = { slug: string; name: string; question: string; fit: string; value: string; contribution: string; proof: string; boundary: string };
type Opportunity = { slug: string; name: string; audience: string; scope: string; output: string; evidence: string; status: string; limit: string };

const actors: Actor[] = [
  { slug: "company", name: "Companies & brands", question: "Where can business value and measurable planetary value reinforce each other?", fit: "4BRANDS · Company Value Engine", value: "Inspect value drivers, operational constraints and candidate interventions through the same evidence-led decision logic.", contribution: "A real decision owner, a bounded use case and authorised company information.", proof: "A baseline, controlled experiment and separate economic and planetary measurements.", boundary: "No claim of achieved savings, customer status or ecological results before measurement." },
  { slug: "foundation", name: "Foundations & philanthropy", question: "What public-interest capability could a defined grant make possible?", fit: "4PLANET · Living Planet Intelligence", value: "An inspectable public-interest object with defined outputs, uncertainty, governance and reporting.", contribution: "An eligible funding route, public-benefit criteria and review of a bounded object.", proof: "Public outputs, independently reviewable methods, use and funded-delivery reporting.", boundary: "Support does not purchase an editorial conclusion, scientific authority or impact claim." },
  { slug: "investor", name: "Investors & catalytic capital", question: "What is the product, proof and economic logic behind the portfolio?", fit: "4PLANET · 4SAPIEN · 4BRANDS", value: "Distinguish working product, hypotheses, user evidence, capital requirements and unproven markets.", contribution: "Stage-appropriate questions, diligence and a suitable capital instrument.", proof: "Versioned product evidence, actual user and cash signals, and explicit outstanding gates.", boundary: "This page is not a securities offer or a representation of secured capital." },
  { slug: "science", name: "Science & data", question: "Can a source or method remain authoritative as it becomes easier to use?", fit: "ATLAS · SPECIES · LIVING SYSTEMS", value: "Connect provenance, limitations, identity and relationships without replacing scientific judgement.", contribution: "Source access where licensed, subject expertise and independent challenge.", proof: "Traceable records, method checks and bounded reproducible cases.", boundary: "The source institution retains authority. Data access and redistribution require permission." },
  { slug: "field", name: "Field & delivery", question: "How could real interventions become inspectable without losing delivery authority?", fit: "IMPACT · Action Contract · Proof Passport", value: "Make scope, responsible actors, delivery state and evidence legible.", contribution: "Named intervention, capacity, geographical authority, reporting and remedy terms.", proof: "A defined unit, attributable delivery record and separately assessed outcome.", boundary: "No provider has been appointed by this page; intention is not physical delivery." },
  { slug: "public", name: "Public sector", question: "Can fragmented place evidence become useful to a specific public decision?", fit: "ATLAS · PLACE · Decision Intelligence", value: "A bounded place or decision brief with sources, alternatives and uncertainty visible.", contribution: "A lawful process, decision owner, public-service need and relevant source access.", proof: "Decision-usefulness testing, method review and measurable service outputs.", boundary: "No government mandate, procurement award or statutory authority is implied." },
  { slug: "culture", name: "Culture & media", question: "How can a living-system story travel without losing its sources or rights?", fit: "4CULTURE_ · Editorial & visual intelligence", value: "Rights-aware documentary stories connected to inspectable evidence.", contribution: "Creative expertise, rights, distribution and independent editorial judgement.", proof: "Released work, audience-use evidence and traceable source/rights decisions.", boundary: "Editorial independence and consent are not exchanged for funding." },
  { slug: "active", name: "Active partners", question: "Where are scope, decisions, evidence and next actions held?", fit: "Controlled partner workspace", value: "A role-scoped view of a real signed collaboration and its proof requirements.", contribution: "An authorised agreement, named owner and permissioned participants.", proof: "Milestones, delivery records, financial state and Proof Passport where applicable.", boundary: "No private workspace or partner relationship is created by viewing this public page." },
];

const opportunities: Opportunity[] = [
  { slug: "founding-build", name: "4PLANET Founding Build", audience: "Foundations · patrons · catalytic capital", scope: "A bounded build phase for the shared public intelligence and evidence infrastructure.", output: "Versioned product improvements, user proof, source integrity and reporting.", evidence: "Product runtime, budget and use-of-funds require current independent review.", status: "EXPLORATORY / TERMS NOT RELEASED", limit: "No amount, award, committed partner or guaranteed delivery is announced." },
  { slug: "sapien-proof", name: "4SAPIEN user proof", audience: "Research · foundations · distribution", scope: "Test whether source-aware personal decision intelligence is useful to real users, beginning with FOOD and FINANCE.", output: "Documented activation, repeat use, corrections and user-valued outcomes.", evidence: "Privacy, consent and actual observed-user proof remain explicit gates.", status: "EXPLORATORY / TERMS NOT RELEASED", limit: "A prototype does not establish behaviour change, retention or product-market fit." },
  { slug: "brands-proof", name: "4BRANDS design-partner proof", audience: "Companies · innovation teams", scope: "One company decision, baseline, constraints and a bounded value experiment.", output: "A decision-grade Value Map and a measured economic and planetary hypothesis.", evidence: "Real company data and an authorised decision owner are needed for validation.", status: "EXPLORATORY / TERMS NOT RELEASED", limit: "Public company analysis is not a customer relationship or realised value." },
  { slug: "science-data", name: "Living Planet Intelligence", audience: "Science · data · public sector", scope: "A source-linked species, place or system case with external method challenge.", output: "Reusable provenance, relationships, uncertainty and decision context.", evidence: "Individual source licences, data quality and independent review determine scope.", status: "EXPLORATORY / TERMS NOT RELEASED", limit: "4PLANET context does not inherit the source provider's scientific authority." },
  { slug: "plastic-proof", name: "Verified Plastic Recovery", audience: "Field providers · funders · impact partners", scope: "Qualify a real recovery unit, delivery chain and independent proof method.", output: "Action Contract, delivery evidence and Proof Passport subject to acceptance.", evidence: "Provider qualification, legal terms, economics and physical delivery remain separate gates.", status: "PRE-ACTION / TERMS NOT RELEASED", limit: "No plastic has been recovered, funded or independently verified by this proposed object." },
];

const scales = [
  { name: "4PLANET", label: "Planet intelligence", body: "ATLAS, SPECIES, LIVING SYSTEMS and IMPACT connect planetary records to relationships and bounded action.", status: "Public products and controlled proof cases", href: "https://4planet.org" },
  { name: "4SAPIEN", label: "Personal intelligence", body: "Ask Embla, FOOD, FINANCE and a persistent Personal Brain bring evidence into individual decisions. Facts, not advice.", status: "Developing / proof required", href: "https://4planet.org/4sapien" },
  { name: "4BRANDS", label: "Company intelligence", body: "Company Value Engine and Company Brain connect business objectives, constraints, interventions and measurement.", status: "Developing / bounded design-partner proof", href: "/4brand" },
];

function signal(name: string) {
  if (typeof window === "undefined") return;
  try {
    const eventName = "4planet_partner_" + name;
    window.dispatchEvent(new CustomEvent(eventName));
    const layer = window as Window & { dataLayer?: Array<Record<string, string>> };
    layer.dataLayer?.push({ event: eventName, surface: "partners" });
  } catch { /* Never fail a user action for analytics. */ }
}

function Meta({ label }: { label: string }) { return <span className="pd-meta">{label}</span>; }

export function PortfolioPage() {
  useEffect(() => { document.title = "Portfolio — 4PLANET Partners"; signal("portfolio_opened"); }, []);
  return <main className="pd-page">
    <header className="pd-hero"><Meta label="ONE SHARED INTELLIGENCE SYSTEM" /><h1>Three scales.<br />One living planet.</h1><p>Decision intelligence for planetary systems, individual lives and companies. Shared evidence and memory. Distinct jobs and explicit proof boundaries.</p></header>
    <section className="pd-scale-list" aria-label="4PLANET portfolio">
      {scales.map((item, i) => <article key={item.name}><span className="pd-number">0{i + 1}</span><div><Meta label={item.label} /><h2>{item.name}</h2><p>{item.body}</p><small>{item.status}</small></div><a href={item.href} onClick={() => signal("portfolio_product_selected")}>Explore ↗</a></article>)}
    </section>
    <section className="pd-dark"><Meta label="THE SHARED MOTOR" /><h2>Evidence → context → decision → action → measurement → learning.</h2><p>Persistent BRAIN, source and claim provenance, Universal Actor Value Engine, Action Contract and Proof Passport are shared infrastructure — not additional public products. Each transition must retain source authority and uncertainty.</p><a className="pd-light-link" href="/proof">Examine the proof boundaries ↗</a></section>
    <section className="pd-bottom"><h2>One coherent portfolio. No inherited proof.</h2><p>A working interface does not automatically establish repeat use, payment, ecological delivery or outcome. Each claim requires evidence at its own scale.</p><a href="/opportunities">Explore bounded opportunities ↗</a></section>
  </main>;
}

export function OpportunitiesPage({ slug }: { slug?: string }) {
  const selected = slug && opportunities.find((item) => item.slug === slug);
  useEffect(() => { document.title = "Opportunities — 4PLANET Partners"; signal("opportunity_viewed"); }, [slug]);
  return <main className="pd-page">
    <header className="pd-hero"><Meta label="EXPLORATORY COLLABORATION OBJECTS" /><h1>{selected ? selected.name : "Start with a real object."}</h1><p>{selected ? selected.scope : "Each opportunity starts with one problem, a bounded deliverable and an explicit proof gate. These are exploratory routes, not approved offers, funded projects or commitments."}</p></header>
    {selected ? <section className="pd-detail"><Meta label={selected.status} /><div><h2>Who this concerns</h2><p>{selected.audience}</p></div><div><h2>Possible output</h2><p>{selected.output}</p></div><div><h2>Evidence required</h2><p>{selected.evidence}</p></div><div className="pd-warning"><h2>Current boundary</h2><p>{selected.limit}</p></div><p>Budget, timetable, legal instrument, eligibility and any binding ask are held for current cost review and Founder-release.</p><a href={"/enquire?opportunity=" + encodeURIComponent(selected.slug)} onClick={() => signal("opportunity_interest")}>Register interest ↗</a><a href="/opportunities">All opportunities ↗</a></section> :
      <section className="pd-opportunities">{opportunities.map((item, i) => <a key={item.slug} href={"/opportunities/" + item.slug} onClick={() => signal("opportunity_selected")}><span className="pd-number">0{i + 1}</span><div><Meta label={item.status} /><h2>{item.name}</h2><p>{item.scope}</p><small>{item.audience}</small></div><span aria-hidden="true">↗</span></a>)}</section>}
  </main>;
}

export function ActorPage({ slug }: { slug?: string }) {
  const actor = actors.find((item) => item.slug === slug);
  useEffect(() => { document.title = "Partner routes — 4PLANET"; signal("actor_selected"); }, [slug]);
  return <main className="pd-page">
    <header className="pd-hero"><Meta label="A PARTNER PATHWAY FOR YOUR ROLE" /><h1>{actor ? actor.name : "What is your role?"}</h1><p>{actor ? actor.question : "Different actors need different evidence, responsibilities and ways to participate. The underlying 4PLANET truth remains the same."}</p></header>
    {actor ? <section className="pd-detail">
      <Meta label={actor.fit} />
      <div><h2>Relevant value</h2><p>{actor.value}</p></div>
      <div><h2>What you could bring</h2><p>{actor.contribution}</p></div>
      <div><h2>What would count as proof</h2><p>{actor.proof}</p></div>
      <div className="pd-warning"><h2>Boundary</h2><p>{actor.boundary}</p></div>
      <a href={"/enquire?role=" + encodeURIComponent(actor.slug)} onClick={() => signal("actor_interest")}>Explore a collaboration ↗</a>
      <a href="/opportunities">See possible opportunities ↗</a>
      <a href="/for">Other partner roles ↗</a>
    </section> : <section className="pd-roles">{actors.map((item) => <a key={item.slug} href={"/for/" + item.slug} onClick={() => signal("actor_route_opened")}><Meta label={item.fit} /><h2>{item.name}</h2><p>{item.question}</p><span aria-hidden="true">↗</span></a>)}</section>}
  </main>;
}

export function FourBrandsPitch() {
  useEffect(() => { document.title = "4BRANDS — 4PLANET Partners"; signal("fourbrands_opened"); }, []);
  return <main className="pd-page">
    <header className="pd-hero"><Meta label="COMPANY INTELLIGENCE" /><h1>Make the company better at what it already needs to do.</h1><p>4BRANDS uses the same evidence-led intelligence infrastructure to connect company objectives, economic reality, choices and measurable results — including the intersection with the living planet.</p></header>
    <section className="pd-scale-list">
      {["Actor & objective", "Economic baseline & constraints", "Decision-grade Value Map", "Bounded intervention", "Economic and planetary measurement", "Institutional memory & learning"].map((item, i) => <article key={item}><span className="pd-number">0{i + 1}</span><div><h2>{item}</h2><p>{i === 2 ? "Opportunities are hypotheses until company-specific inputs support them." : "Evidence, uncertainty, ownership and stage remain inspectable."}</p></div></article>)}
    </section>
    <section className="pd-dark"><Meta label="DESIGN-PARTNER PROOF" /><h2>One company. One decision. One measurable experiment.</h2><p>A published Value Map is not realised savings, a customer endorsement or verified planetary benefit. Real value requires a baseline, owner, intervention and observed result.</p><a className="pd-light-link" href="/opportunities/brands-proof">Explore the bounded object ↗</a></section>
  </main>;
}

export function RestrictedRoom({ kind }: { kind: "dataroom" | "workspace" }) {
  useEffect(() => { document.title = "Controlled access — 4PLANET Partners"; }, [kind]);
  return <main className="pd-page"><header className="pd-hero"><Meta label="ACCESS CONTROLLED" /><h1>{kind === "workspace" ? "An agreement before a workspace." : "Evidence with the right permissions."}</h1><p>{kind === "workspace" ? "Active collaboration materials are accessible only after agreement, role assignment and an approved access grant." : "Sensitive commercial, legal, financial and partner-specific materials are not exposed through public URLs or noindex alone."}</p></header><section className="pd-detail"><div className="pd-warning"><h2>Not a public sign-in</h2><p>No access is implied by this route. A functioning private room requires server-side authentication, explicit authorisation, per-actor data isolation and recorded access before publication.</p></div><a href="/enquire">Register a relevant enquiry ↗</a></section></main>;
}

const roles = actors.filter((x) => x.slug !== "active");
export function EnquirePage() {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const [role, setRole] = useState(params.get("role") || "");
  const [opportunity, setOpportunity] = useState(params.get("opportunity") || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [channel, setChannel] = useState<"CHECKING" | "AVAILABLE" | "UNAVAILABLE">("CHECKING");
  const [companyHp, setCompanyHp] = useState("");
  useEffect(() => {
    document.title = "Partner enquiry — 4PLANET"; signal("intake_started");
    let active = true;
    fetch("/api/leads", { method: "GET", cache: "no-store" })
      .then(async (res) => { if (!res.ok) throw new Error("Intake unavailable"); return res.json() as Promise<{ acceptingEnquiries?: boolean }>; })
      .then((result) => { if (active) setChannel(result.acceptingEnquiries ? "AVAILABLE" : "UNAVAILABLE"); })
      .catch(() => { if (active) setChannel("UNAVAILABLE"); });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !consent || channel !== "AVAILABLE") return;
    setBusy(true); setFeedback("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "4partners", name, email, organisation, company_hp: companyHp,
          role, workArea: opportunity, interest: message, message,
          consent: true, sourceRoute: "/enquire", interests: [role, opportunity].filter(Boolean),
        }),
      });
      const result = await response.json() as { ok?: boolean; delivered?: boolean; reason?: string };
      if (!response.ok || !result.ok) throw new Error("We could not submit this enquiry. Please try again later.");
      if (result.delivered === true) {
        signal("intake_submitted");
        setFeedback("Your enquiry was received by the configured 4PLANET intake. No agreement or reply time is implied.");
        setName(""); setEmail(""); setOrganisation(""); setMessage(""); setConsent(false);
      } else {
        setFeedback("The enquiry channel is not collecting submissions yet. Your information has not been stored or forwarded.");
      }
    } catch {
      setFeedback("The enquiry channel is unavailable. Your information has not been confirmed as received.");
    } finally { setBusy(false); }
  }
  return <main className="pd-page">
    <header className="pd-hero"><Meta label="STRUCTURED PARTNER ENQUIRY" /><h1>Bring a specific question.</h1><p>Tell us your role, the relevant object and what you would like to examine. This is an expression of interest, not a contract or approval to publish your organisation as a partner.</p></header>
    <section className="pd-form-wrap">
    {channel === "UNAVAILABLE" ? <p className="pd-channel-notice" role="status">The enquiry channel is not yet collecting submissions. No information will be sent or stored here.</p> : null}
    {channel === "CHECKING" ? <p className="pd-channel-notice" role="status">Checking whether the enquiry channel is available…</p> : null}
    <form className="pd-form" onSubmit={submit}>
      <label className="pd-honeypot" aria-hidden="true">Leave blank <input tabIndex={-1} autoComplete="off" value={companyHp} onChange={(e) => setCompanyHp(e.target.value)} /></label>
      <label>Your role <select value={role} onChange={(e) => setRole(e.target.value)} required><option value="">Choose a role</option>{roles.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
      <label>Relevant opportunity <select value={opportunity} onChange={(e) => setOpportunity(e.target.value)}><option value="">General enquiry</option>{opportunities.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
      <label>Your name <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" required /></label>
      <label>Work email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" required /></label>
      <label>Organisation <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} maxLength={160} autoComplete="organization" /></label>
      <label>The question or potential contribution <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1200} rows={5} required /></label>
      <label className="pd-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>I agree that 4PLANET may use these details to consider and respond to this enquiry. Do not include confidential or sensitive data.</span></label>
      <button type="submit" disabled={busy || !consent || channel !== "AVAILABLE"}>{channel !== "AVAILABLE" ? "Enquiries not available" : busy ? "Submitting…" : "Submit enquiry"}</button>
      <p className="pd-feedback" role="status" aria-live="polite">{feedback}</p>
      <p className="pd-small">No subscription or commitment is created. If the intake integration is unavailable, the form will explicitly say that no receipt is confirmed.</p>
    </form></section>
  </main>;
}
