import { useState, type FormEvent } from "react";

type ProcurementSignal = {
  id: string;
  title: string;
  buyer: string | null;
  buyerCountry: string | null;
  publicationDate: string | null;
  noticeType: string | null;
  cpv: string[];
  deadline: string | null;
  sourceUrl: string;
};

type ClimateOwnerCandidate = {
  id: string;
  name: string;
  country: string | null;
  type: string | null;
  sourceUrl: string;
};

type ClimateFacility = {
  canonicalFacilityId?: string | null;
  sourceId?: string | number | null;
  name?: string | null;
  sector?: string | null;
  subsector?: string | null;
  country?: string | null;
  lat: number;
  lon: number;
  co2e?: number | null;
  year?: number | string | null;
};

export function PublicProcurementIntelligence({ companyName }: { companyName: string }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"NOR" | "ALL">("NOR");
  const [signals, setSignals] = useState<ProcurementSignal[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [state, setState] = useState<"IDLE" | "LOADING" | "READY" | "NO_MATCH" | "ERROR">("IDLE");

  async function search(event?: FormEvent) {
    event?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setState("LOADING");
    setSignals([]);
    setTotal(null);
    try {
      const response = await fetch(`/api/procurement-demand?q=${encodeURIComponent(q)}&country=${country}`);
      const payload = await response.json() as { ok?: boolean; signals?: ProcurementSignal[]; total?: number };
      if (!response.ok || !payload.ok) throw new Error("PROCUREMENT_SOURCE_FAILED");
      const next = Array.isArray(payload.signals) ? payload.signals : [];
      setSignals(next);
      setTotal(typeof payload.total === "number" ? payload.total : next.length);
      setState(next.length ? "READY" : "NO_MATCH");
    } catch {
      setState("ERROR");
    }
  }

  return (
    <div className="fbi-external-tool" aria-label="Public procurement intelligence">
      <div className="fbi-section-head">
        <div><span>PUBLIC DEMAND / TED</span><h2>See what public buyers are publishing.</h2></div>
        <p>Search a product, technology or capability relevant to {companyName}. 4BRANDS does not infer supplier fit from an industry code.</p>
      </div>

      <form className="fbi-tool-search" onSubmit={search}>
        <label htmlFor="fbi-procurement-query">Procurement keywords</label>
        <div>
          <input id="fbi-procurement-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. reverse vending, recycling sorting" />
          <select aria-label="Procurement geography" value={country} onChange={(event) => setCountry(event.target.value as "NOR" | "ALL")}>
            <option value="NOR">Norway on TED</option>
            <option value="ALL">All TED markets</option>
          </select>
          <button type="submit" disabled={state === "LOADING" || query.trim().length < 2}>{state === "LOADING" ? "Searching…" : "Search notices"}</button>
        </div>
        <small>Source: TED published-notice search. Doffin-only national coverage remains separate until the official public API path is configured.</small>
      </form>

      {state === "ERROR" && <p className="fbi-tool-state" role="status">TED is unavailable for this lookup. No market conclusion is inferred.</p>}
      {state === "NO_MATCH" && <p className="fbi-tool-state" role="status">No bounded result returned. This is not evidence that demand does not exist.</p>}
      {state === "READY" && (
        <>
          <div className="fbi-tool-summary"><strong>{total ?? signals.length}</strong><span>matching published notice records · showing up to {signals.length}</span></div>
          <div className="fbi-tool-results">
            {signals.map((signal) => (
              <article key={signal.id}>
                <span>{signal.publicationDate || "DATE UNKNOWN"}</span>
                <h3>{signal.title}</h3>
                <p>{signal.buyer || "BUYER UNKNOWN"}{signal.buyerCountry ? ` · ${signal.buyerCountry}` : ""}</p>
                <small>{signal.deadline ? `Deadline ${signal.deadline}` : "Deadline unknown"}{signal.cpv.length ? ` · CPV ${signal.cpv.slice(0, 4).join(" · ")}` : ""}</small>
                <a href={signal.sourceUrl} target="_blank" rel="noreferrer">Open original TED notice ↗</a>
              </article>
            ))}
          </div>
        </>
      )}
      <div className="fbi-truth-boundary"><span>SIGNAL BOUNDARY</span><p>A published notice is evidence of procurement activity. It is not proof that {companyName} is eligible, competitive, selected, contracted or paid.</p></div>
    </div>
  );
}

export function PublicPlanetIntelligence({ companyName }: { companyName: string }) {
  const [owners, setOwners] = useState<ClimateOwnerCandidate[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<ClimateOwnerCandidate | null>(null);
  const [facilities, setFacilities] = useState<ClimateFacility[]>([]);
  const [state, setState] = useState<"IDLE" | "SEARCHING" | "REVIEW" | "LOADING" | "READY" | "NO_MATCH" | "ERROR">("IDLE");

  async function discover() {
    setState("SEARCHING");
    setOwners([]);
    setSelectedOwner(null);
    setFacilities([]);
    try {
      const response = await fetch(`/api/climate-trace-owners?name=${encodeURIComponent(companyName)}`);
      const payload = await response.json() as { ok?: boolean; candidates?: ClimateOwnerCandidate[] };
      if (!response.ok || !payload.ok) throw new Error("OWNER_SOURCE_FAILED");
      const next = Array.isArray(payload.candidates) ? payload.candidates : [];
      setOwners(next);
      setState(next.length ? "REVIEW" : "NO_MATCH");
    } catch {
      setState("ERROR");
    }
  }

  async function confirmOwner(owner: ClimateOwnerCandidate) {
    setSelectedOwner(owner);
    setFacilities([]);
    setState("LOADING");
    try {
      const response = await fetch(`/api/climate-trace?ownerIds=${encodeURIComponent(owner.id)}&sectors=power,electricity-generation,oil-and-gas-production-and-transport,oil-and-gas-refining,coal-mining,manufacturing&limit=250&year=2025&gas=co2e_100yr`);
      const payload = await response.json() as { ok?: boolean; assets?: ClimateFacility[] };
      if (!response.ok || !payload.ok) throw new Error("CLIMATE_SOURCE_FAILED");
      const next = Array.isArray(payload.assets) ? payload.assets : [];
      setFacilities(next);
      setState(next.length ? "READY" : "NO_MATCH");
    } catch {
      setState("ERROR");
    }
  }

  return (
    <div className="fbi-external-tool" aria-label="Public planet intelligence">
      <div className="fbi-section-head">
        <div><span>FACILITIES / EMISSIONS · CLIMATE TRACE</span><h2>Review the identity join before showing facility data.</h2></div>
        <p>Climate TRACE owner names are discovery candidates. 4BRANDS never treats a similar name as proof that a facility belongs to the exact legal company.</p>
      </div>

      {state === "IDLE" && <button className="fbi-tool-action" type="button" onClick={() => void discover()}>Find owner candidates</button>}
      {state === "SEARCHING" && <p className="fbi-tool-state" role="status">Searching Climate TRACE owner records…</p>}
      {state === "NO_MATCH" && <p className="fbi-tool-state" role="status">No bounded owner/facility result returned. No emissions are inferred.</p>}
      {state === "ERROR" && <p className="fbi-tool-state" role="status">Climate TRACE is unavailable for this lookup. Existing company evidence is unchanged.</p>}

      {state === "REVIEW" && (
        <div className="fbi-owner-list">
          {owners.map((owner) => (
            <button type="button" key={owner.id} onClick={() => void confirmOwner(owner)}>
              <span><strong>{owner.name}</strong><small>Climate TRACE owner {owner.id}{owner.country ? ` · ${owner.country}` : ""}</small></span>
              <b>Review this owner →</b>
            </button>
          ))}
        </div>
      )}

      {state === "LOADING" && <p className="fbi-tool-state" role="status">Loading public facility records for the reviewed owner…</p>}

      {selectedOwner && state === "READY" && (
        <>
          <div className="fbi-reviewed-join">
            <span>USER-REVIEWED SOURCE JOIN</span>
            <strong>{companyName} → {selectedOwner.name}</strong>
            <p>This review is session context only. It is not automatically promoted to Company Brain or shared planetary truth.</p>
          </div>
          <div className="fbi-tool-results">
            {facilities.slice(0, 16).map((facility, index) => (
              <article key={String(facility.canonicalFacilityId || facility.sourceId || index)}>
                <span>{facility.canonicalFacilityId || `facility:climatetrace:${String(facility.sourceId ?? index)}`}</span>
                <h3>{facility.name || "Unnamed Climate TRACE source"}</h3>
                <p>{facility.sector || "SECTOR UNKNOWN"}{facility.subsector ? ` / ${facility.subsector}` : ""}</p>
                <strong>{facility.co2e != null ? `${Math.round(facility.co2e).toLocaleString("en-GB")} t CO₂e` : "EMISSIONS NOT REPORTED"}</strong>
                <small>{String(facility.year || "YEAR UNKNOWN")} · {facility.country || "COUNTRY UNKNOWN"}</small>
                <a href={`/atlas?l=emissions&z=7&c=${facility.lon.toFixed(3)},${facility.lat.toFixed(3)}`} target="_blank" rel="noreferrer">Open in ATLAS ↗</a>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="fbi-truth-boundary"><span>IDENTITY BOUNDARY</span><p>Facility records only appear after a human chooses the external owner candidate. Name similarity alone never becomes a company-level emissions claim.</p></div>
    </div>
  );
}
