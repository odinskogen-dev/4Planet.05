import type { CSSProperties } from "react";
import type { ScientificDatasetRecord } from "@/data/oslofjordenDatasets";
import type { PlaceRelationRef } from "@/planet/placeModel";
import { DatasetOccurrenceEvidence } from "@/components/place/DatasetOccurrenceEvidence";

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10,
  letterSpacing: ".085em",
  textTransform: "uppercase",
};

export function ScientificDatasetEvidence({ records }: { records: readonly ScientificDatasetRecord[] }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {records.map((record) => (
        <article key={record.id} style={{ border: "1px solid rgba(10,10,10,.24)", padding: "clamp(18px,2.4vw,30px)" }}>
          <div style={{ ...mono, color: "#0B7A39" }}>SCIENTIFIC DATASET / {record.datasetType.replace(/_/g, " ")} / {record.license}</div>
          <h3 style={{ fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(26px,3vw,42px)", letterSpacing: "-.04em", lineHeight: 1, margin: "14px 0 10px" }}>{record.title}</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 920, margin: "0 0 20px", color: "rgba(10,10,10,.72)" }}>{record.whyItMatters}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderTop: "1px solid rgba(10,10,10,.18)", borderLeft: "1px solid rgba(10,10,10,.18)" }}>
            {record.metrics.map((metric) => (
              <div key={`${record.id}-${metric.label}`} style={{ padding: 14, borderRight: "1px solid rgba(10,10,10,.18)", borderBottom: "1px solid rgba(10,10,10,.18)" }}>
                <div style={{ ...mono, color: "rgba(10,10,10,.52)" }}>{metric.label}</div>
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 25, letterSpacing: "-.035em", marginTop: 8 }}>{metric.value}</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.4, color: "rgba(10,10,10,.58)", marginTop: 6 }}>{metric.meaning}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginTop: 20 }}>
            <div><div style={{ ...mono, color: "rgba(10,10,10,.52)" }}>WHERE / WHEN</div><div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6 }}>{record.geographicScope}<br />{record.temporalCoverage}</div></div>
            <div><div style={{ ...mono, color: "rgba(10,10,10,.52)" }}>SAMPLING CONTEXT</div><div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 6 }}>{record.samplingContext}</div></div>
          </div>
          {record.sourceExtent && (
            <div style={{ ...mono, color: "#2E2EFF", marginTop: 18 }}>SOURCE-REPORTED DATASET EXTENT / SW {record.sourceExtent.south}, {record.sourceExtent.west} / NE {record.sourceExtent.north}, {record.sourceExtent.east} / NOT A PLACE BOUNDARY</div>
          )}
          <div style={{ padding: 14, border: "1px solid #FF4D22", marginTop: 18, fontSize: 12.5, lineHeight: 1.5 }}><strong>LIMIT.</strong> {record.limitation}</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
            <a href={record.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, color: "#2E2EFF", textDecoration: "none" }}>{record.publisher} / SOURCE ↗</a>
            <a href={record.licenseUrl} target="_blank" rel="noreferrer" style={{ ...mono, color: "rgba(10,10,10,.62)", textDecoration: "none" }}>{record.license} ↗</a>
            <span style={{ ...mono, color: "rgba(10,10,10,.45)" }}>CHECKED {record.checkedAt}</span>
          </div>

          {record.runtimeOccurrenceDatasetKey && (
            <div style={{ marginTop: "clamp(30px,4vw,52px)", paddingTop: "clamp(26px,4vw,46px)", borderTop: "3px solid #0B7A39" }}>
              <DatasetOccurrenceEvidence
                datasetKey={record.runtimeOccurrenceDatasetKey}
                datasetName={record.title}
                datasetUrl={record.sourceUrl}
                datasetLicense={record.license}
                temporalBoundary={`Published archive coverage: ${record.temporalCoverage}`}
              />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function PlaceRelationEvidence({ relation }: { relation: PlaceRelationRef }) {
  return (
    <article style={{ border: "1px solid rgba(10,10,10,.24)", padding: 18, marginTop: 20 }}>
      <div style={{ ...mono, color: "#2E2EFF" }}>SOURCE-BACKED SUB-PLACE / {relation.relation.replace(/_/g, " ")}</div>
      <h3 style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 500, fontSize: 28, letterSpacing: "-.04em", margin: "10px 0 6px" }}>{relation.label}</h3>
      <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{relation.sourceRecordId} · PART OF OSLOFJORDEN / MRGID 3379</div>
      {relation.representativePoint && <div style={{ ...mono, color: "rgba(10,10,10,.55)", marginTop: 10 }}>REPRESENTATIVE POINT {relation.representativePoint.lat.toFixed(4)}, {relation.representativePoint.lng.toFixed(4)} / {relation.representativePoint.crs}</div>}
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(10,10,10,.7)", marginTop: 12 }}>{relation.limitation}</div>
      <a href={relation.source.url} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", color: "#2E2EFF", textDecoration: "none", marginTop: 14 }}>{relation.source.publisher} / SOURCE ↗</a>
    </article>
  );
}
