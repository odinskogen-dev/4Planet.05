import { lazy } from "react";

export const LabsOverview = lazy(() => import("@/pages/labs/LabsOverview"));
export const DomainsIndex = lazy(() => import("@/pages/v5/Domains").then((m) => ({ default: m.DomainsIndex })));
export const DomainWorld = lazy(() => import("@/pages/v5/Domains").then((m) => ({ default: m.DomainWorld })));
export const MissionDetail = lazy(() => import("@/pages/v5/Missions").then((m) => ({ default: m.MissionDetail })));
export const MissionsIndex = lazy(() => import("@/pages/v5/AllMissions").then((m) => ({ default: m.MissionsIndex })));

export const ImpactLabIndex = lazy(() => import("@/pages/integrated/ImpactPrototype").then((m) => ({ default: m.ImpactLabIndex })));
export const ImpactTestJourney = lazy(() => import("@/pages/integrated/ImpactPrototype").then((m) => ({ default: m.ImpactTestJourney })));
export const PersonalImpactRecordPage = lazy(() => import("@/pages/integrated/ImpactPrototype").then((m) => ({ default: m.PersonalImpactRecordPage })));
export const ImpactPublicHome = lazy(() => import("@/pages/integrated/ImpactPremium").then((m) => ({ default: m.ImpactPublicHome })));
export const ImpactStory = lazy(() => import("@/pages/integrated/ImpactPremium").then((m) => ({ default: m.ImpactStory })));
export const BayActionProof = lazy(() => import("@/pages/integrated/ImpactActionProof").then((m) => ({ default: m.BayActionProof })));

export const CheckoutReturn = lazy(() => import("@/pages/integrated/CheckoutReturn"));
export const CommerceStripeLab = lazy(() => import("@/pages/integrated/CommerceStripeLab"));
export const CompanyGoldTony = lazy(() => import("@/pages/integrated/CompanyGoldTony"));

export const SpeciesIndex = lazy(() => import("@/pages/integrated/Species").then((m) => ({ default: m.SpeciesIndex })));
export const SpeciesProfilePage = lazy(() => import("@/pages/integrated/Species").then((m) => ({ default: m.SpeciesProfilePage })));
export const SpeciesEngineLab = lazy(() => import("@/pages/integrated/SpeciesEngineLab").then((m) => ({ default: m.SpeciesEngineLab })));
export const SpeciesRoute = lazy(() => import("@/pages/integrated/SpeciesRoute").then((m) => ({ default: m.SpeciesRoute })));
export const PlacesIndex = lazy(() => import("@/pages/integrated/Places").then((m) => ({ default: m.PlacesIndex })));
export const PlaceRoute = lazy(() => import("@/pages/integrated/Places").then((m) => ({ default: m.PlaceRoute })));
export const AtlasDiscoveryPage = lazy(() => import("@/pages/integrated/AtlasDiscoveryPage").then((m) => ({ default: m.AtlasDiscoveryPage })));

export const DiscoveryTopicPage = lazy(() => import("@/pages/discovery/DiscoveryEngine").then((m) => ({ default: m.DiscoveryTopicPage })));
export const EarthNowPage = lazy(() => import("@/pages/discovery/DiscoveryEngine").then((m) => ({ default: m.EarthNowPage })));

export const LensCapture = lazy(() => import("@/pages/lens/LensCapture").then((m) => ({ default: m.LensCapture })));
export const FoodCapture = lazy(() => import("@/pages/sapiens/FoodCapture").then((m) => ({ default: m.FoodCapture })));
export const PickPrototype = lazy(() => import("../food/PickPrototype"));
export const FourFinanceHome = lazy(() => import("../pages/sapien/FourSapien").then((m) => ({ default: m.FourFinanceHome })));
export const FourSapienHome = lazy(() => import("../pages/sapien/FourSapien").then((m) => ({ default: m.FourSapienHome })));

export const People = lazy(() => import("@/pages/v5/Entry").then((m) => ({ default: m.People })));
export const Brands = lazy(() => import("@/pages/v5/Entry").then((m) => ({ default: m.Brands })));
export const Partners = lazy(() => import("@/pages/v5/Entry").then((m) => ({ default: m.Partners })));
export const Funders = lazy(() => import("@/pages/v5/Entry").then((m) => ({ default: m.Funders })));
export const Join = lazy(() => import("@/pages/v5/Join"));

export const LivingSystemJourney = lazy(() => import("@/pages/v5/LivingSystems").then((m) => ({ default: m.LivingSystemJourney })));
export const PlanetProofPage = lazy(() => import("@/pages/v5/PlanetProof").then((m) => ({ default: m.PlanetProofPage })));
export const Reports = lazy(() => import("@/pages/v5/Reports").then((m) => ({ default: m.Reports })));
export const About = lazy(() => import("@/pages/v5/About").then((m) => ({ default: m.About })));
export const AboutStory = lazy(() => import("@/pages/v5/AboutPages").then((m) => ({ default: m.AboutStory })));
export const AboutSystem = lazy(() => import("@/pages/v5/AboutPages").then((m) => ({ default: m.AboutSystem })));
export const WhatWeBelieve = lazy(() => import("@/pages/v5/AboutPages").then((m) => ({ default: m.WhatWeBelieve })));
export const Founder = lazy(() => import("@/pages/v5/AboutPages").then((m) => ({ default: m.Founder })));
export const CulturePlay = lazy(() => import("@/pages/v5/Culture").then((m) => ({ default: m.CulturePlay })));
export const MarketHome = lazy(() => import("@/pages/v5/CreatorMarket").then((m) => ({ default: m.MarketHome })));
export const OdinCreatorPage = lazy(() => import("@/pages/v5/CreatorMarket").then((m) => ({ default: m.OdinCreatorPage })));
export const Privacy = lazy(() => import("@/pages/v5/Privacy"));
export const PlanetSignal = lazy(() => import("@/pages/v5/PlanetSignal"));

export const DISCOVERY_TOPIC_SLUGS = [
  "wildfires",
  "earthquakes",
  "climate-change",
  "biodiversity",
  "deforestation",
  "plastic-pollution",
  "coral-bleaching",
  "air-quality",
  "orca",
  "whales",
  "bees",
  "amazon-rainforest",
  "oslofjord",
  "renewable-energy",
  "solar-energy",
  "food-waste",
  "fast-fashion",
  "rewilding",
  "climate-solutions",
  "environmental-jobs",
] as const;
