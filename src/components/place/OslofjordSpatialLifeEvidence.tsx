import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OSLOFJORD_PRIMARY_WATERBODY_ID, OSLOFJORD_SPATIAL_REGISTRY } from "@/data/oslofjordenSpatial";
import { useFollows } from "@/planet/follow";
import { reconcileSourceSnapshot, type ReconcileResult } from "@/planet/sourceWatch";
import { fetchVannmiljoRegistrations, type VannmiljoResult } from "@/planet/vannmiljo";
import { fetchWaterbodyGeometry, type WaterbodyGeometryResult } from "@/planet/waterbodyGeometry";

const PLACE_ID = "place:marine-regions:3379";
const mono: React.CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10, letterSpacing: ".085em", textTransform: "uppercase" };
const card: React.CSSProperties = { border: "1px solid rgba(10,10,10,.24)", padding: "clamp(18px,2.4vw,28px)" };

const sourceStatus = (value: WaterbodyGeometryResult | VannmiljoResult | null) => {
  if (!value) return "LOADING";
  return value.ok ? "LIVE SOURCE" : value.error.replace(/_/g, " ");
};

export function OslofjordSpatialLifeEvidence() {
  const [geometry, setGeometry] = useState<WaterbodyGeometryResult | null>(null);
  const [life, setLife] = useState<VannmiljoResult | null>(null);
  const [watch, setWatch] = useState<ReconcileResult | null>(null);
  const { follows, following } = useFollows();
  const followed = following(PLACE_ID);
  const follow = follows.find((item) => item.id === PLACE_ID);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchWaterbodyGeometry(), fetchVannmiljoRegistrations({ limit: 80 })]).then(([g, l]) => {
      if (!alive) return;
      setGeometry(g);
      setLife(l);
      if (l.ok && following(PLACE_ID)) {
        const result = reconcileSourceSnapshot({
          entityId: PLACE_ID,
          sourceId: "vannmiljo",
          queryKey: `WaterBodyIDFilter:${l.waterBodyId}`,
          checkedAt: l.checkedAt,
          records: l.records.map((record) => ({
            id: record.id,
            fingerprint: [record.lastEditedAt, record.samplingTime, record.scientificName, record.parameterId, record.value, record.unit].join("|"),
            occurredAt: record.samplingTime,
            sourceUrl: record.sourceUrl,
            label: record.scientificName ?? record.parameterName ?? record.id,
          })),
        });
        setWatch(result);
      }
    });
    return () => { alive = false; };
  }, [following]);

  const speciesRecords = useMemo(() => life?.ok ? life.records.filter((record) => Boolean(record.scientificName)) : [], [life]);
  const roles = OSLOFJORD_SPATIAL_REGISTRY;

  return (
    <section aria-labelledby="oslofjord-spatial-life-title" style={{ marginTop: "clamp(42px,6vw,78px)", display: "grid", gap: 18 }}>
      <div>
        <div style={{ ...mono, color: "#2E2EFF" }}>SPATIAL TRUTH + BROADER LOCAL LIFE / LIVE SOURCE ADAPTERS</div>
        <h3 id="oslofjord-spatial-life-title" style={{ fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(34px,5vw,64px)", letterSpacing: "-.045em", lineHeight: .98, margin: "14px 0" }}>One place. Several spatial jobs. No universal polygon.</h3>
        <p style={{ maxWidth: 900, fontSize: 15.5, lineHeight: 1.58, color: "rgba(10,10,10,.72)" }}>The source contract now separates identity, display, biodiversity query, scientific extent, waterbody status, regulation and administration. The first live local query uses Vannmiljø's own WaterBodyID attachment for {OSLOFJORD_PRIMARY_WATERBODY_ID}; 4PLANET does not infer membership from a homemade polygon.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
        {roles.map((role) => (
          <article key={role.id} style={{ ...card, padding: 16 }}>
            <div style={{ ...mono, color: role.availability === "INGESTED" || role.availability === "RUNTIME_SOURCE" ? "#0B7A39" : "#8A6500" }}>{role.role ?? role.use} / {role.availability.replace(/_/g, " ")}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>{role.label}</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.48, marginTop: 8, color: "rgba(10,10,10,.65)" }}>{role.intendedUse ?? role.limitation}</div>
            {role.sourceRecordId && <div style={{ ...mono, marginTop: 9, color: "rgba(10,10,10,.45)" }}>{role.sourceRecordId}</div>}
          </article>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 18 }}>
        <article style={card}>
          <div style={{ ...mono, color: geometry?.ok ? "#0B7A39" : "#8A6500" }}>VANN-NETT WATERBODY GEOMETRY / {sourceStatus(geometry)}</div>
          {geometry?.ok ? (
            <>
              <h4 style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 27, letterSpacing: "-.035em", margin: "14px 0 8px" }}>{geometry.record.name}</h4>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>WaterBodyID {geometry.record.waterBodyId}<br />SOURCE CRS {geometry.record.sourceCrs} → DELIVERY {geometry.record.deliveredCrs}<br />GEOMETRY {geometry.record.geometry.type}</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(10,10,10,.65)" }}>{geometry.record.limitation}</p>
              <a href={geometry.record.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, color: "#2E2EFF", textDecoration: "none" }}>OPEN SOURCE QUERY ↗</a>
            </>
          ) : (
            <p style={{ fontSize: 13, lineHeight: 1.55 }}>The source has not returned a usable polygon in this browser. Source unavailable is not treated as “no geometry exists”.</p>
          )}
        </article>

        <article style={card}>
          <div style={{ ...mono, color: life?.ok ? "#0B7A39" : "#8A6500" }}>VANNMILJØ REGISTRATIONS / {sourceStatus(life)}</div>
          {life?.ok ? (
            <>
              <h4 style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 27, letterSpacing: "-.035em", margin: "14px 0 8px" }}>{life.total.toLocaleString()} source matches</h4>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>{life.records.length} records loaded in this bounded view · {speciesRecords.length} carry a scientific-name field.</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(10,10,10,.65)" }}>Registration ≠ current position. Loaded count ≠ abundance. Source membership ≠ whole-fjord inventory. Rights remain source-controlled/review-required in this candidate.</p>
              <a href="https://vannmiljoapi.miljodirektoratet.no/swagger/ui/index" target="_blank" rel="noreferrer" style={{ ...mono, color: "#2E2EFF", textDecoration: "none" }}>VANNMILJØ API / SOURCE ↗</a>
            </>
          ) : (
            <p style={{ fontSize: 13, lineHeight: 1.55 }}>The source has not returned a usable record set in this browser. No local-life absence is inferred.</p>
          )}
        </article>
      </div>

      {speciesRecords.length > 0 && (
        <article style={card}>
          <div style={{ ...mono, color: "#0B7A39" }}>RECORD-LEVEL LIFE / VANNMILJØ SOURCE</div>
          <div style={{ display: "grid", gap: 0, marginTop: 12, borderTop: "1px solid rgba(10,10,10,.18)" }}>
            {speciesRecords.slice(0, 10).map((record) => (
              <div key={record.id} style={{ display: "grid", gridTemplateColumns: "minmax(150px,1.2fr) minmax(120px,.7fr) minmax(140px,.8fr)", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(10,10,10,.15)", fontSize: 12.5 }}>
                <span><strong>{record.scientificName}</strong><br /><span style={{ color: "rgba(10,10,10,.55)" }}>{record.waterLocationName ?? record.waterLocationCode ?? "LOCATION NAME NOT RETURNED"}</span></span>
                <span>{record.samplingTime ?? "DATE NOT RETURNED"}<br /><span style={{ color: "rgba(10,10,10,.55)" }}>sample / observation time</span></span>
                <span>{record.lat != null && record.lng != null ? `${record.lat.toFixed(4)}, ${record.lng.toFixed(4)}` : "WGS84 LOCATION NOT RETURNED"}<br /><span style={{ color: "rgba(10,10,10,.55)" }}>{record.issues.join(" · ") || "NO NORMALISATION ISSUE FLAG"}</span></span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 9, flexWrap: "wrap" }}>
            <Link to={`/species?place=${encodeURIComponent(PLACE_ID)}&journey=oslofjorden`} style={{ ...mono, background: "#0A0A0A", color: "#fff", padding: "9px 11px", textDecoration: "none" }}>OPEN SAME PLACE CONTEXT IN SPECIES →</Link>
            <Link to="/atlas?journey=oslofjorden&z=6.40&c=10.62,59.67" style={{ ...mono, border: "1px solid #0A0A0A", color: "#0A0A0A", padding: "8px 11px", textDecoration: "none" }}>OPEN SAME PLACE CONTEXT IN ATLAS →</Link>
          </div>
        </article>
      )}

      <article style={{ ...card, borderColor: followed ? "#0B7A39" : "rgba(10,10,10,.24)" }}>
        <div style={{ ...mono, color: followed ? "#0B7A39" : "#8A6500" }}>FOLLOW → SOURCE CHANGE → RETURN / {followed ? "WATCH CONTRACT ACTIVE" : "FOLLOW REQUIRED"}</div>
        {!followed && <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>Follow Oslofjorden above to establish a local source snapshot. A first source check establishes a baseline; it never manufactures an alert.</p>}
        {followed && !watch && <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>Checking the same source contract for a deterministic baseline/change comparison…</p>}
        {followed && watch?.state === "BASELINE_ESTABLISHED" && <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>Baseline established from the current Vannmiljø response. No change is claimed yet. A later check can produce a Return Object only when source records are added or updated.</p>}
        {followed && watch?.state === "NO_CHANGE" && <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>No source-response change since {watch.previousCheckedAt}. This is a checked state, not an ecological “nothing changed” claim.</p>}
        {followed && watch?.state === "SOURCE_CHANGED" && <div><p style={{ fontSize: 13.5, lineHeight: 1.55 }}><strong>{watch.changes.length} source-response change(s)</strong> detected since {watch.previousCheckedAt}. These are Return Objects, not ecological alerts.</p>{watch.changes.slice(0, 5).map((change) => <div key={`${change.kind}-${change.record.id}`} style={{ ...mono, marginTop: 7 }}>{change.kind.replace(/_/g, " ")} / {change.record.label} / {change.record.occurredAt ?? "EVENT DATE NOT RETURNED"}</div>)}</div>}
        {followed && watch?.state === "STORAGE_UNAVAILABLE" && <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>Local source snapshots cannot be persisted in this browser. Watch degrades without claiming notification delivery.</p>}
        {followed && <div style={{ ...mono, marginTop: 10, color: "rgba(10,10,10,.5)" }}>FOLLOWED {follow?.addedAt ? follow.addedAt.slice(0, 10) : "LOCAL STORE"} / NOTIFICATION DELIVERY NOT CLAIMED</div>}
      </article>
    </section>
  );
}
