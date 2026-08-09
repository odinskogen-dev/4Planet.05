import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { DataStatePanel } from "@/components/phase04/DataStatePanel";
import {
  fetchDatasetOccurrences,
  type DatasetOccurrenceRecord,
} from "@/planet/datasetOccurrences";

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 9.5,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

const display: CSSProperties = {
  fontFamily: "'Instrument Sans','DM Sans',sans-serif",
  fontWeight: 500,
  letterSpacing: "-.035em",
  lineHeight: 1,
};

function RecordCard({ record, datasetLicense }: { record: DatasetOccurrenceRecord; datasetLicense: string }) {
  return (
    <article style={{ borderTop: "1px solid rgba(10,10,10,.22)", padding: "17px 0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ ...mono, color: "#2E2EFF" }}>GBIF RECORD / {record.gbifId}</div>
        <div style={{ ...mono, color: "rgba(10,10,10,.5)" }}>{record.eventDate ?? "DATE NOT PROVIDED"}</div>
      </div>
      <h4 style={{ ...display, fontSize: 25, margin: "11px 0 0" }}>{record.scientificName}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginTop: 15, fontSize: 12.5, lineHeight: 1.45 }}>
        <div><span style={mono}>POINT</span><div>{record.lat.toFixed(5)}, {record.lng.toFixed(5)}</div></div>
        <div><span style={mono}>PRECISION</span><div>{record.coordinateUncertaintyInMeters != null ? `± ${Math.round(record.coordinateUncertaintyInMeters).toLocaleString()} m` : "NOT PROVIDED"}</div></div>
        <div><span style={mono}>RECORD TYPE</span><div>{record.basisOfRecord?.replace(/_/g, " ") ?? "NOT PROVIDED"}</div></div>
        <div><span style={mono}>RIGHTS</span><div>{record.license ?? `${datasetLicense} · DATASET METADATA`}</div></div>
      </div>
      {(record.locality || record.waterBody || record.recordedBy) && (
        <div style={{ marginTop: 13, fontSize: 12.5, lineHeight: 1.45, color: "rgba(10,10,10,.65)" }}>
          {record.locality && <span>Locality: {record.locality}. </span>}
          {record.waterBody && <span>Water body: {record.waterBody}. </span>}
          {record.recordedBy && <span>Recorded by: {record.recordedBy}.</span>}
        </div>
      )}
      {record.issues.length > 0 && <div style={{ ...mono, marginTop: 12, color: "#FF4D22" }}>GBIF INTERPRETATION FLAGS / {record.issues.slice(0, 4).join(" · ")}</div>}
      <a href={record.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-flex", marginTop: 13, color: "#2E2EFF", textDecoration: "none", borderBottom: "1px solid currentColor", paddingBottom: 2 }}>OPEN SOURCE RECORD ↗</a>
    </article>
  );
}

export function DatasetOccurrenceEvidence({
  datasetKey,
  datasetName,
  datasetUrl,
  datasetLicense,
  temporalBoundary,
}: {
  datasetKey: string;
  datasetName: string;
  datasetUrl: string;
  datasetLicense: string;
  temporalBoundary: string;
}) {
  const [state, setState] = useState<
    | { kind: "LOADING" }
    | { kind: "LIVE"; checkedAt: string; total: number; records: DatasetOccurrenceRecord[] }
    | { kind: "EMPTY"; checkedAt: string }
    | { kind: "UNAVAILABLE"; checkedAt: string; error: string }
  >({ kind: "LOADING" });

  useEffect(() => {
    let active = true;
    fetchDatasetOccurrences(datasetKey, { limit: 8, requestLimit: 160 }).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setState({ kind: "UNAVAILABLE", checkedAt: result.checkedAt, error: result.error });
        return;
      }
      if (!result.records.length) {
        setState({ kind: "EMPTY", checkedAt: result.checkedAt });
        return;
      }
      setState({ kind: "LIVE", checkedAt: result.checkedAt, total: result.total, records: result.records });
    });
    return () => { active = false; };
  }, [datasetKey]);

  return (
    <section aria-label={`${datasetName} occurrence records`}>
      <div style={{ ...mono, color: "#0B7A39" }}>REAL SOURCE RECORDS / HISTORICAL OCCURRENCES</div>
      <h3 style={{ ...display, fontSize: "clamp(30px,4vw,56px)", margin: "13px 0 10px" }}>Open the archive at record level.</h3>
      <p style={{ maxWidth: 900, fontSize: 15.5, lineHeight: 1.55, margin: "0 0 20px" }}>
        These points come directly from one published dataset whose source scope is Inner Oslofjorden. Each row keeps its own source record, date when supplied, coordinate, source precision when supplied and rights metadata. They are historical occurrence records — not live organism positions, current abundance, population trend or a whole-fjord ecological-status map.
      </p>

      {state.kind === "LOADING" && <DataStatePanel state="LOADING" title="Checking the source dataset." detail="4PLANET is requesting exact GBIF occurrence records from the admitted dataset. Nothing is substituted while the source is loading." />}
      {state.kind === "UNAVAILABLE" && <DataStatePanel state="SOURCE UNAVAILABLE" title="The source record service did not answer this request." detail={`Checked ${state.checkedAt}. ${state.error}. Source unavailability is not evidence that the dataset or life is absent.`} />}
      {state.kind === "EMPTY" && <DataStatePanel state="NO RECORDS" title="No coordinate-bearing records were returned in this request." detail={`Checked ${state.checkedAt}. This is a statement about this source query, not the absence of life in Inner Oslofjorden.`} />}
      {state.kind === "LIVE" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", borderTop: "1px solid #0A0A0A", borderLeft: "1px solid #0A0A0A", marginBottom: 20 }}>
            <div style={{ padding: 13, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A" }}><div style={mono}>SOURCE QUERY COUNT</div><div style={{ fontSize: 25, marginTop: 5 }}>{state.total.toLocaleString()}</div><div style={{ fontSize: 11.5, color: "rgba(10,10,10,.58)", marginTop: 4 }}>records with coordinates returned by GBIF search index for this dataset; not organism abundance</div></div>
            <div style={{ padding: 13, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A" }}><div style={mono}>DISPLAYED</div><div style={{ fontSize: 25, marginTop: 5 }}>{state.records.length}</div><div style={{ fontSize: 11.5, color: "rgba(10,10,10,.58)", marginTop: 4 }}>most recent dated records within the fetched sample</div></div>
            <div style={{ padding: 13, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A" }}><div style={mono}>SOURCE CHECKED</div><div style={{ fontSize: 14, marginTop: 8 }}>{new Date(state.checkedAt).toLocaleString()}</div><div style={{ fontSize: 11.5, color: "rgba(10,10,10,.58)", marginTop: 4 }}>{temporalBoundary}</div></div>
          </div>
          <div>{state.records.map((record) => <RecordCard key={record.gbifId} record={record} datasetLicense={datasetLicense} />)}</div>
        </div>
      )}

      <div style={{ marginTop: 18, padding: 14, background: "#F4F4F0", fontSize: 12.5, lineHeight: 1.55 }}>
        <strong>Source boundary.</strong> The dataset's published Inner Oslofjorden scope supports using its own records as source-bounded local evidence. It does not establish a universal 4PLANET Oslofjorden polygon. <a href={datasetUrl} target="_blank" rel="noreferrer" style={{ color: "#2E2EFF" }}>Dataset source ↗</a>
      </div>
    </section>
  );
}
