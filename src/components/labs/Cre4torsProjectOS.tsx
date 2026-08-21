import { useMemo, useState } from "react";
import "@/styles/cre4tors-project-os.css";

type CreatorKey = "photographer" | "artist" | "filmmaker" | "musician" | "writer";

type Project = { name: string; stage: string; note: string };
type Action = { id: string; label: string; meta: string; urgency: string };

const PROJECTS: Record<CreatorKey, Project[]> = {
  photographer: [
    { name: "Arctic archive", stage: "LICENSING", note: "42 images · rights notes partially complete" },
    { name: "Coast field story", stage: "DELIVERY", note: "Edit, caption and invoice state linked" },
    { name: "Personal series", stage: "DEEP WORK", note: "Protected creation block · no admin scheduled" },
  ],
  artist: [
    { name: "Edition 04", stage: "RELEASE", note: "Edition terms, fulfilment and sales state" },
    { name: "Living systems series", stage: "STUDIO", note: "Protected making time · catalogue updated" },
    { name: "Editorial commission", stage: "CONTRACT", note: "Scope and reproduction rights need approval" },
  ],
  filmmaker: [
    { name: "Field short", stage: "POST", note: "Contributor releases + edit approvals visible" },
    { name: "Species treatment", stage: "PITCH", note: "One decision needed before proposal can move" },
    { name: "Archive reel", stage: "RIGHTS", note: "Music and footage states not yet complete" },
  ],
  musician: [
    { name: "Listening world 01", stage: "MIX", note: "Master + composition ownership explicit" },
    { name: "Live session", stage: "BOOKING", note: "Fee, travel and performance terms tracked" },
    { name: "Sync catalogue", stage: "RIGHTS", note: "Tracks classified by sync readiness" },
  ],
  writer: [
    { name: "Species essay", stage: "DRAFT", note: "Deep work protected · sources and notes retained" },
    { name: "Place feature", stage: "COMMISSION", note: "Scope, fee and publication terms visible" },
    { name: "Long-form project", stage: "RESEARCH", note: "Context retained across interviews and files" },
  ],
};

const ACTIONS: Record<CreatorKey, Action[]> = {
  photographer: [
    { id: "photo-rights", label: "Approve licence scope for 6 archive images", meta: "RIGHTS · HUMAN DECISION REQUIRED", urgency: "TODAY" },
    { id: "photo-invoice", label: "Confirm invoice details for delivered field story", meta: "MONEY · DRAFT PREPARED", urgency: "12 MIN" },
    { id: "photo-edit", label: "Choose final 8 frames from short-list", meta: "CREATIVE · SYSTEM SHOULD NOT DECIDE", urgency: "FOCUS" },
  ],
  artist: [
    { id: "artist-price", label: "Choose final Edition 04 price", meta: "ECONOMY · OPTIONS PREPARED", urgency: "TODAY" },
    { id: "artist-rights", label: "Approve reproduction terms for commission", meta: "RIGHTS · HUMAN DECISION REQUIRED", urgency: "8 MIN" },
    { id: "artist-proof", label: "Approve print proof", meta: "CREATIVE · PHYSICAL JUDGEMENT", urgency: "FOCUS" },
  ],
  filmmaker: [
    { id: "film-cut", label: "Approve story change in cut 03", meta: "CREATIVE · CONTEXT ATTACHED", urgency: "FOCUS" },
    { id: "film-release", label: "Resolve one missing contributor release", meta: "RIGHTS · EXCEPTION", urgency: "TODAY" },
    { id: "film-budget", label: "Choose between two production-cost scenarios", meta: "ECONOMY · OPTIONS PREPARED", urgency: "10 MIN" },
  ],
  musician: [
    { id: "music-master", label: "Confirm master ownership for two tracks", meta: "RIGHTS · HUMAN CONFIRMATION", urgency: "TODAY" },
    { id: "music-mix", label: "Approve mix 05", meta: "CREATIVE · SYSTEM SHOULD NOT DECIDE", urgency: "FOCUS" },
    { id: "music-sync", label: "Choose sync scope for demo brief", meta: "RIGHTS · OPTIONS PREPARED", urgency: "7 MIN" },
  ],
  writer: [
    { id: "writer-edit", label: "Approve editor changes to opening section", meta: "CREATIVE · CONTEXT ATTACHED", urgency: "FOCUS" },
    { id: "writer-terms", label: "Choose syndication option for feature", meta: "RIGHTS · OPTIONS PREPARED", urgency: "6 MIN" },
    { id: "writer-source", label: "Confirm one source attribution", meta: "TRUTH · HUMAN CHECK", urgency: "TODAY" },
  ],
};

export function Cre4torsProjectOS({ creator }: { creator: CreatorKey }) {
  const [done, setDone] = useState<string[]>([]);
  const projects = PROJECTS[creator];
  const actions = ACTIONS[creator];
  const remaining = useMemo(() => actions.filter((action) => !done.includes(action.id)).length, [actions, done]);

  const toggle = (id: string) => setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <section className="c4-project-os" aria-labelledby="creator-os-heading">
      <div className="c4-os-head">
        <div className="c4-section-label">04 · CREATOR PROJECT OS</div>
        <div>
          <h2 id="creator-os-heading">Only show me what needs me.</h2>
          <p>Transferred from the 4PLANET/LABS operating pattern: projects keep their own context, state, files, rights and economic events. The human gets an exception queue instead of carrying the whole system in working memory.</p>
        </div>
      </div>

      <div className="c4-os-shell">
        <aside className="c4-os-sidebar">
          <small>ACTIVE PROJECTS · DEMO</small>
          <div className="c4-os-projects">
            {projects.map((project) => (
              <article className="c4-os-project" key={project.name}>
                <div><strong>{project.name}</strong><span>{project.stage}</span></div>
                <p>{project.note}</p>
              </article>
            ))}
          </div>
          <div className="c4-os-sidebar-foot"><span>CONTEXT RETAINED</span><b>3 / 3</b></div>
        </aside>

        <div className="c4-os-main">
          <small>TODAY · HUMAN ATTENTION QUEUE</small>
          <h3>{remaining === 0 ? "Nothing needs you now." : `${remaining} thing${remaining === 1 ? "" : "s"} need you.`}</h3>
          <div className="c4-os-action-list">
            {actions.map((action) => {
              const isDone = done.includes(action.id);
              return (
                <button className={`c4-os-action ${isDone ? "is-done" : ""}`} key={action.id} type="button" onClick={() => toggle(action.id)} aria-pressed={isDone}>
                  <span className="c4-os-action-marker">{isDone ? "✓" : ""}</span>
                  <span className="c4-os-action-copy"><strong>{action.label}</strong><small>{action.meta}</small></span>
                  <span>{action.urgency}</span>
                </button>
              );
            })}
          </div>
          <div className="c4-os-automation">
            <div><small>HANDLED WITHOUT YOU · DEMO</small><strong>14 routine actions</strong><p>Scheduling, reminders, status collection and document prep.</p></div>
            <div><small>PROTECTED TIME</small><strong>2 focus blocks</strong><p>No low-value operating work routed into reserved creative time.</p></div>
          </div>
          <div className="c4-os-rule"><b>OPERATING PRINCIPLE</b><span>AUTOMATE ROUTINE · ASSIST JUDGEMENT · NEVER HIDE MATERIAL CONTROL</span></div>
        </div>
      </div>
    </section>
  );
}
