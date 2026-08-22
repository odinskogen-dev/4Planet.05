import type { EcosystemProfile } from "@/ecosystems/types";

export const AMAZONIA_GOLD:EcosystemProfile={
 id:"ecosystem:amazonia:gold-01",slug:"amazon-rainforest",name:"AMAZON RAINFOREST",eyebrow:"ECOSYSTEM_ · E4RTH_",lead:"A region, not one uniform ecosystem.",body:"Amazonia is a vast connected region where water, climate, soils, forests, animals, plants, fungi and people interact across many scales. This is a doorway into those relationships — not a claim that one map, metric or story represents the whole region.",accent:"#3AE86F",background:"#020503",
 hero:{src:"/assets/missions/am4zonia/hero.jpg",srcMobile:"/assets/missions/am4zonia/hero-mobile.jpg",alt:"Amazon rainforest canopy",objectPosition:"center 48%"},
 geographyNote:"4PLANET uses Amazonia as a human-readable regional entry. Basin, biome, forest-cover and political boundaries differ by dataset and question. Place-specific claims require place-specific evidence.",centreLabel:"AMAZONIA",
 nodes:[
  {id:"water",label:"WATER",kicker:"FUNCTION",detail:"Forest vegetation, rivers, rainfall and atmospheric moisture are coupled across the region. Water is both a condition for life and a connecting process.",kind:"FUNCTION",x:50,y:10,relation:"CONNECTS"},
  {id:"forest",label:"FOREST",kicker:"HABITAT",detail:"Forest structure creates habitat, stores biomass and shapes local and regional conditions. Amazonia contains many forest types rather than one homogeneous canopy.",kind:"HABITAT",x:82,y:24,relation:"SUPPORTS"},
  {id:"jaguar",label:"JAGUAR",kicker:"SPECIES",detail:"The jaguar is one entry point into prey relationships, habitat continuity, observations and pressure. A species node opens the wider system rather than standing alone.",kind:"SPECIES",x:88,y:62,href:"/species/jaguar",relation:"LIVES WITHIN"},
  {id:"people",label:"PEOPLE",kicker:"HUMAN SYSTEM",detail:"Millions of people live within the wider Amazon region. Livelihoods, cultures, governance, infrastructure and economies are part of the system, not external to it.",kind:"HUMAN",x:69,y:88,relation:"DEPENDS + SHAPES"},
  {id:"pressure",label:"PRESSURE",kicker:"CHANGE",detail:"Land-use change, fragmentation, fire, extraction, infrastructure, warming and drying can interact. Their importance is place-, period- and source-specific.",kind:"PRESSURE",x:31,y:88,relation:"ALTERS"},
  {id:"solutions",label:"RESPONSES",kicker:"SOLUTION",detail:"Protection, stewardship, restoration, monitoring, policy, finance and better production systems are response classes. A response is not an outcome until delivery and evidence exist.",kind:"SOLUTION",x:12,y:62,href:"/missions/am4zonia",relation:"CAN CHANGE"},
  {id:"evidence",label:"EVIDENCE",kicker:"SOURCE",detail:"Satellite products, biodiversity records, hydrology, climate data and field research reveal different parts of the system. No single source establishes the whole story.",kind:"EVIDENCE",x:18,y:24,href:"/atlas?journey=amazonia",relation:"MAKES VISIBLE"}
 ],
 chapters:[
  {id:"meet",number:"01",kicker:"MEET THE SYSTEM",title:"A region made of relationships.",body:"The useful question is not only where Amazonia is. It is what moves through it, what depends on what, and how changes in one part of the network can propagate into others."},
  {id:"life",number:"02",kicker:"LIFE",title:"Enter through a species. Keep going.",body:"A jaguar, macaw, river dolphin, tree, fungus or pollinator can each become an entry point into habitat, food, movement, ecological function and pressure."},
  {id:"function",number:"03",kicker:"FUNCTION",title:"Water, carbon, habitat and movement connect the whole.",body:"4PLANET treats ecosystem functions as relationships to explore rather than decorative facts."},
  {id:"human",number:"04",kicker:"WHY IT MATTERS TO US",title:"Humans are inside the dependency graph.",body:"Climate stability, water cycles, food systems, materials, economies, cultures and health depend on functioning living systems."},
  {id:"pressure",number:"05",kicker:"CHANGE",title:"Pressure is a pattern, not one score.",body:"Forest loss, fire, roads, mining, warming and drying can overlap, but remain separate source-backed signals until evidence supports a stronger interpretation."},
  {id:"response",number:"06",kicker:"ACTORS + SOLUTIONS",title:"Who is changing the system — and how?",body:"The next layer connects stewardship, researchers, public institutions, NGOs, companies, funders and solution providers to specific geographies, interventions and evidence."}
 ],
 species:[{label:"Jaguar",href:"/species/jaguar",meta:"PREDATOR · FLAGSHIP"},{label:"Hyacinth macaw",href:"/species/hyacinth-macaw",meta:"BIRD · REGIONAL CONTEXT"}],
 actors:[{label:"Actor layer",href:"/partners",meta:"PROFILE ENGINE · NEXT PASS"},{label:"AM4ZONIA_",href:"/missions/am4zonia",meta:"MISSION CONTEXT"}],
 sources:[
  {label:"Amazon mapping",authority:"NASA Earth Observatory",href:"https://science.nasa.gov/earth/earth-observatory/mapping-the-amazon-145649/",establishes:"Regional mapping and Earth-observation context.",limitation:"A regional overview does not establish one ecological condition for the whole Amazon."},
  {label:"Amazon wet season",authority:"NASA Earth Observatory",href:"https://science.nasa.gov/earth/earth-observatory/the-amazon-makes-its-own-wet-season-91161/",establishes:"Evidence on vegetation-atmosphere interaction and seasonal moisture context.",limitation:"Mechanisms and effects vary across space, time and study design."},
  {label:"Amazon drying",authority:"NASA Earth Observatory",href:"https://science.nasa.gov/earth/earth-observatory/human-activities-are-drying-out-the-amazon-145834/",establishes:"Research-based context on atmospheric drying and human influence.",limitation:"This does not establish one local cause or uniform regional condition."}
 ],
 primaryActions:[{label:"MEET THE JAGUAR",href:"/species/jaguar"},{label:"UNDERSTAND THE SYSTEM",href:"/living-systems/amazonia"},{label:"OPEN IN ATLAS",href:"/atlas?journey=amazonia"}]
};
