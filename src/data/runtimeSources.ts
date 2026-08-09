/*
 * 4PLANET_ RUNTIME SOURCE DISCLOSURE EXPORT v1.0
 * DERIVATIVE from canonical Source Ingest rows checked 2026-08-09.
 * Knowledge OS remains canonical; this map exists only to make source links
 * reachable from the product without a live spreadsheet dependency.
 */

export interface RuntimeSourceRef {
  sourceId: string;
  label: string;
  publisher: string;
  url: string;
}

export const RUNTIME_SOURCES: Record<string, RuntimeSourceRef> = {
  "SRC-W02-USDA-HONEY-POLL-001": { sourceId: "SRC-W02-USDA-HONEY-POLL-001", label: "Pollination Ecology / honey-bee foraging", publisher: "USDA Agricultural Research Service", url: "https://www.ars.usda.gov/research/publications/publication/?seqNo115=260929" },
  "SRC-W02-CORBET-TEMP-001": { sourceId: "SRC-W02-CORBET-TEMP-001", label: "Temperature and the pollinating activity of social bees", publisher: "Ecological Entomology / Corbet et al.", url: "https://resjournals.onlinelibrary.wiley.com/doi/10.1111/j.1365-2311.1993.tb01075.x" },
  "SRC-W02-BUMBLE-TEMP-001": { sourceId: "SRC-W02-BUMBLE-TEMP-001", label: "Winter Active Bumblebees", publisher: "PLOS ONE / Stelzer et al.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2832779/" },
  "SRC-W02-KLEIN-POLLINATION-001": { sourceId: "SRC-W02-KLEIN-POLLINATION-001", label: "Importance of pollinators in changing landscapes for world crops", publisher: "Proceedings of the Royal Society B / Klein et al.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1702377/" },
  "SRC-W02-WOODCOCK-NEONIC-001": { sourceId: "SRC-W02-WOODCOCK-NEONIC-001", label: "Country-specific effects of neonicotinoid pesticides", publisher: "Science / Woodcock et al.", url: "https://pubmed.ncbi.nlm.nih.gov/28663502/" },
  "SRC-W02-BUMBLE-HABITAT-001": { sourceId: "SRC-W02-BUMBLE-HABITAT-001", label: "Habitat use and conservation of bumblebees", publisher: "Biological Conservation / Carvell", url: "https://www.sciencedirect.com/science/article/pii/S0006320701001148" },
  "SRC-W02-FAO-IPBES-POLL-001": { sourceId: "SRC-W02-FAO-IPBES-POLL-001", label: "Pollinators vital to our food supply under threat", publisher: "FAO reporting IPBES assessment", url: "https://www.fao.org/newsroom/detail/Pollinators-vital-to-our-food-supply-under-threat/en" },
  "SRC-W02-FAROE-COD-PP-001": { sourceId: "SRC-W02-FAROE-COD-PP-001", label: "Phytoplankton production and cod production on the Faroe Shelf", publisher: "ICES Journal of Marine Science", url: "https://academic.oup.com/icesjms/article/62/2/163/602260" },
  "SRC-W02-ROMAN-WHALE-PUMP-001": { sourceId: "SRC-W02-ROMAN-WHALE-PUMP-001", label: "The Whale Pump", publisher: "PLOS ONE / Roman & McCarthy", url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0013255" },
  "SRC-W02-NOAA-COD-001": { sourceId: "SRC-W02-NOAA-COD-001", label: "Atlantic Cod — Management", publisher: "NOAA Fisheries", url: "https://www.fisheries.noaa.gov/species/atlantic-cod/management" },
  "SRC-W02-DFO-NORTHERN-COD-001": { sourceId: "SRC-W02-DFO-NORTHERN-COD-001", label: "Northern cod stock-status background", publisher: "Fisheries and Oceans Canada", url: "https://www.dfo-mpo.gc.ca/publications/fisheries-peches/recreational-recreative/nfl-food-fishery-survey-sondage-peche-subsistance-tnl-eng.html" },
  "SRC-W02-ICES-NORTHSEA-001": { sourceId: "SRC-W02-ICES-NORTHSEA-001", label: "Greater North Sea ecosystem overview", publisher: "ICES", url: "https://www.ices.dk/advice/ESD/Pages/Greater_North_Sea_Landing.aspx" },
  "SRC-W02-NOAA-CRW-METHOD-001": { sourceId: "SRC-W02-NOAA-CRW-METHOD-001", label: "Version 3.1 Daily Global 5km Methodology", publisher: "NOAA Coral Reef Watch", url: "https://coralreefwatch.noaa.gov/product/5km/methodology.php" },
};

export const runtimeSource = (sourceId: string) => RUNTIME_SOURCES[sourceId];
