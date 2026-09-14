export type FirstMarketProduct = {
  id: string;
  slug: string;
  title: string;
  creator: string;
  location: string;
  year: string;
  imageUrl: string;
  productType: "PHOTOGRAPHIC PRINT";
  state: "NOT YET FOR SALE";
};

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
    state: "NOT YET FOR SALE",
  },
  {
    id: "market:odin:fjord-valley-mirror",
    slug: "fjord-valley-mirror",
    title: "Still Water, Two Skies",
    creator: "Odin Oddekalv",
    location: "Vestland · Norway",
    year: "2024",
    imageUrl: "/market/odin/fjord-valley-mirror.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "NOT YET FOR SALE",
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
    state: "NOT YET FOR SALE",
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
    state: "NOT YET FOR SALE",
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
    state: "NOT YET FOR SALE",
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
    state: "NOT YET FOR SALE",
  },
];
