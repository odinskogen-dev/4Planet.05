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
      ["World Place Index", "https://4planetatlas.com/places"],
      ["Missions", "https://4planet.org/missions"],
      ["ATLAS", "https://4planetatlas.com/"],
      ["SPECIES", "https://4species.com/species/"],
      ["4SAPIEN", "https://4sapien.com/"],
      ["S4PIENS", "https://s4piens.com/"],
      ["4BRANDS", "https://4brands.org/"],
      ["4NATION", "https://4nation.org/"],
      ["4BRAIN", "https://4brain.app/"],
      ["MAGAZINE", "https://4planetmagazine.com/magazine/"],
      ["MARKET", "https://4planetmarket.com/"],
      ["CRE4TORS", "https://cre4tors.com/"],
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
      ["World Place Index", "https://4planetatlas.com/places"],
      ["Berlin", "https://4planetatlas.com/place/berlin"],
      ["Oslo", "https://4planetatlas.com/place/oslo"],
      ["London", "https://4planetatlas.com/place/london"],
      ["Tokyo", "https://4planetatlas.com/place/tokyo"],
      ["Kenya", "https://4planetatlas.com/place/kenya"],
      ["4PLANET", "https://4planet.org/"],
      ["SPECIES", "https://4species.com/species/"],
      ["Living Systems", "https://4planet.org/living-systems"],
    ],
    schemaType: "WebApplication",
    sitemap: "ATLAS_WORLD_PLACE_INDEX",
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


const ATLAS_WORLD_PLACES = [
  ["berlin","Berlin","City","Germany",52.52,13.405,"Berlin is the capital and a major urban centre of Germany."],
  ["oslo","Oslo","City","Norway",59.9139,10.7522,"Oslo is the capital and a major urban centre of Norway."],
  ["bergen","Bergen","City","Norway",60.3913,5.3221,"Bergen is a city on Norway's west coast."],
  ["london","London","City","United Kingdom",51.5072,-0.1276,"London is the capital and a major urban centre of the United Kingdom."],
  ["new-york","New York","City","United States",40.7128,-74.0060,"New York is a major city in the United States."],
  ["tokyo","Tokyo","City","Japan",35.6762,139.6503,"Tokyo is the capital and a major urban centre of Japan."],
  ["nairobi","Nairobi","City","Kenya",-1.2864,36.8172,"Nairobi is the capital and a major urban centre of Kenya."],
  ["paris","Paris","City","France",48.8566,2.3522,"Paris is the capital and a major urban centre of France."],
  ["rome","Rome","City","Italy",41.9028,12.4964,"Rome is the capital and a major urban centre of Italy."],
  ["madrid","Madrid","City","Spain",40.4168,-3.7038,"Madrid is the capital and a major urban centre of Spain."],
  ["lisbon","Lisbon","City","Portugal",38.7223,-9.1393,"Lisbon is the capital and a major urban centre of Portugal."],
  ["copenhagen","Copenhagen","City","Denmark",55.6761,12.5683,"Copenhagen is the capital and a major urban centre of Denmark."],
  ["stockholm","Stockholm","City","Sweden",59.3293,18.0686,"Stockholm is the capital and a major urban centre of Sweden."],
  ["helsinki","Helsinki","City","Finland",60.1699,24.9384,"Helsinki is the capital and a major urban centre of Finland."],
  ["reykjavik","Reykjavík","City","Iceland",64.1466,-21.9426,"Reykjavík is the capital and a major urban centre of Iceland."],
  ["amsterdam","Amsterdam","City","Netherlands",52.3676,4.9041,"Amsterdam is the capital and a major urban centre of the Netherlands."],
  ["brussels","Brussels","City","Belgium",50.8503,4.3517,"Brussels is the capital and a major urban centre of Belgium."],
  ["vienna","Vienna","City","Austria",48.2082,16.3738,"Vienna is the capital and a major urban centre of Austria."],
  ["prague","Prague","City","Czechia",50.0755,14.4378,"Prague is the capital and a major urban centre of Czechia."],
  ["warsaw","Warsaw","City","Poland",52.2297,21.0122,"Warsaw is the capital and a major urban centre of Poland."],
  ["athens","Athens","City","Greece",37.9838,23.7275,"Athens is the capital and a major urban centre of Greece."],
  ["cairo","Cairo","City","Egypt",30.0444,31.2357,"Cairo is the capital and a major urban centre of Egypt."],
  ["cape-town","Cape Town","City","South Africa",-33.9249,18.4241,"Cape Town is a major coastal city in South Africa."],
  ["lagos","Lagos","City","Nigeria",6.5244,3.3792,"Lagos is a major coastal city in Nigeria."],
  ["accra","Accra","City","Ghana",5.6037,-0.1870,"Accra is the capital and a major urban centre of Ghana."],
  ["addis-ababa","Addis Ababa","City","Ethiopia",8.9806,38.7578,"Addis Ababa is the capital and a major urban centre of Ethiopia."],
  ["delhi","Delhi","City","India",28.6139,77.2090,"Delhi is a major urban region and national capital territory of India."],
  ["mumbai","Mumbai","City","India",19.0760,72.8777,"Mumbai is a major coastal city in India."],
  ["beijing","Beijing","City","China",39.9042,116.4074,"Beijing is the capital and a major urban centre of China."],
  ["shanghai","Shanghai","City","China",31.2304,121.4737,"Shanghai is a major coastal city in China."],
  ["seoul","Seoul","City","South Korea",37.5665,126.9780,"Seoul is the capital and a major urban centre of South Korea."],
  ["singapore","Singapore","City-state","Singapore",1.3521,103.8198,"Singapore is a city-state in Southeast Asia."],
  ["jakarta","Jakarta","City","Indonesia",-6.2088,106.8456,"Jakarta is a major urban centre of Indonesia."],
  ["sydney","Sydney","City","Australia",-33.8688,151.2093,"Sydney is a major coastal city in Australia."],
  ["melbourne","Melbourne","City","Australia",-37.8136,144.9631,"Melbourne is a major coastal city in Australia."],
  ["auckland","Auckland","City","New Zealand",-36.8509,174.7645,"Auckland is a major urban centre of New Zealand."],
  ["toronto","Toronto","City","Canada",43.6532,-79.3832,"Toronto is a major city in Canada."],
  ["vancouver","Vancouver","City","Canada",49.2827,-123.1207,"Vancouver is a major coastal city in Canada."],
  ["mexico-city","Mexico City","City","Mexico",19.4326,-99.1332,"Mexico City is the capital and a major urban centre of Mexico."],
  ["sao-paulo","São Paulo","City","Brazil",-23.5505,-46.6333,"São Paulo is a major city in Brazil."],
  ["rio-de-janeiro","Rio de Janeiro","City","Brazil",-22.9068,-43.1729,"Rio de Janeiro is a major coastal city in Brazil."],
  ["buenos-aires","Buenos Aires","City","Argentina",-34.6037,-58.3816,"Buenos Aires is the capital and a major urban centre of Argentina."],
  ["lima","Lima","City","Peru",-12.0464,-77.0428,"Lima is the capital and a major coastal urban centre of Peru."],
  ["bogota","Bogotá","City","Colombia",4.7110,-74.0721,"Bogotá is the capital and a major urban centre of Colombia."],
  ["santiago","Santiago","City","Chile",-33.4489,-70.6693,"Santiago is the capital and a major urban centre of Chile."],
  ["kenya","Kenya","Country","Africa",-0.0236,37.9062,"Kenya is a country in East Africa."],
  ["norway","Norway","Country","Europe",60.4720,8.4689,"Norway is a country in Northern Europe."],
  ["brazil","Brazil","Country","South America",-14.2350,-51.9253,"Brazil is a country in South America."],
  ["australia","Australia","Country","Oceania",-25.2744,133.7751,"Australia is a country and continent in Oceania."],
  ["japan","Japan","Country","East Asia",36.2048,138.2529,"Japan is an island country in East Asia."],
].map(([slug,name,type,context,lat,lon,summary])=>({
  slug,name,type,context,lat,lon,summary,
  sourceDataset: type === "Country" ? "Natural Earth 1:10m Admin 0 — Countries" : "Natural Earth 1:10m Populated Places",
  sourceUrl: type === "Country"
    ? "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/"
    : "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/",
  sourceRightsUrl: "https://www.naturalearthdata.com/about/terms-of-use/",
  sourceCheckedAt: "2026-10-06"
}));

function atlasPlacePassesQualityGate(place){
  return Boolean(
    place && place.slug && place.name && place.type && place.context &&
    Number.isFinite(place.lat) && place.lat >= -90 && place.lat <= 90 &&
    Number.isFinite(place.lon) && place.lon >= -180 && place.lon <= 180 &&
    place.summary && place.sourceUrl && place.sourceRightsUrl && place.sourceCheckedAt
  );
}
const ATLAS_INDEXABLE_PLACES = ATLAS_WORLD_PLACES.filter(atlasPlacePassesQualityGate);

function atlasDistanceKm(a,b){
  const r=6371,toRad=(v)=>v*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lon-a.lon);
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(x));
}
function atlasPlaceRelations(place){
  const parent=ATLAS_WORLD_PLACES.find((p)=>p.type==="Country"&&p.name===place.context);
  const children=place.type==="Country"?ATLAS_WORLD_PLACES.filter((p)=>p.context===place.name&&p.slug!==place.slug):[];
  const nearby=ATLAS_WORLD_PLACES.filter((p)=>p.slug!==place.slug)
    .map((p)=>({...p,distanceKm:atlasDistanceKm(place,p)}))
    .sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,4);
  const seen=new Set([place.slug]);
  const related=[];
  for(const item of [parent,...children,...nearby].filter(Boolean)){
    if(seen.has(item.slug)) continue;
    seen.add(item.slug); related.push(item);
    if(related.length===6) break;
  }
  return {parent,children,related};
}

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
      "Canonical Place pages now live in the ATLAS World Place Index. Verified geography can publish first; ecological intelligence is added progressively only where source-grounded relationships exist. Arbitrary map states and machine-generated variants are not search pages.",
      "ATLAS provides the spatial exploration layer while canonical place pages provide stable, human-readable entry points into the connected system."
    ],
    fallbackLinks: [["World Place Index","https://4planetatlas.com/places"],["ATLAS","https://4planetatlas.com/"],["Living Systems","https://4planet.org/living-systems"],["SPECIES","https://4species.com/species/"]],
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
  "/impact/actions/bay-of-biscay-survey": {
    title: "Bay of Biscay Cetacean Survey — Action Evidence | 4PLANET",
    description: "A bounded 4PLANET action page for a cetacean survey evidence pathway in the Bay of Biscay, separating delivery from ecological outcome.",
    fallbackTitle: "Bay of Biscay Cetacean Survey",
    fallbackParagraphs: [
      "This public action page represents a bounded survey and evidence pathway rather than a claim that observation alone creates ecological impact.",
      "The purpose of the action layer is to connect a defined activity to who performs it, what evidence is produced and what later conclusions that evidence can legitimately support.",
      "4PLANET keeps contribution, delivery, observation and verified ecological outcome as separate states. Stronger outcome claims require evidence beyond completion of a survey."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"]],
    schemaType: "WebPage",
  },
  "/privacy": {
    title: "Privacy — 4PLANET",
    description: "4PLANET privacy principles for public products, private account state and user-controlled intelligence.",
    fallbackTitle: "Privacy",
    fallbackParagraphs: [
      "4PLANET separates public planetary intelligence from private user and organisation context. Public product pages may be discoverable; authenticated account state, Personal Brain context and tenant-scoped Company Brain data are private by default.",
      "Search-engine directives are not treated as a security mechanism. Surfaces requiring secrecy must rely on access control, with noindex, noarchive and cache controls used as additional protections where appropriate.",
      "Product-specific privacy behaviour can evolve as capabilities move from prototype to production, but private context must not become public merely to improve discoverability."
    ],
    fallbackLinks: [["About","https://4planet.org/about"],["4SAPIEN","https://4sapien.com/"],["4BRANDS","https://4brands.org/"]],
    schemaType: "WebPage",
  },
  "/join": {
    title: "Join 4PLANET — Find a Way to Contribute",
    description: "Find public routes into 4PLANET missions, products, culture and credible ecological action as they become available.",
    fallbackTitle: "Join 4PLANET",
    fallbackParagraphs: [
      "4PLANET is designed so people who want to help can find a meaningful route into the work. Public routes can include learning, using products, following missions, contributing skills, supporting credible action or participating through culture.",
      "Availability depends on the maturity of each pathway. A mission or partner pathway is not presented as open when delivery, evidence or participation requirements are unresolved.",
      "The public ecosystem links understanding to action progressively, with clear boundaries between interest, participation, contribution, delivery and verified outcome."
    ],
    fallbackLinks: [["Missions","https://4planet.org/missions"],["Impact","https://4planet.org/impact"],["Partners","https://4planet.org/partners"],["MAGAZINE","https://4planetmagazine.com/magazine/"]],
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
  const disallows = [
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /account",
    "Disallow: /admin",
    "Disallow: /saved",
    "Disallow: /auth/",
    "Disallow: /id",
    "Disallow: /oauth",
    "Disallow: /labs",
    "Disallow: /os",
    "Disallow: /sandbox",
    "Disallow: /company-brain",
  ];
  const group = (agent) => [`User-agent: ${agent}`, "Allow: /", ...disallows, ""];
  return [
    ...group("OAI-SearchBot"),
    ...group("Googlebot"),
    ...group("Bingbot"),
    ...group("*"),
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

  const privatePathPrefixes = [
    "/api", "/checkout", "/account", "/admin", "/saved", "/auth",
    "/id", "/oauth", "/labs", "/os", "/sandbox", "/company-brain"
  ];
  const privatePath = privatePathPrefixes.some((prefix) =>
    url.pathname === prefix || url.pathname.startsWith(prefix + "/")
  );

  const privateSurface =
    PRIVATE_HOSTS.has(host) ||
    host.endsWith(".pages.dev") ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    (Boolean(PUBLIC_HOSTS[host]) && privatePath);

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
    if (pathname.startsWith("/place/")) {
      const slug = pathname.slice("/place/".length);
      if (ATLAS_WORLD_PLACES.some((place) => place.slug === slug)) {
        return Response.redirect("https://4planetatlas.com/place/" + slug + url.search, 308);
      }
    }
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

  if (host === "4planetatlas.com" && url.pathname === "/places") {
    const items = ATLAS_INDEXABLE_PLACES.map((place) => `<li><a href="/place/${escapeHtml(place.slug)}">${escapeHtml(place.name)}</a> — ${escapeHtml(place.type)}, ${escapeHtml(place.context)}</li>`).join("");
    const canonical="https://4planetatlas.com/places";
    const data={"@context":"https://schema.org","@graph":[
      {"@type":"CollectionPage","@id":canonical+"#page","name":"4PLANET ATLAS World Place Index","url":canonical,"description":"Verified geographic entry points into 4PLANET ATLAS, with progressive source-grounded living-planet intelligence."},
      {"@type":"ItemList","@id":canonical+"#places","numberOfItems":ATLAS_WORLD_PLACES.length,"itemListElement":ATLAS_INDEXABLE_PLACES.map((place,index)=>({"@type":"ListItem","position":index+1,"url":`https://4planetatlas.com/place/${place.slug}`,"name":place.name}))}
    ]};
    const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>World Place Index — 4PLANET ATLAS</title><meta name="description" content="Explore verified places in 4PLANET ATLAS. Geography is published first; source-grounded living-planet intelligence is connected progressively."><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg"><script type="application/ld+json">${JSON.stringify(data).replaceAll("<","\\u003c")}</script></head><body><main><p>4PLANET ATLAS / WORLD PLACE INDEX</p><h1>Explore the world by place</h1><p>This index contains ${ATLAS_INDEXABLE_PLACES.length} verified geographic entry points. Each place has a stable canonical URL, a reference coordinate, explicit provenance and a direct route into the shared ATLAS map.</p><p>Geographic identity is the Level 0 foundation. Living systems, species, pressures, missions, evidence and solutions are connected only when source-grounded evidence supports them. Missing ecological knowledge remains unknown rather than being filled with generic environmental text.</p><nav aria-label="World Place Index"><ul>${items}</ul></nav><h2>How to read the index</h2><p>Reference coordinates help ATLAS open the intended geography; they do not define administrative or ecological boundaries. Place pages link to related geographic entries so people and crawlers can move through the index without relying on JavaScript.</p><h2>Provenance</h2><p>The current cohort uses public-domain Natural Earth geographic reference data. City and populated-place identities use the 1:10m Populated Places dataset; country identities use the 1:10m Admin 0 Countries dataset. Ecological enrichment is a separate evidence layer.</p><p><a href="/">Open 4PLANET ATLAS</a> · <a href="https://4planet.org/living-systems">Living Systems</a> · <a href="https://4species.com/species/">Species</a></p></main></body></html>`;
    return new Response(body,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=300"}});
  }

  if (host === "4planetatlas.com" && url.pathname.startsWith("/place/")) {
    const slug = url.pathname.slice("/place/".length).replace(/\/+$/,"");
    const place = ATLAS_INDEXABLE_PLACES.find((item) => item.slug === slug);
    if (place) {
      const canonical = `https://4planetatlas.com/place/${place.slug}`;
      const mapHref = `https://4planetatlas.com/?place=${encodeURIComponent(place.slug)}&lat=${place.lat}&lon=${place.lon}&z=${place.type === "Country" ? 4 : 10}`;
      const {parent,children,related}=atlasPlaceRelations(place);
      const schemaType=place.type==="City"||place.type==="City-state"?"City":place.type==="Country"?"Country":"Place";
      const description=`Explore ${place.name} in 4PLANET ATLAS: verified location, geographic context and a direct map view, with source-grounded intelligence added over time.`;
      const breadcrumbs=[
        {"@type":"ListItem","position":1,"name":"4PLANET ATLAS","item":"https://4planetatlas.com/"},
        {"@type":"ListItem","position":2,"name":"World Place Index","item":"https://4planetatlas.com/places"},
        {"@type":"ListItem","position":3,"name":place.name,"item":canonical}
      ];
      const data={"@context":"https://schema.org","@graph":[
        {"@type":"WebPage","@id":canonical+"#page","url":canonical,"name":`${place.name} — Explore in 4PLANET ATLAS`,"description":description,"mainEntity":{"@id":canonical+"#place"},"breadcrumb":{"@id":canonical+"#breadcrumbs"},"citation":[place.sourceUrl,place.sourceRightsUrl],"isPartOf":{"@type":"WebSite","name":"4PLANET ATLAS","url":"https://4planetatlas.com/"}},
        {"@type":schemaType,"@id":canonical+"#place","name":place.name,"url":canonical,"geo":{"@type":"GeoCoordinates","latitude":place.lat,"longitude":place.lon},"containedInPlace":{"@type":"Place","name":place.context},...(parent?{"containedInPlace":{"@id":`https://4planetatlas.com/place/${parent.slug}#place`}}:{})},
        {"@type":"BreadcrumbList","@id":canonical+"#breadcrumbs","itemListElement":breadcrumbs}
      ]};
      const parentHtml=parent?`<p><strong>Parent geography:</strong> <a href="/place/${escapeHtml(parent.slug)}">${escapeHtml(parent.name)}</a>.</p>`:`<p><strong>Geographic context:</strong> ${escapeHtml(place.context)}. A canonical parent object is not yet published in this cohort.</p>`;
      const childHtml=children.length?`<h2>Places within this geography</h2><ul>${children.map((p)=>`<li><a href="/place/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a> — ${escapeHtml(p.type)}</li>`).join("")}</ul>`:"";
      const relatedHtml=related.length?`<h2>Related places in the current index</h2><ul>${related.map((p)=>`<li><a href="/place/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a> — ${escapeHtml(p.type)}, ${escapeHtml(p.context)}</li>`).join("")}</ul>`:"";
      const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>${escapeHtml(place.name)} — Explore in 4PLANET ATLAS</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg"><meta property="og:title" content="${escapeHtml(place.name)} — 4PLANET ATLAS"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify(data).replaceAll("<","\\u003c")}</script></head><body><main><nav aria-label="Breadcrumb"><a href="/">ATLAS</a> / <a href="/places">Places</a> / <span>${escapeHtml(place.name)}</span></nav><p>4PLANET ATLAS / PLACE</p><h1>${escapeHtml(place.name)}</h1><p>${escapeHtml(place.type)} · ${escapeHtml(place.context)}</p><h2>About this place</h2><p>${escapeHtml(place.summary)} 4PLANET ATLAS represents ${escapeHtml(place.name)} as a stable geographic object at reference coordinate ${place.lat}, ${place.lon}. The coordinate is used to open the intended map context; it is not an administrative boundary, ecological boundary or claim about conditions across the whole place.</p>${parentHtml}<p><a href="${mapHref}">Open ${escapeHtml(place.name)} in ATLAS</a>. The handoff carries the same place slug and reference coordinate so the geographic entry point and interactive map resolve to the same object.</p><h2>Living Planet Intelligence</h2><p>Geographic identity is published independently from ecological interpretation. Living Systems, Species, Pressures, Missions, Evidence and Solutions are connected here only when the shared 4PLANET evidence model supports the relationship. Until then, those relationships remain unknown rather than being inferred from the place name.</p>${childHtml}${relatedHtml}<h2>Source and provenance</h2><p><strong>Geographic source:</strong> <a href="${escapeHtml(place.sourceUrl)}">${escapeHtml(place.sourceDataset)}</a>. Natural Earth data is public domain; <a href="${escapeHtml(place.sourceRightsUrl)}">terms of use</a>. Source reference checked ${escapeHtml(place.sourceCheckedAt)}.</p><p><a href="/places">World Place Index</a> · <a href="/">ATLAS home</a> · <a href="https://4planet.org/living-systems">Living Systems</a> · <a href="https://4species.com/species/">Species</a></p><p>Truth boundary: this Place page verifies geographic identity and map context. It does not by itself establish species presence, ecosystem health, pressure, causality or ecological outcome.</p></main></body></html>`;
      return new Response(body,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=300"}});
    }
  }

  const baseConfig = PUBLIC_HOSTS[host];
  const normalisedPath = url.pathname.replace(/\/$/, "") || "/";
  let routeConfig = host === "4planet.org" ? FOURPLANET_ROUTES[normalisedPath] : null;

  if (host === "4planet.org" && !routeConfig && normalisedPath.startsWith("/missions/")) {
    const missionSlug = normalisedPath.slice("/missions/".length);
    const missionDiscovery = {
      "cle4n": ["CLE4N_ — A Cleaner Ocean, From Source to Sea", "A 4PLANET OCE4N_ mission pathway connecting marine pollution prevention, interception, recovery and transparent evidence.", "A clean ocean is a systems problem, not only a clean-up problem. CLE4N_ connects production, consumption, collection, rivers, coastlines and marine recovery.", "The pathway is in development. Public support opens only when delivery, measurement, evidence and reporting requirements are confirmed."],
      "wh4les": ["WH4LES_ — Whale Intelligence and Ocean Systems", "A 4PLANET OCE4N_ mission exploring whales, migration corridors, food webs, monitoring and credible protection pathways.", "Whales are participants in ocean food webs, migration systems and nutrient cycles across enormous distances.", "WH4LES_ is a strategic concept. Monitoring, protection and partner pathways must remain evidence-bounded rather than presented as completed conservation work."],
      "cor4l": ["COR4L_ — Rebuilding Reef Resilience", "A 4PLANET OCE4N_ mission exploring coral reef systems, pressures, monitoring and evidence-led restoration pathways.", "Coral reefs are living structures supporting marine life, coastal livelihoods and vulnerable shorelines.", "COR4L_ is a strategic concept. Restoration and protection pathways are not presented as delivered outcomes without evidence."],
      "rewild-marine": ["RE:WILD_ Marine — Coastal Habitat Recovery", "A 4PLANET OCE4N_ mission exploring seagrass, kelp, shellfish beds and credible marine habitat recovery pathways.", "Marine rewilding is the long work of returning ecological function to degraded coastal and shallow-sea systems.", "4PLANET is not currently presented as delivering marine restoration itself; delivery requires credible local actors and evidence."],
      "clim4te": ["CLIM4TE_ — Climate Action Through Living Systems", "A 4PLANET E4RTH_ mission connecting climate action to real places, ecosystems, restoration and evidence.", "CLIM4TE_ makes climate action legible through forests, soils, wetlands, biodiversity and place-based restoration.", "The Tree Unit is an operational proof path under development. Public support remains closed until launch requirements are complete."],
      "am4zonia": ["AM4ZONIA_ — Rainforest as Planetary Infrastructure", "A 4PLANET E4RTH_ mission exploring Amazon forest systems, biodiversity, stewardship, monitoring and credible protection pathways.", "The Amazon is a living climate and biodiversity system whose ecological relationships extend far beyond a single forest polygon.", "The protection pathway remains in development; allocation, evidence and reporting depend on an approved delivery model."],
      "species": ["SPECIES_ — Ecological Relationships and Protection", "A 4PLANET E4RTH_ mission connecting species intelligence, ecological functions, public education and credible protection pathways.", "Species are participants in food webs, migration, pollination, seed dispersal and other relationships that keep ecosystems functioning.", "SPECIES_ is a strategic mission concept; public species intelligence is available through the standalone 4SPECIES product."],
      "rewild-land": ["RE:WILD_ Land — Returning Landscapes to Life", "A 4PLANET E4RTH_ mission exploring habitat reconnection, wetland restoration, natural regeneration and evidence-led land recovery.", "Rewilding is the long work of rebuilding ecological function in damaged or simplified landscapes.", "The habitat-recovery pathway remains in development and is not presented as delivered ecological outcome."],
      "food": ["FOOD_ — Food as Ecological Infrastructure", "A 4PLANET S4PIENS_ mission exploring how food systems connect soil, water, biodiversity, labour, energy, culture and health.", "Every meal connects human needs to land, water, soil, biodiversity, labour and energy systems.", "FOOD_ is a strategic concept focused on food-system intelligence and practical pathways rather than unsupported impact claims."],
      "en4rgy": ["EN4RGY_ — Energy Shapes Every Other System", "A 4PLANET S4PIENS_ mission exploring energy, infrastructure, materials, land use, access, reliability and ecological trade-offs.", "Energy is infrastructure behind homes, transport, industry, food, communication and public life.", "EN4RGY_ is a strategic concept designed to make complex system choices more legible without reducing them to slogans."],
      "circular-city": ["CIRCULAR CITY_ — Cities as Resource Loops", "A 4PLANET S4PIENS_ mission exploring reuse, repair, circular construction, shared infrastructure and urban ecological systems.", "Cities concentrate people, materials, energy, food, waste and knowledge and can either accelerate extraction or circulate resources more intelligently.", "CIRCULAR CITY_ is a strategic concept; future pilots require explicit delivery and evidence."],
      "f4shion": ["F4SHION_ — Materials, Culture and Longevity", "A 4PLANET S4PIENS_ mission exploring fashion as a material system and cultural pathway toward longevity, repair, reuse and transparency.", "Fashion connects fibres, water, chemicals, labour, supply chains, garments, repair, reuse and cultural value.", "F4SHION_ is a strategic concept, not a claim that 4PLANET currently operates a complete circular-fashion programme."],
      "m4gazine": ["4PLANET MAGAZINE — Field Intelligence for a Living Planet", "The 4CULTURE_ editorial mission for source-based reporting, field intelligence, photography, essays and public learning.", "Journalism and visual storytelling make ecological reality understandable, memorable and culturally present.", "The canonical editorial home is 4planetmagazine.com; this mission page explains its role inside the wider 4PLANET ecosystem."],
      "4film": ["4PLANET FILM — Documentary Storytelling for Living Systems", "A 4PLANET 4CULTURE_ mission for documentary storytelling connecting ecological systems, fieldwork and public attention.", "Some ecological realities need image, sound, time and human presence to become emotionally and intellectually legible.", "4PLANET FILM is a strategic concept; future productions and partnerships must be represented according to their actual state."],
      "4rt": ["4RT_ — Prints for Planet", "A 4PLANET 4CULTURE_ mission exploring art, photography and limited editions with transparent economic and mission pathways.", "Art can hold ecological attention in durable form, but money flows and any ecological contribution must remain explicit and auditable.", "4RT_ is a strategic concept. No sale is converted into an ecological outcome claim without separate delivery evidence."],
      "4play": ["4PLAY_ — Music, Events and Cultural Activation", "A 4PLANET 4CULTURE_ mission exploring music, events and cultural participation as routes into ecological attention and action.", "Participation becomes stronger when ecological work enters places where people already gather, listen, create and belong.", "4PLAY_ is a strategic concept; cultural attention and ecological outcome remain separate evidence states."]
    };
    const mission = missionDiscovery[missionSlug];
    if (mission) {
      routeConfig = {
        title: mission[0],
        description: mission[1],
        fallbackTitle: mission[0],
        fallbackParagraphs: [mission[2], mission[3], "This mission uses shared 4PLANET intelligence and evidence infrastructure rather than a separate truth store."],
        fallbackLinks: [["Missions","https://4planet.org/missions"],["Living Systems","https://4planet.org/living-systems"],["Impact","https://4planet.org/impact"]],
        schemaType: "WebPage",
      };
    }
  }

  if (host === "4planet.org" && !routeConfig && normalisedPath.startsWith("/journey/")) {
    const journeySlug = normalisedPath.slice("/journey/".length);
    const journeys = {
      "orca": ["Orca Journey — Follow a Species Through 4PLANET", "A public 4PLANET journey connecting orca species intelligence, place and living-system context across the ecosystem."],
      "jaguar": ["Jaguar Journey — Follow a Species Through 4PLANET", "A public 4PLANET journey connecting jaguar species intelligence, place and living-system context across the ecosystem."]
    };
    const journey = journeys[journeySlug];
    if (journey) {
      routeConfig = {
        title: journey[0],
        description: journey[1],
        fallbackTitle: journey[0],
        fallbackParagraphs: [
          journey[1],
          "The journey is a navigation layer across shared canonical species and place intelligence. It does not create a second species record or duplicate the standalone 4SPECIES canonical profile.",
          "Species facts, conservation context and ecological relationships should remain attributable to their underlying sources and evidence state."
        ],
        fallbackLinks: [["4SPECIES",`https://4species.com/species/${journeySlug}`],["ATLAS","https://4planetatlas.com/"],["Living Systems","https://4planet.org/living-systems"]],
        schemaType: "WebPage",
      };
    }
  }

  const config = routeConfig ? { ...baseConfig, ...routeConfig, canonical: `https://4planet.org${normalisedPath}` } : baseConfig;

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
    const sitemapPaths = config.sitemap === "ATLAS_WORLD_PLACE_INDEX"
      ? ["/", "/places", ...ATLAS_INDEXABLE_PLACES.map((place) => `/place/${place.slug}`)]
      : config.sitemap;
    return new Response(sitemapXml(host, sitemapPaths), {
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
