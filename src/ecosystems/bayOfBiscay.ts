import type { EcosystemProfile } from "@/ecosystems/types";

export const BAY_OF_BISCAY_GOLD:EcosystemProfile={
 id:"ecosystem:bay-of-biscay:gold-01",slug:"bay-of-biscay",name:"BAY OF BISCAY",eyebrow:"ECOSYSTEM_ · OCE4N_",lead:"A living marine system where ocean conditions, food webs, cetaceans and human activity meet.",body:"The Bay of Biscay is used here as a regional marine-system entry rather than one uniform ecological unit. The experience connects species, prey, ocean conditions, survey effort, vessel activity, pressures and the people trying to understand what is changing.",accent:"#2E2EFF",background:"#02040a",
 hero:{src:"/assets/missions/wh4les/hero-real.jpg",srcMobile:"/assets/missions/wh4les/hero-real-mobile.jpg",alt:"A wild orca surfacing at sea",objectPosition:"50% 50%"},
 geographyNote:"4PLANET uses Bay of Biscay as a regional narrative focus for the England–Spain survey corridor. Survey routes, ecological boundaries and source coverage are separate geometries and must not be treated as interchangeable.",centreLabel:"BISCAY",
 nodes:[
  {id:"cetaceans",label:"CETACEANS",kicker:"LIFE",detail:"Whales, dolphins and porpoises become entry points into habitat use, prey relationships, observation records and monitoring effort. Records are observations, not live animal positions.",kind:"SPECIES",x:50,y:10,href:"/species/orca",relation:"LIVES WITHIN"},
  {id:"prey",label:"PREY WEB",kicker:"RELATIONSHIP",detail:"Cetaceans depend on wider food webs. Prey availability, trophic relationships and ocean conditions must be source-backed rather than decorative food-chain claims.",kind:"FUNCTION",x:82,y:24,relation:"SUPPORTS"},
  {id:"conditions",label:"OCEAN",kicker:"CONDITION",detail:"Temperature, bathymetry, productivity and other marine conditions provide context for life and movement. Each variable has its own source, scale and time semantics.",kind:"HABITAT",x:88,y:62,href:"/atlas?journey=bay-of-biscay",relation:"CONDITIONS"},
  {id:"vessels",label:"VESSELS",kicker:"HUMAN SYSTEM",detail:"Shipping and ferry traffic share this spatial system. Vessel presence can create monitoring opportunities and pressures, but presence alone does not establish ecological harm.",kind:"HUMAN",x:69,y:88,relation:"SHARES SPACE"},
  {id:"noise",label:"NOISE",kicker:"PRESSURE",detail:"Underwater noise is a relevant pressure class for cetaceans. Any effect claim requires species-, exposure-, place- and evidence-specific qualification.",kind:"PRESSURE",x:31,y:88,relation:"CAN ALTER"},
  {id:"survey",label:"SURVEY EFFORT",kicker:"MONITORING",detail:"Route geometry, hours and distance are data. They show where observers looked and keep monitoring effort distinct from sightings.",kind:"EVIDENCE",x:12,y:62,relation:"MAKES VISIBLE"},
  {id:"actors",label:"ACTORS",kicker:"RESPONSE",detail:"NGOs, volunteer observers, researchers, ferry operators and public institutions play different roles in monitoring, research, management and response.",kind:"ACTOR",x:18,y:24,href:"/partners",relation:"RESPONDS"}
 ],
 chapters:[
  {id:"meet",number:"01",kicker:"MEET THE SYSTEM",title:"An ocean region made legible through relationships.",body:"The useful question is not only where the Bay of Biscay is. It is how life, ocean conditions, survey effort and human activity overlap through space and time."},
  {id:"life",number:"02",kicker:"LIFE",title:"Meet the animals — then inspect the system around them.",body:"Orca, sperm whale, humpback whale, harbour porpoise and other marine species can each open a different path into observations, habitats, prey, pressures and uncertainty."},
  {id:"function",number:"03",kicker:"HOW IT WORKS",title:"Food webs, depth, currents and conditions shape what is possible.",body:"The marine system is dynamic. Multiple environmental and biological conditions should remain distinct rather than collapse into one health score or implied causality."},
  {id:"human",number:"04",kicker:"WHY IT MATTERS TO US",title:"We use the same ocean we are trying to understand.",body:"Transport, fisheries, coastal economies, research and stewardship all depend on marine systems. Human relevance belongs inside the relationship map."},
  {id:"pressure",number:"05",kicker:"MONITORING + PRESSURE",title:"Seeing more clearly starts with knowing where we looked.",body:"Sightings cannot be interpreted without effort. Route, distance, time, conditions and observation method matter before records are used to infer distribution or change."},
  {id:"response",number:"06",kicker:"ACTORS + ACTION",title:"Monitoring becomes useful when it connects to people and decisions.",body:"The next layer connects actors to survey effort, research, data, geography and possible response pathways while keeping partnership and outcome claims evidence-bound."}
 ],
 species:[{label:"Orca",href:"/species/orca",meta:"CETACEAN · FLAGSHIP"},{label:"Sperm whale",href:"/species/sperm-whale",meta:"DEEP OCEAN"},{label:"Humpback whale",href:"/species/humpback-whale",meta:"MIGRATORY CONTEXT"},{label:"Harbour porpoise",href:"/species/harbour-porpoise",meta:"COASTAL CONTEXT"}],
 actors:[{label:"ORCA",href:"/partners",meta:"ACTOR PROFILE · CANDIDATE"},{label:"WH4LES_",href:"/missions/wh4les",meta:"MISSION CONTEXT"}],
 sources:[
  {label:"Marine species observations",authority:"OBIS",href:"https://obis.org/",establishes:"Source records for marine species occurrences where available.",limitation:"Occurrence records are not live positions, abundance estimates or migration tracks."},
  {label:"Biodiversity occurrence records",authority:"GBIF",href:"https://www.gbif.org/",establishes:"Taxon identity and occurrence records from contributing datasets.",limitation:"Observation density reflects sampling effort and data availability as well as biodiversity."},
  {label:"Marine spatial context",authority:"EMODnet",href:"https://emodnet.ec.europa.eu/",establishes:"European marine data products including bathymetric and other spatial context.",limitation:"Coverage, resolution, dates and semantics vary by product."}
 ],
 primaryActions:[{label:"MEET THE ORCA",href:"/species/orca"},{label:"FOLLOW THE ORCA JOURNEY",href:"/living-systems/orca"},{label:"OPEN IN ATLAS",href:"/atlas?journey=bay-of-biscay"}]
};
