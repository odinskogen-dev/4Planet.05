export type MarketCreator = {
  id: string;
  slug: string;
  name: string;
  role: string;
  sourceUrl: string;
  state: "ACTIVE_TEST_CREATOR";
};

export type MarketProduct = {
  id: string;
  slug: string;
  title: string;
  creatorId: string;
  productType: "PHOTOGRAPHIC_PRINT";
  location: string;
  year: string;
  caption: string;
  imageUrl: string;
  sourceImagePath: string;
  sourceUrl: string;
  orientation: "landscape" | "square" | "portrait";
  catalogueState: "PUBLISHED_TEST_CATALOGUE";
  saleState: "NOT_YET_FOR_SALE";
  priceState: "NOT_SET";
  editionState: "NOT_SET";
  fulfilmentState: "NOT_CONNECTED";
  rightsState: "CREATOR_AUTHORISED_FOR_MARKET_TEST";
};

const ODIN_SITE = "https://oddekalv.org";
const ODIN_SOURCE_IMAGE_ROOT = "https://raw.githubusercontent.com/odinskogen-dev/OdinOddekalv-site/main/odin-oddekalv%203/public";

export const ODIN_ODDEKALV_CREATOR: MarketCreator = {
  id: "creator:odin-oddekalv",
  slug: "odin-oddekalv",
  name: "Odin Oddekalv",
  role: "Photographer",
  sourceUrl: `${ODIN_SITE}/photography`,
  state: "ACTIVE_TEST_CREATOR",
};

function product(
  id: string,
  title: string,
  location: string,
  year: string,
  caption: string,
  sourceImagePath: string,
  orientation: MarketProduct["orientation"],
): MarketProduct {
  return {
    id: `market:odin:${id}`,
    slug: id,
    title,
    creatorId: ODIN_ODDEKALV_CREATOR.id,
    productType: "PHOTOGRAPHIC_PRINT",
    location,
    year,
    caption,
    imageUrl: `${ODIN_SOURCE_IMAGE_ROOT}${sourceImagePath}`,
    sourceImagePath,
    sourceUrl: ODIN_ODDEKALV_CREATOR.sourceUrl,
    orientation,
    catalogueState: "PUBLISHED_TEST_CATALOGUE",
    saleState: "NOT_YET_FOR_SALE",
    priceState: "NOT_SET",
    editionState: "NOT_SET",
    fulfilmentState: "NOT_CONNECTED",
    rightsState: "CREATOR_AUTHORISED_FOR_MARKET_TEST",
  };
}

export const FIRST_MARKET_PRODUCTS: MarketProduct[] = [
  product(
    "reinebringen-vista",
    "Above the fjord",
    "Reine, Lofoten · Norway",
    "2024",
    "A long look at scale. Where the question of how we live on Earth feels largest.",
    "/images/odin/archive/reinebringen-vista.jpg",
    "landscape",
  ),
  product(
    "fjord-valley-mirror",
    "Still water, two skies",
    "Vestland · Norway",
    "2024",
    "The valley holding its breath. A study in reflection and weather.",
    "/images/odin/archive/fjord-valley-mirror.jpg",
    "landscape",
  ),
  product(
    "fjord-island-cabins",
    "Turf roofs, inner waterway",
    "Vestland · Norway",
    "2024",
    "Shelter built low and close — houses that almost disappear into the land.",
    "/images/odin/archive/fjord-island-cabins.jpg",
    "square",
  ),
  product(
    "reinebringen-clifftop",
    "Cliff edge, weather coming in",
    "Reine, Lofoten · Norway",
    "2024",
    "Granite, moss and moving cloud. The north makes you feel small in a good way.",
    "/images/odin/archive/reinebringen-clifftop.jpg",
    "landscape",
  ),
  product(
    "lofoten-beach",
    "White sand at dusk",
    "Lofoten · Norway",
    "2024",
    "A figure for scale on an empty arctic beach, light almost gone.",
    "/images/odin/field/lofoten-beach.jpg",
    "landscape",
  ),
  product(
    "seaweed-coast",
    "Kelp line, low tide",
    "Lofoten · Norway",
    "2023",
    "The edge where ocean meets land — and where most of the life is.",
    "/images/odin/archive/seaweed-coast.jpg",
    "landscape",
  ),
];

export function getMarketProduct(slug: string | undefined) {
  if (!slug) return undefined;
  return FIRST_MARKET_PRODUCTS.find((item) => item.slug === slug);
}
