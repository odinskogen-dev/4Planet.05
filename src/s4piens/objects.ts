/**
 * S4PIENS — "Follow one thing". Everyday objects mapped onto the stations of a
 * human system, so a person can see BOTH the object's journey and the system it
 * belongs to. Text is 4PLANET CONTEXT (explanation, no figures); quantities and
 * places come only from sourced adapters on the system page.
 */
export interface ObjectStep {
  /** The system station this step belongs to. */
  station: string;
  title: string;
  body: string;
  where: string;
  needs: string[];
  nature?: string;
  atlas?: string[];
}

export interface EverydayObject {
  slug: string;
  name: string;
  article: string;
  system: string;
  line: string;
  steps: ObjectStep[];
  /** Honest note when the object's own system is not yet mapped. */
  mappedVia?: string;
}

export const OBJECTS: EverydayObject[] = [
  {
    slug: "bread", name: "Bread", article: "A loaf of bread", system: "food",
    line: "From a field of wheat to the crust left on the plate.",
    steps: [
      { station: "inputs", title: "Seed, soil and rain", body: "A wheat crop starts with seed, fertile soil, rain or irrigation, fertiliser and fuel for the tractor.", where: "Farmland", needs: ["Seed", "Soil", "Water", "Fertiliser", "Fuel"], nature: "Soil life and the water cycle do work no farmer can replace.", atlas: ["ndvi", "precip"] },
      { station: "production", title: "The wheat field", body: "The crop grows through the seasons and is harvested by combine. Grain is traded globally, so a harvest in one region matters far away.", where: "Grain-growing plains", needs: ["Land", "Machinery", "Labour"], nature: "Fields replace whatever habitat was there before.", atlas: ["truecolor"] },
      { station: "movement", title: "Grain store and ship", body: "Grain is dried, stored in silos and moved by truck, train and ship — often across borders.", where: "Silos, rail lines, ports", needs: ["Storage", "Transport fuel"] },
      { station: "processing", title: "The mill", body: "The grain is cleaned and ground into flour. Bran and germ are separated or kept, depending on the flour.", where: "Flour mills", needs: ["Electricity", "Water"] },
      { station: "processing", title: "The bakery", body: "Flour, water, yeast and salt become dough, then bread, in ovens that run on gas or electricity.", where: "Industrial and local bakeries", needs: ["Energy", "Packaging"] },
      { station: "use", title: "Shop and table", body: "Bread reaches people through shops and is eaten within days — it is a fresh product with a short life.", where: "Shops, kitchens", needs: ["Cold-free storage", "Price"] },
      { station: "end", title: "What is left", body: "Bread goes stale within days, so it is often thrown away. Leftovers can become feed, compost or biogas — or landfill.", where: "Homes, shops, waste systems", needs: ["Collection", "Composting"], nature: "Food in landfill releases methane as it breaks down." },
    ],
  },
  {
    slug: "coffee", name: "Coffee", article: "A cup of coffee", system: "food",
    line: "From a shaded hillside in the tropics to the grounds in your bin.",
    steps: [
      { station: "production", title: "The coffee farm", body: "Coffee grows on shrubs in tropical highlands, much of it on small family farms. Some farms grow it under shade trees; others in full sun.", where: "Tropical highlands", needs: ["Land", "Rain", "Labour"], nature: "Shade-grown coffee can keep more trees and birds on the land than full-sun plots.", atlas: ["forest", "truecolor"] },
      { station: "processing", title: "Picking and drying", body: "Ripe cherries are picked — often by hand — then washed or dried to free the green bean.", where: "Farms and local mills", needs: ["Water", "Labour", "Sun or dryers"] },
      { station: "movement", title: "Export and shipping", body: "Green beans are bagged, graded and shipped in containers to roasters on other continents.", where: "Export ports, container ships", needs: ["Shipping fuel", "Traders"] },
      { station: "processing", title: "Roasting", body: "Roasters turn green beans brown and aromatic in hot drums, then grind and pack them.", where: "Roasteries", needs: ["Gas or electricity", "Packaging"] },
      { station: "use", title: "The cup", body: "Coffee is brewed at home, at work or in a café. Price, habit and taste decide far more than origin.", where: "Kitchens, cafés", needs: ["Water", "Energy for heating", "Machines"] },
      { station: "end", title: "Grounds and cups", body: "Used grounds can be composted; single-use cups and capsules are harder to recover.", where: "Bins, compost, waste systems", needs: ["Sorting", "Collection"] },
    ],
  },
  {
    slug: "steel-beam", name: "Steel beam", article: "A steel beam", system: "energy-and-industry",
    line: "From iron ore in the ground to a building that stands for a century.",
    steps: [
      { station: "production", title: "The iron-ore mine", body: "Iron ore is dug from large open pits and crushed. Mining is concentrated in a small number of regions.", where: "Open-pit mines", needs: ["Diesel", "Water", "Explosives"], nature: "Mines and their roads replace habitat and can open access to wider areas.", atlas: ["truecolor"] },
      { station: "inputs", title: "Coal — or hydrogen and electricity", body: "Most steel is still made with coal, which removes oxygen from the ore. New routes use hydrogen and electricity instead.", where: "Coal mines, power plants, electrolysers", needs: ["Coal or hydrogen", "Electricity"] },
      { station: "movement", title: "Ship and rail", body: "Ore and coal travel by rail to ports and by bulk carrier to steelworks, often on another continent.", where: "Ore railways, bulk ports", needs: ["Fuel"] },
      { station: "processing", title: "Furnace", body: "In a blast furnace the ore becomes molten iron and then steel. Electric arc furnaces melt scrap steel instead.", where: "Steelworks", needs: ["Very high heat", "Electricity"], nature: "Steelmaking is one of the largest industrial sources of carbon dioxide.", atlas: ["emissions"] },
      { station: "processing", title: "Rolling mill", body: "Hot steel is rolled into beams, plates and bars.", where: "Rolling mills", needs: ["Electricity", "Water"] },
      { station: "use", title: "The building", body: "Beams carry floors and roofs in buildings, bridges and factories — for decades.", where: "Construction sites, cities", needs: ["Design", "Maintenance"] },
      { station: "end", title: "Scrap and recycling", body: "Steel can be melted and reused many times without losing quality, so scrap is a valuable input.", where: "Scrap yards, electric furnaces", needs: ["Demolition", "Sorting", "Electricity"] },
    ],
  },
  {
    slug: "smartphone", name: "Smartphone", article: "A smartphone", system: "energy-and-industry",
    mappedVia: "Technology is not yet mapped as its own system, so the phone is followed through Energy & industry — the mining, refining, manufacturing and power behind it.",
    line: "Dozens of materials from mines on several continents, in a device you replace every few years.",
    steps: [
      { station: "production", title: "Mines", body: "A phone contains copper, gold, tin, lithium, cobalt, rare-earth elements and more — each mined in different places.", where: "Metal mines", needs: ["Energy", "Water", "Labour"], nature: "Each mine has its own footprint on land and water.", atlas: ["truecolor"] },
      { station: "processing", title: "Refining", body: "Ores are concentrated and refined into pure metals and chemicals, often far from the mine.", where: "Refineries and smelters", needs: ["Electricity", "Chemicals", "Heat"], atlas: ["emissions"] },
      { station: "processing", title: "Chips and screens", body: "Chips are made in ultra-clean factories; screens, batteries and cameras in others. Each part may come from a different country.", where: "Chip fabs, component factories", needs: ["Very pure water", "Electricity", "Specialised gases"] },
      { station: "processing", title: "Assembly", body: "Hundreds of parts are assembled, tested and boxed.", where: "Assembly plants", needs: ["Labour", "Electricity"] },
      { station: "movement", title: "Shipping", body: "Phones are flown or shipped to distribution centres and shops worldwide.", where: "Airports, ports, warehouses", needs: ["Fuel"] },
      { station: "use", title: "Use and charging", body: "Charging uses electricity at home, and the networks and data centres a phone relies on use electricity too.", where: "Homes, networks, data centres", needs: ["Electricity", "Networks"], atlas: ["night"] },
      { station: "end", title: "E-waste and recovery", body: "Old phones are kept in drawers, refurbished, recycled — or lost to landfill and informal recycling. Recovering small amounts of many metals is difficult.", where: "Drawers, repair shops, recyclers", needs: ["Collection", "Repair", "Recycling plants"] },
    ],
  },
];

export const objectBySlug = (slug: string) => OBJECTS.find((o) => o.slug === slug);
