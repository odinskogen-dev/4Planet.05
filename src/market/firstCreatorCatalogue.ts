export type MarketCreator = {
  id: string;
  slug: string;
  name: string;
  role: string;
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
  orientation: "landscape" | "square" | "portrait";
  catalogueState: "PUBLISHED_TEST_CATALOGUE";
  saleState: "NOT_YET_FOR_SALE";
  priceState: "NOT_SET";
  editionState: "NOT_SET";
  fulfilmentState: "NOT_CONNECTED";
  rightsState: "CREATOR_AUTHORISED_FOR_MARKET_TEST";
  assetState: "LOCAL_MARKET_COPY";
};

const MARKET_ASSET_ROOT = "/market/odin";

export const ODIN_ODDEKALV_CREATOR: MarketCreator = {
  id: "creator:odin-oddekalv",
  slug: "odin-oddekalv",
  name: "Odin Oddekalv",
  role: "Photographer",
  state: "ACTIVE_TEST_CREATOR",
};

function product(
  id: string,
  title: string,
  location: string,
  year: string,
  caption: string,
  sourceImagePath: string,
  filename: string,
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
    imageUrl: `${MARKET_ASSET_ROOT}/${filename}`,
    sourceImagePath,
    orientation,
    catalogueState: "PUBLISHED_TEST_CATALOGUE",
    saleState: "NOT_YET_FOR_SALE",
    priceState: "NOT_SET",
    editionState: "NOT_SET",
    fulfilmentState: "NOT_CONNECTED",
    rightsState: "CREATOR_AUTHORISED_FOR_MARKET_TEST",
    assetState: "LOCAL_MARKET_COPY",
  };
}

export const FIRST_MARKET_PRODUCTS: MarketProduct[] = [
  product(
    "reinebringen-vista",
    "Above the fjord",
    "Reine, Lofoten · Norway",
    "2024",
    "A long look at scale. Where the question of how we live on Earth feels largest.",
    "odin-oddekalv 2/public/images/odin/archive/reinebringen-vista.jpg",
    "reinebringen-vista.jpg",
    "landscape",
  ),
  product(
    "fjord-valley-mirror",
    "Still water, two skies",
    "Vestland · Norway",
    "2024",
    "The valley holding its breath. A study in reflection and weather.",
    "odin-oddekalv 2/public/images/odin/archive/fjord-valley-mirror.jpg",
    "fjord-valley-mirror.jpg",
    "landscape",
  ),
  product(
    "fjord-island-cabins",
    "Turf roofs, inner waterway",
    "Vestland · Norway",
    "2024",
    "Shelter built low and close — houses that almost disappear into the land.",
    "odin-oddekalv 2/public/images/odin/archive/fjord-island-cabins.jpg",
    "fjord-island-cabins.jpg",
    "square",
  ),
  product(
    "reinebringen-clifftop",
    "Cliff edge, weather coming in",
    "Reine, Lofoten · Norway",
    "2024",
    "Granite, moss and moving cloud. The north makes you feel small in a good way.",
    "odin-oddekalv 2/public/images/odin/archive/reinebringen-clifftop.jpg",
    "reinebringen-clifftop.jpg",
    "landscape",
  ),
  product(
    "lofoten-beach",
    "White sand at dusk",
    "Lofoten · Norway",
    "2024",
    "A figure for scale on an empty arctic beach, light almost gone.",
    "odin-oddekalv 2/public/images/odin/field/lofoten-beach.jpg",
    "lofoten-beach.jpg",
    "landscape",
  ),
  product(
    "seaweed-coast",
    "Kelp line, low tide",
    "Lofoten · Norway",
    "2023",
    "The edge where ocean meets land — and where most of the life is.",
    "odin-oddekalv 2/public/images/odin/archive/seaweed-coast.jpg",
    "seaweed-coast.jpg",
    "landscape",
  ),
];

export function getMarketProduct(slug: string | undefined) {
  if (!slug) return undefined;
  return FIRST_MARKET_PRODUCTS.find((item) => item.slug === slug);
}
