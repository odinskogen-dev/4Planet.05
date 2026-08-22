export type FoodProofSignal = {
  id: string;
  theme: "CLIMATE" | "WATER" | "WASTE";
  value: string;
  label: string;
  context: string;
  source: string;
  sourceUrl: string;
  dataYear: string;
  checkedOn: string;
  limitation: string;
};

/**
 * A deliberately tiny Gold Standard evidence set for first-contact comprehension.
 * These are global context signals, not causal attribution to a person, product,
 * farm, company or place. Keep the source year and boundary attached in public UI.
 */
export const FOOD_PROOF_SIGNALS: FoodProofSignal[] = [
  {
    id: "agrifood-ghg-2023",
    theme: "CLIMATE",
    value: "32%",
    label: "of global anthropogenic greenhouse-gas emissions",
    context: "FAO reports 16.5 Gt CO₂e from agrifood systems in 2023, spanning farm-gate activity, land-use change and pre/post-production supply-chain processes.",
    source: "FAO · FAOSTAT",
    sourceUrl: "https://www.fao.org/statistics/highlights-archive/highlights-detail/greenhouse-gas-emissions-from-agrifood-systems.-global--regional-and-country-trends--2001-2023/en",
    dataYear: "2023",
    checkedOn: "2026-08-19",
    limitation: "Global agrifood-system accounting. It does not assign responsibility to an individual consumer, company, commodity or location.",
  },
  {
    id: "agriculture-water-share",
    theme: "WATER",
    value: "72%",
    label: "of global freshwater withdrawals",
    context: "FAO describes agriculture as the largest global water user, with irrigation the primary driver of agricultural withdrawals.",
    source: "FAO · Land & Water",
    sourceUrl: "https://www.fao.org/land-water/water/agricultural-water-management/water-accounting/en",
    dataYear: "GLOBAL CONTEXT",
    checkedOn: "2026-08-19",
    limitation: "A global share. Local water pressure varies sharply by basin, season, crop, irrigation system and water source.",
  },
  {
    id: "consumer-food-waste-2022",
    theme: "WASTE",
    value: "1.05B t",
    label: "of food waste generated in 2022",
    context: "UNEP's Food Waste Index 2024 estimates 1.05 billion tonnes of food waste at retail, food-service and household level — almost one-fifth of food available to consumers.",
    source: "UNEP · Food Waste Index 2024",
    sourceUrl: "https://www.unep.org/resources/publication/food-waste-index-report-2024",
    dataYear: "2022",
    checkedOn: "2026-08-19",
    limitation: "Food waste at retail, food-service and household level, including inedible parts. It is not the same measure as upstream food loss before retail.",
  },
];
