export type MarketCommerceCandidate = {
  candidatePriceNok: number;
  printSize: string;
  podSku: string;
  podSizing: "fitPrintArea";
  shippingMethod: "Standard";
  shippingCountry: "NO";
  sampleState: "REQUIRED";
};

export type FirstMarketProduct = {
  id: string;
  slug: string;
  title: string;
  creator: string;
  location: string;
  year: string;
  imageUrl: string;
  productType: "PHOTOGRAPHIC PRINT" | "ART PRINT";
  state: "RELEASE GATED";
  commerce: MarketCommerceCandidate;
};

const photoCommerce = (): MarketCommerceCandidate => ({
  candidatePriceNok: 1290,
  printSize: "8 × 12 IN",
  podSku: "GLOBAL-FAP-8X12",
  podSizing: "fitPrintArea",
  shippingMethod: "Standard",
  shippingCountry: "NO",
  sampleState: "REQUIRED",
});

const artCommerce = (): MarketCommerceCandidate => ({
  candidatePriceNok: 890,
  printSize: "6 × 8 IN",
  podSku: "GLOBAL-FAP-6X8",
  podSizing: "fitPrintArea",
  shippingMethod: "Standard",
  shippingCountry: "NO",
  sampleState: "REQUIRED",
});

export const FIRST_MARKET_PRODUCTS: FirstMarketProduct[] = [
  {
    id: "market:odin:reinebringen-vista",
    slug: "reinebringen-vista",
    title: "Above the Fjord",
    creator: "Odin Oddekalv",
    location: "Reine, Lofoten · Norway",
    year: "2024",
    imageUrl: "/market/odin/reinebringen-vista.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce(),
  },
  {
    id: "market:odin:fjord-island-cabins",
    slug: "fjord-island-cabins",
    title: "Turf Roofs, Inner Waterway",
    creator: "Odin Oddekalv",
    location: "Vestland · Norway",
    year: "2024",
    imageUrl: "/market/odin/fjord-island-cabins.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: { ...photoCommerce(), printSize: "8 × 8 IN", podSku: "GLOBAL-FAP-8X8" },
  },
  {
    id: "market:odin:reinebringen-clifftop",
    slug: "reinebringen-clifftop",
    title: "Cliff Edge, Weather Coming In",
    creator: "Odin Oddekalv",
    location: "Reine, Lofoten · Norway",
    year: "2024",
    imageUrl: "/market/odin/reinebringen-clifftop.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce(),
  },
  {
    id: "market:odin:lofoten-beach",
    slug: "lofoten-beach",
    title: "White Sand at Dusk",
    creator: "Odin Oddekalv",
    location: "Lofoten · Norway",
    year: "2024",
    imageUrl: "/market/odin/lofoten-beach.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: { ...photoCommerce(), printSize: "9 × 12 IN", podSku: "GLOBAL-FAP-9X12" },
  },
  {
    id: "market:odin:seaweed-coast",
    slug: "seaweed-coast",
    title: "Kelp Line, Low Tide",
    creator: "Odin Oddekalv",
    location: "Lofoten · Norway",
    year: "2023",
    imageUrl: "/market/odin/seaweed-coast.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce(),
  },
  {
    id: "market:amalie:a01",
    slug: "amalie-a01-dense-animals-green-leaves",
    title: "Dense Animals / Green Leaves",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a01-dense-animals-green-leaves.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
  {
    id: "market:amalie:a07",
    slug: "amalie-a07-people-on-pink",
    title: "People on Pink",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a07-people-on-pink.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
  {
    id: "market:amalie:a12",
    slug: "amalie-a12-pirate-frogs",
    title: "Pirate Frogs",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a12-pirate-frogs.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
  {
    id: "market:amalie:a13",
    slug: "amalie-a13-frog-holiday-pool-world",
    title: "Frog Holiday / Pool World",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a13-frog-holiday-pool-world.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
  {
    id: "market:amalie:a14",
    slug: "amalie-a14-frog-treehouse-snake-mole",
    title: "Frog Treehouse / Snake / Mole",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a14-frog-treehouse-snake-mole.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
  {
    id: "market:amalie:a15",
    slug: "amalie-a15-pig-society-turquoise",
    title: "Pig Society / Turquoise",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a15-pig-society-turquoise.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce(),
  },
];

export function getFirstMarketProduct(id: string) {
  return FIRST_MARKET_PRODUCTS.find((product) => product.id === id || product.slug === id) ?? null;
}
