/**
 * Public search surfaces of the preserved Living Systems v1.4.2 export.
 * This is distribution metadata only. The original 88 source files remain
 * byte-identical. New pages require independent editorial + source review.
 */
export const LIVING_SYSTEMS_SEARCH_PAGES = Object.freeze([
  { path:"/start/", title:"Start exploring living systems | 4PLANET", description:"Explore how species, ecosystems, human systems, threats and solutions connect. Follow a guided path through the evidence and its limits." },
  { path:"/ecosystems/", title:"Ecosystems and their relationships | 4PLANET", description:"Explore connected ecosystems, ecological functions and dependencies in Living Systems Intelligence, with pathways to evidence and impacts." },
  { path:"/ecosystems/EC_AMAZON_RAINFOREST/", title:"Amazon rainforest: dependencies, threats and solutions | 4PLANET", description:"Explore how the Amazon rainforest supports rainfall regulation, biodiversity and human systems, and examine the evidence, pressures and responses." },
  { path:"/species/", title:"Species and living system connections | 4PLANET", description:"Explore species as parts of living systems. Understand their ecological roles, dependencies, pressures and linked evidence." },
  { path:"/species/western-honey-bee/", title:"Western honey bee: pollination and food systems | 4PLANET", description:"Explore how the western honey bee (Apis mellifera) connects pollination, ecosystems, food production and human activity, with sources and limits." },
  { path:"/dependencies/", title:"Ecological dependencies explained | 4PLANET", description:"Trace what depends on what in nature and human systems, including cascading effects and uncertainty in the underlying evidence." },
  { path:"/solutions/", title:"Solutions for living systems | 4PLANET", description:"Explore proposed responses to ecological pressures and understand which functions, species and threats each response addresses." },
  { path:"/decisions/", title:"Decisions about ecological systems | 4PLANET", description:"Examine ecological decisions through dependencies, possible outcomes, evidence quality and uncertainty rather than unsupported impact claims." },
  { path:"/sources/", title:"Living Systems sources and evidence | 4PLANET", description:"Explore the source basis for Living Systems Intelligence and see how ecological claims connect to documented evidence." },
  { path:"/trust/", title:"Evidence quality and limits | 4PLANET Living Systems", description:"Understand confidence, gaps, limitations and source integrity in Living Systems Intelligence. Separate verified findings from interpretation." },
  { path:"/learning/", title:"Learning from ecological outcomes | 4PLANET", description:"Explore how ecological observations, expected effects and new evidence can improve understanding and inform future decisions." },
  { path:"/about/", title:"About Living Systems Intelligence | 4PLANET", description:"Learn how Living Systems Intelligence connects species, ecosystems, human systems, threats, solutions and the evidence behind them." }
]);
export const LIVING_SYSTEMS_CANONICAL_PREFIX = "https://4planet.org/livingsystems";
export const livingSystemsPublicRoutes = LIVING_SYSTEMS_SEARCH_PAGES.map((p) => "/livingsystems" + p.path);
