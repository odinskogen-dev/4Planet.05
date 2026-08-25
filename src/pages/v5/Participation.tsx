import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import {
  PARTICIPATION_OPPORTUNITIES,
  PARTICIPATION_CONTRACT_RULES,
  ACTOR_ENGINE_01_FOUNDATION,
  ACTOR_TEMPLATE_TRANSFER_CASES,
  explainParticipationMatch,
  externalRecordToOpportunity,
  opportunitiesForActor,
  type ExternalParticipationRecord,
  type ParticipationOpportunity,
  type ParticipationPreference,
} from "@/content/participation";
import "@/styles/actor-participation.css";

function SourceMark({ opportunity }: { opportunity: ParticipationOpportunity }) {
  const firstParty = opportunity.source.assertion === "ACTOR_OFFICIAL";
  return (
    <div className="participation-source">
      <span>{firstParty ? "ACTOR OFFICIAL" : "EXTERNAL PUBLIC LISTING"}</span>
      <span>CHECKED {opportunity.source.checkedAt}</span>
      <span>{opportunity.confidence} CONFIDENCE</span>
    </div>
  );
}

function FinancialReality({ opportunity }: { opportunity: ParticipationOpportunity }) {
  const { financials } = opportunity;
  const rows = [
    ["PAY", financials.paid ? "Paid opportunity" : "Unpaid / volunteer"],
    ["TRAINING", financials.trainingCost],
    ["MEMBERSHIP", financials.membershipCost],
    ["TRAVEL", financials.travel],
    ["ACCOMMODATION", financials.accommodation],
    ["FOOD", financials.food],
    ["INSURANCE", financials.insurance],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="participation-financials">
      <p>REAL COST / FRICTION</p>
      {rows.map(([label, value]) => (
        <div key={label}><span>{label}</span><strong>{value}</strong></div>
      ))}
      <small>{financials.note}</small>
    </div>
  );
}

export function OpportunityCard({ opportunity, compact = false }: { opportunity: ParticipationOpportunity; compact?: boolean }) {
  return (
    <article className={`participation-card${compact ? " participation-card-compact" : ""}`}>
      <div className="participation-card-top">
        <div className="participation-types">{opportunity.types.map((type) => <span key={type}>{type.replaceAll("_", " ")}</span>)}</div>
        <span className={`participation-availability participation-availability-${opportunity.availability.toLowerCase()}`}>{opportunity.availability.replaceAll("_", " ")}</span>
      </div>
      <p className="participation-actor">{opportunity.actorName}</p>
      <h3>{opportunity.title}</h3>
      <p className="participation-summary">{opportunity.summary}</p>
      <div className="participation-facts">
        <div><span>WHERE</span><strong>{opportunity.place}</strong></div>
        <div><span>WHEN</span><strong>{opportunity.dates}</strong></div>
        <div><span>TIME</span><strong>{opportunity.duration}</strong></div>
        <div><span>MODE</span><strong>{opportunity.mode.replaceAll("_", " ")}</strong></div>
      </div>
      {!compact && (
        <>
          {opportunity.ecologicalPurpose && <div className="participation-purpose"><span>WHY IT MATTERS</span><p>{opportunity.ecologicalPurpose}</p></div>}
          <div className="participation-detail-grid">
            <div><span>WHAT YOU BRING</span>{opportunity.skills.map((skill) => <p key={skill}>{skill}</p>)}</div>
            <div><span>REQUIREMENTS</span>{opportunity.eligibility.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <FinancialReality opportunity={opportunity} />
        </>
      )}
      <SourceMark opportunity={opportunity} />
      <div className="participation-card-actions">
        <a href={opportunity.applicationUrl} target="_blank" rel="noreferrer">OPEN OFFICIAL SOURCE <span aria-hidden>↗</span></a>
        {opportunity.actorId === "P17-A036" && <Link to="/actors/orca">ACTOR PROFILE →</Link>}
      </div>
    </article>
  );
}

export function GetInvolvedSection({ actorId }: { actorId: string }) {
  const opportunities = opportunitiesForActor(actorId);
  return (
    <section className="participation-actor-section" id="get-involved">
      <header className="participation-section-head">
        <p>GET INVOLVED</p>
        <h2>Don’t just follow the work. Find your place in it.</h2>
        <span>Current, source-backed ways to contribute. Costs, requirements and uncertainty stay visible.</span>
      </header>
      {opportunities.length ? (
        <div className="participation-opportunity-grid">
          {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}
        </div>
      ) : (
        <div className="participation-none">
          <span>NO SOURCE-BACKED PARTICIPATION PATHWAY PUBLISHED YET</span>
          <p>4PLANET will not manufacture a volunteer route because a profile exists. Opportunities appear only when a current source supports them.</p>
        </div>
      )}
      <Link className="participation-find-link" to="/get-involved">
        <span>FIND YOUR WAY TO HELP</span><b>Match your skills, time and constraints →</b>
      </Link>
    </section>
  );
}

type ApiState = "LOADING" | "LIVE" | "UNAVAILABLE";

type ExternalApiResponse = {
  status: string;
  source?: { reportedCount?: number | null; checkedAt?: string };
  opportunities?: ExternalParticipationRecord[];
};

const DEFAULT_PREFERENCE: ParticipationPreference = {
  care: "ocean",
  skill: "",
  time: "ANY",
  place: "ANY",
  cost: "ANY",
};

function relevantToPreference(opportunity: ParticipationOpportunity, preference: ParticipationPreference) {
  const care = preference.care.trim().toLowerCase();
  const skill = preference.skill.trim().toLowerCase();
  if (!care && !skill) return true;
  const text = [
    opportunity.title,
    opportunity.summary,
    opportunity.ecologicalPurpose,
    opportunity.place,
    ...opportunity.skills,
    ...opportunity.speciesOrEcosystems,
  ].filter(Boolean).join(" ").toLowerCase();
  return (!care || text.includes(care)) && (!skill || text.includes(skill));
}

export function FindYourWayToHelp() {
  const [preference, setPreference] = useState<ParticipationPreference>(DEFAULT_PREFERENCE);
  const [external, setExternal] = useState<ParticipationOpportunity[]>([]);
  const [apiState, setApiState] = useState<ApiState>("LOADING");
  const [reportedCount, setReportedCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/volunteer-opportunities", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        const payload = (await response.json()) as ExternalApiResponse;
        if (!active) return;
        if (!response.ok || payload.status !== "LIVE_EXTERNAL_SOURCE") {
          setApiState("UNAVAILABLE");
          setExternal([]);
          return;
        }
        setReportedCount(payload.source?.reportedCount ?? null);
        setExternal((payload.opportunities ?? []).map(externalRecordToOpportunity));
        setApiState("LIVE");
      })
      .catch(() => {
        if (!active) return;
        setApiState("UNAVAILABLE");
        setExternal([]);
      });
    return () => { active = false; };
  }, []);

  const allOpportunities = useMemo(() => [...PARTICIPATION_OPPORTUNITIES, ...external], [external]);
  const matches = useMemo(() => allOpportunities
    .filter((opportunity) => relevantToPreference(opportunity, preference))
    .map((opportunity) => explainParticipationMatch(opportunity, preference))
    .filter((match) => match.eligibleForReview)
    .sort((a, b) => Number(Boolean(a.opportunity.external)) - Number(Boolean(b.opportunity.external)))
    .slice(0, 6), [allOpportunities, preference]);

  function set<K extends keyof ParticipationPreference>(key: K, value: ParticipationPreference[K]) {
    setPreference((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="participation-discovery">
      <Seo
        title="Find your way to help — 4PLANET"
        description="Match what you care about, what you can bring and the constraints you actually have to real ways to contribute."
        path="/get-involved"
        robots="noindex,follow"
      />
      <nav className="participation-nav"><Link to="/">4PLANET_</Link><div><Link to="/actors">ACTORS</Link><Link to="/atlas">ATLAS</Link></div></nav>
      <header className="participation-discovery-hero">
        <p>4PLANET_ GET INVOLVED</p>
        <h1>Find your way to help.</h1>
        <span>Start with what you care about. Add what you can bring. Keep time, place and money real.</span>
      </header>

      <section className="participation-matcher" aria-label="Participation preferences">
        <label><span>WHAT DO YOU CARE ABOUT?</span><input value={preference.care} onChange={(event) => set("care", event.target.value)} placeholder="ocean, forest, wildlife…" /></label>
        <label><span>WHAT CAN YOU BRING?</span><input value={preference.skill} onChange={(event) => set("skill", event.target.value)} placeholder="photography, science, writing…" /></label>
        <label><span>HOW MUCH TIME?</span><select value={preference.time} onChange={(event) => set("time", event.target.value as ParticipationPreference["time"])}><option value="ANY">Any</option><option value="HOURS">Hours</option><option value="DAYS">Days</option><option value="WEEKS">Weeks</option><option value="MONTHS">Months</option></select></label>
        <label><span>WHERE?</span><select value={preference.place} onChange={(event) => set("place", event.target.value as ParticipationPreference["place"])}><option value="ANY">Anywhere</option><option value="REMOTE">Remote</option><option value="TRAVEL">I can travel</option><option value="LOCAL">Local</option></select></label>
        <label><span>MONEY REALITY?</span><select value={preference.cost} onChange={(event) => set("cost", event.target.value as ParticipationPreference["cost"])}><option value="ANY">Show all</option><option value="LOW_COST">Low cost</option><option value="COSTS_COVERED">Core costs covered</option><option value="PAID_ONLY">Paid only</option></select></label>
      </section>

      <section className="participation-results">
        <div className="participation-results-head">
          <div><p>EXPLAINABLE MATCHES</p><h2>Places where you could genuinely be useful.</h2></div>
          <div className={`participation-api-state participation-api-${apiState.toLowerCase()}`}><span>LIVE SUPPLY</span><strong>{apiState === "LIVE" ? `VolunteerConnector · ${reportedCount ?? "live"} public listings` : apiState === "LOADING" ? "Checking public API…" : "External source unavailable — showing first-party pathways only"}</strong></div>
        </div>
        {matches.length ? matches.map((match) => (
          <div className="participation-match" key={match.opportunity.id}>
            <OpportunityCard opportunity={match.opportunity} compact />
            <aside>
              <p>WHY THIS MATCH</p>
              {match.reasons.map((reason) => <span key={reason}>{reason}</span>)}
              <p>HARD GATES</p>
              {match.hardGates.map((gate) => <span key={gate.label}><b>{gate.state}</b> {gate.label} — {gate.reason}</span>)}
            </aside>
          </div>
        )) : <div className="participation-zero"><h3>No credible match under these constraints.</h3><p>That is a valid result. Broaden one constraint rather than pretending a weak listing fits.</p></div>}
      </section>

      <section className="participation-external-proof">
        <header><p>LIVE EXTERNAL SOURCE PROOF</p><h2>Real supply. Not automatically recommended.</h2><span>VolunteerConnector listings are shown as externally asserted records. UNKNOWN availability, costs or eligibility block them from the explainable match list until those gates can be resolved.</span></header>
        {apiState === "LIVE" && external.length ? <div>{external.slice(0, 3).map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} compact />)}</div> : <div className="participation-zero"><h3>External source not available.</h3><p>The product fails closed rather than replacing live records with fabricated examples.</p></div>}
      </section>

      <section className="participation-transfer-proof">
        <header><p>TEMPLATE TRANSFER PROOF</p><h2>One Actor system. Unlike actors.</h2><span>The shared schema must survive marine monitoring, restoration implementation and knowledge infrastructure without organisation-specific page architecture.</span></header>
        <div className="participation-transfer-grid">{ACTOR_TEMPLATE_TRANSFER_CASES.map((actor) => <article key={actor.actorId}><span>{actor.archetype}</span><h3>{actor.actorName}</h3><p>{actor.note}</p><div><b>{actor.actorId}</b><b>{actor.getInvolvedState.replaceAll("_", " ")}</b></div><a href={actor.source} target="_blank" rel="noreferrer">SOURCE ↗</a></article>)}</div>
      </section>

      <section className="participation-trust">
        <div><p>HOW THIS WORKS</p><h2>Matching without magic.</h2></div>
        <div>{PARTICIPATION_CONTRACT_RULES.map((rule) => <p key={rule}>{rule}</p>)}</div>
      </section>

      <section className="participation-engine">
        <p>ACTOR ENGINE 01 — FOUNDATION</p>
        <div>{ACTOR_ENGINE_01_FOUNDATION.map((step, index) => <span key={step}><b>{String(index + 1).padStart(2, "0")}</b>{step}</span>)}</div>
      </section>
    </main>
  );
}
