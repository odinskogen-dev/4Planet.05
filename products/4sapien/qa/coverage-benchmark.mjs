#!/usr/bin/env node

const KEY = process.env.KASSALAPP_API_KEY || process.env.KASSALAPP_TOKEN || '';
const BASE = 'https://kassal.app/api/v1';
const QUERIES = [
  'melk','yoghurt','ost','smør','egg','brød','havregryn','pasta','ris','kaffe',
  'juice','brus','vann','kylling','kjøttdeig','laks','frossenpizza','grønnsaker','sjokolade','leverpostei'
];

if (!KEY) {
  console.error('COVERAGE_UNKNOWN: KASSALAPP_API_KEY/KASSALAPP_TOKEN mangler. Ingen dekningsprosent beregnes uten norsk butikkdata.');
  process.exit(2);
}

const headers = { Authorization: `Bearer ${KEY}`, Accept: 'application/json', 'User-Agent': '4SAPIEN-Coverage-QA/1.0 (https://4sapien.com)' };
const rows = [];

for (const query of QUERIES) {
  const url = `${BASE}/products?search=${encodeURIComponent(query)}&page=1&size=100&unique=false&exclude_without_ean=false`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Kassalapp ${response.status} for ${query}`);
  const json = await response.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  for (const p of data) rows.push({ query, ...p });
}

const truthy = (v) => v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0);
const priceOf = (p) => typeof p?.current_price === 'number' ? p.current_price : p?.current_price?.price;
const storeOf = (p) => p?.store?.code || p?.store?.name || p?.current_price?.store?.code || p?.current_price?.store?.name || null;
const uniq = new Map();
for (const p of rows) {
  const key = p.ean ? `ean:${p.ean}` : `fallback:${p.name}|${p.brand || ''}|${storeOf(p) || ''}`;
  if (!uniq.has(key)) uniq.set(key, p);
}
const products = [...uniq.values()];
const chains = {};
for (const p of rows) {
  const store = storeOf(p) || 'UNKNOWN';
  chains[store] = (chains[store] || 0) + 1;
}

const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : null;
const count = products.length;
const metrics = {
  generated_at: new Date().toISOString(),
  methodology: '20 chain-neutral Norwegian grocery queries; first 100 Kassalapp rows per query; deduplicated primarily by EAN.',
  queries: QUERIES,
  raw_rows: rows.length,
  unique_products: count,
  coverage: {
    ean_pct: pct(products.filter(p => truthy(p.ean)).length, count),
    image_pct: pct(products.filter(p => truthy(p.image)).length, count),
    ingredients_pct: pct(products.filter(p => truthy(p.ingredients)).length, count),
    nutrition_pct: pct(products.filter(p => truthy(p.nutrition)).length, count),
    price_observation_pct: pct(products.filter(p => priceOf(p) != null).length, count),
    store_or_chain_pct: pct(products.filter(p => storeOf(p)).length, count)
  },
  observed_store_or_chain_identifiers: Object.fromEntries(Object.entries(chains).sort((a,b) => b[1]-a[1])),
  caveat: 'This is an API/data-availability benchmark, not a claim that every physical store carries every returned product.'
};

console.log(JSON.stringify(metrics, null, 2));
