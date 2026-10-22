// Generated from src/routes/router.tsx and src/data/discoveryTopics.json on 2026-10-22.
// Server classification of released React routes; does not rewrite client route ownership.
// Wildcards and dynamic route segments deliberately preserve existing deep links.
export const PUBLIC_EXACT_ROUTES = [
  "/",
  "/404",
  "/4culture",
  "/4sapien",
  "/4sapien/finance",
  "/4sapien/food",
  "/4sapien/food/choose",
  "/about",
  "/about/founder",
  "/about/story",
  "/about/system",
  "/about/what-we-believe",
  "/actors",
  "/air-quality",
  "/amazon-rainforest",
  "/ambassadors",
  "/atlas",
  "/bees",
  "/biodiversity",
  "/brands",
  "/cart",
  "/checkout",
  "/checkout/lab",
  "/checkout/return",
  "/climate-change",
  "/climate-solutions",
  "/coral-bleaching",
  "/cre4tor",
  "/cre4tor/odin",
  "/creator/odin",
  "/culture/film",
  "/culture/play",
  "/culture/telier",
  "/deforestation",
  "/domains",
  "/domains/oce4n/pl4stic",
  "/e4rth",
  "/earth-now",
  "/earthquakes",
  "/ecosystems/amazon-rainforest",
  "/embed/atlas",
  "/environmental-jobs",
  "/fast-fashion",
  "/food-waste",
  "/food/lens",
  "/food/pick",
  "/funders",
  "/get-involved",
  "/impact",
  "/impact/actions/bay-of-biscay-survey",
  "/impact/lab",
  "/join",
  "/labs",
  "/labs/food-user-test",
  "/labs/gold",
  "/lens",
  "/living-systems",
  "/living-systems/great-barrier-reef",
  "/living-systems/oslofjord",
  "/living-systems/oslofjorden",
  "/magazine",
  "/magazine/about",
  "/magazine/corrections",
  "/magazine/sources",
  "/market",
  "/marketplace",
  "/members",
  "/missions",
  "/missions/4film",
  "/missions/4ntarctica",
  "/missions/4rt",
  "/missions/4telier",
  "/missions/amazonia",
  "/missions/en3rgy",
  "/missions/m4gazine",
  "/missions/pl4stic",
  "/missions/rewild",
  "/now",
  "/oce4n",
  "/orca",
  "/os",
  "/os/labs",
  "/oslofjord",
  "/partners",
  "/people",
  "/places",
  "/plastic-pollution",
  "/privacy",
  "/renewable-energy",
  "/reports",
  "/rewilding",
  "/s4piens",
  "/s4piens/food/lens",
  "/signal",
  "/solar-energy",
  "/species",
  "/species/lab",
  "/species/orca/lume",
  "/sponsors",
  "/store",
  "/stories",
  "/story",
  "/system",
  "/whales",
  "/wildfires"
];
export const RELEASED_MISSION_ROUTES = ["/missions/cle4n","/missions/wh4les","/missions/cor4l","/missions/rewild-marine","/missions/clim4te","/missions/am4zonia","/missions/species","/missions/rewild-land","/missions/food","/missions/en4rgy","/missions/circular-city","/missions/f4shion","/missions/m4gazine","/missions/4film","/missions/4rt","/missions/4play"];
export const PUBLIC_PATTERN_ROUTES = [
  "/4nation/*",
  "/labs/gold/object/:slug",
  "/labs/gold/story/:slug",
  "/sandbox/gold/*",
  "/domains/:key",
  "/missions/:slug",
  "/atlas/:objectSlug",
  "/place/:slug",
  "/species/:slug",
  "/impact/lab/:unit",
  "/impact/lab/records/:recordId",
  "/impact/test/:unit",
  "/impact/record/:recordId",
  "/impact/:slug",
  "/actors/:slug",
  "/living-systems/:slug",
  "/magazine/stories/:id",
  "/magazine/:slug",
  "/stories/:slug",
  "/os/*",
  "/m/:slug",
  "/m/:slug/support",
  "/m/:slug/campaign",
  "/portal/*"
];

function patternToRegExp(pattern) {
  const pieces=pattern.split('/').filter(Boolean);
  const converted=pieces.map((p)=>p==='*'?'(?:.*)':p.startsWith(':')?'[^/]+':p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return new RegExp('^/'+converted.join('/')+'/?$');
}
const exact=new Set([...PUBLIC_EXACT_ROUTES,...RELEASED_MISSION_ROUTES].map(x=>x==='/'?'/':x.replace(/\/+$/,'')));
const patterns=PUBLIC_PATTERN_ROUTES.map(patternToRegExp);

export function isKnown4PlanetPublicRoute(pathname) {
  const p=pathname.replace(/\/+$/,'')||'/';
  if (exact.has(p)) return true;
  // Finite canonical owners have authoritative released IDs. A React parameter
  // matcher is not proof that every arbitrary slug is a published entity.
  if (p.startsWith('/missions/')) return false;
  if (p.startsWith('/domains/')) return false;
  if (p.startsWith('/place/')) return false; // qualified Place IDs redirect first

  if (patterns.some(r=>r.test(p))) return true;
  // Next.js Living Systems and historical web game deliveries are independently
  // versioned static applications, not owned by src/routes/router.tsx.
  if (/^\/livingsystems(?:\/|$)/.test(p)) return true;
  if (/^\/games(?:\/|$)/.test(p)) return true;
  // Existing published 3D/XR assets use non-React delivery.
  if (/^\/xr(?:\/|$)/.test(p)) return true;
  return false;
}
