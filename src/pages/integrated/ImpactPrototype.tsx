import { useMemo, useState } from "react";
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

function RecordStatus({ record }: { record: PersonalImpactRecord }) {
  const rows = [
    ["CONTRIBUTION", record.contribution.status],
    ["DELIVERY", record.delivery.status],
    ["OUTCOME", record.outcome.status],
    ["SYSTEM IMPACT", record.impact.status],
  ];
  return (
    <div className="four" style={{ marginTop: 24 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ borderTop: `1px solid ${T.line}`, padding: "14px 0" }}>
          <div style={{ ...mono, color: T.dim }}>{label}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>{value.replace(/_/g, " ")}</div>
        </div>
      ))}
    </div>
  );
}

function UnitCard({ slug, search }: { slug: TestUnitSlug; search: string }) {
  const unit = TEST_UNITS[slug];
  return (
    <Link to={contextHref(`/impact/test/${slug}`, search, { journey: `${slug}-test` })} style={{ ...panel, color: T.ink, textDecoration: "none", display: "flex", flexDirection: "column", minHeight: 290 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ ...mono, color: T.blue }}>{unit.id}</div><Badge>TEST ONLY</Badge>
      </div>
      <h2 style={{ marginTop: 38, fontFamily: T.display, fontSize: "clamp(36px,5vw,64px)", letterSpacing: "-.04em" }}>{unit.name}</h2>
      <p style={{ marginTop: 14, color: T.dim, lineHeight: 1.55 }}>{unit.description}</p>
      <div style={{ marginTop: "auto", paddingTop: 26, ...mono, color: T.blue }}>RUN TEST JOURNEY →</div>
    </Link>
  );
}

export function ImpactPrototypeIndex() {
  const location = useLocation();
  const records = useMemo(() => readPersonalImpactRecords(), []);
  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Badge>NON-PRODUCTION</Badge><Badge color="#8A6500">NO PAYMENT</Badge><Badge color="#8A6500">NO PROVIDER REQUEST</Badge></div>
        <h1 style={{ marginTop: 24, fontFamily: T.display, fontSize: "clamp(48px,8vw,112px)", lineHeight: .92, letterSpacing: "-.05em" }}>Impact truth before impact claims.</h1>
        <p style={{ marginTop: 28, maxWidth: 760, fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.5 }}>
          Tree and Plastic are contract tests. They prove that contribution, provider delivery, outcome and system impact remain separate. They do not trigger real-world work.
        </p>
        <div style={{ marginTop: 24 }}><Badge>{TEST_DISCLOSURE}</Badge></div>
        <div className="tw" style={{ marginTop: 48 }}>
          <UnitCard slug="tree" search={location.search} />
          <UnitCard slug="plastic" search={location.search} />
        </div>
        <div style={{ ...panel, marginTop: 24 }}>
          <div style={{ ...mono, color: T.blue }}>LOCAL PERSONAL IMPACT RECORDS</div>
          {records.length === 0 ? <p style={{ marginTop: 16, color: T.dim }}>No local test records on this device.</p> : records.slice(0, 6).map((record) => (
            <Link key={record.id} to={contextHref(`/impact/record/${encodeURIComponent(record.id)}`, location.search, { record: record.id, journey: `${record.unit.slug}-test` })} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
              <span>{record.unit.name}</span><span style={{ ...mono, color: T.red }}>NOT DELIVERED →</span>
            </Link>
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
      navigate(contextHref(`/impact/record/${encodeURIComponent(record.id)}`, location.search, { entity, journey: `${slug}-test`, record: record.id }));
    } catch {
      setStorageError(true);
    }
  };

  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/impact", location.search)} style={{ ...mono, color: T.blue }}>← IMPACT TEST LAB</Link>
        <div style={{ marginTop: 32 }}><Badge>{TEST_DISCLOSURE}</Badge></div>
        <h1 style={{ marginTop: 24, fontFamily: T.display, fontSize: "clamp(52px,9vw,124px)", lineHeight: .9, letterSpacing: "-.055em" }}>{unit.name}</h1>
        <p style={{ marginTop: 24, maxWidth: 720, fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.55 }}>{unit.description}</p>
        <div className="four" style={{ marginTop: 46 }}>
          {[
            ["01", "UNDERSTAND", `Open the connected ${slug === "tree" ? "pollinator" : "orca"} context.`],
            ["02", "CONTRIBUTE", "Create a local test contribution. No payment."],
            ["03", "DELIVERY", "Fixture returns NOT DELIVERED. No provider request."],
            ["04", "PROOF", "Create a Personal Impact Record with outcome and impact unassessed."],
          ].map(([n, title, text]) => <div key={n} style={{ ...panel, borderRight: 0 }}><div style={{ ...mono, color: T.blue }}>{n}</div><h2 style={{ marginTop: 14, fontSize: 21 }}>{title}</h2><p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5, color: T.dim }}>{text}</p></div>)}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link to={atlas} style={{ ...mono, color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 15px", textDecoration: "none" }}>ATLAS CONTEXT</Link>
          <Link to={species} style={{ ...mono, color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 15px", textDecoration: "none" }}>SPECIES CONTEXT</Link>
          <button onClick={create} style={{ ...mono, border: 0, background: T.blue, color: "#fff", padding: "13px 16px", cursor: "pointer" }}>CREATE LOCAL TEST RECORD →</button>
        </div>
        {storageError && <p role="alert" style={{ marginTop: 18, maxWidth: 760, color: T.red, fontSize: 13 }}>LOCAL RECORD NOT CREATED. Browser storage is unavailable; no contribution or delivery state was recorded.</p>}
        <p style={{ marginTop: 18, maxWidth: 760, fontSize: 12.5, color: T.dim, lineHeight: 1.55 }}>Creating this record writes only to localStorage on this device. No personal identity, payment, API request or physical delivery is created.</p>
      </Section>
    </PublicShell>
  );
}

export function PersonalImpactRecordPage() {
  const { recordId } = useParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const record = personalImpactRecordById(recordId ? decodeURIComponent(recordId) : undefined);
  if (!record) return <NotFound />;

  const share = async () => {
    const text = shareText(record);
    try {
      if (navigator.share) await navigator.share({ title: `${record.unit.name} — test record`, text });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/impact", location.search)} style={{ ...mono, color: T.blue }}>← IMPACT TEST LAB</Link>
        <article style={{ ...panel, marginTop: 34, border: `2px solid ${T.red}` }} aria-label="Personal Impact test share card">
          <Badge>{record.disclosure}</Badge>
          <h1 style={{ marginTop: 28, fontFamily: T.display, fontSize: "clamp(46px,8vw,104px)", lineHeight: .9, letterSpacing: "-.05em" }}>{record.unit.name}</h1>
          <p style={{ marginTop: 22, fontSize: 18 }}>{record.contribution.quantity} × {record.unit.unitLabel}</p>
          <RecordStatus record={record} />
          <div style={{ marginTop: 26, borderTop: `1px solid ${T.line}`, paddingTop: 18, fontSize: 12, lineHeight: 1.65, wordBreak: "break-all" }}>
            <div>Record: {record.id}</div>
            <div>Provider: {record.delivery.providerId}</div>
            <div>Provider reference: {record.delivery.providerReference}</div>
            <div>Created locally: {record.createdAt}</div>
          </div>
          <button onClick={share} style={{ ...mono, marginTop: 24, background: T.blue, color: "#fff", border: 0, padding: "13px 16px", cursor: "pointer" }}>{copied ? "TEST CARD COPIED" : "SHARE TEST CARD"}</button>
        </article>
      </Section>
    </PublicShell>
  );
}
