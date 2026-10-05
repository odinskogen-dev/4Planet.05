const PUBLIC_HOSTS = {
  "4planet.org": {
    title: "4PLANET — For a Living Planet",
    description: "Living Planet Intelligence connecting understanding, credible action and proof for a living planet.",
    canonical: "https://4planet.org/",
    fallbackTitle: "4PLANET — For a Living Planet",
    fallbackParagraphs: [
      "4PLANET is an early-stage environmental technology ecosystem building Living Planet Intelligence: connected tools for understanding places, species, living systems and the human systems that shape them.",
      "The public ecosystem connects ATLAS, SPECIES, 4SAPIEN, S4PIENS, 4BRANDS, 4NATION, MAGAZINE and Impact through shared infrastructure while keeping each product’s purpose and canonical home distinct. Public prototypes are labelled honestly rather than presented as finished systems.",
      "The operating idea is to connect understanding to better decisions, credible action, evidence and learning. 4PLANET distinguishes contribution from delivery and verified ecological outcome, and keeps sources, uncertainty and unknowns visible where they matter."
    ],
    fallbackLinks: [
      ["Impact", "https://4planet.org/impact"],
      ["Places", "https://4planet.org/places"],
      ["Missions", "https://4planet.org/missions"],
      ["ATLAS", "https://4planetatlas.com/"],
      ["SPECIES", "https://4species.com/species/"],
    ],
    schemaType: "WebSite",
  },
  "4planetatlas.com": {
    title: "4PLANET ATLAS — Explore the Living Planet",
    description: "Explore places, species, living systems and source-grounded planetary data through 4PLANET ATLAS.",
    canonical: "https://4planetatlas.com/",
    fallbackTitle: "Explore the Living Planet with 4PLANET ATLAS",
    fallbackParagraphs: [
      "4PLANET ATLAS is the spatial exploration surface for Living Planet Intelligence. It connects places, species and living systems so users can move from a location on the map into the source-grounded context that helps explain what lives there, what is changing and how different ecological and human systems connect.",
      "ATLAS is designed to work with the same canonical objects used elsewhere in 4PLANET rather than creating a separate map-only truth store. A species shown in ATLAS should resolve to the same species identity used in SPECIES, while places and living systems should keep their provenance, uncertainty and update state visible.",
      "The public product is still developing. Interactive map behaviour may evolve, but the search-readable surface is intended to remain clear about sources, context and product maturity without turning dynamic map states into thousands of low-value search pages."
    ],
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["SPECIES", "https://4species.com/species/"],
      ["Living Systems", "https://4planet.org/living-systems"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
  "4brands.org": {
    title: "4BRANDS — Understand Any Company. Improve Your Own.",
    description: "4BRANDS is the Better Company product from 4PLANET: source-grounded company understanding, opportunities and measurable improvement.",
    canonical: "https://4brands.org/",
    fallbackTitle: "Understand Any Company. Improve Your Own.",
    fallbackParagraphs: [
      "4BRANDS is the Better Company product from 4PLANET. Its public role is to make companies easier to understand through source-grounded information about economics, procurement, people and planet, while keeping facts, unknowns and confidence separate from generated suggestions.",
      "The product direction combines a public company view with a private Company Brain for authorised organisational context. Public analysis can be discovered and shared; private company knowledge, documents, decisions and tenant data remain access-controlled and are not part of the public search surface.",
      "4BRANDS is being developed around practical value rather than generic sustainability scoring. The aim is to help a company see where value is created or lost, identify realistic improvement opportunities and connect recommendations back to evidence without presenting estimates or suggestions as verified outcomes."
    ],
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["Impact", "https://4planet.org/impact"],
      ["ATLAS", "https://4planetatlas.com/"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
  "s4piens.com": {
    title: "S4PIENS — Human Systems Intelligence",
    description: "S4PIENS explores the human systems, value chains, incentives and infrastructure that shape people and the living planet.",
    canonical: "https://s4piens.com/",
    fallbackTitle: "S4PIENS — Human Systems Intelligence",
    fallbackParagraphs: [
      "S4PIENS is the human-systems intelligence layer in the 4PLANET ecosystem. It explores the value chains, incentives, infrastructure and institutions through which human needs are met, and how those systems interact with people, places, resources and the rest of the living planet.",
      "The purpose is not to reduce humanity to one model or score. S4PIENS is intended to make complex systems easier to inspect: what a system produces, which actors participate, where dependencies and pressures occur, what solutions exist and where evidence is strong, weak or still missing.",
      "S4PIENS is distinct from 4SAPIEN, the product for an individual person. The two can share infrastructure and public intelligence, but personal context belongs to the user and is not merged into the public human-systems model."
    ],
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["4SAPIEN", "https://4sapien.com/"],
      ["ATLAS", "https://4planetatlas.com/"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
};


const FOURPLANET_ROUTES = {
  "/about": {
    title: "About 4PLANET — Living Planet Intelligence",
    description: "What 4PLANET is building, why it exists and how its public products connect understanding, action, proof and learning.",
    fallbackTitle: "About 4PLANET",
    fallbackParagraphs: [
      "4PLANET is an early-stage environmental technology initiative building Living Planet Intelligence: connected public tools that help people understand the living world, see what is changing and find credible ways to act.",
      "The ecosystem connects source-grounded knowledge, places, species, living systems and human systems across products such as ATLAS, SPECIES, 4SAPIEN, 4BRANDS, 4NATION, MAGAZINE and Impact. The products are at different stages of development, and public prototypes are labelled as such rather than presented as finished systems.",
      "The underlying direction is simple: better understanding should support better decisions; better decisions should make useful action easier; and action should be connected to evidence so the system can learn without confusing contribution with proven ecological outcome."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["MAGAZINE","https://4planetmagazine.com/magazine/"]],
    schemaType: "AboutPage",
  },
  "/impact": {
    title: "4PLANET Impact — From Understanding to Credible Action",
    description: "4PLANET Impact is an early public platform direction for connecting people and companies with credible expert-led action and proof.",
    fallbackTitle: "4PLANET Impact",
    fallbackParagraphs: [
      "Impact is the action layer of 4PLANET. The goal is to make it easier for people and companies to discover credible work for nature, understand what a contribution supports and follow the evidence that comes back from the organisations doing the work.",
      "4PLANET is not trying to replace field organisations. The intended model is to help expert organisations reach more supporters, connect funding to understandable actions and present delivery evidence with clear boundaries between contribution, work completed and independently supported ecological outcomes.",
      "This is an early public platform direction. Partner candidates are not presented as partners until an agreement exists, and no contribution is described as a verified ecological outcome unless the available evidence supports that claim."
    ],
    fallbackLinks: [["4PLANET","https://4planet.org/"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Partners","https://4planet.org/partners"]],
    schemaType: "WebPage",
  },
  "/domains": {
    title: "4PLANET Domains — Ocean, Land, Human Systems and Culture",
    description: "Explore OCE4N_, E4RTH_, S4PIENS_ and 4CULTURE_: four public 4PLANET domains connected by shared Living Planet Intelligence.",
    fallbackTitle: "Four domains. One living planet.",
    fallbackParagraphs: [
      "4PLANET organises its public work through four distinct domains with shared infrastructure: OCE4N_ for marine systems, E4RTH_ for land, biodiversity, climate and restoration, S4PIENS_ for human systems, and 4CULTURE_ for culture, media and participation.",
      "The domains are not separate truth systems. They are public lenses over connected places, species, living systems, human systems, missions and evidence. Each domain develops its own mission pathways while reusing the same underlying intelligence and proof standards.",
      "Public mission and product maturity varies. Strategic concepts, partner pathways and operational proof paths remain labelled separately so unfinished work is not presented as proven delivery."
    ],
    fallbackLinks: [["OCE4N_","https://4planet.org/domains/oce4n"],["E4RTH_","https://4planet.org/domains/e4rth"],["S4PIENS_","https://4planet.org/domains/s4piens"],["4CULTURE_","https://4planet.org/domains/4culture"],["Missions","https://4planet.org/missions"]],
    schemaType: "CollectionPage",
  },
  "/domains/oce4n": {
    title: "OCE4N_ — Marine Systems and Ocean Resilience | 4PLANET",
    description: "OCE4N_ is 4PLANET's marine domain for understanding ocean systems and building credible pathways for protection, recovery and participation.",
    fallbackTitle: "OCE4N_ — The Living Ocean",
    fallbackParagraphs: [
      "OCE4N_ is 4PLANET's marine domain: a public place to understand the systems that make oceans productive and resilient and to develop credible pathways for protection, recovery and participation.",
      "Its current mission pathways include CLE4N_, WH4LES_, COR4L_ and RE:WILD_ Marine. Public support opens only where delivery, evidence and reporting requirements are sufficiently resolved.",
      "Ocean intelligence connects through shared 4PLANET infrastructure to ATLAS, SPECIES, Living Systems, Impact and MAGAZINE rather than creating a separate marine truth store."
    ],
    fallbackLinks: [["Missions","https://4planet.org/missions"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Living Systems","https://4planet.org/living-systems"]],
    schemaType: "CollectionPage",
  },
  "/domains/e4rth": {
    title: "E4RTH_ — Land, Biodiversity and Restoration | 4PLANET",
    description: "E4RTH_ is 4PLANET's land-systems domain for forests, biodiversity, climate, species and ecological restoration.",
    fallbackTitle: "E4RTH_ — The Living Land",
    fallbackParagraphs: [
      "E4RTH_ is 4PLANET's land-systems domain: forests, biodiversity, climate, species and the long work of returning damaged landscapes to ecological function.",
      "Its current mission pathways include CLIM4TE_, AM4ZONIA_, SPECIES_ and RE:WILD_ Land. The Tree Unit is an operational proof path under development; public support remains closed until its launch requirements are complete.",
      "E4RTH_ connects land-system understanding to shared places, species, evidence and action infrastructure across 4PLANET."
    ],
    fallbackLinks: [["Missions","https://4planet.org/missions"],["SPECIES","https://4species.com/species/"],["ATLAS","https://4planetatlas.com/"],["Impact","https://4planet.org/impact"]],
    schemaType: "CollectionPage",
  },
  "/domains/s4piens": {
    title: "S4PIENS_ — Human Systems | 4PLANET",
    description: "S4PIENS_ makes food, energy, cities, materials and other human systems legible in relation to people and the living planet.",
    fallbackTitle: "S4PIENS_ — The Systems We Build",
    fallbackParagraphs: [
      "S4PIENS_ makes the human systems behind ecological pressure visible and explores how those systems can be redesigned toward healthier, lower-impact and more durable forms of life.",
      "Its current mission pathways include FOOD_, EN4RGY_, CIRCULAR CITY_ and F4SHION_. These are public system lenses and strategic pathways, not claims that 4PLANET already operates every intervention described.",
      "The domain connects to the standalone S4PIENS human-systems intelligence product while keeping 4SAPIEN, the private individual product, distinct."
    ],
    fallbackLinks: [["S4PIENS","https://s4piens.com/"],["4SAPIEN","https://4sapien.com/"],["Missions","https://4planet.org/missions"],["Living Systems","https://4planet.org/living-systems"]],
    schemaType: "CollectionPage",
  },
  "/domains/4culture": {
    title: "4CULTURE_ — Culture for Action | 4PLANET",
    description: "4CULTURE_ is 4PLANET's cultural layer for editorial, film, art and participation that carries ecological intelligence into public life.",
    fallbackTitle: "4CULTURE_ — Culture for Action",
    fallbackParagraphs: [
      "4CULTURE_ is the cultural distribution layer of 4PLANET: editorial, film, art and gatherings that carry ecological intelligence into public life.",
      "Its current pathways include 4PLANET MAGAZINE, 4PLANET FILM, 4RT_ and 4PLAY_. They are cultural mission pathways using shared 4PLANET infrastructure rather than competing standalone truth systems.",
      "Culture is treated as a route to attention, understanding and participation. Cultural activity is not itself described as ecological outcome without separate evidence."
    ],
    fallbackLinks: [["MAGAZINE","https://4planetmagazine.com/magazine/"],["Missions","https://4planet.org/missions"],["Impact","https://4planet.org/impact"]],
    schemaType: "CollectionPage",
  },
  "/missions": {
    title: "4PLANET Missions — Connected Work for a Living Planet",
    description: "Explore 4PLANET mission areas across ocean, land, human systems and culture, connected through shared living-planet intelligence.",
    fallbackTitle: "4PLANET Missions",
    fallbackParagraphs: [
      "4PLANET Missions organise work around major parts of the living planet and the human systems that affect them. The mission structure creates clear public entry points while shared infrastructure connects data, places, species, evidence and action across the ecosystem.",
      "The mission names are OCE4N_, E4RTH_, S4PIENS_ and 4CULTURE_. They are separate public worlds with shared infrastructure rather than isolated projects. Their role is to make complex planetary challenges understandable and connect them to practical products, actors, solutions and evidence.",
      "Mission pages are developed progressively. Public prototypes may expose only part of the intended system, and missing evidence or unfinished capabilities should remain visible rather than being filled with unsupported claims."
    ],
    fallbackLinks: [["Living Systems","https://4planet.org/living-systems"],["ATLAS","https://4planetatlas.com/"],["Impact","https://4planet.org/impact"],["MAGAZINE","https://4planetmagazine.com/magazine/"]],
    schemaType: "CollectionPage",
  },
  "/places": {
    title: "Places — Explore Living Systems Through Place | 4PLANET",
    description: "Explore 4PLANET place pages that connect geography with species, living systems, pressures, evidence and relevant human context.",
    fallbackTitle: "Places",
    fallbackParagraphs: [
      "Places are a core entry point into Living Planet Intelligence. A place page connects geography with species, living systems, pressures, evidence and relevant human context instead of treating a location as an isolated map pin.",
      "Public place coverage grows selectively. Pages should be indexable only when they contain useful, source-grounded context; arbitrary map states and thin generated locations are not intended to become search pages.",
      "ATLAS provides the spatial exploration layer while canonical place pages provide stable, human-readable entry points into the connected system."
    ],
    fallbackLinks: [["ATLAS","https://4planetatlas.com/"],["Living Systems","https://4planet.org/living-systems"],["SPECIES","https://4species.com/species/"],["Kenya","https://4planet.org/place/kenya"]],
    schemaType: "CollectionPage",
  },
  "/place/kenya": {
    title: "Kenya — Place Intelligence | 4PLANET",
    description: "Explore Kenya through 4PLANET's connected place, species, living-system and source-grounded intelligence layers.",
    fallbackTitle: "Kenya — Place Intelligence",
    fallbackParagraphs: [
      "Kenya is a public 4PLANET place surface connecting geography to species, ecosystems and relevant human context. It is an entry point into a connected knowledge model rather than a claim to represent every ecological condition in the country.",
      "Place intelligence is intended to preserve source boundaries and uncertainty while connecting users to the relevant ATLAS, SPECIES and Living Systems views.",
      "Coverage remains selective and developing. Missing evidence should remain visible rather than being replaced by generic environmental claims."
    ],
    fallbackLinks: [["Places","https://4planet.org/places"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Living Systems","https://4planet.org/living-systems"]],
    schemaType: "WebPage",
  },
  "/living-systems": {
    title: "Living Systems — 4PLANET",
    description: "Explore living systems as connected places, species, ecological relationships, pressures and human systems through 4PLANET.",
    fallbackTitle: "Living Systems",
    fallbackParagraphs: [
      "Living systems are a core public lens in 4PLANET. They connect species, places, ecological relationships, pressures and relevant human systems so a user can understand more than a single isolated fact.",
      "The aim is not to reduce nature to one score. Each public surface should preserve sources, uncertainty and the distinction between observation, interpretation and verified outcome. ATLAS provides the spatial lens, SPECIES provides species-level journeys and NATUREBRAIN provides the shared source-grounded intelligence underneath them.",
      "As the system grows, living-system pages are intended to connect understanding with credible actions and evidence without overstating what is known."
    ],
    fallbackLinks: [["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Places","https://4planet.org/places"],["Impact","https://4planet.org/impact"]],
    schemaType: "CollectionPage",
  },
  "/reports": {
    title: "Reports and Evidence — 4PLANET",
    description: "4PLANET reports connect public claims, delivery evidence and source-grounded learning without confusing contribution with verified outcome.",
    fallbackTitle: "Reports and Evidence",
    fallbackParagraphs: [
      "4PLANET reporting is designed to make evidence inspectable. Public reports should distinguish what was funded, what was delivered, what evidence exists and what ecological outcome can or cannot be supported.",
      "The reporting model connects mission work and Impact pathways back to sources and proof rather than converting activity into an automatic impact score.",
      "This public surface is still developing. Empty or private reporting states are not intended for search indexing."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["About","https://4planet.org/about"],["Partners","https://4planet.org/partners"]],
    schemaType: "CollectionPage",
  },
  "/actors": {
    title: "Actors — Organisations and Roles in Living Systems | 4PLANET",
    description: "Explore how 4PLANET connects organisations and other actors to places, systems, pressures, solutions and evidence.",
    fallbackTitle: "Actors",
    fallbackParagraphs: [
      "4PLANET models actors because environmental change depends on who can observe, decide, fund, deliver, regulate or verify work in a real system.",
      "An actor record is not automatically a partner endorsement. Public research, candidate relationships, active work and confirmed partnerships remain distinct states.",
      "Actor intelligence is intended to connect credible organisations and roles to the places, pressures, solutions and evidence where they are relevant."
    ],
    fallbackLinks: [["Partners","https://4planet.org/partners"],["Impact","https://4planet.org/impact"],["Living Systems","https://4planet.org/living-systems"]],
    schemaType: "CollectionPage",
  },
  "/brands": {
    title: "Brands and Companies — Public Company Context | 4PLANET",
    description: "Explore the public company and brand context connected to 4PLANET while private Company Brain data remains tenant-scoped and protected.",
    fallbackTitle: "Brands and Companies",
    fallbackParagraphs: [
      "Companies and brands are part of the human systems that shape materials, energy, procurement, work, consumption and ecological pressure.",
      "4PLANET can connect public company context to relevant systems and evidence. Deeper company intelligence belongs in 4BRANDS, while private Company Brain data remains tenant-scoped and outside the public search surface.",
      "Public company context should stay source-grounded and distinguish facts from suggestions, estimates and unknowns."
    ],
    fallbackLinks: [["4BRANDS","https://4brands.org/"],["S4PIENS","https://s4piens.com/"],["Impact","https://4planet.org/impact"]],
    schemaType: "CollectionPage",
  },
  "/cre4tor/odin": {
    title: "Odin Oddekalv — CRE4TOR_01 | 4PLANET MARKET",
    description: "Photography by Odin Oddekalv, the first public creator proof in 4PLANET MARKET.",
    fallbackTitle: "Odin Oddekalv — CRE4TOR_01",
    fallbackParagraphs: [
      "This public creator page presents photography by Odin Oddekalv as the first creator proof inside 4PLANET MARKET.",
      "Creator identity, rights, work, product, fulfilment and transaction paths are intended to stay connected without creating a second marketplace truth system.",
      "Product availability, pricing and fulfilment remain owned by the live commerce offer; a product click is not treated as a purchase or delivery record."
    ],
    fallbackLinks: [["4PLANET MARKET","https://4planetmarket.com/"],["4PLANET","https://4planet.org/"]],
    schemaType: "ProfilePage",
  },
  "/living-systems/oslofjord": {
    title: "Oslofjord — Living System Evidence | 4PLANET",
    description: "A source-grounded 4PLANET reading of Bunnefjorden and the wider Oslofjord system, with explicit evidence and claim boundaries.",
    fallbackTitle: "Oslofjord — Living System Evidence",
    fallbackParagraphs: [
      "This 4PLANET Living System surface uses Bunnefjorden as a bounded reference cell inside the wider Oslofjord. The reading connects physical form, oxygen conditions, human pressures, a measured wastewater intervention and attributable public sources.",
      "NIVA reporting is used to describe a specific oxygen-condition change associated with lowering the Nordre Follo wastewater outfall. That evidence is not presented as proof that the whole Oslofjord ecosystem was restored.",
      "Bathymetry, water-status layers, physical interventions, monitoring and assessment remain attributable to their respective source authorities rather than being merged into an unsupported synthetic score."
    ],
    fallbackLinks: [["Living Systems","https://4planet.org/living-systems"],["ATLAS","https://4planetatlas.com/"],["Impact","https://4planet.org/impact"]],
    schemaType: "WebPage",
  },
  "/living-systems/great-barrier-reef": {
    title: "Great Barrier Reef — Living System Evidence | 4PLANET",
    description: "A 4PLANET transfer reading of Great Barrier Reef monitoring and heat-stress evidence with explicit source and claim boundaries.",
    fallbackTitle: "Great Barrier Reef — Living System Evidence",
    fallbackParagraphs: [
      "This public transfer page tests the same 4PLANET Living System grammar against Great Barrier Reef evidence rather than treating the reef as one homogeneous object.",
      "AIMS field monitoring and NOAA Coral Reef Watch thermal-stress observations are kept as separate evidence modes. Regional coral-cover estimates do not describe every reef or every dimension of reef health.",
      "Actor roles and intervention fit remain open where the evidence has not yet been resolved. The page therefore exposes incomplete knowledge instead of manufacturing a generic reef solution."
    ],
    fallbackLinks: [["Living Systems","https://4planet.org/living-systems"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"]],
    schemaType: "WebPage",
  },
  "/partners": {
    title: "Partners — 4PLANET",
    description: "How 4PLANET approaches collaboration with expert organisations, technology partners and others contributing to a living planet.",
    fallbackTitle: "Working with 4PLANET",
    fallbackParagraphs: [
      "4PLANET is designed to work with organisations that already have real expertise, field capability, data, technology or distribution. The objective is not to duplicate good work but to make credible work easier to understand, discover, fund and learn from.",
      "Potential collaborations can range from expert field delivery and evidence to technology, science, distribution and mission support. A public mention of an organisation does not by itself mean a formal partnership; 4PLANET distinguishes research, candidate relationships, active pilots and confirmed partnerships.",
      "Where collaboration involves environmental action, the preferred model is transparent about who receives funding, who performs the work, what evidence is available and what can or cannot be claimed as an outcome."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["About","https://4planet.org/about"],["Funders","https://4planet.org/funders"]],
    schemaType: "WebPage",
  },
  "/funders": {
    title: "Funding 4PLANET — Building Public-Interest Planetary Infrastructure",
    description: "Explore how funding can support 4PLANET public-interest technology, evidence infrastructure, products and credible ecological action.",
    fallbackTitle: "Funding 4PLANET",
    fallbackParagraphs: [
      "4PLANET is building public-interest technology and products around living-planet intelligence, decision support and credible ecological action. Funding can support the infrastructure, research, product development and field-connected work required to make those systems useful.",
      "Different forms of capital have different roles. Grants and mission-aligned support can help build shared public capability; sponsors can support defined missions or public experiences; commercial products can create recurring revenue; and later investment may support scalable technology where the evidence and economics justify it.",
      "4PLANET does not treat funding itself as impact. Capital is an input. Delivery, evidence and ecological outcomes remain separate states and should be reported separately."
    ],
    fallbackLinks: [["About","https://4planet.org/about"],["Impact","https://4planet.org/impact"],["Partners","https://4planet.org/partners"]],
    schemaType: "WebPage",
  },
};

const PRIVATE_HOSTS = new Set([
  "labs.4planet.org",
  "os.4planet.org",
  "test.4planet.org",
  "id.4planet.org",
]);

function normaliseHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapXml(host, paths) {
  const urls = paths.map((path) => `  <url><loc>${xmlEscape(`https://${host}${path}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robotsText(host, isPrivate = false) {
  if (isPrivate) return "User-agent: *\nDisallow: /\n";
  return [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /account",
    "Disallow: /admin",
    "Disallow: /saved",
    "",
    `Sitemap: https://${host}/sitemap.xml`,
    "",
  ].join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function discoveryFallback(config) {
  const links = (config.fallbackLinks || [])
    .map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join("");
  const paragraphs = (config.fallbackParagraphs || [config.fallbackText || config.description])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  return `<main data-public-discovery-fallback="1" aria-label="Public discovery summary"><h1>${escapeHtml(config.fallbackTitle || config.title)}</h1>${paragraphs}<nav aria-label="Related 4PLANET public surfaces"><ul>${links}</ul></nav></main>`;
}

function structuredData(config, canonical) {
  const data = {
    "@context": "https://schema.org",
    "@type": config.schemaType || "WebSite",
    name: config.title,
    url: canonical,
    description: config.description,
  };
  if (config.schemaType === "WebApplication") {
    data.isPartOf = {
      "@type": "WebSite",
      name: "4PLANET",
      url: "https://4planet.org/",
    };
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function withSecurityHeaders(response, privateSurface = false) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  if (privateSurface) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("Cache-Control", "no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const rawHost = url.hostname.toLowerCase();
  const host = normaliseHost(rawHost);

  if (rawHost.startsWith("www.") && PUBLIC_HOSTS[host]) {
    url.hostname = host;
    return Response.redirect(url.toString(), 308);
  }

  const privateSurface =
    PRIVATE_HOSTS.has(host) ||
    host.endsWith(".pages.dev") ||
    host === "localhost" ||
    host.endsWith(".localhost");

  if (url.pathname === "/robots.txt" && privateSurface) {
    return new Response(robotsText(host, true), {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
    });
  }

  if (host === "4planet.org") {
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const exactRedirects = new Map([
      ["/atlas", "https://4planetatlas.com/"],
      ["/species", "https://4species.com/species/"],
      ["/4brands", "https://4brands.org/"],
      ["/4sapien", "https://4sapien.com/"],
      ["/market", "https://4planetmarket.com/"],
      ["/magazine", "https://4planetmagazine.com/magazine/"],
    ]);

    if (exactRedirects.has(pathname)) {
      return Response.redirect(exactRedirects.get(pathname) + url.search, 308);
    }

    if (pathname.startsWith("/species/")) {
      const slug = pathname.slice("/species/".length);
      return Response.redirect("https://4species.com/species/" + slug + url.search, 308);
    }

    if (pathname.startsWith("/magazine/")) {
      const suffix = pathname.slice("/magazine/".length);
      return Response.redirect("https://4planetmagazine.com/magazine/" + suffix + url.search, 308);
    }
  }

  const baseConfig = PUBLIC_HOSTS[host];
  const routeConfig = host === "4planet.org" ? FOURPLANET_ROUTES[url.pathname.replace(/\/$/, "") || "/"] : null;
  const config = routeConfig ? { ...baseConfig, ...routeConfig, canonical: `https://4planet.org${url.pathname.replace(/\/$/, "") || "/"}` } : baseConfig;

  if (config && url.pathname === "/robots.txt" && host !== "4planet.org") {
    return new Response(robotsText(host), {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  if (config?.sitemap && url.pathname === "/sitemap.xml") {
    return new Response(sitemapXml(host, config.sitemap), {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  const response = await context.next();

  if (privateSurface) return withSecurityHeaders(response, true);

  if (!config) return response;

  const headers = new Headers(response.headers);
  headers.delete("X-Robots-Tag");

  const contentType = headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // Existing prerendered discovery routes keep their own metadata. Named public
  // organisation routes and standalone product homes are normalised below.
  if (host === "4planet.org" && url.pathname !== "/" && !routeConfig) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const canonical = config.canonical || (host === "4planet.org"
    ? `https://4planet.org${url.pathname === "/" ? "/" : url.pathname}`
    : `https://${host}/`);

  const transformed = new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(config.title);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('meta[name="robots"]', {
      element(element) {
        element.setAttribute("content", "index,follow,max-image-preview:large");
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute("content", config.title);
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", canonical);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute("content", config.title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.remove();
      },
    })
    .on("head", {
      element(element) {
        element.append(`<link rel="canonical" href="${canonical}">`, { html: true });
        element.append(structuredData(config, canonical), { html: true });
      },
    })
    .on("#root", {
      element(element) {
        element.setInnerContent(discoveryFallback(config), { html: true });
      },
    })
    .transform(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }));

  return transformed;
}
