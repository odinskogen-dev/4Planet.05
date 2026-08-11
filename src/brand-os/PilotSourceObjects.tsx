import "./pilot-source-objects.css";

const SourcePill = ({ children }: { children: React.ReactNode }) => <span className="bos-source-pill">{children}</span>;

export function OrcaSourceObject() {
  return (
    <figure className="bos-source-object" aria-labelledby="orca-source-object-title">
      <figcaption className="bos-source-object-head">
        <span>SPECIES_ / SOURCE-FIRST INTERNAL PRODUCTION OBJECT</span>
        <h3 id="orca-source-object-title">One record. A wider living system.</h3>
        <p>Orca / Orcinus orca</p>
      </figcaption>

      <div className="bos-source-object-grid">
        <article>
          <span className="bos-source-object-index">01 / SOURCE RECORD</span>
          <h4>GBIF 5939349319</h4>
          <p>Human observation · 3 January 2026 · Norway.</p>
          <div className="bos-source-pills">
            <SourcePill>SRC-025</SourcePill>
            <SourcePill>CC BY 4.0</SourcePill>
            <SourcePill>COORDINATE ROUNDED</SourcePill>
          </div>
        </article>
        <article>
          <span className="bos-source-object-index">02 / RELATIONSHIP</span>
          <h4>Social + acoustic life</h4>
          <p>Orcas live in socially structured groups and use underwater sound for communication and navigation.</p>
          <div className="bos-source-pills"><SourcePill>CLM-BOS-ORCA-001</SourcePill><SourcePill>SRC-015</SourcePill></div>
        </article>
        <article>
          <span className="bos-source-object-index">03 / PRODUCT CONTEXT</span>
          <h4>Persisted, not promoted</h4>
          <p>Canonical staging stores the SourceRecord, Observation and ProductContext. No Signal is created. Place membership remains unassessed.</p>
          <div className="bos-source-pills"><SourcePill>orca-gbif</SourcePill><SourcePill>OBSERVATION ≠ SIGNAL</SourcePill></div>
        </article>
      </div>

      <div className="bos-source-limit">
        <strong>LIMIT</strong>
        <p>This record does not establish range, abundance, population trend, current location, place membership or ecosystem condition.</p>
      </div>
    </figure>
  );
}

const osloLayers = [
  {
    index: "01",
    title: "MODELLED PRESSURE",
    body: "M-3141 nitrogen-input baseline and intervention scenarios. Modelled load — not a direct in-fjord concentration or observed ecological outcome.",
    source: "SRC-021 / CLM-BOS-OSLO-003",
  },
  {
    index: "02",
    title: "MAPPED MARINE NATURE",
    body: "HB19 mapped-known occurrences of marine nature types. Coverage is incomplete and partly based on older mapping; missing mapping is not absence.",
    source: "SRC-022 / CLM-BOS-OSLO-004",
  },
  {
    index: "03",
    title: "MONITORING COVERAGE",
    body: "Vannmiljø Økokyst monitoring-location points under NLOD. This layer shows where monitoring records exist, not condition, trend or completeness.",
    source: "SRC-023 / CLM-BOS-OSLO-005",
  },
];

export function OslofjordOnePlaceObject() {
  return (
    <figure className="bos-source-object bos-one-place" aria-labelledby="oslo-source-object-title">
      <figcaption className="bos-source-object-head">
        <span>ONE PLACE_ / INTERNAL PRODUCTION OBJECT</span>
        <h3 id="oslo-source-object-title">Oslofjorden is not one condition.</h3>
        <p>Three bounded layers. Three different kinds of evidence.</p>
      </figcaption>

      <div className="bos-place-boundary" role="img" aria-label="Conceptual Oslofjorden interface focus containing three bounded evidence layers; this is not a scientific boundary map.">
        <div className="bos-place-axis"><span>INNER</span><span>OUTER</span></div>
        {osloLayers.map((layer) => (
          <article className="bos-place-layer" key={layer.index}>
            <span className="bos-source-object-index">{layer.index}</span>
            <h4>{layer.title}</h4>
            <p>{layer.body}</p>
            <small>{layer.source}</small>
          </article>
        ))}
      </div>

      <div className="bos-source-limit">
        <strong>COVERAGE / CAUSAL LIMIT</strong>
        <p>Layers keep their own geography, period, method and coverage. Co-location is not causality. Partial monitoring is not total ecological condition.</p>
      </div>
    </figure>
  );
}
