export const OWNED_JSON_LD_SELECTOR = [
  'script[id="4planet-page-jsonld"]',
  'script[type="application/ld+json"][data-4planet-prerender="true"]',
  'script[type="application/ld+json"][data-4planet-atlas-prerender="true"]',
].join(",");

export function removeOwnedJsonLd(documentRoot: Pick<Document, "querySelectorAll"> = document): void {
  documentRoot.querySelectorAll(OWNED_JSON_LD_SELECTOR).forEach((node) => node.remove());
}
