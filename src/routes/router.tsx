import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/v5/Home";
import { DomainsIndex, DomainWorld } from "@/pages/v5/Domains";
import { MissionDetail } from "@/pages/v5/Missions";
import { MissionsIndex } from "@/pages/v5/AllMissions";
import { ImpactIndex, PathwayPage } from "@/pages/v5/Impact";
import { People, Brands, Partners, Funders } from "@/pages/v5/Entry";
import { LivingSystems } from "@/pages/v5/LivingSystems";
import { Reports } from "@/pages/v5/Reports";
import { About } from "@/pages/v5/About";
import { Stories, CultureFilm, CultureTelier, CulturePlay } from "@/pages/v5/Culture";
import Privacy from "@/pages/v5/Privacy";
import { StoryArticle } from "@/pages/v5/StoryArticle";
import { NotFound } from "@/pages/system";
const Atlas = lazy(() => import("@/pages/v5/Atlas"));

/* 4PLANET_ v1 — THE WORLD.
   Mandate: "I open 4PLANET_ and immediately see Earth." So Earth is "/".
   The V36 editorial home is NOT deleted — it moves to /story, intact.
   /atlas is left byte-identical so the separate ATLAS development line continues
   from its own snapshot without this product line disturbing it. */
const World = lazy(() => import("@/earth/World"));

const WorldFallback = (
  <div style={{ position: "fixed", inset: 0, background: "#080808" }} />
);

const toImpact = <Navigate to="/impact" replace />;
const toJoin = <Navigate to="/people" replace />;
const toDomains = <Navigate to="/domains" replace />;
const toBrands = <Navigate to="/brands" replace />;
const toAbout = <Navigate to="/about" replace />;
const toHome = <Navigate to="/" replace />;
function MtoMission() { const { slug } = useParams(); return <Navigate to={"/missions/" + slug} replace />; }

export function AppRoutes() {
  return (
    <Routes>
      {/* THE WORLD IS THE INTERFACE. Earth is the front door. */}
      <Route path="/" element={<Suspense fallback={WorldFallback}><World /></Suspense>} />
      {/* V36 editorial home — preserved, not regressed, just no longer the entry point. */}
      <Route path="/story" element={<Home />} />
      <Route path="/domains" element={<DomainsIndex />} />
      <Route path="/domains/:key" element={<DomainWorld />} />
      <Route path="/missions" element={<MissionsIndex />} />
      <Route path="/missions/cle4n" element={<Navigate to="/missions/pl4stic" replace />} />
      <Route path="/missions/amazonia" element={<Navigate to="/missions/am4zonia" replace />} />
      <Route path="/domains/oce4n/cle4n" element={<Navigate to="/missions/pl4stic" replace />} />
      <Route path="/missions/:slug" element={<MissionDetail />} />
      <Route path="/atlas" element={<Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#080808" }} />}><Atlas /></Suspense>} />
      <Route path="/impact" element={<ImpactIndex />} />
      <Route path="/impact/:slug" element={<PathwayPage />} />
      <Route path="/join" element={<Navigate to="/people" replace />} />
      <Route path="/people" element={<People />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/funders" element={<Funders />} />
      <Route path="/living-systems" element={<LivingSystems />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/about" element={<About />} />
      <Route path="/stories" element={<Stories />} />
      <Route path="/stories/:slug" element={<StoryArticle />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/culture/film" element={<CultureFilm />} />
      <Route path="/culture/telier" element={<CultureTelier />} />
      <Route path="/culture/play" element={<CulturePlay />} />

      {/* OS is internal-only: never public. Route away cleanly. */}
      <Route path="/os" element={toAbout} />
      <Route path="/os/*" element={toAbout} />

      {/* legacy redirects */}
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
      <Route path="/magazine" element={toHome} />
      <Route path="/system" element={toHome} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
