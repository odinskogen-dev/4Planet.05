import Link from "next/link";
import {
  claimsList,
  sourcesList,
  getClaimsByConfidence,
  getClaimsByReviewStatus,
  getUnderSourcedNodes,
  getUnderSourcedRelationships,
  getSourcesNeedingVerification,
  allDataGaps,
} from "@/lib/trust";
import { reviewLabel } from "@/components/EvidencePanel";
import { solutionIntelligenceIntegrity } from "@/lib/solutions";
import { learningIntegrity } from "@/lib/learning";
import { getDataQualitySummary, DATA_QUALITY_ISSUES } from "@/lib/dataQuality";
import { EvidenceCoverageSummary, DataQualityIssueList } from "@/components/DataQuality";
import { nodeMeta } from "@/lib/graph";
import type { ReviewStatus } from "@/types";

export const metadata = { title: "Trust — LIVING SYSTEMS INTELLIGENCE" };

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-line p-4">
      <div className="text-[28px] font-semibold leading-none tracking-tight">{value}</div>
      <div className="micro mt-2">{label}</div>
    </div>
  );
}

function Bars({ data }: { data: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-[12.5px]">{reviewLabel(k as ReviewStatus)}</span>
          <span className="h-2 bg-brand/80" style={{ width: `${(v / max) * 60 + 4}%` }} />
          <span className="text-[12.5px] text-muted">{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrustPage() {
  const byConfidence = getClaimsByConfidence();
  const byReview = getClaimsByReviewStatus();
  const underNodes = getUnderSourcedNodes();
  const underRels = getUnderSourcedRelationships();
  const needVerify = getSourcesNeedingVerification();
  const gaps = allDataGaps();

  const AMAZON_SOURCES = new Set([
    "AMAZON_INSTITUTIONAL",
    "INPE",
    "MAPBIOMAS",
    "RAISG",
    "WWF_AMAZON",
  ]);
  const amazonClaims = claimsList.filter(
    (c) =>
      (c.nodeId &&
        (c.nodeId.includes("AMAZON") ||
          [
            "SV_RAINFALL_REGULATION",
            "SV_CARBON_STORAGE",
            "SV_BIODIVERSITY_HABITAT",
            "SV_WATER_CYCLING",
            "SV_CLIMATE_REGULATION",
            "TH_DEFORESTATION",
            "TH_FOREST_DEGRADATION",
            "TH_FIRE",
            "TH_ILLEGAL_MINING",
            "TH_LAND_USE_CHANGE",
            "TH_SUPPLY_CHAIN_PRESSURE",
            "SO_INDIGENOUS_STEWARDSHIP",
            "SO_FOREST_RESTORATION",
            "SO_PROTECTED_AREAS",
          ].includes(c.nodeId))) ||
      c.sourceIds.some((s) => AMAZON_SOURCES.has(s))
  );
  const amazonSourceCount = sourcesList.filter(
    (s) => AMAZON_SOURCES.has(s.id) || s.id === "IPCC" || s.id === "NASA"
  ).length;
  const amazonGaps = amazonClaims.flatMap((c) => c.dataGaps ?? []);
  const amazonUnder = amazonClaims.filter(
    (c) => c.reviewStatus === "NeedsSource" || c.reviewStatus === "Draft"
  );
  const si = solutionIntelligenceIntegrity();

  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <div className="micro-brand mb-2">Intelligence integrity</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
        Trust
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        A serious intelligence system is open about what it knows and what it does
        not. This page tracks the evidence base — claims, sources, confidence,
        review status and the gaps still to be closed.
      </p>

      <div className="mt-5 max-w-2xl border-l-2 border-brand pl-4 py-1">
        <p className="text-[14px] leading-relaxed text-ink/85">
          Trust is not a score of perfection. It is a map of what is supported,
          what needs review, and where better evidence is required.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px sm:grid-cols-4">
        <Stat label="Claims" value={claimsList.length} />
        <Stat label="Sources" value={sourcesList.length} />
        <Stat label="Need sourcing" value={underNodes.length} />
        <Stat label="Sources to verify" value={needVerify.length} />
      </div>

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Solution &amp; decision intelligence integrity</div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
          <Stat label="Solution pathways" value={si.pathwaysCount} />
          <Stat label="Decision signals" value={si.signalsCount} />
          <Stat label="Signals to source" value={si.signalsNeedingSources.length} />
          <Stat label="Pathways to evidence" value={si.pathwaysNeedingEvidence.length} />
        </div>
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted">
          Decision signals are structured reasoning, not automated advice. Items
          listed above still need stronger sourcing or evidence before they should
          be relied upon.
        </p>
      </section>

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Amazon — flagship case coverage</div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
          <Stat label="Amazon claims" value={amazonClaims.length} />
          <Stat label="Amazon sources" value={amazonSourceCount} />
          <Stat label="Need sourcing" value={amazonUnder.length} />
          <Stat label="Data gaps" value={amazonGaps.length} />
        </div>
        {amazonUnder.length ? (
          <div className="mt-4 space-y-2">
            {amazonUnder.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3"
              >
                <span className="text-[13.5px]">{c.statement}</span>
                <span className="micro text-brand">{reviewLabel(c.reviewStatus)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <div className="micro-brand mb-4">Claims by confidence</div>
          <Bars data={byConfidence} />
        </section>
        <section>
          <div className="micro-brand mb-4">Claims by review status</div>
          <Bars data={byReview} />
        </section>
      </div>

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Nodes needing stronger sourcing ({underNodes.length})</div>
        <div className="space-y-2">
          {underNodes.map((c) => {
            const n = c.nodeId ? nodeMeta(c.nodeId) : null;
            return (
              <div key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3">
                <span className="text-[13.5px]">{c.statement}</span>
                <span className="flex items-center gap-3">
                  {n?.href ? (
                    <Link href={n.href} className="micro hover:text-brand">
                      {n.name}
                    </Link>
                  ) : n ? (
                    <span className="micro">{n.name}</span>
                  ) : null}
                  <span className="micro text-brand">{reviewLabel(c.reviewStatus)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {underRels.length ? (
        <section className="mt-10 border-t border-line pt-6">
          <div className="micro-brand mb-4">Relationships needing stronger evidence ({underRels.length})</div>
          <div className="space-y-2">
            {underRels.map((c) => (
              <div key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3">
                <span className="text-[13.5px]">{c.statement}</span>
                <span className="font-mono text-[11px] text-ink/50">{c.relationshipId}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 border-t border-line pt-6">
        <div className="micro-brand mb-4">Known data gaps ({gaps.length})</div>
        <ul className="space-y-1.5">
          {gaps.map((g, i) => (
            <li key={i} className="text-[13px] leading-snug text-muted">
              — {g.gap}
            </li>
          ))}
        </ul>
      </section>

      {(() => {
        const li = learningIntegrity();
        return (
          <section className="mt-12 border-t border-line pt-6">
            <div className="micro-brand mb-4">Learning intelligence integrity</div>
            <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {[
                ["Expected outcomes", li.expectedCount],
                ["Observed outcomes", li.observedCount],
                ["Learning records", li.learningCount],
                ["Confidence updates", li.confidenceUpdateCount],
              ].map(([label, n]) => (
                <div key={label as string} className="bg-paper p-4">
                  <div className="text-[22px] font-semibold tabular-nums">{n as number}</div>
                  <div className="micro mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="micro mb-2">By assumption status</div>
                <ul className="space-y-1">
                  {Object.entries(li.byAssumption).map(([k, v]) => (
                    <li key={k} className="flex justify-between text-[13px]">
                      <span className="text-muted">{k}</span>
                      <span className="tabular-nums">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="micro mb-2">By confidence change</div>
                <ul className="space-y-1">
                  {Object.entries(li.byConfidenceChange).map(([k, v]) => (
                    <li key={k} className="flex justify-between text-[13px]">
                      <span className="text-muted">{k}</span>
                      <span className="tabular-nums">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {li.recordsNeedingSources.length ? (
              <p className="mt-4 text-[13px] text-muted">
                Learning records needing stronger sourcing:{" "}
                <span className="text-ink">
                  {li.recordsNeedingSources.map((r) => r.id).join(", ")}
                </span>
              </p>
            ) : null}
            {li.dataGaps.length ? (
              <div className="mt-4">
                <div className="micro mb-2">Learning data gaps ({li.dataGaps.length})</div>
                <ul className="space-y-1">
                  {li.dataGaps.map((g, i) => (
                    <li key={i} className="text-[12.5px] leading-snug text-muted">— {g}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-5 text-[12.5px] text-muted">
              Learning records are structured examples for the proof cases, not
              live impact reports.
            </p>
          </section>
        );
      })()}

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Evidence coverage</div>
        <EvidenceCoverageSummary />
        <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-muted">
          Coverage reflects how many claims and sources are attached to each case,
          and how much remains context-dependent or unverified — not a score of
          how &ldquo;good&rdquo; the underlying science is.
        </p>
      </section>

      {(() => {
        const dq = getDataQualitySummary();
        return (
          <section className="mt-12 border-t border-line pt-6">
            <div className="micro-brand mb-4">Data quality register ({dq.issueCount})</div>
            <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1">
              {Object.entries(dq.bySeverity).map(([k, v]) => (
                <span key={k} className="micro">{k} <span className="ml-1 text-ink tabular-nums">{v}</span></span>
              ))}
              <span className="micro">Unverified sources <span className="ml-1 text-ink tabular-nums">{dq.unverifiedSources}</span></span>
              <span className="micro">Sources needing URL <span className="ml-1 text-ink tabular-nums">{dq.sourcesNeedingURL}</span></span>
            </div>
            <DataQualityIssueList issues={DATA_QUALITY_ISSUES} />
            <p className="mt-4 text-[12.5px] text-muted">
              These are integrity signals — known limitations the system makes
              visible rather than hides.
            </p>
          </section>
        );
      })()}
    </div>
  );
}
