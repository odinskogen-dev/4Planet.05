import { useMemo, useState } from "react";
import pilotData from "@/brand-os/pilots.json";
import {
  EXTERNAL_PUBLISHING_ENABLED,
  dryRunPublish,
  evaluateRelease,
  idempotencyKey,
} from "@/brand-os/runtime";
import type {
  FounderDecision,
  PublicationReceipt,
  ReleaseRecord,
  StoryRecord,
} from "@/brand-os/types";
import "./brand-os-release-board.css";

const stories = pilotData as unknown as StoryRecord[];

const gateLabel = (value: string) => value.split("_").join(" ");

const makeRelease = (story: StoryRecord, decision: FounderDecision): ReleaseRecord => ({
  releaseId: `REL-${story.storyId.replace("STORY-", "")}-IG-001`,
  storyId: story.storyId,
  channel: "instagram",
  version: 1,
  founderDecision: decision,
  contentFingerprint: `${story.slug}-master-v1`,
});

export default function BrandOSReleaseBoard() {
  const [selectedId, setSelectedId] = useState(stories[0]?.storyId ?? "");
  const [decisions, setDecisions] = useState<Record<string, FounderDecision>>({});
  const [receipts, setReceipts] = useState<PublicationReceipt[]>([]);

  const story = stories.find((item) => item.storyId === selectedId) ?? stories[0];
  const decision = story ? decisions[story.storyId] ?? "OPEN" : "OPEN";
  const release = story ? makeRelease(story, decision) : null;
  const qa = story && release ? evaluateRelease(story, release) : null;

  const storyReceipts = useMemo(
    () => (story ? receipts.filter((receipt) => receipt.storyId === story.storyId) : []),
    [receipts, story],
  );

  if (!story || !release || !qa) return null;

  const setFounderDecision = (next: FounderDecision) => {
    setDecisions((current) => ({ ...current, [story.storyId]: next }));
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
            AI produces. Founder releases. The system preserves truth, rights, receipts and learning.
          </p>
        </div>
        <div className="bos-safety" role="status">
          <strong>EXTERNAL PUBLISHING DISABLED</strong>
          <span>Dry-run only. No platform network call exists in this interface.</span>
        </div>
      </header>

      <section className="bos-pilot-strip" aria-label="Brand OS pilot stories">
        {stories.map((item) => (
          <button
            className={item.storyId === story.storyId ? "bos-pilot bos-pilot-active" : "bos-pilot"}
            key={item.storyId}
            onClick={() => setSelectedId(item.storyId)}
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
          <p className="bos-kicker">RELEASE OBJECT</p>
          <h2>{release.releaseId}</h2>

          <dl className="bos-data-list">
            <div><dt>Channel</dt><dd>{release.channel}</dd></div>
            <div><dt>Version</dt><dd>v{release.version}</dd></div>
            <div><dt>Founder</dt><dd>{decision}</dd></div>
            <div><dt>External publish</dt><dd>{EXTERNAL_PUBLISHING_ENABLED ? "ENABLED" : "DISABLED"}</dd></div>
            <div><dt>QA</dt><dd>{qa.status}</dd></div>
            <div><dt>Public eligible</dt><dd>{qa.publicEligible ? "YES" : "NO"}</dd></div>
          </dl>

          <div className="bos-section">
            <h3>QA / release reasons</h3>
            {qa.reasons.length ? (
              <ul className="bos-reasons">
                {qa.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            ) : <p>All content gates pass. External publishing is still controlled by runtime configuration.</p>}
          </div>

          <div className="bos-actions" aria-label="Founder decision simulation">
            {(["APPROVED", "EDIT", "HOLD", "KILL"] as FounderDecision[]).map((value) => (
              <button key={value} type="button" onClick={() => setFounderDecision(value)}>
                {value === "APPROVED" ? "APPROVE" : value}
              </button>
            ))}
          </div>

          <button className="bos-dry-run" type="button" onClick={simulatePublish}>
            SIMULATE PUBLISH / DRY RUN
          </button>
          <code className="bos-key">{idempotencyKey(release)}</code>
        </aside>
      </section>

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
