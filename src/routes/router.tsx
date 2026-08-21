import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/v5/Home";
import { DomainsIndex, DomainWorld } from "@/pages/v5/Domains";
import { MissionDetail } from "@/pages/v5/Missions";
import { MissionsIndex } from "@/pages/v5/AllMissions";
import { ImpactLabIndex, ImpactTestJourney, PersonalImpactRecordPage } from "@/pages/integrated/ImpactPrototype";
import { ImpactPublicHome, ImpactStory } from "@/pages/integrated/ImpactPremium";
import { SpeciesIndex, SpeciesProfilePage } from "@/pages/integrated/Species";
import { SapiensFrontDoor, ActorsIndex, ActorProfilePage, InnovationProfilePage } from "@/pages/integrated/SapiensSystemsProfiles";
import { Brands, Partners, Funders } from "@/pages/v5/Entry";
import Join from "@/pages/v5/Join";
import { LivingSystems, LivingSystemJourney } from "@/pages/v5/LivingSystems";
import { Reports } from "@/pages/v5/Reports";
import { About } from "@/pages/v5/About";
import { Stories, CultureFilm, CulturePlay } from "@/pages/v5/Culture";
import Privacy from "@/pages/v5/Privacy";
import { StoryArticle } from "@/pages/v5/StoryArticle";
import { NotFound } from "@/pages/system";

const PublicWorld = lazy(() => import("@/earth/PublicWorld"));
const JaguarWorld = lazy(() => import("@/pages/integrated/JaguarWorld"));
const HomoSapiensWorld = lazy(() => import("@/pages/integrated/HomoSapiensWorld"));
const SapiensAtlasSandbox = lazy(() => import("@/pages/integrated/SapiensAtlasSandbox"));
const AmazonRainforest = lazy(() => import("@/pages/integrated/AmazonRainforest"));

const WorldFallback = (
  <div style={{ position: "fixed", inset: 0, background: "#080808" }} />
);

/**
 * S4PIENS can have its own domain surface without becoming a separate product,
 * repository, map engine or truth system. Whichever of these founder-owned
 * domains is attached in Cloudflare lands in the same Human Systems product.
 * 4planet.org keeps its existing home route unchanged.
 */
const SAPIENS_UNIVERSE_HOSTS = new Set([
  "s4piens.com",
  "www.s4piens.com",
  "s4pien.com",
  "www.s4pien.com",
  "s4piens.org",
  "www.s4piens.org",
  "s4pien.org",
  "www.s4pien.org",
]);

const isSapiensUniverseHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return SAPIENS_UNIVERSE_HOSTS.has(host) || host.startsWith("build-s4piens-universe-domain.");
};

const toImpact = <Navigate to="/impact" replace />;
const toJoin = <Navigate to="/join" replace />;
const toBrands = <Navigate to="/brands" replace />;
const toAbout = <Navigate to="/about" replace />;
const toHome = <Navigate to="/" replace />;
function MtoMission() { const { slug } = useParams(); return <Navigate to={"/missions/" + slug} replace />; }
function RedirectTestUnit() { const { unit } = useParams(); return <Navigate to={`/impact/lab/${unit}`} replace />; }
function RedirectRecord() { const { recordId } = useParams(); return <Navigate to={`/impact/lab/records/${recordId}`} replace />; }

function SapiensFoodEntry() {
  return <Suspense fallback={WorldFallback}><SapiensAtlasSandbox /></Suspense>;
}

export function AppRoutes() {
  const sapiensHost = isSapiensUniverseHost();
  return (
    <Routes>
      <Route path="/" element={sapiensHost ? <SapiensFrontDoor /> : <Home />} />
      <Route path="/story" element={<Navigate to="/" replace />} />
      <Route path="/domains" element={<DomainsIndex />} />
      <Route path="/domains/:key" element={<DomainWorld />} />
      <Route path="/missions" element={<MissionsIndex />} />
      <Route path="/missions/pl4stic" element={<Navigate to="/missions/cle4n" replace />} />
      <Route path="/missions/amazonia" element={<Navigate to="/missions/am4zonia" replace />} />
      <Route path="/missions/4ntarctica" element={<Navigate to="/missions/rewild-marine" replace />} />
      <Route path="/missions/rewild" element={<Navigate to="/missions/rewild-land" replace />} />
      <Route path="/missions/en3rgy" element={<Navigate to="/missions/en4rgy" replace />} />
      <Route path="/missions/4telier" element={<Navigate to="/missions/4rt" replace />} />
      <Route path="/culture/telier" element={<Navigate to="/missions/4rt" replace />} />
      <Route path="/domains/oce4n/pl4stic" element={<Navigate to="/missions/cle4n" replace />} />
      <Route path="/missions/:slug" element={<MissionDetail />} />
      <Route path="/atlas" element={<Suspense fallback={WorldFallback}><PublicWorld /></Suspense>} />
      <Route path="/sandbox/s4piens" element={<SapiensFoodEntry />} />
      <Route path="/food" element={sapiensHost ? <SapiensFoodEntry /> : <Navigate to="/missions/food" replace />} />
      <Route path="/human-systems" element={sapiensHost ? <SapiensFrontDoor /> : <Navigate to="/domains/s4piens" replace />} />
      <Route path="/actors" element={<ActorsIndex />} />
      <Route path="/actors/:slug" element={<ActorProfilePage />} />
      <Route path="/innovations/precision-nutrient-management" element={<InnovationProfilePage />} />
      <Route path="/innovations/:slug" element={<InnovationProfilePage />} />
      <Route path="/species" element={<SpeciesIndex />} />
      <Route path="/species/jaguar" element={<Suspense fallback={WorldFallback}><JaguarWorld /></Suspense>} />
      <Route path="/species/homo-sapiens" element={<Suspense fallback={WorldFallback}><HomoSapiensWorld /></Suspense>} />
      <Route path="/species/:slug" element={<SpeciesProfilePage />} />
      <Route path="/ecosystems/amazon-rainforest" element={<Suspense fallback={WorldFallback}><AmazonRainforest /></Suspense>} />
      <Route path="/impact" element={<ImpactPublicHome />} />
      <Route path="/impact/lab" element={<ImpactLabIndex />} />
      <Route path="/impact/lab/:unit" element={<ImpactTestJourney />} />
      <Route path="/impact/lab/records/:recordId" element={<PersonalImpactRecordPage />} />
      <Route path="/impact/test/:unit" element={<RedirectTestUnit />} />
      <Route path="/impact/record/:recordId" element={<RedirectRecord />} />
      <Route path="/impact/:slug" element={<ImpactStory />} />
      <Route path="/join" element={<Join />} />
      <Route path="/people" element={<Navigate to="/join" replace />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/funders" element={<Funders />} />
      <Route path="/living-systems" element={<LivingSystems />} />
      <Route path="/living-systems/:slug" element={<LivingSystemJourney />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/about" element={<About />} />
      <Route path="/stories" element={<Stories />} />
      <Route path="/stories/:slug" element={<StoryArticle />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/culture/film" element={<CultureFilm />} />
      <Route path="/culture/play" element={<CulturePlay />} />
      <Route path="/os" element={toAbout} />
      <Route path="/os/*" element={toAbout} />
      <Route path="/m/:slug" element={<MtoMission />} />
      <Route path="/m/:slug/support" element={toImpact} />
      <Route path="/m/:slug/campaign" element={toImpact} />
      <Route path="/marketplace" element={toImpact} />
      <Route path="/store" element={toImpact} />
      <Route path="/cart" element={toImpact} />
      <Route path="/checkout" element={toImpact} />
      <Route path="/members" element={toJoin} />
      <Route path="/ambassadors" element={toJoin} />
      <Route path="/portal/*" element={toImpact} />
      <Route path="/sponsors" element={toBrands} />
      <Route path="/oce4n" element={<Navigate to="/domains/oce4n" replace />} />
      <Route path="/e4rth" element={<Navigate to="/domains/e4rth" replace />} />
      <Route path="/s4piens" element={sapiensHost ? <SapiensFrontDoor /> : <Navigate to="/domains/s4piens" replace />} />
      <Route path="/4culture" element={<Navigate to="/domains/4culture" replace />} />
      <Route path="/magazine" element={toHome} />
      <Route path="/system" element={toHome} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
