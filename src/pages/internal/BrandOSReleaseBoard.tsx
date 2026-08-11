import { useMemo, useState } from "react";
import pilotData from "@/brand-os/pilots.json";
import { BeeRelationshipReveal } from "@/brand-os/BeeRelationshipReveal";
import { OrcaSourceObject, OslofjordOnePlaceObject } from "@/brand-os/PilotSourceObjects";
import { manifestForStory } from "@/brand-os/release-manifests";
import {
  BEE_FIRST_LIVE_LEARNING_CONTRACT,
  FIRST_LIVE_RECOMMENDATION,
  INSTAGRAM_PRELIVE_READINESS,
  releaseFamilyForStory,
} from "@/brand-os/prelive-closure";
import {
  EXTERNAL_PUBLISHING_ENABLED,
  dryRunPublish,
  evaluateRelease,
  idempotencyKey,
  recordFounderIntervention,
  summarizeFounderBurden,
} from "@/brand-os/runtime";
import type {
  FounderDecision,
  FounderInteractionType,
  FounderIntervention,
  PublicationReceipt,
  StoryRecord,
} from "@/brand-os/types";
import "./brand-os-release-board.css";

const stories = pilotData as unknown as StoryRecord[];

const gateLabel = (value: string) => value.split("_").join(" ");

const interactionTypeFor = (decision: FounderDecision): FounderInteractionType => {
  if (decision === "APPROVED") return "APPROVE";
  if (decision === "EDIT") return "EDIT";
  if (decision === "KILL") return "KILL";
  return "HOLD";
};

const recommendationForStory = (storyId: string) => {
  if (storyId === FIRST_LIVE_RECOMMENDATION.storyId) {
    return "PROJECT LEAD: APPROVE AS FIRST CONTROLLED TEST CANDIDATE — no live release occurs from this board.";
  }
  if (storyId === "STORY-BOS-ORCA-001") return "PROJECT LEAD: APPROVE AS SECOND CONTROLLED TEST CANDIDATE after BEE baseline.";
  return "PROJECT LEAD: APPROVE AS THIRD CONTROLLED TEST CANDIDATE after BEE + ORCA baseline.";
};

const ProductionPreview = ({ storyId }: { storyId: string }) => {
  if (storyId === "STORY-BOS-BEE-001") return <BeeRelationshipReveal />;
  if (storyId === "STORY-BOS-ORCA-001") return <OrcaSourceObject />;
  if (storyId === "STORY-BOS-OSLO-001") return <OslofjordOnePlaceObject />;
  return null;
};

export default function BrandOSReleaseBoard() {
  const [selectedId, setSelectedId] = useState(stories[0]?.storyId ?? "");
  const [decisions, setDecisions] = useState<Record<string, FounderDecision>>({});
  const [receipts, setReceipts] = useState<PublicationReceipt[]>([]);
  const [reviewStartedAt, setReviewStartedAt] = useState(() => Date.now());
  const [interventions, setInterventions] = useState<FounderIntervention[]>([]);

  const story = stories.find((item) => item.storyId === selectedId) ?? stories[0];
  const decision = story ? decisions[story.storyId] ?? "OPEN" : "OPEN";
  const manifest = story ? manifestForStory(story) : null;
  const family = story ? releaseFamilyForStory(story.storyId) : null;
  const release = manifest ? { ...manifest.release, founderDecision: decision } : null;
  const qa = story && release ? evaluateRelease(story, release) : null;
  const burden = useMemo(() => summarizeFounderBurden(interventions), [interventions]);

  const storyReceipts = useMemo(
    () => (story ? receipts.filter((receipt) => receipt.storyId === story.storyId) : []),
    [receipts, story],
  );

  if (!story || !manifest || !family || !release || !qa) return null;

  const selectStory = (storyId: string) => {
    setSelectedId(storyId);
    setReviewStartedAt(Date.now());
  };

  const setFounderDecision = (next: FounderDecision) => {
    const durationSeconds = Math.max(0, (Date.now() - reviewStartedAt) / 1000);
    const intervention = recordFounderIntervention(
      story.storyId,
      release.releaseId,
      interactionTypeFor(next),
      durationSeconds,
      "Founder Release Board local review simulation",
      next,
    );

    setDecisions((current) => ({ ...current, [story.storyId]: next }));
    setInterventions((current) => [...current, intervention]);
    setReviewStartedAt(Date.now());
  };

  const simulatePublish = () => {
    const receipt = dryRunPublish(story, release, receipts);
    setReceipts((current) => [...current, receipt]);
  };

  return (
    <main className="bos-shell">
      <header className="bos-header">
        <div>
          <p className="bos-kicker">4PLANET_ BRAND OS / INTERNAL CONTROL</p>
          <h1>Founder Release Board</h1>
          <p className="bos-lede">
            Exact founder-review objects, release families and pre-live controls. Nothing here can publish externally.
          </p>
        </div>
        <div className="bos-safety" role="status">
          <strong>EXTERNAL PUBLISHING DISABLED</strong>
          <span>Dry-run only. Platform state: {INSTAGRAM_PRELIVE_READINESS.state}. No account authentication or platform network call is executed here.</span>
        </div>
      </header>

      <section className="bos-pilot-strip" aria-label="Brand OS pilot stories">
        {stories.map((item) => (
          <button
            className={item.storyId === story.storyId ? "bos-pilot bos-pilot-active" : "bos-pilot"}
            key={item.storyId}
            onClick={() => selectStory(item.storyId)}
            type="button"
          >
            <span>{item.storyId}</span>
            <strong>{item.title}</strong>
            <small>{item.state}</small>
          </button>
        ))}
      </section>

      <section className="bos-grid">
        <article className="bos-card bos-story-card">
          <div className="bos-card-head">
            <div>
              <p className="bos-id">{story.storyId}</p>
              <h2>{story.title}</h2>
            </div>
            <span className="bos-risk">{story.risk} RISK</span>
          </div>

          <div className="bos-section bos-recommendation">
            <h3>Project Lead recommendation</h3>
            <p>{recommendationForStory(story.storyId)}</p>
          </div>

          <div className="bos-section">
            <h3>Truth core</h3>
            <p>{story.truthCore}</p>
          </div>

          <div className="bos-section">
            <h3>Audience job</h3>
            <p>{story.audienceJob}</p>
          </div>

          <div className="bos-gates" aria-label="Release gates">
            {Object.entries(story.gates).map(([name, value]) => (
              <div className={`bos-gate bos-gate-${value.toLowerCase()}`} key={name}>
                <span>{name}</span>
                <strong>{gateLabel(value)}</strong>
              </div>
            ))}
          </div>

          <div className="bos-section">
            <h3>Current blockers</h3>
            <ol className="bos-blockers">
              {story.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
            </ol>
          </div>
        </article>

        <aside className="bos-card bos-release-card">
          <p className="bos-kicker">FROZEN RELEASE OBJECT</p>
          <h2>{release.releaseId}</h2>
          <p className="bos-id">{manifest.manifestId}</p>

          <dl className="bos-data-list">
            <div><dt>Primary channel</dt><dd>{release.channel}</dd></div>
            <div><dt>Version</dt><dd>v{release.version}</dd></div>
            <div><dt>Founder</dt><dd>{decision}</dd></div>
            <div><dt>External publish</dt><dd>{EXTERNAL_PUBLISHING_ENABLED ? "ENABLED" : "DISABLED"}</dd></div>
            <div><dt>Release QA</dt><dd>{qa.status}</dd></div>
            <div><dt>Non-founder ready</dt><dd>{story.publicReleaseEligible ? "YES" : "NO"}</dd></div>
            <div><dt>Family</dt><dd>{family.familyId}</dd></div>
          </dl>

          <div className="bos-section">
            <h3>Founder review copy</h3>
            <strong>{manifest.content.headline}</strong>
            <p>{manifest.content.deck}</p>
            <p>{manifest.content.caption}</p>
          </div>

          <div className="bos-section">
            <h3>Truth / accessibility / rights</h3>
            <p><strong>ALT:</strong> {manifest.content.altText}</p>
            <p><strong>PROVENANCE:</strong> {manifest.content.provenanceLabel}</p>
            <p><strong>SOURCE FOOTER:</strong> {manifest.content.sourceFooter}</p>
            <p><strong>RIGHTS:</strong> {manifest.content.rightsRoute}</p>
            <p><strong>LIMIT:</strong> {manifest.content.limitation}</p>
            <p><strong>DESTINATION:</strong> {manifest.content.ownedDestination}</p>
          </div>

          <div className="bos-section">
            <h3>QA / release reasons</h3>
            {qa.reasons.length ? (
              <ul className="bos-reasons">
                {qa.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            ) : <p>All release gates pass. External publishing is still controlled by runtime configuration.</p>}
          </div>

          <div className="bos-section">
            <h3>Founder decision — local simulation only</h3>
            <p className="bos-measurement-note">These controls do not persist a founder decision to staging and do not authorise live release.</p>
            <div className="bos-actions" aria-label="Founder decision simulation">
              {(["APPROVED", "EDIT", "HOLD", "KILL"] as FounderDecision[]).map((value) => (
                <button key={value} type="button" onClick={() => setFounderDecision(value)}>
                  {value === "APPROVED" ? "APPROVE" : value}
                </button>
              ))}
            </div>
          </div>

          <button className="bos-dry-run" type="button" onClick={simulatePublish}>
            SIMULATE PUBLISH / DRY RUN
          </button>
          <code className="bos-key">{idempotencyKey(release)}</code>

          <div className="bos-section">
            <h3>Founder burden / this session</h3>
            <dl className="bos-data-list bos-burden-list">
              <div><dt>Decisions</dt><dd>{burden.interventionCount}</dd></div>
              <div><dt>Total</dt><dd>{burden.totalSeconds.toFixed(1)} s</dd></div>
              <div><dt>Average</dt><dd>{burden.averageSeconds.toFixed(1)} s</dd></div>
            </dl>
            <p className="bos-measurement-note">Session UI measurement is active. Canonical staging persistence exists, but this browser control does not write founder interventions to staging until a dedicated authenticated founder write path is accepted.</p>
          </div>
        </aside>
      </section>

      <section className="bos-production-preview" aria-label="Selected Brand OS production object">
        <ProductionPreview storyId={story.storyId} />
      </section>

      <section className="bos-card bos-release-family" aria-label="Exact release family">
        <div className="bos-card-head">
          <div>
            <p className="bos-kicker">EXACT RELEASE FAMILY</p>
            <h2>{family.familyId}</h2>
          </div>
          <span className="bos-risk">{family.recommendedPrimarySurface}</span>
        </div>
        <p>{family.whyThisFamily}</p>
        <div className="bos-variant-grid">
          {family.variants.map((variant) => (
            <article className="bos-variant" key={variant.variantId}>
              <p className="bos-id">{variant.variantId}</p>
              <h3>{variant.surface}</h3>
              <p><strong>{variant.format}</strong> · {variant.aspectRatio}</p>
              <ol>
                {variant.framePlan.map((frame) => <li key={frame}>{frame}</li>)}
              </ol>
              {variant.caption ? <p><strong>CAPTION:</strong> {variant.caption}</p> : null}
              {variant.altText ? <p><strong>ALT:</strong> {variant.altText}</p> : null}
              {variant.sourceFooter ? <p><strong>SOURCE:</strong> {variant.sourceFooter}</p> : null}
              <p><strong>LIMIT:</strong> {variant.truthBoundary}</p>
              <p><strong>DESTINATION:</strong> {variant.destination}</p>
              <p className="bos-id">{variant.readiness} · {variant.trackingId}</p>
            </article>
          ))}
        </div>
      </section>

      {story.storyId === FIRST_LIVE_RECOMMENDATION.storyId ? (
        <section className="bos-grid bos-prelive-grid" aria-label="First live test readiness">
          <article className="bos-card">
            <p className="bos-kicker">REFERENCE LIVE TEST — PREP ONLY</p>
            <h2>BEE / INSTAGRAM FEED</h2>
            <p><strong>{FIRST_LIVE_RECOMMENDATION.variantId}</strong></p>
            <ul className="bos-reasons">
              {FIRST_LIVE_RECOMMENDATION.rationale.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
            <div className="bos-section">
              <h3>Material risks</h3>
              <ul className="bos-reasons">
                {FIRST_LIVE_RECOMMENDATION.materialRisks.map((risk) => <li key={risk}>{risk}</li>)}
              </ul>
            </div>
          </article>

          <article className="bos-card">
            <p className="bos-kicker">PLATFORM STATE</p>
            <h2>{INSTAGRAM_PRELIVE_READINESS.state}</h2>
            <p>{INSTAGRAM_PRELIVE_READINESS.intendedAccount}</p>
            <div className="bos-section">
              <h3>Authentication still required</h3>
              <ul className="bos-reasons">
                {INSTAGRAM_PRELIVE_READINESS.authRequirements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <p className="bos-measurement-note">No authentication, account binding, media hosting or external platform request has been performed.</p>
          </article>
        </section>
      ) : null}

      {story.storyId === BEE_FIRST_LIVE_LEARNING_CONTRACT.storyId ? (
        <section className="bos-card bos-learning-contract" aria-label="Pre-registered learning contract">
          <p className="bos-kicker">PRE-REGISTERED LEARNING CONTRACT</p>
          <h2>{BEE_FIRST_LIVE_LEARNING_CONTRACT.contractId}</h2>
          <p><strong>HYPOTHESIS:</strong> {BEE_FIRST_LIVE_LEARNING_CONTRACT.hypothesis}</p>
          <p><strong>PRIMARY:</strong> {BEE_FIRST_LIVE_LEARNING_CONTRACT.primaryMetric}</p>
          <div className="bos-variant-grid">
            <article className="bos-variant">
              <h3>Decision rules</h3>
              <ul>{BEE_FIRST_LIVE_LEARNING_CONTRACT.decisionRules.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="bos-variant">
              <h3>Cannot conclude from one release</h3>
              <ul>{BEE_FIRST_LIVE_LEARNING_CONTRACT.cannotConclude.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
        </section>
      ) : null}

      <section className="bos-card bos-ledger">
        <div className="bos-card-head">
          <div>
            <p className="bos-kicker">PUBLICATION LEDGER</p>
            <h2>Receipts / duplicate control</h2>
          </div>
          <span>{storyReceipts.length} receipt{storyReceipts.length === 1 ? "" : "s"}</span>
        </div>

        {storyReceipts.length === 0 ? (
          <p className="bos-empty">No dry-run receipt yet.</p>
        ) : (
          <div className="bos-receipts">
            {storyReceipts.map((receipt) => (
              <div className="bos-receipt" key={receipt.receiptId}>
                <strong>{receipt.status}</strong>
                <span>{receipt.receiptId}</span>
                <span>{receipt.releaseId}</span>
                <span>{receipt.channel}</span>
                <span>{new Date(receipt.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="bos-footer">
        <span>Authority: BRAIN canon → Brand OS runtime → Founder release.</span>
        <span>Performance may inform canon. Performance may not silently rewrite canon.</span>
      </footer>
    </main>
  );
}
