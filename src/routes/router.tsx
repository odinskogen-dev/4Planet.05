import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/v5/Home";
import { DomainsIndex, DomainWorld } from "@/pages/v5/Domains";
import { MissionDetail } from "@/pages/v5/Missions";
import { MissionsIndex } from "@/pages/v5/AllMissions";
import { ImpactLabIndex, ImpactTestJourney, PersonalImpactRecordPage } from "@/pages/integrated/ImpactPrototype";
import { ImpactPublicHome, ImpactStory } from "@/pages/integrated/ImpactPremium";
import CheckoutReturn from "@/pages/integrated/CheckoutReturn";
import CommerceStripeLab from "@/pages/integrated/CommerceStripeLab";
import { SpeciesIndex, SpeciesProfilePage } from "@/pages/integrated/Species";
import { SpeciesEngineLab } from "@/pages/integrated/SpeciesEngineLab";
import { SpeciesRoute } from "@/pages/integrated/SpeciesRoute";
import { LensCapture } from "@/pages/lens/LensCapture";
import { FoodCapture } from "@/pages/sapiens/FoodCapture";
import PickPrototype from "../food/PickPrototype";
import { FourFinanceHome, FourSapienHome } from "../pages/sapien/FourSapien";
import { People, Brands, Partners, Funders } from "@/pages/v5/Entry";
import Join from "@/pages/v5/Join";
import { LivingSystems, LivingSystemJourney } from "@/pages/v5/LivingSystems";
import { Reports } from "@/pages/v5/Reports";
import { About } from "@/pages/v5/About";
import { AboutStory, AboutSystem, Founder } from "@/pages/v5/AboutPages";
import { CultureFilm, CulturePlay } from "@/pages/v5/Culture";
import Privacy from "@/pages/v5/Privacy";
import { NotFound } from "@/pages/system";

const PublicWorld = lazy(() => import("@/earth/PublicWorld"));
const LumeRoom = lazy(() => import("@/pages/v5/LumeRoom"));
const Magazine = lazy(() => import("@/pages/v5/Magazine"));
const StoryArticle = lazy(() => import("@/pages/v5/StoryArticle").then((module) => ({ default: module.StoryArticle })));
const MagazineAbout = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineAbout })));
const MagazineSources = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineSources })));
const MagazineCorrections = lazy(() => import("@/pages/v5/MagazineInfo").then((module) => ({ default: module.MagazineCorrections })));
const MagazineStoryRecord = lazy(() => import("@/pages/v5/MagazineStoryRecord").then((module) => ({ default: module.MagazineStoryRecord })));
const ActorsIndex = lazy(() => import("@/pages/v5/ActorGold").then((module) => ({ default: module.ActorsIndex })));
const ActorProfile = lazy(() => import("@/pages/v5/ActorGold").then((module) => ({ default: module.ActorProfilePage })));
const FindYourWayToHelp = lazy(() => import("@/pages/v5/Participation").then((module) => ({ default: module.FindYourWayToHelp })));
const PitchHub = lazy(() => import("@/pages/v5/PitchHub"));

const WorldFallback = (
  <div style={{ position: "fixed", inset: 0, background: "#080808" }} />
);

const MagazineFallback = (
  <div aria-hidden style={{ minHeight: "100vh", background: "#fff" }} />
);

const ActorFallback = (
  <div aria-hidden style={{ minHeight: "100vh", background: "#080b10" }} />
);

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
      <Route path="/present" element={<Suspense fallback={MagazineFallback}><PitchHub /></Suspense>} />
      <Route path="/pitch" element={<Navigate to="/present" replace />} />
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
      <Route path="/species/orca/lume" element={<Suspense fallback={WorldFallback}><LumeRoom /></Suspense>} />
      <Route path="/species/:slug" element={<SpeciesRoute curatedElement={<SpeciesProfilePage />} />} />
      <Route path="/lens" element={<LensCapture />} />
      <Route path="/food/lens" element={<FoodCapture />} />
      <Route path="/s4piens/food/lens" element={<FoodCapture />} />
      <Route path="/4sapien" element={<FourSapienHome />} />
      <Route path="/4sapien/food" element={<PickPrototype />} />
      <Route path="/4sapien/finance" element={<FourFinanceHome />} />
      <Route path="/food/pick" element={<PickPrototype />} />
      <Route path="/impact" element={<ImpactPublicHome />} />
      <Route path="/impact/lab" element={<ImpactLabIndex />} />
      <Route path="/impact/lab/:unit" element={<ImpactTestJourney />} />
      <Route path="/impact/lab/records/:recordId" element={<PersonalImpactRecordPage />} />
      <Route path="/impact/test/:unit" element={<RedirectTestUnit />} />
      <Route path="/impact/record/:recordId" element={<RedirectRecord />} />
      <Route path="/impact/:slug" element={<ImpactStory />} />
      <Route path="/checkout/lab" element={<CommerceStripeLab />} />
      <Route path="/checkout/return" element={<CheckoutReturn />} />
      <Route path="/join" element={<Join />} />
      <Route path="/people" element={<People />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/actors" element={<Suspense fallback={ActorFallback}><ActorsIndex /></Suspense>} />
      <Route path="/actors/:slug" element={<Suspense fallback={ActorFallback}><ActorProfile /></Suspense>} />
      <Route path="/get-involved" element={<Suspense fallback={ActorFallback}><FindYourWayToHelp /></Suspense>} />
      <Route path="/funders" element={<Funders />} />
      <Route path="/living-systems" element={<LivingSystems />} />
      <Route path="/living-systems/:slug" element={<LivingSystemJourney />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/about" element={<About />} />
      <Route path="/about/story" element={<AboutStory />} />
      <Route path="/about/system" element={<AboutSystem />} />
      <Route path="/about/founder" element={<Founder />} />
      <Route path="/magazine" element={<Suspense fallback={MagazineFallback}><Magazine /></Suspense>} />
      <Route path="/magazine/about" element={<Suspense fallback={MagazineFallback}><MagazineAbout /></Suspense>} />
      <Route path="/magazine/sources" element={<Suspense fallback={MagazineFallback}><MagazineSources /></Suspense>} />
      <Route path="/magazine/corrections" element={<Suspense fallback={MagazineFallback}><MagazineCorrections /></Suspense>} />
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
