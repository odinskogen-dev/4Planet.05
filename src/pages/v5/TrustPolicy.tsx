import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label } from "@/components/ui";
import { T } from "@/styles/tokens";

const LEGAL_NAME = "SKOG COMMUNICATIONS AS";
const ORG_NO = "923 003 789";
const ADDRESS = "Sandakerveien 52, 0477 Oslo, Norway";
const TEMP_CONTACT = "odin.skogen@gmail.com";

type PolicySection = { title: string; body: React.ReactNode };
type PolicyProps = { eyebrow: string; title: string; intro: string; sections: PolicySection[] };

const policyLinks = [
  ["Company", "/company"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Sources", "/source-policy"],
  ["Corrections", "/corrections"],
  ["Impact claims", "/impact-claims"],
  ["Editorial independence", "/editorial-independence"],
  ["Media rights", "/media-rights"],
  ["AI disclosure", "/ai-disclosure"],
  ["Terms & limitations", "/terms"],
  ["Cookies", "/cookies"],
] as const;

function PolicyPage({ eyebrow, title, intro, sections }: PolicyProps) {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,104px)">
        <Label color={T.blue} style={{ marginBottom: 18 }}>{eyebrow}</Label>
        <h1 style={{ fontFamily: T.display, fontWeight: 500, color: T.ink, fontSize: "clamp(34px,5vw,62px)", letterSpacing: "-.04em", lineHeight: 1.01, maxWidth: 900 }}>{title}</h1>
        <p style={{ fontSize: "clamp(16px,1.4vw,19px)", color: T.dim, marginTop: 20, maxWidth: 760, lineHeight: 1.65 }}>{intro}</p>
        <div style={{ marginTop: "clamp(40px,6vw,68px)", maxWidth: 900 }}>
          {sections.map((section) => (
            <section key={section.title} style={{ borderTop: `1px solid ${T.line}`, padding: "22px 0 30px" }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: T.blue }}>{section.title.toUpperCase()}</div>
              <div style={{ fontSize: "clamp(15px,1.2vw,17px)", lineHeight: 1.7, color: T.ink, marginTop: 12, maxWidth: 820 }}>{section.body}</div>
            </section>
          ))}
        </div>
        <nav aria-label="Trust policies" style={{ borderTop: `1px solid ${T.lineStrong}`, marginTop: 28, paddingTop: 22, display: "flex", gap: "10px 18px", flexWrap: "wrap", maxWidth: 900 }}>
          {policyLinks.map(([label, to]) => <Link key={to} to={to} className="link" style={{ color: T.blue, fontSize: 13 }}>{label}</Link>)}
        </nav>
      </Section>
    </PublicShell>
  );
}

export function TrustHub() {
  return (
    <PolicyPage
      eyebrow="4PLANET TRUST"
      title="What we claim. What we do not. How to check us."
      intro="4Planet is an early-stage product and public-interest initiative. These pages state the current legal operator, evidence boundaries, correction route, data practices and prototype limitations so the public surface can be inspected without relying on implied trust."
      sections={[
        { title: "Legal operator", body: <>{LEGAL_NAME}, organisation no. {ORG_NO}, {ADDRESS}. 4Planet is not a separate incorporated legal entity, foundation or non-profit organisation.</> },
        { title: "Evidence before status", body: <>A source, contribution, partner discussion, provider report, ecological outcome and system-level impact are different things. 4Planet does not merge those states into one stronger claim.</> },
        { title: "Current release boundary", body: <>The public product remains a release candidate. No paid membership, checkout, public partner status or verified ecological-impact claim is created by these trust pages.</> },
      ]}
    />
  );
}

export function CompanyPage() {
  return (
    <PolicyPage
      eyebrow="COMPANY"
      title="The legal operator behind the current 4Planet candidate."
      intro="4Planet is being developed through an existing Norwegian limited company while the wider long-term governance structure is still being developed."
      sections={[
        { title: "Legal identity", body: <><strong>{LEGAL_NAME}</strong><br />Organisation no. {ORG_NO}<br />Registered address: {ADDRESS}</> },
        { title: "Role", body: <>SKOG COMMUNICATIONS AS is the current Norwegian operating company used for eligible 4Planet development, applications and agreements. 4Planet is an early-stage living-planet intelligence and public-interest product initiative.</> },
        { title: "What this does not mean", body: <>The company is a commercial Norwegian AS. 4Planet is not presented as a foundation, non-profit organisation, independent verifier, funded programme, verified field operator or separate incorporated entity unless a future change is actually completed and evidenced.</> },
        { title: "Registered information", body: <>Public legal claims follow the current official company register. Proposed internal changes to company purpose or governance are not treated as registered facts before the relevant authority records them.</> },
      ]}
    />
  );
}

export function ContactPage() {
  return (
    <PolicyPage
      eyebrow="CONTACT"
      title="A direct route into 4Planet."
      intro="Use the Join route for a structured expression of interest. Until a canonical 4planet.org outbound mailbox is independently verified, the pre-release contact below remains the public fallback."
      sections={[
        { title: "General and privacy contact", body: <><a href={`mailto:${TEMP_CONTACT}`} className="link" style={{ color: T.blue }}>{TEMP_CONTACT}</a></> },
        { title: "Structured enquiries", body: <>Use <Link to="/join" className="link" style={{ color: T.blue }}>Join 4Planet</Link> for product testing, expertise, creative participation, partnerships, funding interest or future membership interest. A submission is non-binding.</> },
        { title: "Domain mail", body: <>Role addresses at 4planet.org are being prepared. They are not presented here as verified outbound identities until sender authentication and end-to-end delivery have been confirmed.</> },
      ]}
    />
  );
}

export function SourcePolicyPage() {
  return (
    <PolicyPage
      eyebrow="SOURCES & PROVENANCE"
      title="Sources are evidence inputs, not permission to overclaim."
      intro="4Planet separates what an external source states from what the product adds as context, interpretation or design."
      sections={[
        { title: "Source record", body: <>Where practical, a material factual claim should retain enough provenance to identify its source, dataset or record, retrieval context, relevant rights status and limitations.</> },
        { title: "Source statement vs 4Planet context", body: <>A source statement is not silently rewritten as a 4Planet conclusion. Product context, synthesis and inference should be distinguishable from externally sourced evidence.</> },
        { title: "Confidence and limitations", body: <>Incomplete coverage, uncertainty, geographic mismatch, old data, modelled values and known methodological limitations should remain visible when they materially affect interpretation.</> },
        { title: "Correction route", body: <>If a source, attribution or claim appears wrong, use the <Link to="/corrections" className="link" style={{ color: T.blue }}>corrections route</Link>. A correction request does not itself establish that a claim is wrong; it triggers review against evidence.</> },
      ]}
    />
  );
}

export function CorrectionsPage() {
  return (
    <PolicyPage
      eyebrow="CORRECTIONS"
      title="Errors should be correctable without rewriting the record of what happened."
      intro="4Planet treats correction as an evidence process, not a reputational negotiation."
      sections={[
        { title: "What to send", body: <>Identify the page, statement or media item, explain the issue, and include the strongest source or evidence you have. Send the request to <a href={`mailto:${TEMP_CONTACT}`} className="link" style={{ color: T.blue }}>{TEMP_CONTACT}</a> until a verified domain mailbox is active.</> },
        { title: "Review", body: <>A request is checked against the underlying source, claim type, product context and publication state. No person or organisation can automatically change a factual record merely by requesting a correction.</> },
        { title: "Material changes", body: <>Where a published factual error is confirmed, 4Planet should correct the affected surface and retain an internal record of the reason and evidence for the change. Material public corrections should be visible rather than silently disguised.</> },
      ]}
    />
  );
}

export function ImpactClaimsPage() {
  return (
    <PolicyPage
      eyebrow="IMPACT CLAIMS"
      title="Contribution is not delivery. Delivery is not outcome. Outcome is not system impact."
      intro="The IMPACT layer is designed around explicit state separation so a financial or participation event cannot be presented as ecological proof by default."
      sections={[
        { title: "Contribution", body: <>A person or organisation can express support or, in a future paid system, make a contribution. That state alone does not prove field delivery.</> },
        { title: "Delivery", body: <>A provider-reported or evidenced delivery is a separate state. It must not be upgraded into an ecological outcome without supporting evidence.</> },
        { title: "Outcome", body: <>Measured, provider-claimed and independently reviewed outcomes are different evidence states. The label used must match the evidence actually available.</> },
        { title: "System impact", body: <>Large causal claims about biodiversity, climate or system change require a defensible method and evidence beyond a single delivery record. Prototype demonstrations are not verified impact.</> },
      ]}
    />
  );
}

export function EditorialIndependencePage() {
  return (
    <PolicyPage
      eyebrow="EDITORIAL INDEPENDENCE"
      title="Support should not purchase evidence or editorial conclusions."
      intro="4Planet may work with funders, companies, contributors and field partners. Those relationships must not silently change source quality, evidence thresholds or factual conclusions."
      sections={[
        { title: "Commercial separation", body: <>Funding, sponsorship, pilot support or a future paid relationship should be identified where material. It does not automatically create endorsement, partner status, favourable coverage or stronger scientific confidence.</> },
        { title: "Claim authority", body: <>Scientific and ecological claims are governed by evidence and source controls. A commercial relationship is not evidence for an environmental claim.</> },
        { title: "Conflicts", body: <>Material conflicts that could reasonably affect interpretation should be disclosed or handled through an appropriate review boundary.</> },
      ]}
    />
  );
}

export function MediaRightsPage() {
  return (
    <PolicyPage
      eyebrow="MEDIA RIGHTS"
      title="Beautiful media still needs provenance, rights and truthful context."
      intro="Photography, film, illustration and generated media are treated as assets with rights and truth constraints, not decoration detached from provenance."
      sections={[
        { title: "Rights", body: <>Public use requires an appropriate owned, licensed, permitted or otherwise defensible rights basis. Unknown rights are not treated as permission.</> },
        { title: "Attribution", body: <>Where a licence or source requires attribution, the relevant credit and source context should travel with the asset or its publication record.</> },
        { title: "Documentary meaning", body: <>An image should not be framed as documentary proof of a species, place, event or intervention when it does not actually evidence that claim.</> },
        { title: "Synthetic media", body: <>Materially generated or altered media that could be mistaken for documentary evidence should be disclosed. Synthetic media is never used as ecological source proof.</> },
      ]}
    />
  );
}

export function AiDisclosurePage() {
  return (
    <PolicyPage
      eyebrow="AI DISCLOSURE"
      title="AI can assist the work. It is not a source of truth."
      intro="4Planet uses AI-assisted workflows in research, software, design, analysis and communication. The evidence chain must remain inspectable independently of the model that helped produce an output."
      sections={[
        { title: "What AI may do", body: <>AI may help structure research, compare sources, draft code and copy, generate internal alternatives, identify inconsistencies and support production workflows.</> },
        { title: "What AI cannot establish", body: <>A model output does not by itself verify a scientific fact, legal status, partnership, funding state, field delivery, ecological outcome or media provenance.</> },
        { title: "Public disclosure", body: <>Material synthetic or AI-altered public media should be labelled when a reasonable viewer could mistake it for documentary reality. Routine AI assistance in drafting or software production does not convert the output into evidence.</> },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <PolicyPage
      eyebrow="TERMS & LIMITATIONS"
      title="Current limitations of the public release candidate."
      intro="These are bounded prototype-use limitations. They are not purchase, paid-membership or subscription terms because those systems are not active."
      sections={[
        { title: "Release-candidate status", body: <>Features, datasets, routes and wording may change during controlled testing. A prototype screen is not a promise that a service, product, intervention or data source will be offered permanently.</> },
        { title: "No professional advice", body: <>Public information is provided for general understanding and product exploration. It is not a substitute for professional legal, financial, medical or other regulated advice.</> },
        { title: "No transaction or status by browsing", body: <>Using the site or submitting an expression of interest does not create a membership, partnership, investment, funding commitment, field-delivery contract or payment obligation.</> },
        { title: "Data and availability", body: <>External datasets can be incomplete, delayed, revised or unavailable. 4Planet should expose material source and limitation information where it affects interpretation, but cannot promise uninterrupted availability of third-party data.</> },
      ]}
    />
  );
}

export function CookiesPage() {
  return (
    <PolicyPage
      eyebrow="COOKIES & DEVICE STORAGE"
      title="No non-essential tracking by default."
      intro="The current candidate is designed to avoid pretending that a consent banner solves tracking that has not been properly controlled."
      sections={[
        { title: "Current intent", body: <>4Planet does not intentionally activate advertising or behavioural-tracking cookies in the current public candidate.</> },
        { title: "Local prototype state", body: <>Some product demonstrations can store local-only state on your device, such as a follow or test record. Such local state should be limited to what the feature needs and is not presented as a user account.</> },
        { title: "Future analytics or marketing", body: <>Non-essential analytics, advertising, marketing tags or comparable device storage must remain disabled until the relevant information and consent controls are implemented and verified.</> },
      ]}
    />
  );
}
