// ATLAS flagship research candidate · 2026-10-22
// Existing 250 canonical place identities are unchanged. Source-reviewed
// content is held from public release pending Founder editorial approval.
// 20 eligible released place slugs: 9 evidence-enhanced candidates, 1 Kenya
// already released, 10 explicitly unverified source-scoping candidates.
export const ATLAS_FLAGSHIP_COHORT = [
  {
    "rank": 1,
    "slug": "brazil",
    "status": "EVIDENCE_READY",
    "focus": "Brazilian Amazon, legal Amazon vs country",
    "priorityReason": "GSC Amazon-basin query signals; forest monitoring; Living Systems",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 2,
    "slug": "australia",
    "status": "EVIDENCE_READY",
    "focus": "National biodiversity and GBR reef contexts",
    "priorityReason": "Official State of Environment, reef science",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 3,
    "slug": "norway",
    "status": "EVIDENCE_READY",
    "focus": "National biodiversity observations and monitoring",
    "priorityReason": "Direct 4PLANET mission and Oslofjord",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 4,
    "slug": "oslo",
    "status": "EVIDENCE_READY",
    "focus": "Oslofjord urban-coastal relationship (not identical boundaries)",
    "priorityReason": "Existing Oslofjord case and national official assessments",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 5,
    "slug": "nairobi",
    "status": "EVIDENCE_READY",
    "focus": "Nairobi River basin urban restoration project",
    "priorityReason": "UN-Habitat source-specific case",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 6,
    "slug": "cape-town",
    "status": "EVIDENCE_READY",
    "focus": "Table Mountain fynbos and protected park",
    "priorityReason": "SANParks source",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 7,
    "slug": "vancouver",
    "status": "EVIDENCE_READY",
    "focus": "City natural-area restoration, marine and terrestrial links",
    "priorityReason": "City Biodiversity Strategy",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 8,
    "slug": "singapore",
    "status": "EVIDENCE_READY",
    "focus": "Nature ways, ecological connectors",
    "priorityReason": "NParks City in Nature and Singapore BiodiversitySG",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 9,
    "slug": "london",
    "status": "EVIDENCE_READY",
    "focus": "Greater London documented heat trends",
    "priorityReason": "UK Met Office regional report",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 10,
    "slug": "kenya",
    "status": "EVIDENCE_READY_EXISTING",
    "focus": "Existing fully source-validated country dossier",
    "priorityReason": "Preserve existing Kenya curated graph exactly",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 11,
    "slug": "rio-de-janeiro",
    "status": "SOURCE_SCOPING",
    "focus": "Local coastal ecosystem and water-quality sources needed",
    "priorityReason": "National datasets cannot prove local reef/bay condition",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 12,
    "slug": "sao-paulo",
    "status": "SOURCE_SCOPING",
    "focus": "Local green-space and city heat observations needed",
    "priorityReason": "Brazil's Amazon data cannot be applied to São Paulo",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 13,
    "slug": "sydney",
    "status": "SOURCE_SCOPING",
    "focus": "City coastline habitats and local surveys needed",
    "priorityReason": "Australia national assessment insufficient for city condition",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 14,
    "slug": "jakarta",
    "status": "SOURCE_SCOPING",
    "focus": "Urban watershed and flood observations needed",
    "priorityReason": "Regional headlines insufficient",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 15,
    "slug": "lima",
    "status": "SOURCE_SCOPING",
    "focus": "Coastal marine biodiversity source and dates needed",
    "priorityReason": "No locality-specific verified evidence yet",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 16,
    "slug": "quito",
    "status": "SOURCE_SCOPING",
    "focus": "Andean metropolitan ecological corridors needed",
    "priorityReason": "No locality-specific verified evidence yet",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 17,
    "slug": "delhi",
    "status": "SOURCE_SCOPING",
    "focus": "Local ground-monitor air quality and urban nature needed",
    "priorityReason": "WHO national/city aggregates not live measurements",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 18,
    "slug": "tokyo",
    "status": "SOURCE_SCOPING",
    "focus": "City habitat, heat, local observation series needed",
    "priorityReason": "No locality-specific verified evidence yet",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 19,
    "slug": "cairo",
    "status": "SOURCE_SCOPING",
    "focus": "Nile city water/heat field data needed",
    "priorityReason": "No locality-specific verified evidence yet",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  },
  {
    "rank": 20,
    "slug": "mexico-city",
    "status": "SOURCE_SCOPING",
    "focus": "High-elevation urban ecology and ground-monitor data needed",
    "priorityReason": "No locality-specific verified evidence yet",
    "demand": "HYPOTHESIS_UNLESS_GSC_PAGE_QUERY_VERIFIED"
  }
];
export const ATLAS_FLAGSHIP_EVIDENCE = {
  "brazil": {
    "explanation": "Brazil is not synonymous with the Amazon basin. INPE's PRODES estimates annual clearing within defined Brazilian monitoring areas; DETER supplies alerts for enforcement rather than a verified current inventory of all forest loss. The Amazon rainforest is also transboundary, so a single national map centre cannot represent the entire ecological system.",
    "ecosystems": [
      "Brazilian Amazon forest and linked hydrological systems, geographically scoped to PRODES areas",
      "Cerrado and other Brazilian biomes require separately defined datasets"
    ],
    "sources": [
      {
        "label": "INPE — how Amazon deforestation monitoring works",
        "url": "https://www.gov.br/inpe/pt-br/acesso-a-informacao/perguntas-frequentes/principais-produtos-e-servicos-do-inpe/monitoramento-do-territorio-florestas/como-se-monitora-o-desmatamento",
        "use": "PRODES annual deforestation assessment differs from DETER alerts",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "INPE — consolidated 2025 monitoring period",
        "url": "https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/sistema-do-inpe-aponta-5-731-km2-de-desmatamento-na-amazonia-em-2025",
        "use": "Historical assessment with explicit August 2024–July 2025 observation period",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Living Systems — Amazon rainforest",
        "https://4planet.org/livingsystems/ecosystems/EC_AMAZON_RAINFOREST/"
      ],
      [
        "Deforestation: what the map does not prove",
        "https://4planet.org/deforestation"
      ],
      [
        "Amazon forests versus the Amazon basin",
        "https://4planet.org/amazon-rainforest"
      ]
    ],
    "truthBoundary": "These sources describe national monitoring scopes and historical reporting periods. They cannot establish conditions at the ATLAS Brazil reference coordinate or outside PRODES/DETER coverage."
  },
  "australia": {
    "explanation": "Australia's State of the Environment 2021 synthesises biodiversity changes and highlights threats from land clearing, introduced species and climate change. The Great Barrier Reef is one coastal ecosystem, not a substitute for the state of all Australian waters or continental biodiversity.",
    "ecosystems": [
      "Australian terrestrial biodiversity and threatened ecosystems (national assessment)",
      "Great Barrier Reef marine ecosystem, geographically bounded to its own reef region"
    ],
    "sources": [
      {
        "label": "Australian Government — biodiversity assessment",
        "url": "https://soe.dcceew.gov.au/overview/environment/biodiversity",
        "use": "2021 national biodiversity assessment with known reporting gaps",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "Great Barrier Reef Marine Park Authority — Outlook 2024",
        "url": "https://www.gbrmpa.gov.au/our-work/outlook-report-2024",
        "use": "Separate reef-region scientific assessment, not a national ocean-state score",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Coral bleaching: heat stress is not observed mortality",
        "https://4planet.org/coral-bleaching"
      ],
      [
        "Living Systems — Great Barrier Reef",
        "https://4planet.org/living-systems/great-barrier-reef"
      ],
      [
        "Climate change",
        "https://4planet.org/climate-change"
      ]
    ],
    "truthBoundary": "National ecosystem trends and GBR reports should never be read as measurements at Australia's reference coordinate. Field survey and date are required for regional status."
  },
  "norway": {
    "explanation": "Norwegian environment authorities publish monitoring of threatened species and habitat management, but national species and habitat summaries cannot be projected onto every town or fjord. The Oslofjord provides a separate, geographically limited case linked to 4PLANET's evidence model.",
    "ecosystems": [
      "Norwegian threatened species and habitats monitored under defined programmes",
      "Oslofjord coastal ecosystem — separate local scope"
    ],
    "sources": [
      {
        "label": "Norwegian Environment Agency — monitored effects of threatened-nature interventions, 2025",
        "url": "https://www.miljodirektoratet.no/publikasjoner/2026/februar-2026/overvaking-av-effekter-av-tiltak-for-trua-natur-i-2025/",
        "use": "2025 monitoring report covers ten species and one habitat type, not a universal nature index",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "Norwegian Environment Agency — state of Oslofjord 2025",
        "url": "https://www.miljodirektoratet.no/publikasjoner/2025/januar-2025/tilstandsrapport-for-oslofjorden/",
        "use": "Regional assessment, distinct from national overview",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Oslofjord: evidence and environmental pressures",
        "https://4planet.org/oslofjord"
      ],
      [
        "Living Systems — Oslofjord",
        "https://4planet.org/living-systems/oslofjord"
      ],
      [
        "4PLANET biodiversity",
        "https://4planet.org/biodiversity"
      ]
    ],
    "truthBoundary": "Norway country geography, individual species monitoring and the Oslofjord are different scales. No national ecological health score or local trend is inferred here."
  },
  "oslo": {
    "explanation": "Oslo is an urban place by the Oslofjord, but city boundaries do not describe the whole fjord. Norway's 2025 Oslofjord state assessment documents the regional system; the 4PLANET case separates whole-fjord evidence from narrower Bunnefjorden-specific hypotheses and observations.",
    "ecosystems": [
      "Inner Oslofjord coastal urban interface",
      "Bunnefjorden case — narrower study area; not an Oslo citywide status"
    ],
    "sources": [
      {
        "label": "Norwegian Environment Agency — Oslofjord state assessment 2025",
        "url": "https://www.miljodirektoratet.no/publikasjoner/2025/januar-2025/tilstandsrapport-for-oslofjorden/",
        "use": "Regional ecological evidence and pressure context",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "Norwegian Environment Agency — follow-up Oslofjord measures 2026",
        "url": "https://www.miljodirektoratet.no/aktuelt/nyheter/2026/april-2026/oslofjorden-ma-fa-flere-miljotiltak/",
        "use": "Policy interventions and status communication; not evidence that interventions worked",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Oslofjord ecosystem evidence guide",
        "https://4planet.org/oslofjord"
      ],
      [
        "Living Systems — Oslofjord proof case",
        "https://4planet.org/living-systems/oslofjord"
      ],
      [
        "4NATION decisions — evidence and status",
        "https://4nation.org/"
      ]
    ],
    "truthBoundary": "Oslo coordinates locate the city, not the sea basin. The published regional study is not a measurement at this point; implementation does not establish outcome."
  },
  "nairobi": {
    "explanation": "UN-Habitat's 2025 nature-based urban regeneration guide identifies Nairobi Rivers Regeneration as a river-basin scale case where restoration and livelihoods can be evaluated together. River recovery is an intervention pathway, not proof that every Nairobi watercourse has improved.",
    "ecosystems": [
      "Nairobi river catchment and urban green-blue infrastructure (case-study scale)"
    ],
    "sources": [
      {
        "label": "UN-Habitat — Nature-based Solutions in Urban Regeneration (2025)",
        "url": "https://unhabitat.org/nature-based-solutions-in-urban-regeneration",
        "use": "Nairobi river-basin case and criteria for evaluating outcomes",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "UN-Habitat — integrating Nature-based Solutions into Urban Planning (2025)",
        "url": "https://unhabitat.org/integrating-nature-based-solutions-into-urban-territorial-planning",
        "use": "Planning method, not a local performance survey",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "ATLAS Kenya — separately sourced national habitat graph",
        "https://4planetatlas.com/place/kenya"
      ],
      [
        "Biodiversity and ecosystem function",
        "https://4planet.org/biodiversity"
      ],
      [
        "Impact — intervention versus measured outcome",
        "https://4planet.org/impact"
      ]
    ],
    "truthBoundary": "UN-Habitat's Nairobi example is a programme description. Actual pollutant trends, biodiversity recovery and social outcomes require programme-specific independent monitoring."
  },
  "cape-town": {
    "explanation": "Table Mountain National Park sits within the Cape Floral Region; South African National Parks describes its fynbos and other vegetation. These protected-area descriptions are not a survey of all Cape Town neighbourhoods or the surrounding marine ecosystem.",
    "ecosystems": [
      "Table Mountain National Park fynbos and Afromontane vegetation (protected-area scope)"
    ],
    "sources": [
      {
        "label": "South African National Parks — Table Mountain National Park",
        "url": "https://www.sanparks.org/wp-content/uploads/2021/04/tmnp_brochure.pdf",
        "use": "Fynbos and park biodiversity, protected-area rather than metro scope",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "UN-Habitat — urban nature planning method (2025)",
        "url": "https://unhabitat.org/integrating-nature-based-solutions-into-urban-territorial-planning",
        "use": "General city-scale nature-based planning framework; does not establish Cape Town trends",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Explore ecological dependencies",
        "https://4planet.org/livingsystems/dependencies/"
      ],
      [
        "Biodiversity and habitat limitations",
        "https://4planet.org/biodiversity"
      ]
    ],
    "truthBoundary": "Park biodiversity is documented for Table Mountain National Park, not every site within Cape Town. No urban species abundance is inferred."
  },
  "vancouver": {
    "explanation": "Vancouver's own Biodiversity Strategy explicitly connects the city's marine and terrestrial ecosystems and commits to restoring forests, wetlands and shorelines. A policy strategy states intended work; it is not itself a post-intervention species or habitat outcome.",
    "ecosystems": [
      "Municipal forest and wetland habitat restoration",
      "Marine and terrestrial ecosystem connections within the city strategy"
    ],
    "sources": [
      {
        "label": "City of Vancouver — Biodiversity Strategy",
        "url": "https://vancouver.ca/parks-recreation-culture/biodiversity.aspx",
        "use": "Official municipal strategy, restoration targets and ecological framing",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "UN-Habitat — urban nature-based design (2025)",
        "url": "https://unhabitat.org/nature-based-solutions-in-urban-regeneration",
        "use": "Methodological context, not a Vancouver field assessment",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Biodiversity — drivers and field data",
        "https://4planet.org/biodiversity"
      ],
      [
        "Living Systems — dependencies",
        "https://4planet.org/livingsystems/dependencies/"
      ]
    ],
    "truthBoundary": "Municipal planning statements are not verified ecological outcomes. Site-specific measurements, monitoring periods and species datasets are not yet joined."
  },
  "singapore": {
    "explanation": "Singapore's National Parks Board documents a City in Nature programme with nature-park networks, naturalised parks and ecological corridors. Its Nature Ways connect parks and reserves and are described for urban wildlife movement. These are planned or existing connectivity interventions, not proof of population recovery.",
    "ecosystems": [
      "Nature Ways and nature park networks, city-level planning scope",
      "Urban ecological connectivity for birds, butterflies and other wildlife described by NParks"
    ],
    "sources": [
      {
        "label": "NParks — City in Nature key strategies",
        "url": "https://www.nparks.gov.sg/who-we-are/city-in-nature-key-strategies",
        "use": "Primary official policy, planned networks and actions",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "BiodiversitySG NParks — Nature Ways in Singapore",
        "url": "https://biodiversitysg.nparks.gov.sg/our-ecosystems/terrestrial-and-freshwater-habitats/natureways-in-singapore/",
        "use": "Official urban linear habitat corridor explanation",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Bees and pollinator relationships",
        "https://4planet.org/bees"
      ],
      [
        "Biodiversity — records versus abundance",
        "https://4planet.org/biodiversity"
      ],
      [
        "IMPACT — intervention and outcomes",
        "https://4planet.org/impact"
      ]
    ],
    "truthBoundary": "Connectivity initiatives do not independently establish survival, dispersal success or trends for any species. Planned 2030 targets are not completed results."
  },
  "london": {
    "explanation": "The UK Met Office's State of the UK Climate 2025 reports a substantial rise in days above 30°C and warm nights in Greater London compared with 1961–1990. This is a documented regional trend; street-scale temperature and local nature-based interventions require separate observations.",
    "ecosystems": [
      "Urban green-blue infrastructure as a heat-adaptation research question, not a measured local effect"
    ],
    "sources": [
      {
        "label": "Met Office — State of the UK Climate 2025",
        "url": "https://www.metoffice.gov.uk/research/climate/maps-and-data/about/state-of-climate",
        "use": "Greater London heat statistics from assessment published July 2026",
        "checkedAt": "2026-10-22"
      },
      {
        "label": "Met Office — urban climate impacts",
        "url": "https://www.metoffice.gov.uk/research/climate/climate-impacts/urban",
        "use": "Urban heat islands and spatial modelling considerations",
        "checkedAt": "2026-10-22"
      }
    ],
    "relatedKnowledge": [
      [
        "Climate change — attribution and time scales",
        "https://4planet.org/climate-change"
      ],
      [
        "Urban ecological dependencies",
        "https://4planet.org/livingsystems/dependencies/"
      ],
      [
        "Air quality — what ground measurements mean",
        "https://4planet.org/air-quality"
      ]
    ],
    "truthBoundary": "Regional heat trends do not measure the ATLAS London reference point, and do not establish a cooling benefit from an unmeasured intervention."
  }
};
