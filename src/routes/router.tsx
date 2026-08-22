import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/v5/Home";
import { DomainsIndex, DomainWorld } from "@/pages/v5/Domains";
import { MissionDetail } from "@/pages/v5/Missions";
import { MissionsIndex } from "@/pages/v5/AllMissions";
import { ImpactLabIndex, ImpactTestJourney, PersonalImpactRecordPage } from "@/pages/integrated/ImpactPrototype";
import { ImpactPublicHome, ImpactStory } from "@/pages/integrated/ImpactPremium";
import { SpeciesIndex, SpeciesProfilePage } from "@/pages/integrated/Species";
import { Brands, Partners, Funders } from "@/pages/v5/Entry";
import Join from "@/pages/v5/Join";
import { LivingSystems, LivingSystemJourney } from "@/pages/v5/LivingSystems";
import { Reports } from "@/pages/v5/Reports";
import { About } from "@/pages/v5/About";
import { AboutStory, AboutSystem, Founder } from "@/pages/v5/AboutPages";
import { Magazine } from "@/pages/v5/Magazine";
import { Stories, CultureFilm, CulturePlay } from "@/pages/v5/Culture";
import Privacy from "@/pages/v5/Privacy";
import { StoryArticle } from "@/pages/v5/StoryArticle";
import { NotFound } from "@/pages/system";
const PublicWorld=lazy(()=>import("@/earth/PublicWorld"));const SapiensGold=lazy(()=>import("@/pages/integrated/SapiensGold"));const BayOfBiscay=lazy(()=>import("@/pages/integrated/BayOfBiscay"));const AmazonRainforestGold=lazy(()=>import("@/pages/integrated/AmazonRainforestGold"));
const WorldFallback=<div style={{position:"fixed",inset:0,background:"#080808"}}/>;const toImpact=<Navigate to="/impact" replace/>;const toJoin=<Navigate to="/join" replace/>;const toBrands=<Navigate to="/brands" replace/>;const toAbout=<Navigate to="/about" replace/>;
function MtoMission(){const{slug}=useParams();return <Navigate to={"/missions/"+slug} replace/>}function RedirectTestUnit(){const{unit}=useParams();return <Navigate to={`/impact/lab/${unit}`} replace/>}function RedirectRecord(){const{recordId}=useParams();return <Navigate to={`/impact/lab/records/${recordId}`} replace/>}
export function AppRoutes(){return <Routes>
<Route path="/" element={<Home/>}/><Route path="/story" element={<Navigate to="/" replace/>}/><Route path="/domains" element={<DomainsIndex/>}/><Route path="/domains/:key" element={<DomainWorld/>}/>
<Route path="/missions" element={<MissionsIndex/>}/><Route path="/missions/pl4stic" element={<Navigate to="/missions/cle4n" replace/>}/><Route path="/missions/amazonia" element={<Navigate to="/missions/am4zonia" replace/>}/><Route path="/missions/4ntarctica" element={<Navigate to="/missions/rewild-marine" replace/>}/><Route path="/missions/rewild" element={<Navigate to="/missions/rewild-land" replace/>}/><Route path="/missions/en3rgy" element={<Navigate to="/missions/en4rgy" replace/>}/><Route path="/missions/4telier" element={<Navigate to="/missions/4rt" replace/>}/><Route path="/culture/telier" element={<Navigate to="/missions/4rt" replace/>}/><Route path="/domains/oce4n/pl4stic" element={<Navigate to="/missions/cle4n" replace/>}/><Route path="/missions/:slug" element={<MissionDetail/>}/>
<Route path="/atlas" element={<Suspense fallback={WorldFallback}><PublicWorld/></Suspense>}/><Route path="/species" element={<SpeciesIndex/>}/><Route path="/species/:slug" element={<SpeciesProfilePage/>}/><Route path="/ecosystems/bay-of-biscay" element={<Suspense fallback={WorldFallback}><BayOfBiscay/></Suspense>}/><Route path="/ecosystems/amazon-rainforest" element={<Suspense fallback={WorldFallback}><AmazonRainforestGold/></Suspense>}/>
<Route path="/impact" element={<ImpactPublicHome/>}/><Route path="/impact/lab" element={<ImpactLabIndex/>}/><Route path="/impact/lab/:unit" element={<ImpactTestJourney/>}/><Route path="/impact/lab/records/:recordId" element={<PersonalImpactRecordPage/>}/><Route path="/impact/test/:unit" element={<RedirectTestUnit/>}/><Route path="/impact/record/:recordId" element={<RedirectRecord/>}/><Route path="/impact/:slug" element={<ImpactStory/>}/>
<Route path="/join" element={<Join/>}/><Route path="/people" element={<Navigate to="/join" replace/>}/><Route path="/brands" element={<Brands/>}/><Route path="/partners" element={<Partners/>}/><Route path="/funders" element={<Funders/>}/><Route path="/living-systems" element={<LivingSystems/>}/><Route path="/living-systems/:slug" element={<LivingSystemJourney/>}/><Route path="/reports" element={<Reports/>}/>
<Route path="/about" element={<About/>}/><Route path="/about/story" element={<AboutStory/>}/><Route path="/about/system" element={<AboutSystem/>}/><Route path="/about/founder" element={<Founder/>}/><Route path="/magazine" element={<Magazine/>}/><Route path="/stories" element={<Stories/>}/><Route path="/stories/:slug" element={<StoryArticle/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/culture/film" element={<CultureFilm/>}/><Route path="/culture/play" element={<CulturePlay/>}/>
<Route path="/os" element={toAbout}/><Route path="/os/*" element={toAbout}/><Route path="/m/:slug" element={<MtoMission/>}/><Route path="/m/:slug/support" element={toImpact}/><Route path="/m/:slug/campaign" element={toImpact}/><Route path="/marketplace" element={toImpact}/><Route path="/store" element={toImpact}/><Route path="/cart" element={toImpact}/><Route path="/checkout" element={toImpact}/><Route path="/members" element={toJoin}/><Route path="/ambassadors" element={toJoin}/><Route path="/portal/*" element={toImpact}/><Route path="/sponsors" element={toBrands}/>
<Route path="/oce4n" element={<Navigate to="/domains/oce4n" replace/>}/><Route path="/e4rth" element={<Navigate to="/domains/e4rth" replace/>}/><Route path="/s4piens" element={<Suspense fallback={WorldFallback}><SapiensGold/></Suspense>}/><Route path="/4culture" element={<Navigate to="/domains/4culture" replace/>}/><Route path="/system" element={<Navigate to="/about/system" replace/>}/><Route path="/404" element={<NotFound/>}/><Route path="*" element={<NotFound/>}/>
</Routes>}
