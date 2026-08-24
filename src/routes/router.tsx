import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/v5/Home";
import { DomainsIndex, DomainWorld } from "@/pages/v5/Domains";
import { MissionDetail } from "@/pages/v5/Missions";
import { MissionsIndex } from "@/pages/v5/AllMissions";
import { ImpactLabIndex, ImpactTestJourney, PersonalImpactRecordPage } from "@/pages/integrated/ImpactPrototype";
import { ImpactPublicHome, ImpactStory } from "@/pages/integrated/ImpactPremium";
import { SpeciesIndex, SpeciesProfilePage } from "@/pages/integrated/Species";
import { SpeciesEngineLab } from "@/pages/integrated/SpeciesEngineLab";
import { SpeciesRoute } from "@/pages/integrated/SpeciesRoute";
import { LensCapture } from "@/pages/lens/LensCapture";
import { FoodCapture } from "@/pages/sapiens/FoodCapture";
import { Brands, Partners, Funders } from "@/pages/v5/Entry";
import Join from "@/pages/v5/Join";
import { LivingSystems, LivingSystemJourney } from "@/pages/v5/LivingSystems";
import { Reports } from "@/pages/v5/Reports";
import { About } from "@/pages/v5/About";
import { CultureFilm, CulturePlay } from "@/pages/v5/Culture";
import Privacy from "@/pages/v5/Privacy";
import { NotFound } from "@/pages/system";

const PublicWorld = lazy(() => import("@/earth/PublicWorld"));
const Magazine = lazy(() => import("@/pages/v5/Magazine"));
const StoryArticle = lazy(() => import("@/pages/v5/StoryArticle").then((module) => ({ default: module.StoryArticle })));
const MagazineAbout = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineAbout })));
const MagazineSources = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineSources })));
const MagazineCorrections = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineCorrections })));
const MagazinePrivacy = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazinePrivacy })));
const MagazineAtlas = lazy(() => import("@/pages/v5/MagazineAtlas").then((module) => ({ default: module.MagazineAtlas })));
const MagazineStoryRecord = lazy(() => import("@/pages/v5/MagazineStoryRecord").then((module) => ({ default: module.MagazineStoryRecord })));
const MagazineSearch = lazy(() => import("@/pages/v5/MagazineLibrary").then((module) => ({ default: module.MagazineSearch })));
const MagazineSaved = lazy(() => import("@/pages/v5/MagazineLibrary").then((module) => ({ default: module.MagazineSaved })));
const MagazineArchive = lazy(() => import("@/pages/v5/MagazineLibrary").then((module) => ({ default: module.MagazineArchive })));
const MagazineSignalPage = lazy(() => import("@/pages/v5/MagazineSignal").then((module) => ({ default: module.MagazineSignalPage })));
const MagazineTopicHub = lazy(() => import("@/pages/v5/MagazineHub").then((module) => ({ default: module.MagazineTopicHub })));
const MagazineSeriesHub = lazy(() => import("@/pages/v5/MagazineHub").then((module) => ({ default: module.MagazineSeriesHub })));
const ActorsIndex = lazy(() => import("@/pages/v5/ActorGold").then((module) => ({ default: module.ActorsIndex })));
const ActorProfile = lazy(() => import("@/pages/v5/ActorGold").then((module) => ({ default: module.ActorProfilePage })));

const WorldFallback = <div style={{ position: "fixed", inset: 0, background: "#080808" }} />;
const MagazineFallback = <div aria-hidden style={{ minHeight: "100vh", background: "#fff" }} />;
const ActorFallback = <div aria-hidden style={{ minHeight: "100vh", background: "#080b10" }} />;

const toImpact = <Navigate to="/impact" replace />;
const toJoin = <Navigate to="/join" replace />;
const toBrands = <Navigate to="/brands" replace />;
const toAbout = <Navigate to="/about" replace />;
const toHome = <Navigate to="/" replace />;
function MtoMission() { const { slug } = useParams(); return <Navigate to={"/missions/" + slug} replace />; }
function RedirectTestUnit() { const { unit } = useParams(); return <Navigate to={`/impact/lab/${unit}`} replace />; }
function RedirectRecord() { const { recordId } = useParams(); return <Navigate to={`/impact/lab/records/${recordId}`} replace />; }

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
      <Route path="/missions/m4gazine" element={<Navigate to="/magazine" replace />} />
      <Route path="/culture/telier" element={<Navigate to="/missions/4rt" replace />} />
      <Route path="/domains/oce4n/pl4stic" element={<Navigate to="/missions/cle4n" replace />} />
      <Route path="/missions/:slug" element={<MissionDetail />} />
      <Route path="/atlas" element={<Suspense fallback={WorldFallback}><PublicWorld /></Suspense>} />
      <Route path="/species" element={<SpeciesIndex />} />
      <Route path="/species/lab" element={<SpeciesEngineLab />} />
      <Route path="/species/:slug" element={<SpeciesRoute curatedElement={<SpeciesProfilePage />} />} />
      <Route path="/lens" element={<LensCapture />} />
      <Route path="/food/lens" element={<FoodCapture />} />
      <Route path="/s4piens/food/lens" element={<FoodCapture />} />
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
      <Route path="/actors" element={<Suspense fallback={ActorFallback}><ActorsIndex /></Suspense>} />
      <Route path="/actors/:slug" element={<Suspense fallback={ActorFallback}><ActorProfile /></Suspense>} />
      <Route path="/funders" element={<Funders />} />
      <Route path="/living-systems" element={<LivingSystems />} />
      <Route path="/living-systems/:slug" element={<LivingSystemJourney />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/about" element={<About />} />
      <Route path="/magazine" element={<Suspense fallback={MagazineFallback}><Magazine /></Suspense>} />
      <Route path="/magazine/about" element={<Suspense fallback={MagazineFallback}><MagazineAbout /></Suspense>} />
      <Route path="/magazine/sources" element={<Suspense fallback={MagazineFallback}><MagazineSources /></Suspense>} />
      <Route path="/magazine/corrections" element={<Suspense fallback={MagazineFallback}><MagazineCorrections /></Suspense>} />
      <Route path="/magazine/privacy" element={<Suspense fallback={MagazineFallback}><MagazinePrivacy /></Suspense>} />
      <Route path="/magazine/atlas" element={<Suspense fallback={MagazineFallback}><MagazineAtlas /></Suspense>} />
      <Route path="/magazine/search" element={<Suspense fallback={MagazineFallback}><MagazineSearch /></Suspense>} />
      <Route path="/magazine/saved" element={<Suspense fallback={MagazineFallback}><MagazineSaved /></Suspense>} />
      <Route path="/magazine/archive" element={<Suspense fallback={MagazineFallback}><MagazineArchive /></Suspense>} />
      <Route path="/magazine/topics/:topic" element={<Suspense fallback={MagazineFallback}><MagazineTopicHub /></Suspense>} />
      <Route path="/magazine/series/:series" element={<Suspense fallback={MagazineFallback}><MagazineSeriesHub /></Suspense>} />
      <Route path="/magazine/signals/:slug" element={<Suspense fallback={MagazineFallback}><MagazineSignalPage /></Suspense>} />
      <Route path="/magazine/stories/:id" element={<Suspense fallback={MagazineFallback}><MagazineStoryRecord /></Suspense>} />
      <Route path="/magazine/:slug" element={<Suspense fallback={MagazineFallback}><StoryArticle /></Suspense>} />
      <Route path="/stories" element={<Navigate to="/magazine" replace />} />
      <Route path="/stories/:slug" element={<Suspense fallback={MagazineFallback}><StoryArticle /></Suspense>} />
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
      <Route path="/s4piens" element={<Navigate to="/domains/s4piens" replace />} />
      <Route path="/4culture" element={<Navigate to="/domains/4culture" replace />} />
      <Route path="/system" element={toHome} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
