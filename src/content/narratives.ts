// Central mission narrative layer (V17).
// Two layers per mission:
//   scene[]  — the short opening movement (verbatim public source of truth, used in hero lead-ins)
//   article  — the full documentary body, composed as Snohetta-style editorial blocks.
// Every factual claim is grounded in 4PLANET_DOMAIN_MISSION_CONTENT_PACK_v1. No invented
// numbers, partners, locations, totals or states. Prose is editorial, not quantified.

export type Block =
  | { k: "lead"; t: string }     // large opening statement
  | { k: "para"; t: string }     // body paragraph
  | { k: "quote"; t: string }    // pull-quote (rendered in domain colour)
  | { k: "sub"; t: string };     // small section label above the paragraphs that follow

export interface MissionNarrative {
  scene: string[];
  article: Block[];
}

const L = (t: string): Block => ({ k: "lead", t });
const P = (t: string): Block => ({ k: "para", t });
const Q = (t: string): Block => ({ k: "quote", t });
const S = (t: string): Block => ({ k: "sub", t });

export const MISSION_NARRATIVE: Record<string, MissionNarrative> = {
  // OCE4N_
  "wh4les": {
    scene: [
      "Every year whales travel further than almost any other animal on Earth.",
      "Their migrations connect oceans, move nutrients and support marine ecosystems across enormous distances.",
      "For millions of years, they have shaped life beneath the surface.",
      "Today they move through shipping lanes, industrial noise, fishing gear and changing oceans.",
      "Protecting whales is no longer only about whales. It is about protecting the systems they help keep alive.",
      "4Planet is developing WH4LES to make migratory intelligence easier to understand, support and follow.",
    ],
    article: [
      L("A whale is not a single animal moving through empty water. It is a piece of the ocean's living infrastructure — travelling through food webs, migration corridors and nutrient cycles across distances few other animals on Earth will ever cross."),
      P("Follow one animal for a year and you begin to see the ocean the way it actually works: not as a flat blue surface, but as a set of connected systems held together by movement. Whales carry nutrients between feeding and breeding grounds. Their presence supports the plankton productivity that feeds much of the sea and helps produce the oxygen we breathe."),
      S("The pressure"),
      P("Those corridors now cross shipping lanes, industrial noise, fishing gear and waters reshaped by a changing climate. Vessel strike, entanglement and the steady drift of prey into new places all add pressure — and much of it is difficult to monitor, because the routes whales follow stretch across enormous distances and many jurisdictions at once."),
      Q("Whale protection is no longer only about whales. It is about protecting the systems they help keep alive."),
      P("That is the shift this mission is built around. A whale population is connected to marine food webs, to ocean productivity, to public imagination and to the wider biological systems that keep oceans functioning. When you protect the animal, you protect the corridor — and everything that moves through it."),
      S("What can help"),
      P("Better monitoring across borders. Quieter, safer shipping practices. Protected routes and reduced entanglement risk. Field research, policy pressure and — underneath all of it — a public that understands why any of this matters."),
      P("WH4LES is being developed as a public mission world for exactly that: whale intelligence, storytelling and credible future partner pathways, connecting ecological understanding, evidence, field documentation and cultural reach into something people can follow."),
    ],
  },
  "cor4l": {
    scene: [
      "From a distance, a coral reef can look still.",
      "Up close, it is a living city.",
      "Fish, crustaceans, algae, coral and countless other relationships build shelter, food and protection together.",
      "Reefs help hold coastlines in place and support life far beyond their visible edges.",
      "But warming water, pollution, disease and physical damage are changing these systems faster than many reefs can recover.",
      "COR4L is being developed to make reef systems, their pressures and the work of recovery easier to understand, support and follow.",
    ],
    article: [
      L("From a distance a reef can look like scenery. Up close it is a dense, working structure — a living city where coral animals, fish nurseries, algae and countless relationships build shelter, food and protection together."),
      P("Reefs are not only beautiful; they are load-bearing. They hold vulnerable coastlines in place, support fisheries and sustain life far beyond their visible edges. A reef is infrastructure that happens to be alive."),
      S("The pressure"),
      P("Warming water, ocean acidification, pollution, disease and bleaching events are now pushing reef systems past the point where many can recover at their own pace. When a reef weakens, the loss is rarely cosmetic."),
      Q("Reef loss is a system failure, not only a visual loss."),
      P("Biodiversity, fisheries, coastal protection and local livelihoods can weaken together. That is why this mission treats a reef as a system to be understood, not a postcard to be mourned."),
      S("What can help"),
      P("Reducing local pressure. Protecting reef areas. Improving water quality. Supporting evidence-led restoration and monitoring — and strengthening public understanding of how reef systems actually hold together."),
      P("COR4L is being developed as a mission world for reef intelligence, restoration pathways and cultural communication that makes reef systems both emotionally and scientifically legible."),
    ],
  },
  "pl4stic": {
    scene: [
      "Plastic does not disappear when it leaves our hands.",
      "It moves through rivers, coastlines, fisheries, beaches, stomachs, currents and food webs.",
      "Marine plastic is not only a waste problem.",
      "It is a systems problem: production, consumption, leakage, cleanup and recovery.",
      "PL4STIC is being developed to make marine waste recovery easier to understand, support and follow.",
    ],
    article: [
      L("Plastic does not disappear when it leaves our hands. It moves — through rivers, coastlines, fisheries, beaches, stomachs, currents and food webs — long after the moment it was thrown away."),
      P("That movement is the clue. Marine waste is not only an ocean problem; it is a systems problem that begins far upstream, in production, consumption, collection, rivers, coastlines and infrastructure. The sea is where it ends up, not where it starts."),
      S("The pressure"),
      P("Waste enters marine systems through poorly managed material flows, stormwater, rivers, coastlines, ports and consumer systems. Recovery matters — but so do prevention and interception, before anything reaches open water."),
      Q("Marine debris affects species, habitats, coastlines, food systems and public trust in the health of the ocean."),
      S("What can help"),
      P("Source reduction. Better material systems. Interception before the sea. Coastal recovery with transparent weighing and reporting. Local field operations, and the policy change that makes all of it stick."),
      S("What 4Planet is building"),
      P("A measurable pathway designed to support one kilogram of marine waste recovery — but only after an approved delivery partner, a measurement method, an evidence standard and a reporting model are confirmed. Until each of those is in place, the pathway stays closed to public support. The honesty is the point."),
    ],
  },
  "4ntarctica": {
    scene: [
      "At the bottom of the world, ice, ocean and atmosphere move as one system.",
      "What happens there does not stay there.",
      "Changes in polar waters affect climate, sea level, marine life and weather patterns far beyond Antarctica itself.",
      "The continent can feel distant from everyday life. Its systems are not.",
      "4NTARCTICA is being developed to make polar change easier to understand, document and follow.",
    ],
    article: [
      L("At the bottom of the world, ice, ocean and atmosphere move as one system. Antarctica and the Southern Ocean are not remote background landscapes — they are major working parts of Earth's climate and ocean machinery."),
      P("The continent can feel distant from everyday life. Its systems are not. Sea ice, krill, penguins, seals, whales and the great Southern Ocean currents are tied directly into the wider ocean and the global climate."),
      S("The pressure"),
      P("Polar marine systems are under pressure from warming, sea-ice change, fishing pressure, pollution and the cumulative effects of global emissions produced far away."),
      Q("What happens in polar systems does not stay at the poles."),
      S("What can help"),
      P("Stronger protection. Better science communication. Precautionary management. Support for credible research and conservation partners — and public understanding of how deeply the poles and the rest of the planet are connected."),
      P("4NTARCTICA is being developed as a mission world for Antarctic intelligence, protection pathways and cultural attention around the ecosystems that help regulate the planetary system as a whole."),
    ],
  },

  // E4RTH_ (flagship — hand-composed)
  "clim4te": {
    scene: [
      "A forest is never just trees.",
      "It is climate, water, soil, fungi, birds, insects and thousands of relationships growing together.",
      "When forests disappear, far more than carbon is lost. Water cycles change. Species lose habitat. Soils weaken. Communities lose resilience.",
      "CLIM4TE is being developed to make credible tree and restoration pathways easier to understand, support and follow.",
    ],
    article: [
      L("Climate is the largest story we have, and the hardest one to feel. It arrives as targets, curves and distant numbers — real, but abstract. People understand the scale of the problem. What they struggle to see is where meaningful action can actually begin."),
      P("This mission starts from a simple move: tie climate to real places, living systems and specific ecological work. Not the whole atmosphere at once — one landscape, one restoration, one thing you can follow from decision to outcome."),
      S("Why a forest is never just trees"),
      P("A forest is climate, water, soil, fungi, birds, insects and thousands of relationships growing together. Forests, soils and wetlands can contribute to ecological resilience, biodiversity, water regulation and climate stability — but only when restoration is designed for place, for species and for long-term care, rather than for a photograph."),
      P("That distinction matters, because planting the wrong thing in the wrong place can look like climate action while doing very little. Restoration that lasts is planting where planting is ecologically justified, protecting what is already intact, and improving the soils and wetlands that quietly hold everything else together."),
      Q("When forests disappear, far more than carbon is lost. Water cycles change. Species lose habitat. Soils weaken. Communities lose resilience."),
      S("The first proof path"),
      P("Inside CLIM4TE sits Tree Unit — the first operational proof path in the entire 4Planet system. It is designed to support one tree through a verified delivery pathway. One tree, done credibly, tracked openly."),
      P("It is deliberately not open yet. Species, location, cost, capacity, evidence requirements and reporting all have to be confirmed first. Tree Unit opens to public support only when those are in place — and until then the honest status is exactly what the site shows: partner validation pending, public support closed."),
      P("CLIM4TE is being developed to make credible tree and restoration pathways easier to understand, support and follow — so that when a pathway does open, it opens as proof rather than as a promise."),
    ],
  },
  "am4zonia": {
    scene: [
      "The Amazon is more than a rainforest. It is a continental living system.",
      "It moves water through the sky, stores carbon, holds extraordinary biodiversity and helps regulate climate far beyond its borders.",
      "When rainforest is lost, the effects do not stay local.",
      "AM4ZONIA exists because protecting rainforest means protecting one of the living systems humanity depends on.",
      "4Planet is developing this Mission to make rainforest protection easier to understand, support and follow.",
    ],
    article: [
      L("The Amazon is not simply a forest. It is a living climate system, a biodiversity system and a foundation for people far beyond its borders — closer to planetary infrastructure than to scenery."),
      P("It moves water through the sky, stores carbon and holds an extraordinary density of life. Canopy, rivers, rainfall, soil, pollinators, seed dispersers, predators and the Indigenous and local communities who steward it are not separate features. They are one interdependent system, and the system is what does the work."),
      S("The pressure"),
      P("Deforestation, fires, extraction and fragmentation weaken the ecological relationships that let rainforest stay rainforest. Past a certain point, damage stops being local — it changes rainfall, atmospheric moisture, biodiversity, carbon storage and regional climate patterns far beyond the forest edge."),
      Q("Protecting rainforest means protecting one of the living systems humanity depends on."),
      S("What can help"),
      P("Stronger protection of intact forest. Support for Indigenous and local stewardship. Credible conservation finance. Restoration where appropriate, better monitoring, and a public that understands why an intact forest is worth far more standing than cleared."),
      S("What 4Planet is building"),
      P("A pathway designed to support protection of one square metre of Amazon rainforest through an approved delivery model. The final unit model, allocation method, cost, evidence and reporting standard all remain subject to partner agreement — so the pathway is described honestly as in development, and public support stays closed until it can be delivered and proven."),
    ],
  },
  "species": {
    scene: [
      "Every species carries a role in a larger living system.",
      "Some pollinate. Some disperse seeds. Some regulate populations. Some move nutrients. Some reveal whether an ecosystem is beginning to fail.",
      "When a species disappears, the loss is rarely isolated. It changes relationships around it.",
      "SPECIES is being developed to make biodiversity loss, ecological roles and protection pathways easier to understand, support and follow.",
    ],
    article: [
      L("A species is not an isolated biological object. It is a participant — in food webs, migration cycles, pollination, nutrient flows and the quiet balance that keeps an ecosystem standing."),
      P("Predators, pollinators, grazers, seed dispersers, decomposers and marine mammals all shape the systems around them. Each one is doing a job. Some pollinate. Some move nutrients. Some regulate populations. Some simply reveal, by thriving or failing, whether an ecosystem is still healthy."),
      S("The pressure"),
      P("Habitat fragmentation, exploitation, pollution, disease and climate pressure can remove a species from an ecosystem before the wider consequences are even understood. The danger is not only the loss itself, but how invisible the knock-on effects can be until they arrive."),
      Q("When a species disappears, the loss is rarely isolated. It changes every relationship around it."),
      S("What can help"),
      P("Habitat protection and monitoring. Field protection. Reducing direct pressures. Public education, better evidence and targeted conservation action aimed where it changes the most."),
      P("SPECIES is being developed as a mission world that connects species intelligence, field protection pathways, public education and cultural storytelling — making ecological roles, biodiversity loss and the routes to protection easier to understand, support and follow."),
    ],
  },
  "rewild": {
    scene: [
      "Land can recover when pressure is reduced and life is given room to return.",
      "Water finds new paths. Soils rebuild. Plants spread. Insects return. Birds follow. Larger systems begin to reconnect.",
      "Rewilding is not about turning back time. It is about restoring the conditions that allow living systems to function again.",
      "RE:WILD is being developed to make habitat recovery easier to understand, support and follow.",
    ],
    article: [
      L("Rewilding is not decoration, and it is not nostalgia. It is the long, patient work of rebuilding ecological function in landscapes that have been damaged or simplified — giving life enough room to return on its own terms."),
      P("Land loses complexity quietly: through fragmentation, intensive use, drainage, pollution, erosion and the steady removal of species and natural processes. What is left can look green while barely working as a system."),
      S("What recovery looks like"),
      P("Reduce the pressure, and the sequence begins. Water finds new paths. Soils rebuild. Plants spread. Insects return, and birds follow. Slowly, the larger systems start to reconnect. Healthy landscapes hold water, support biodiversity, create habitat, reduce erosion and absorb disturbance instead of amplifying it."),
      Q("Rewilding is not about turning back time. It is about restoring the conditions that let living systems function again."),
      S("What can help"),
      P("Protecting and reconnecting habitats. Restoring wetlands. Allowing natural regeneration. Reintroducing ecological processes where it is appropriate — and monitoring recovery honestly, over the years it actually takes."),
      S("What 4Planet is building"),
      P("A pathway designed to support restoration of one square metre of degraded habitat through an approved local model. Like the other land pathways, it is described as in development and stays closed to public support until delivery, evidence and reporting can stand on their own."),
    ],
  },

  // S4PIENS_
  "food": {
    scene: [
      "Every meal begins in a living system.",
      "Soil. Water. Pollinators. Seeds. Weather. Labour. Land.",
      "Food can nourish people while placing less pressure on the systems that make it possible. Or it can accelerate extraction, waste and ecological loss.",
      "FOOD is being developed to make the relationships between diets, production and living systems easier to understand — and better choices easier to find.",
    ],
    article: [
      L("Every meal begins in a living system — soil, water, pollinators, seeds, weather, labour and land — long before it reaches a plate. Food is one of the most direct ways human systems touch the living world."),
      P("That directness cuts both ways. Food systems can place enormous pressure on land, water, climate and biodiversity, while making the lower-impact choice difficult to understand or even find. Or they can strengthen soil, biodiversity, resilience and public health at the same time."),
      S("What can help"),
      P("Regenerative and agroecological practice. Healthier soil. Less waste. More transparent supply chains. Lower-impact diets and local systems designed for resilience rather than only for volume."),
      Q("Food is ecological infrastructure — the daily point where human systems and living systems meet."),
      P("FOOD is being developed as a mission world for food-system intelligence, practical partnerships and cultural communication around the systems that feed people and shape landscapes — editorial about food systems, not lifestyle photography of them."),
    ],
  },
  "en3rgy": {
    scene: [
      "Energy powers nearly every system we live inside.",
      "How we heat, move, build, produce and connect shapes the pressure placed on land, water, climate and communities.",
      "Energy is often invisible until its consequences become impossible to ignore.",
      "EN3RGY is being developed to make the transition toward cleaner, more resilient energy systems easier to understand and follow.",
    ],
    article: [
      L("Energy is not only a technical sector. It is the infrastructure behind homes, transport, industry, food, communication and public life — invisible until its consequences become impossible to ignore."),
      P("Because it sits underneath everything, energy is rarely simple. Its choices are usually communicated as clean binaries, even though they involve real trade-offs across ecosystems, materials, cost, access, reliability and justice."),
      S("Why it matters"),
      P("Energy systems shape emissions, extraction, land use, air quality, economic security and the sheer capacity of a society to change. Get the explanation wrong and the whole debate collapses into slogans."),
      Q("The goal is to make complex system choices more legible — without reducing them to slogans."),
      S("What can help"),
      P("Efficiency and demand reduction. Clean generation and better grids. Responsible material use. Accessible public understanding, and transition models that actually account for people and ecosystems together."),
      P("EN3RGY is being developed as a mission world for energy intelligence and public explanation — infrastructure, grids, materials and system choices made legible rather than loud."),
    ],
  },
  "circular-city": {
    scene: [
      "Cities concentrate human possibility.",
      "They also concentrate materials, waste, transport, energy use and demand.",
      "The future of urban life depends on whether cities can become places where materials stay in use, systems waste less and people can live well within ecological limits.",
      "CIRCULAR CITY is being developed to make the circular transition visible, practical and easier to participate in.",
    ],
    article: [
      L("Cities concentrate people, materials, energy, food, waste and knowledge in one place. That concentration can accelerate extraction — or it can become the very thing that lets resources circulate longer and more intelligently."),
      P("The difference is design. Urban systems often treat materials, food, water and energy as linear flows: take, use, discard. A circular city treats the same flows as loops to be closed."),
      S("Why it matters"),
      P("How a city is designed affects emissions, resource use, health, access, public space and the ecological pressure it exports well beyond its own boundaries. The city's edge is not where its impact ends."),
      Q("Cities can become loops, not endpoints."),
      S("What can help"),
      P("Reuse systems and repair. Local material loops and circular construction. Shared infrastructure, better waste prevention, and urban nature written into planning rather than added as decoration."),
      P("CIRCULAR CITY is being developed as a mission world for circular urban systems: visible pilots, public understanding and future city-based partnerships."),
    ],
  },
  "f4shion": {
    scene: [
      "Every garment begins somewhere.",
      "In a field. In a factory. In a supply chain. In a design decision. In a material choice.",
      "Fashion can express culture, identity and imagination. It can also hide enormous material, labour and environmental pressure behind a finished product.",
      "F4SHION is being developed to make the life of clothing — and better ways of making, using and valuing it — easier to understand and follow.",
    ],
    article: [
      L("Fashion is three things at once: a material system, a cultural language and a public expression of how value, identity and consumption are organised. A garment is never only a garment."),
      P("It begins in a field, a factory, a supply chain, a design decision, a material choice — fibres, water, soil, dyes and labour — most of which the finished product is designed to hide."),
      S("The pressure"),
      P("High volumes, short product cycles, unclear supply chains and disposal culture create pressure across fibres, water, chemicals, labour and waste. And because fashion reaches public culture directly, it can normalise speed and disposability faster than almost any other system."),
      Q("Make fewer things matter more."),
      P("The same reach works in reverse: fashion can make longevity, repair, reuse and material intelligence desirable rather than dutiful."),
      S("What can help"),
      P("Better materials and longer use. Repair and resale. Smaller batches and circular design. Transparent production — and a cultural shift that treats disposability as the exception, not the default."),
      P("F4SHION is being developed as a mission world for material intelligence, circular fashion, small-scale proof projects and cultural formats that make lower-impact choices genuinely desirable."),
    ],
  },

  // 4CULTURE_
  "4play": {
    scene: [
      "Before people join a movement, they need a reason to feel something.",
      "A song. A night. A shared space. A moment that makes a different future feel possible.",
      "4PLAY is being developed to turn ecological attention into experiences people can enter together.",
    ],
    article: [
      L("Before people join anything, they need a reason to feel something. A song. A night. A shared space. A moment where a different future feels not just necessary, but possible — and worth belonging to."),
      P("Participation gets stronger when ecological work enters the places people already gather, listen, create and belong. The audiences change most often already exist — in music, art, fashion and social life — just not usually in the same room as environmental work."),
      Q("Turn attention into participation — without beginning in guilt or abstraction."),
      S("What can help"),
      P("Thoughtful cultural programming and mission-linked events. Artist participation. Low-overhead formats, and transparent pathways that lead from a night out to real support."),
      P("4PLAY is being developed as a lightweight cultural activation layer — powered through existing networks and platforms first, before it becomes a larger operating track."),
    ],
  },
  "4film": {
    scene: [
      "Some systems cannot be understood in a headline.",
      "They need time. Place. Sound. Faces. Silence. Evidence.",
      "Film can take people closer to the living world than explanation alone.",
      "4FILM is being developed to document the places, species, people and systems that shape the work of 4Planet.",
    ],
    article: [
      L("Some ecological realities need more than explanation. They need image, sound, time, human presence and cinematic force — the things a headline can never carry."),
      P("Many ecological stories fail to reach people not because they are untrue, but because they arrive without enough emotional depth, cultural relevance or visual precision to land. Film can make complex systems visible, memorable and emotionally intelligible without flattening them into slogans."),
      Q("Some systems cannot be understood in a headline. They need time, place, sound, faces, silence — and evidence."),
      S("What can help"),
      P("Long-form and short-form documentary. Field-based storytelling. Collaboration with researchers and local communities — and distribution that connects audiences back to credible action rather than leaving them moved but idle."),
      P("4FILM is being developed as a documentary pathway for the whales, forests, species, field partners and ecological restoration that shape the work of 4Planet."),
    ],
  },
  "4telier": {
    scene: [
      "Culture needs places where ideas become objects, images, spaces and interventions.",
      "4TELIER is being developed as a studio for visual work that makes ecological attention tangible — through design, art, print, objects and public expression.",
    ],
    article: [
      L("Art and design can make ecological questions inhabitable — not as decoration, but as objects, spaces and images that carry attention into daily life and refuse to be thrown away."),
      P("Ecological communication becomes abstract or disposable when it has no physical or aesthetic form people actually want to keep close. Objects, exhibitions, editions and design systems can create durable cultural memory — and route that attention back toward mission work."),
      Q("Objects people want to keep become attention that lasts."),
      S("What can help"),
      P("Limited editions and exhibitions. Design collaborations. Objects with clear impact routing, and visual work that deepens ecological meaning rather than trivialising it."),
      P("4TELIER is being developed as a cultural studio and exhibition pathway connecting art, design, objects and mission storytelling through shared 4Planet infrastructure."),
    ],
  },
  "m4gazine": {
    scene: [
      "Every generation needs stories that help it understand the world it inherits.",
      "M4GAZINE is being developed as a cultural field guide for a living planet: a place for nature, systems, innovation, art, music, film, fashion and the people building what comes next.",
    ],
    article: [
      L("Facts matter. But facts without attention, context and emotional relevance often fail to enter public life at all — they stay technical, fragmented and, in the end, invisible."),
      P("Ecological work needs a narrative layer as much as it needs data. Journalism, essays, photography, field notes and editorial systems can make complex ecological reality understandable, memorable and culturally present — part of the conversation rather than a footnote to it."),
      Q("A cultural field guide for a living planet."),
      S("What can help"),
      P("Rigorous editorial work and source-based storytelling. Field reporting and visual essays. Formats that connect ecological systems back to daily life, so understanding turns into participation."),
      P("M4GAZINE is being developed as the editorial engine of 4Planet — mission notes, field intelligence, essays, reports and public storytelling across the whole system."),
    ],
  },
};

export const missionScene = (slug: string): string[] => MISSION_NARRATIVE[slug]?.scene ?? [];
export const missionArticle = (slug: string): Block[] => MISSION_NARRATIVE[slug]?.article ?? [];
