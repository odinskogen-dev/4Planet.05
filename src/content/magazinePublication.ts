export const MAGAZINE_PUBLICATION_STATE = {
  release: "PUBLIC_FOUNDING_EDITION",
  publicSince: "2026-08-24",
  publisher: "4PLANET MAGAZINE",
  editorialDesk: "4PLANET Editorial Desk",
  promise: "Stories that earn the reader's time: human-first, source-aware, visually literate and explicit about what the evidence can and cannot support.",
} as const;

export const MAGAZINE_PUBLICATION_PIPELINE = [
  "IDEA",
  "RESEARCH",
  "SOURCES",
  "CLAIMS",
  "DRAFT",
  "EDIT",
  "FACT CHECK",
  "VISUALS",
  "SEO",
  "QA",
  "PUBLISH",
  "DISTRIBUTE",
  "LEARN",
] as const;

export const MAGAZINE_EDITORIAL_FORMS = [
  { id: "FEATURE", label: "Feature", job: "A deeply edited narrative or systems story worth sustained attention." },
  { id: "FIELD", label: "From the Field", job: "People, methods and places where observation or action actually happens." },
  { id: "EXPLAINER", label: "Explainer", job: "Make a difficult living-system question legible without flattening it." },
  { id: "WHAT_WORKS", label: "What Works", job: "Interrogate a proposed solution, including mechanism, evidence, trade-offs and limits." },
  { id: "LIVING_WORLD", label: "The Living World", job: "Enter through a species or ecosystem and reveal the system around it." },
  { id: "PLANET_SIGNAL", label: "Planet Signal", job: "One timely source, one useful observation, one reason it matters and one explicit boundary." },
  { id: "VISUAL_ESSAY", label: "Visual Essay", job: "Let images carry part of the argument while captions, context and rights remain attached." },
  { id: "INTERVIEW_PROFILE", label: "Interview / Profile", job: "Reserved for real original reporting with a named person; never fabricated from secondary material." },
] as const;

export const MAGAZINE_RELEASE_STANDARD = [
  "The opening gives a human reader a reason to continue before asking them to absorb system context.",
  "Every material factual claim is supportable by an attached source or is clearly labelled as 4PLANET interpretation.",
  "Reported-from-source work never implies that 4PLANET was physically present unless original reporting actually occurred.",
  "Observed, modelled, interpreted and unknown remain different states throughout copy and visuals.",
  "Every full story has a distinct art direction, an honest hero and at least one second visual beat.",
  "A context image is never presented as documentary proof of the event, person, place or outcome described.",
  "Headline and dek promise only what the body can deliver.",
  "The final section leaves the reader with a sharper model of the world, not a recycled summary or generic call to action.",
  "Canonical URL, metadata, structured data, internal links, alt text and source links are present before release.",
  "The story passes desktop, mobile, keyboard, reduced-motion and live-route checks before publication.",
] as const;

export const MAGAZINE_VOICE = [
  "Human first: begin with a person, place, animal, object, tension or surprising fact whenever the material supports it.",
  "Curious rather than preachy: investigate the mechanism before declaring the moral.",
  "Intelligent without insider language: preserve complexity, remove unnecessary jargon.",
  "Visually literate: write with scenes, scale, movement and spatial consequence in mind.",
  "Scientifically honest: uncertainty is useful information, not a weakness to hide.",
  "Provocative only when earned: surprise should come from evidence, framing or consequence rather than hype.",
  "Reader value is the final gate: every published object must teach, reveal, reframe, orient or help someone see what to inspect next.",
] as const;

export const MAGAZINE_ANALYTICS_EVENTS = [
  "article_open",
  "engaged_read",
  "read_depth",
  "read_complete",
  "topic_open",
  "search",
  "save",
  "share",
  "related_story_open",
  "source_open",
  "atlas_open",
  "returning_reader",
] as const;
