import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import {
  TEST_DISCLOSURE,
  TEST_UNITS,
  createTestPersonalImpactRecord,
  personalImpactRecordById,
  readPersonalImpactRecords,
  deletePersonalImpactRecord,
  resetPersonalImpactRecords,
  displayContributionState,
  shareText,
  type PersonalImpactRecord,
  type TestUnitSlug,
} from "@/impact/prototype";
import { contextHref } from "@/product/ProductNav";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const panel: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(20px,3vw,32px)" };

function Badge({ children, color = T.red }: { children: React.ReactNode; color?: string }) {
  return <span style={{ ...mono, display: "inline-flex", border: `1px solid ${color}`, color, padding: "4px 7px" }}>{children}</span>;
}

type Pathway = { title: string; place: string; status: "VALIDATION" | "DEVELOPMENT" | "PROTOTYPE"; body: string };
const PATHWAYS: Pathway[] = [
  { title: "Tree planting", place: "Project geography — stated once a provider agreement exists", status: "DEVELOPMENT",
    body: "The provider and proof method are being prepared for validation. No provider agreement or public contribution route is in place." },
  { title: "Plastic recovery", place: "Coastal and river systems — scope defined per provider", status: "PROTOTYPE",
    body: "The contract model exists as a transparent prototype. No production pathway is open." },
  { title: "Habitat restoration", place: "Degraded land — geography pending", status: "DEVELOPMENT",
    body: "Structure in development; sources and provider agreements are not yet in place." },
];

const HUMAN_PATH: [string, string, string][] = [
  ["01", "UNDERSTAND", "Begin with the life, place or living system — what matters, what is changing and what the evidence actually establishes."],
  ["02", "ACT", "When a pathway is genuinely ready, take a defined action with a named delivery model. Until then the action stays closed."],
  ["03", "SEE THE EVIDENCE", "Follow what was funded, what a provider reported, what evidence exists and what outcome is — or is not — established."],
];

const CHAIN: [string, string][] = [
  ["Contribution", "what was committed"],
  ["Provider", "who is responsible for delivery"],
  ["Delivery", "what was reported as done"],
  ["Evidence", "what supports the delivery record"],
  ["Outcome", "what changed, if measured"],
  ["System impact", "wider effects, never assumed"],
];

export function ImpactPublicHome() {
  const location = useLocation();
  return (
    <PublicShell>
      <Section pad="clamp(44px,7vw,92px)">
        <p style={{ ...mono, color: T.blue, fontSize: 11, letterSpacing: ".18em" }}>IMPACT · FROM UNDERSTANDING TO CREDIBLE ACTION</p>
        <h1 style={{ marginTop: 16, fontFamily: T.display, fontSize: "clamp(46px,7.5vw,96px)", lineHeight: .91, letterSpacing: "-.05em", maxWidth: "13ch" }}>
          Understand. Act. See what happened.
        </h1>
        <p style={{ marginTop: 22, maxWidth: "58ch", fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.55, color: "rgba(8,8,8,.76)" }}>
          IMPACT is the route from caring about a living system to taking a defined action — and then seeing the evidence without turning a contribution into a claim it cannot support.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#pathways" style={{ ...mono, fontSize: 12, background: T.blue, color: "#fff", minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 18px", textDecoration: "none" }}>SEE WHAT IS BEING BUILT →</a>
          <Link to={contextHref("/join", location.search)} style={{ ...mono, fontSize: 12, border: `1px solid ${T.ink}`, color: T.ink, minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 18px", textDecoration: "none" }}>REGISTER INTEREST</Link>
        </div>

        <div className="impact-human-path" style={{ marginTop: "clamp(44px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", borderTop: `1px solid ${T.lineStrong}`, borderBottom: `1px solid ${T.lineStrong}` }}>
          {HUMAN_PATH.map(([n, title, text], i) => (
            <div key={title} style={{ padding: "clamp(24px,3vw,38px) clamp(0px,2vw,28px)", borderLeft: i === 0 ? "none" : `1px solid ${T.line}` }}>
              <div style={{ ...mono, color: T.blue }}>{n}</div>
              <h2 style={{ marginTop: 12, fontFamily: T.display, fontSize: "clamp(26px,3.5vw,40px)", letterSpacing: "-.035em" }}>{title}</h2>
              <p style={{ marginTop: 12, color: T.dim, fontSize: 14.5, lineHeight: 1.58 }}>{text}</p>
            </div>
          ))}
        </div>

        <div id="pathways" style={{ marginTop: "clamp(48px,6vw,76px)" }}>
          <div style={{ ...mono, color: T.blue }}>PATHWAYS IN DEVELOPMENT</div>
          <h2 style={{ marginTop: 12, fontFamily: T.display, fontSize: "clamp(32px,5vw,58px)", letterSpacing: "-.04em", lineHeight: .98, maxWidth: 820 }}>Action opens only when the delivery path is real.</h2>
          <div className="tw" style={{ marginTop: 24 }}>
            {PATHWAYS.map((p) => (
              <div key={p.title} style={{ ...panel }}>
                <Badge color="#8A6500">{p.status} · NOT OPEN</Badge>
                <h3 style={{ marginTop: 14, fontFamily: T.display, fontSize: "clamp(24px,3vw,32px)", letterSpacing: "-.02em" }}>{p.title}</h3>
                <p style={{ marginTop: 8, fontSize: 13.5, color: "rgba(8,8,8,.7)", lineHeight: 1.55 }}>{p.body}</p>
                <p style={{ marginTop: 12, ...mono, fontSize: 10, color: "rgba(8,8,8,.55)" }}>PLACE · {p.place}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "clamp(44px,6vw,72px)", maxWidth: 920 }}>
          <details style={{ borderTop: `1px solid ${T.lineStrong}`, borderBottom: `1px solid ${T.lineStrong}`, padding: "18px 0" }}>
            <summary style={{ cursor: "pointer", ...mono, color: T.blue, minHeight: 44, display: "flex", alignItems: "center" }}>HOW PROOF IS KEPT SEPARATE →</summary>
            <p style={{ marginTop: 12, maxWidth: 680, color: T.dim, lineHeight: 1.6, fontSize: 14 }}>Contribution, delivery, evidence and outcome are different states. The system keeps them separate so support never becomes an automatic ecological result.</p>
            <div className="impact-proof-chain" style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", border: `1px solid ${T.line}` }}>
              {CHAIN.map(([step, desc], i) => (
                <div key={step} style={{ padding: "16px 14px", borderLeft: i % 3 === 0 ? "none" : `1px solid ${T.line}`, borderTop: i < 3 ? "none" : `1px solid ${T.line}` }}>
                  <div style={{ ...mono, color: T.blue, fontSize: 9.5 }}>0{i + 1}</div>
                  <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 500 }}>{step}</div>
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "rgba(8,8,8,.6)", lineHeight: 1.4 }}>{desc}</div>
                </div>
              ))}
            </div>
          </details>
        </div>

        <p style={{ marginTop: 28, maxWidth: "70ch", fontSize: 13.5, color: "rgba(8,8,8,.7)", lineHeight: 1.6, borderLeft: `2px solid ${T.line}`, paddingLeft: 14 }}>
          No production pathway is open yet. Nothing here takes payment, requests a provider or claims physical delivery. When a pathway becomes real, it will say so — with sources and a visible status history.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link to={contextHref("/impact/lab", location.search)} style={{ ...mono, fontSize: 11, color: T.dim }}>TECHNICAL TEST LAB →</Link>
        </div>
        <style>{`@media(max-width:760px){.impact-human-path{grid-template-columns:1fr!important}.impact-human-path>div{border-left:0!important;border-top:1px solid ${T.line}}.impact-human-path>div:first-child{border-top:0!important}.impact-proof-chain{grid-template-columns:1fr!important}.impact-proof-chain>div{border-left:0!important;border-top:1px solid ${T.line}!important}.impact-proof-chain>div:first-child{border-top:0!important}}`}</style>
      </Section>
    </PublicShell>
  );
}

function UnitCard({ slug, search }: { slug: TestUnitSlug; search: string }) {
  const unit = TEST_UNITS[slug];
  return (
    <Link to={contextHref(`/impact/lab/${slug}`, search, { journey: `${slug}-test` })} style={{ ...panel, color: T.ink, textDecoration: "none", display: "flex", flexDirection: "column", minHeight: 240 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ ...mono, color: T.blue }}>{unit.id}</div><Badge>TEST ONLY</Badge>
      </div>
      <h2 style={{ marginTop: 28, fontFamily: T.display, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-.03em" }}>{unit.name}</h2>
      <p style={{ marginTop: 12, color: "rgba(8,8,8,.7)", lineHeight: 1.55, fontSize: 14 }}>{unit.description}</p>
      <div style={{ marginTop: "auto", paddingTop: 22, ...mono, color: T.blue }}>RUN TEST JOURNEY →</div>
    </Link>
  );
}

export function ImpactLabIndex() {
  const location = useLocation();
  const [records, setRecords] = useState<PersonalImpactRecord[]>(() => readPersonalImpactRecords());
  const removeOne = (id: string) => setRecords(deletePersonalImpactRecord(id));
  const resetAll = () => { resetPersonalImpactRecords(); setRecords([]); };
  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/impact", location.search)} style={{ ...mono, color: T.blue }}>← IMPACT</Link>
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}><Badge>TEST ENVIRONMENT — NON-PRODUCTION</Badge><Badge color="#8A6500">NO PAYMENT</Badge><Badge color="#8A6500">NO PROVIDER REQUEST</Badge></div>
        <h1 style={{ marginTop: 22, fontFamily: T.display, fontSize: "clamp(40px,6vw,64px)", lineHeight: .96, letterSpacing: "-.03em" }}>Impact lab</h1>
        <p style={{ marginTop: 18, maxWidth: "60ch", fontSize: "clamp(16px,2vw,21px)", lineHeight: 1.5, color: "rgba(8,8,8,.7)" }}>
          A transparent place to inspect how the proof model works. Everything here is a local test — no payment,
          no provider request, no physical delivery.
        </p>
        <div className="tw" style={{ marginTop: 40 }}>
          <UnitCard slug="tree" search={location.search} />
          <UnitCard slug="plastic" search={location.search} />
        </div>
        <div style={{ ...panel, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ ...mono, color: T.blue }}>LOCAL PERSONAL IMPACT RECORDS</div>
            {records.length > 0 && <button onClick={resetAll} style={{ ...mono, fontSize: 10, border: `1px solid ${T.red}`, color: T.red, background: "transparent", padding: "6px 10px", cursor: "pointer" }}>DELETE ALL LOCAL RECORDS</button>}
          </div>
          {records.length === 0 ? <p style={{ marginTop: 16, color: "rgba(8,8,8,.6)" }}>No local test records on this device.</p> : records.slice(0, 8).map((record) => (
            <div key={record.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: `1px solid ${T.line}`, alignItems: "center" }}>
              <Link to={contextHref(`/impact/lab/records/${encodeURIComponent(record.id)}`, location.search, { record: record.id, journey: `${record.unit.slug}-test` })} style={{ color: T.ink, textDecoration: "none", flex: 1 }}>
                {record.unit.name} <span style={{ ...mono, color: T.red, marginLeft: 8 }}>NOT DELIVERED</span>
              </Link>
              <button onClick={() => removeOne(record.id)} aria-label={`Delete local record ${record.unit.name}`} style={{ ...mono, fontSize: 10, border: `1px solid ${T.line}`, background: "transparent", color: "rgba(8,8,8,.6)", padding: "6px 9px", cursor: "pointer" }}>DELETE</button>
            </div>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}

export function ImpactTestJourney() {
  const { unit: slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [storageError, setStorageError] = useState(false);
  if (slug !== "tree" && slug !== "plastic") return <NotFound />;
  const unit = TEST_UNITS[slug];
  const entity = slug === "tree" ? "taxon:gbif:1341976" : "taxon:gbif:2440483";
  const speciesSlug = slug === "tree" ? "western-honey-bee" : "orca";
  const atlas = contextHref("/atlas", location.search, { entity, journey: `${slug}-test` });
  const species = contextHref(`/species/${speciesSlug}`, location.search, { entity, journey: `${slug}-test` });

  const create = () => {
    try {
      const record = createTestPersonalImpactRecord(slug);
      navigate(contextHref(`/impact/lab/records/${encodeURIComponent(record.id)}`, location.search, { entity, journey: `${slug}-test`, record: record.id }));
    } catch {
      setStorageError(true);
    }
  };

  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/impact/lab", location.search)} style={{ ...mono, color: T.blue }}>← IMPACT LAB</Link>
        <div style={{ marginTop: 22 }}><Badge>{TEST_DISCLOSURE}</Badge></div>
        <h1 style={{ marginTop: 20, fontFamily: T.display, fontSize: "clamp(40px,6vw,64px)", lineHeight: .95, letterSpacing: "-.03em" }}>{unit.name}</h1>
        <p style={{ marginTop: 18, maxWidth: "62ch", fontSize: "clamp(16px,2vw,21px)", lineHeight: 1.55, color: "rgba(8,8,8,.72)" }}>{unit.description}</p>
        <div className="four" style={{ marginTop: 40 }}>
          {[
            ["01", "UNDERSTAND", `Open the connected ${slug === "tree" ? "pollinator" : "orca"} context.`],
            ["02", "CONTRIBUTE", "Create a local test contribution. No payment."],
            ["03", "DELIVERY", "Fixture returns NOT DELIVERED. No provider request."],
            ["04", "PROOF", "Create a Personal Impact Record with outcome and system impact unassessed."],
          ].map(([n, title, text]) => <div key={n} style={{ ...panel, borderRight: 0 }}><div style={{ ...mono, color: T.blue }}>{n}</div><h2 style={{ marginTop: 14, fontSize: 20 }}>{title}</h2><p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5, color: "rgba(8,8,8,.7)" }}>{text}</p></div>)}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link to={atlas} style={{ ...mono, color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 15px", textDecoration: "none" }}>ATLAS CONTEXT</Link>
          <Link to={species} style={{ ...mono, color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 15px", textDecoration: "none" }}>SPECIES CONTEXT</Link>
          <button onClick={create} style={{ ...mono, border: 0, background: T.blue, color: "#fff", padding: "13px 16px", cursor: "pointer" }}>CREATE LOCAL TEST RECORD →</button>
        </div>
        {storageError && <p role="alert" style={{ marginTop: 18, maxWidth: 760, color: T.red, fontSize: 13 }}>LOCAL RECORD NOT CREATED. Browser storage is unavailable; no contribution or delivery state was recorded.</p>}
        <p style={{ marginTop: 18, maxWidth: 760, fontSize: 12.5, color: "rgba(8,8,8,.62)", lineHeight: 1.55 }}>Creating this record writes only to localStorage on this device. No personal identity, payment, API request or physical delivery is created.</p>
      </Section>
    </PublicShell>
  );
}

function RecordStatus({ record }: { record: PersonalImpactRecord }) {
  const rows: [string, string, string][] = [
    ["Contribution", displayContributionState(record.contribution.status), "ok"],
    ["Delivery", record.delivery.status.replace(/_/g, " "), "no"],
    ["Outcome", record.outcome.status.replace(/_/g, " "), "no"],
    ["System impact", record.impact.status.replace(/_/g, " "), "no"],
  ];
  return (
    <div className="four" style={{ marginTop: 24 }}>
      {rows.map(([label, value, tone]) => (
        <div key={label} style={{ borderTop: `1px solid ${T.line}`, padding: "14px 0" }}>
          <div style={{ ...mono, color: "rgba(8,8,8,.55)" }}>{label.toUpperCase()}</div>
          <div style={{ marginTop: 8, fontSize: 13, color: tone === "no" ? T.red : "#1c7a3a", fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export function PersonalImpactRecordPage() {
  const { recordId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const record = personalImpactRecordById(recordId ? decodeURIComponent(recordId) : undefined);
  if (!record) return <NotFound />;

  const share = async () => {
    const text = shareText(record);
    try {
      if (navigator.share) await navigator.share({ title: `${record.unit.name} — TEST-ONLY local record`, text });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  const remove = () => {
    deletePersonalImpactRecord(record.id);
    navigate(contextHref("/impact/lab", location.search));
  };

  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/impact/lab", location.search)} style={{ ...mono, color: T.blue }}>← IMPACT LAB</Link>
        <div style={{ marginTop: 18 }}><Badge>{TEST_DISCLOSURE}</Badge></div>
        <h1 style={{ marginTop: 18, fontFamily: T.display, fontSize: "clamp(32px,5vw,48px)", lineHeight: .95, letterSpacing: "-.02em" }}>Proof record</h1>
        <article aria-label="Personal Impact test share card">
        <p style={{ ...panel, marginTop: 18, maxWidth: "72ch", fontSize: 16, lineHeight: 1.6, color: "rgba(8,8,8,.8)" }}>
          You created a <strong>local test contribution</strong> for {record.contribution.quantity} × {record.unit.unitLabel}.
          <strong> No provider was contacted, nothing was delivered, and no outcome was assessed.</strong> This record lives only on this device.
        </p>
        <RecordStatus record={record} />
        <details style={{ marginTop: 24, ...mono, color: "rgba(8,8,8,.5)" }}>
          <summary style={{ cursor: "pointer", color: T.blue }}>Technical detail</summary>
          <div style={{ marginTop: 10, lineHeight: 1.7, wordBreak: "break-all" }}>
            <div>Record: {record.id}</div>
            <div>Provider: {record.delivery.providerId}</div>
            <div>Provider reference: {record.delivery.providerReference}</div>
            <div>Created locally: {record.createdAt}</div>
          </div>
        </details>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <button onClick={share} style={{ ...mono, background: "transparent", color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 16px", cursor: "pointer" }}>{copied ? "TEST CARD COPIED" : "SHARE (TEST-ONLY)"}</button>
          <button onClick={remove} style={{ ...mono, background: "transparent", color: T.red, border: `1px solid ${T.red}`, padding: "12px 16px", cursor: "pointer" }}>DELETE THIS LOCAL RECORD</button>
        </div>
        </article>
      </Section>
    </PublicShell>
  );
}
