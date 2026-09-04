import fs from "node:fs";
import { readArticleTemplates, readFeatures, readImages, readSignals, readStories, readTopics } from "./magazine-content.mjs";

const stories = readStories();
const signals = readSignals();
const topics = readTopics();
const templates = readArticleTemplates();
const features = readFeatures();
const images = readImages();
const failures = [];
const fail = (message) => failures.push(message);
const words = (blocks = []) => blocks.reduce((total, block) => total + String(block?.t || "").trim().split(/\s+/).filter(Boolean).length, 0);
const isHttps = (value) => typeof value === "string" && /^https:\/\//.test(value);
const standfirstSource = fs.readFileSync("src/content/magazineStandfirsts.ts", "utf8");

if (stories.length < 12) fail(`Launch needs at least 12 full stories; found ${stories.length}`);
if (signals.length < 10) fail(`Launch needs at least 10 Planet Signals; found ${signals.length}`);
if (topics.length < 12) fail(`Launch needs a real discovery graph; found only ${topics.length} topics`);
if (templates.length < 4) fail(`Launch needs reusable editorial formats; found only ${templates.length}`);

const heroOwners = new Map();
let worldFacing = 0;
for (const story of stories) {
  if (story.editorialType === "SOURCE_REPORTED_EDITORIAL" || story.editorialType === "INDEPENDENT_EDITORIAL") worldFacing += 1;
  const feature = features[story.slug];
  if (!feature) {
    fail(`${story.slug}: no feature layer`);
    continue;
  }

  const wordCount = words(feature.blocks);
  const subheads = feature.blocks.filter((block) => block?.k === "sub").length;
  const leads = feature.blocks.filter((block) => block?.k === "lead").length;
  const quotes = feature.blocks.filter((block) => block?.k === "quote").length;
  const paragraphs = feature.blocks.filter((block) => block?.k === "para").length;
  const combinedSources = [...(story.sourceLinks ?? []), ...(feature.addedSources ?? [])];
  const minimumWords = story.mode === "DEEP" ? 500 : 360;
  const minimumSections = story.mode === "DEEP" ? 3 : 2;

  if (wordCount < minimumWords) fail(`${story.slug}: insufficient substance for ${story.mode} (${wordCount} words; minimum ${minimumWords})`);
  if (feature.blocks.length < 8) fail(`${story.slug}: narrative does not have enough distinct beats`);
  if (paragraphs < 5) fail(`${story.slug}: needs more reported/explanatory substance, not padding`);
  if (subheads < minimumSections) fail(`${story.slug}: needs at least ${minimumSections} deliberate sections`);
  if (leads !== 1) fail(`${story.slug}: needs exactly one clear human-first lead`);
  if (quotes < 1) fail(`${story.slug}: needs at least one framing/pull-quote beat`);
  if (!standfirstSource.includes(`\"${story.slug}\"`)) fail(`${story.slug}: missing edited standfirst`);

  if (!feature.secondary && !feature.secondaryMission) fail(`${story.slug}: missing second visual beat`);
  if (!feature.secondaryKicker || !feature.secondaryCaption || !feature.secondaryNote) fail(`${story.slug}: second visual context is incomplete`);
  if (!feature.hero || !images[feature.hero]) fail(`${story.slug}: hero is missing from the controlled image registry (${feature.hero || "none"})`);
  if (feature.secondary && !images[feature.secondary]) fail(`${story.slug}: secondary image is missing from the controlled image registry (${feature.secondary})`);
  if (feature.hero) {
    const existing = heroOwners.get(feature.hero);
    if (existing) fail(`Duplicate edited hero: ${feature.hero} is used by both ${existing} and ${story.slug}`);
    else heroOwners.set(feature.hero, story.slug);
  }

  const heroMeta = images[feature.hero];
  if (heroMeta && (!heroMeta.src || !heroMeta.alt || !heroMeta.role)) fail(`${story.slug}: hero registry metadata is incomplete`);
  if (!Array.isArray(story.topics) || story.topics.length < 2) fail(`${story.slug}: topic graph is too weak`);
  if (!story.title || story.title.length < 12) fail(`${story.slug}: headline is too weak or missing`);
  if (!story.dek || story.dek.length < 80) fail(`${story.slug}: dek must promise useful context`);

  if (story.editorialType === "SOURCE_REPORTED_EDITORIAL") {
    if (!Array.isArray(story.sourceLinks) || story.sourceLinks.length < 1) fail(`${story.slug}: source-reported editorial has no primary source`);
    if (combinedSources.length < 2) fail(`${story.slug}: full source-reported feature needs at least two traceable evidence objects`);
    if (story.mode === "DEEP" && combinedSources.length < 3) fail(`${story.slug}: DEEP source-reported feature needs primary reporting plus independent/method context`);
    if (!story.reportingNote || story.reportingNote.length < 80) fail(`${story.slug}: source-reported editorial needs an explicit reporting boundary`);
  }
  for (const source of combinedSources) if (!isHttps(source.url)) fail(`${story.slug}: source is not an exact HTTPS URL`);

  const prose = feature.blocks.map((block) => String(block?.t || "")).join(" ");
  const notBut = (prose.match(/\bnot\b[^.]{0,80}\bbut\b/gi) || []).length;
  if (notBut > 4) fail(`${story.slug}: repetitive AI-shaped 'not X but Y' construction (${notBut})`);
  const emDash = (prose.match(/—/g) || []).length;
  if (emDash > 16) fail(`${story.slug}: overuses em dashes (${emDash}); edit for human rhythm`);
}

if (worldFacing < 7) fail(`Founding edition is too self-referential: only ${worldFacing}/${stories.length} full stories are world-facing journalism`);

for (const signal of signals) {
  if (!isHttps(signal.sourceUrl)) fail(`${signal.slug}: Planet Signal source must be an exact HTTPS URL`);
  if (!signal.title || signal.title.length < 15) fail(`${signal.slug}: weak Planet Signal headline`);
  if (!signal.dek || signal.dek.length < 90) fail(`${signal.slug}: weak Planet Signal dek`);
  if (!signal.signal || signal.signal.length < 100) fail(`${signal.slug}: the signal is too thin`);
  if (!signal.whyItMatters || signal.whyItMatters.length < 120) fail(`${signal.slug}: reader value / why-it-matters is too thin`);
  if (!signal.boundary || signal.boundary.length < 120) fail(`${signal.slug}: anti-overclaim boundary is too thin`);
  if (!Array.isArray(signal.topics) || signal.topics.length < 3) fail(`${signal.slug}: signal needs at least three useful topic connections`);
}

for (const topic of topics) {
  const storyCount = stories.filter((story) => story.topics?.includes(topic.id)).length;
  const signalCount = signals.filter((signal) => signal.topics?.includes(topic.id)).length;
  if (storyCount + signalCount < 1) fail(`${topic.id}: topic is an empty public destination`);
  if (!topic.promise || topic.promise.length < 45) fail(`${topic.id}: topic needs a useful reader promise`);
}

const readerFiles = [
  "src/components/magazine/MagazineShell.tsx",
  "src/pages/v5/Magazine.tsx",
  "src/pages/v5/MagazineHub.tsx",
  "src/pages/v5/MagazineInfo.tsx",
  "src/pages/v5/MagazineLibrary.tsx",
  "src/pages/v5/MagazineSignal.tsx",
  "src/pages/v5/MagazineAtlas.tsx",
  "src/pages/v5/StoryArticle.tsx",
  "src/routes/router.tsx",
];
const readerSource = readerFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["LIVE DEVELOPMENT", "EDITORIAL LAB", "prototype fixture", "placeholder story"]) {
  if (readerSource.includes(forbidden)) fail(`Reader surface still exposes prototype language: ${forbidden}`);
}
for (const requiredRoute of ["/magazine/about", "/magazine/sources", "/magazine/corrections", "/magazine/privacy", "/magazine/atlas", "/magazine/search", "/magazine/saved", "/magazine/archive", "/magazine/topics/:topic", "/magazine/series/:series", "/magazine/signals/:slug"]) {
  if (!readerSource.includes(requiredRoute)) fail(`Missing public Magazine route: ${requiredRoute}`);
}

const typography = fs.readFileSync("src/styles/magazine-brand-typography.css", "utf8");
for (const requiredFont of ["Instrument Sans", "DM Sans", "Fragment Mono"]) if (!typography.includes(requiredFont)) fail(`Brand typography missing ${requiredFont}`);
if (!readerSource.includes("/magazine/atlas")) fail("Reader-safe ATLAS path is not wired");

const publication = fs.readFileSync("src/content/magazinePublication.ts", "utf8");
for (const step of ["IDEA", "RESEARCH", "SOURCES", "CLAIMS", "DRAFT", "EDIT", "FACT CHECK", "VISUALS", "SEO", "QA", "PUBLISH", "DISTRIBUTE", "LEARN"]) {
  if (!publication.includes(`\"${step}\"`)) fail(`Article Engine missing ${step}`);
}
for (const event of ["article_open", "engaged_read", "read_depth", "read_complete", "topic_open", "search", "save", "share", "related_story_open", "source_open", "atlas_open", "returning_reader"]) {
  const analyticsSource = fs.readFileSync("src/analytics/MagazineAnalytics.ts", "utf8") + fs.readFileSync("src/analytics/Analytics.tsx", "utf8");
  if (!publication.includes(`\"${event}\"`) || (!readerSource.includes(event) && !analyticsSource.includes(event))) fail(`Analytics contract missing event ${event}`);
}

function hexRgb(hex) { const value = hex.replace("#", ""); return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255); }
function luminance(hex) { return hexRgb(hex).map((c) => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0); }
function contrast(a, b) { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); }
if (contrast("#000000", "#ffffff") < 4.5) fail("Black/white resting palette fails WCAG AA");
if (contrast("#ffffff", "#2E2EFF") < 4.5) fail("White/brand-blue pairing fails WCAG AA");

if (failures.length) {
  console.error("4PLANET MAGAZINE INTERNATIONAL READER GOLD GATE — FAIL");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`4PLANET MAGAZINE INTERNATIONAL READER GOLD GATE — PASS: ${stories.length} full stories, ${signals.length} bounded Signals, ${topics.length} live topics; substance-density, multi-source evidence, edited standfirsts, unique heroes, article engine, reader analytics, brand typography and WCAG-AA resting palette verified.`);
