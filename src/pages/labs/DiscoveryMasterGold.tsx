import { Link, Navigate, useParams } from "react-router-dom";
import discovery from "@/data/discoveryInventory.json";
import atlasDiscovery from "@/data/atlasDiscovery.json";
import { speciesBySlug } from "@/data/species";
import { speciesSourceEnvelopeBySlug } from "@/data/speciesSourceEnvelope";
import { hasShowableImage, speciesMedia } from "@/data/speciesMedia";
import { planetProofBySlug } from "@/planet/proofs/planetProofs";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import "@/styles/discovery-master-gold.css";

const TEST_ROBOTS = "noindex,nofollow,noarchive,nosnippet";
const MASTER_IDS = ["orca", "great-barrier-reef", "global-fires"] as const;
type MasterId = (typeof MASTER_IDS)[number];

function GoldBar({ label }: { label: string }) {
  return (
    <div className="discovery-master-testbar" role="note">
      <strong>WORLD CLASS GOLD / CONTROLLED TEST</strong>
      <span>{label}</span>
      <span>NO LIVE RELEASE</span>
    </div>
  );
}

function SourceLedger({ sources }: { sources: { label: string; url: string; note?: string; authority?: string }[] }) {
  return (
    <section className="discovery-master-section discovery-master-sources">
      <div className="discovery-master-kicker">HOW WE KNOW</div>
      <h2>Open the evidence.</h2>
      <div className="discovery-master-source-list">
        {sources.map((source, index) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{source.authority || source.label}</strong><small>{source.label}</small>{source.note ? <p>{source.note}</p> : null}</div>
            <b aria-hidden>↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function NextWorlds({ items }: { items: { label: string; href: string; kind: string }[] }) {
  return (
    <section className="discovery-master-section discovery-master-next">
      <div className="discovery-master-kicker">CONTINUE EXPLORING</div>
      <h2>One object should open the planet.</h2>
      <div className="discovery-master-next-list">
        {items.map((item) => (
          <Link key={item.href} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>
        ))}
      </div>
    </section>
  );
}

function OrcaMaster() {
  const profile = speciesBySlug("orca");
  const item = discovery.species.find((entry) => entry.slug === "orca");
  const envelope = speciesSourceEnvelopeBySlug("orca");
  const media = speciesMedia("orca");
  if (!profile || !item || !envelope) return <Navigate to="/labs/gold" replace />;
  const relatedPlaces = discovery.places.filter((place) => place.indexable && place.relatedSpecies.some((species) => species.slug === "orca"));
  const sources = Array.from(new Map(envelope.records.map((record) => [record.sourceUrl, {
    label: record.label,
    url: record.sourceUrl,
    note: record.uncertainty,
  }])).values());

  return (
    <PublicShell>
      <Seo title="Orca — Discovery Master Gold TEST | 4PLANET" description={item.description} path="/labs/gold/discovery/orca" robots={TEST_ROBOTS} />
      <main className="discovery-master discovery-master--orca">
        <GoldBar label="MASTER 01 / SPECIES" />
        <header className="discovery-master-photohero">
          {hasShowableImage("orca") && media?.localPath ? <img src={media.localPath} alt="Wild Orca in its marine environment" /> : null}
          <div className="discovery-master-photohero__veil" aria-hidden />
          <div className="discovery-master-photohero__copy">
            <Link to="/labs/gold" className="discovery-master-back">← GOLD SYSTEM</Link>
            <div className="discovery-master-kicker">4PLANET SPECIES / MASTER GOLD</div>
            <h1>Orca</h1>
            <p className="discovery-master-latin">{profile.scientificName}</p>
            <p className="discovery-master-deck">{profile.intro}</p>
            <div className="discovery-master-actions">
              <Link to="/species/orca">OPEN THE CURRENT ORCA OBJECT →</Link>
              <Link to={item.atlasHref || "/atlas/whales"}>SEE REPORTED OBSERVATIONS →</Link>
            </div>
          </div>
          {media?.attribution ? <div className="discovery-master-credit">{media.attribution}{media.licence ? ` · ${media.licence}` : ""}</div> : null}
        </header>

        <section className="discovery-master-section discovery-master-statement">
          <div className="discovery-master-kicker">THE HUMAN QUESTION</div>
          <h2>Where do Orcas live — and what does a dot on a map actually mean?</h2>
          <p>{profile.habitat}</p>
        </section>

        <section className="discovery-master-section">
          <div className="discovery-master-kicker">WHAT WE KNOW</div>
          <div className="discovery-master-claims">
            {(profile.publicClaims || []).slice(0, 3).map((claim) => (
              <article key={claim.text}>
                <span>{claim.state}</span>
                <p>{claim.text}</p>
                <small>{claim.limitation}</small>
                <a href={claim.sourceUrl} target="_blank" rel="noreferrer">{claim.source} ↗</a>
              </article>
            ))}
          </div>
        </section>

        <section className="discovery-master-section discovery-master-boundary">
          <div><div className="discovery-master-kicker">READ THE MAP CORRECTLY</div><h2>Observation is not location.</h2></div>
          <p>Reported occurrence records are historical source records. They do not establish a live position, complete range, migration route, abundance or population trend.</p>
        </section>

        {relatedPlaces.length ? (
          <section className="discovery-master-section">
            <div className="discovery-master-kicker">PLACE RELATIONSHIPS</div>
            <h2>Follow the animal into place.</h2>
            <div className="discovery-master-next-list">
              {relatedPlaces.map((place) => <Link key={place.slug} to={`/place/${place.slug}`}><span>PLACE</span><strong>{place.name}</strong><b>→</b></Link>)}
            </div>
          </section>
        ) : null}

        <SourceLedger sources={sources} />
        <NextWorlds items={[
          { kind: "ATLAS", label: "Whales — reported observations", href: item.atlasHref || "/atlas/whales" },
          { kind: "SPECIES", label: "All source-qualified species", href: "/species" },
          { kind: "PLACE", label: "Explore Places", href: "/places" },
        ]} />
      </main>
    </PublicShell>
  );
}

function ReefMaster() {
  const place = discovery.places.find((entry) => entry.slug === "great-barrier-reef");
  const proof = planetProofBySlug("great-barrier-reef");
  if (!place || !proof) return <Navigate to="/labs/gold" replace />;
  const sourceById = Object.fromEntries(proof.sources.map((source) => [source.id, source]));
  const current = proof.sections.find((section) => section.id === "WHAT_IS_HAPPENING");
  const changed = proof.sections.find((section) => section.id === "WHAT_CHANGED");

  return (
    <PublicShell>
      <Seo title="Great Barrier Reef — Discovery Master Gold TEST | 4PLANET" description={place.description} path="/labs/gold/discovery/great-barrier-reef" robots={TEST_ROBOTS} />
      <main className="discovery-master discovery-master--reef">
        <GoldBar label="MASTER 02 / PLACE + LIVING SYSTEM" />
        <header className="discovery-master-reefhero">
          <picture className="discovery-master-reefhero__media">
            <source media="(max-width: 760px)" srcSet="/assets/missions/cor4l/hero-real-mobile.jpg" />
            <img src="/assets/missions/cor4l/hero-real.jpg" alt="A living coral reef in the rights-cleared COR4L_ media bank" />
          </picture>
          <div className="discovery-master-reefhero__veil" aria-hidden />
          <div className="discovery-master-reefhero__copy">
            <Link to="/labs/gold" className="discovery-master-back">← GOLD SYSTEM</Link>
            <div className="discovery-master-kicker">GREAT BARRIER REEF / MASTER GOLD</div>
            <h1>Life at reef scale.</h1>
            <p className="discovery-master-deck">{place.summary}</p>
            <div className="discovery-master-actions">
              <Link to="/living-systems/great-barrier-reef">OPEN THE CURRENT REEF OBJECT →</Link>
              <Link to="/place/great-barrier-reef">EXPLORE THE PLACE →</Link>
            </div>
          </div>
          <div className="discovery-master-visualnote">FOUNDER-SUPPLIED · RIGHTS-CLEARED · CONTENT-VERIFIED REEF PHOTOGRAPHY</div>
        </header>

        <section className="discovery-master-section discovery-master-stats">
          <article><strong>40</strong><span>years of AIMS Long-Term Monitoring Programme context</span></article>
          <article><strong>121</strong><span>reefs surveyed in the 2025–26 summary</span></article>
          <article><strong>5,175</strong><span>manta tows reported by AIMS</span></article>
          <article><strong>≈1,035 km</strong><span>survey effort reported by AIMS</span></article>
        </section>

        <section className="discovery-master-reefgrid" aria-label="Rights-cleared coral reef photography">
          <figure><img src="/assets/missions/cor4l/detail-coral-02.jpg" alt="Coral reef detail from the rights-cleared COR4L_ media bank" loading="lazy" /></figure>
          <figure><img src="/assets/missions/cor4l/detail-coral-03.jpg" alt="Living coral habitat from the rights-cleared COR4L_ media bank" loading="lazy" /></figure>
        </section>

        <section className="discovery-master-section discovery-master-statement">
          <div className="discovery-master-kicker">WHAT IS HAPPENING</div>
          <h2>{current?.headline || "Condition varies across space and time."}</h2>
          <p>{current?.summary}</p>
          {current?.sourceIds.map((id) => sourceById[id] ? <a key={id} className="discovery-master-inline-source" href={sourceById[id].url} target="_blank" rel="noreferrer">{sourceById[id].authority} ↗</a> : null)}
        </section>

        <section className="discovery-master-section discovery-master-boundary">
          <div><div className="discovery-master-kicker">READ THIS CORRECTLY</div><h2>A reef system is not one number.</h2></div>
          <p>{proof.truthBoundary}</p>
        </section>

        <section className="discovery-master-section discovery-master-statement">
          <div className="discovery-master-kicker">CHANGE THROUGH TIME</div>
          <h2>{changed?.headline}</h2>
          <p>{changed?.summary}</p>
        </section>

        <SourceLedger sources={proof.sources.map((source) => ({ label: source.label, url: source.url, authority: source.authority, note: source.supports }))} />
        <NextWorlds items={[
          { kind: "ATLAS", label: "Explore the Great Barrier Reef in ATLAS", href: "/atlas" },
          { kind: "SPECIES", label: "Green Turtle", href: "/species/green-sea-turtle" },
          { kind: "SPECIES", label: "Whale Shark", href: "/species/whale-shark" },
        ]} />
      </main>
    </PublicShell>
  );
}

function FiresMaster() {
  const object = atlasDiscovery.objects.find((entry) => entry.slug === "fires");
  if (!object) return <Navigate to="/labs/gold" replace />;

  return (
    <PublicShell>
      <Seo title="Global Fires — Discovery Master Gold TEST | 4PLANET" description={object.description} path="/labs/gold/discovery/global-fires" robots={TEST_ROBOTS} />
      <main className="discovery-master discovery-master--fires">
        <GoldBar label="MASTER 03 / ATLAS SIGNAL" />
        <header className="discovery-master-firehero">
          <div className="discovery-master-firehero__signal" aria-hidden><i /><i /><i /><i /><i /></div>
          <div className="discovery-master-firehero__copy">
            <Link to="/labs/gold" className="discovery-master-back">← GOLD SYSTEM</Link>
            <div className="discovery-master-kicker">4PLANET ATLAS / EARTH SIGNAL</div>
            <h1>Fire, seen from space.</h1>
            <p className="discovery-master-deck">{object.summary}</p>
            <div className="discovery-master-actions">
              <Link to="/atlas/fires">UNDERSTAND THE SIGNAL →</Link>
              <Link to={object.atlasHref}>OPEN LIVE ATLAS →</Link>
            </div>
          </div>
          <div className="discovery-master-visualnote">DESIGNED SIGNAL FIELD / NOT LIVE SATELLITE DATA</div>
        </header>

        <section className="discovery-master-section discovery-master-boundary discovery-master-boundary--dark">
          <div><div className="discovery-master-kicker">ONE CRITICAL DISTINCTION</div><h2>Detected heat is not automatically a wildfire.</h2></div>
          <p>{object.limitations[0]}</p>
        </section>

        <section className="discovery-master-section discovery-master-statement">
          <div className="discovery-master-kicker">WHY THIS OBJECT DESERVES TO EXIST</div>
          <h2>Fast-moving data needs slower interpretation.</h2>
          <p>{object.whyItMatters}</p>
        </section>

        <section className="discovery-master-section">
          <div className="discovery-master-kicker">WHAT YOU CAN EXPLORE</div>
          <div className="discovery-master-signal-list">
            {object.availableData.map((item) => <div key={item}>{item}</div>)}
          </div>
        </section>

        <section className="discovery-master-section discovery-master-boundary">
          <div><div className="discovery-master-kicker">LIMITS</div><h2>Useful because the limits stay visible.</h2></div>
          <ul>{object.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <SourceLedger sources={object.sources.map((source) => ({ label: source.label, url: source.url, authority: source.authority, note: source.use }))} />
        <NextWorlds items={[
          { kind: "ATLAS", label: "Earth", href: "/atlas/earth" },
          { kind: "PLACE", label: "Amazon Basin", href: "/place/amazon-basin" },
          { kind: "ATLAS", label: "Open the full planetary map", href: object.atlasHref },
        ]} />
      </main>
    </PublicShell>
  );
}

export function DiscoveryMasterGold() {
  const { slug = "" } = useParams();
  if (!MASTER_IDS.includes(slug as MasterId)) return <Navigate to="/labs/gold" replace />;
  if (slug === "orca") return <OrcaMaster />;
  if (slug === "great-barrier-reef") return <ReefMaster />;
  return <FiresMaster />;
}

export default DiscoveryMasterGold;
