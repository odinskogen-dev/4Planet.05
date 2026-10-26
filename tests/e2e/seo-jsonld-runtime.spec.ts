import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const OWNED_JSON_LD = [
  'script[id="4planet-page-jsonld"]',
  'script[type="application/ld+json"][data-4planet-prerender="true"]',
  'script[type="application/ld+json"][data-4planet-atlas-prerender="true"]',
].join(",");

const RAW_ROUTES = ["/species/orca/", "/atlas/"] as const;
const PUBLIC_ORIGIN = "https://4planet.org";
const KENYA_PATH = "/place/kenya";
const PRODUCTION_ROBOTS = "index,follow,max-image-preview:large";
const PRIVATE_ROBOTS = "noindex,nofollow,noarchive";

type PlaceReleaseFixture = {
  slug?: string;
  indexable: boolean;
  publicationState: string;
  canonicalOrigin: string | null;
};

const discoveryInventory = JSON.parse(
  readFileSync(new URL("../../src/data/discoveryInventory.json", import.meta.url), "utf8"),
) as { places: PlaceReleaseFixture[] };

function placeIsReleasedForOrigin(place: PlaceReleaseFixture) {
  return place.indexable === true
    && place.publicationState === "READY_FOR_FOUNDER_RELEASE"
    && place.canonicalOrigin === PUBLIC_ORIGIN;
}

function expectedRobotsForHost(hostname: string, routeRobots: string) {
  const host = hostname.trim().toLowerCase().replace(/^www\./, "");
  const preview = host === "test.4planet.org"
    || host === "labs.4planet.org"
    || host === "os.4planet.org"
    || host === "id.4planet.org"
    || host === "localhost"
    || host.endsWith(".localhost")
    || host.endsWith(".pages.dev");
  return preview ? PRIVATE_ROBOTS : routeRobots;
}

function normalisePath(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/$/, "");
}

function canonicalFromRawHtml(html: string) {
  const tag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

function headMetadataFromRawHtml(html: string) {
  const meta = (key: string) => html.match(
    new RegExp(`<meta\\s+name=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
  )?.[1];
  return {
    title: html.match(/<title>([^<]+)<\/title>/i)?.[1],
    description: meta("description"),
    robots: meta("robots"),
    canonical: canonicalFromRawHtml(html),
  };
}

function prerenderGraphsFromRawHtml(html: string) {
  return [...html.matchAll(
    /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])(?=[^>]*\bdata-4planet-prerender=["']true["'])[^>]*>([\s\S]*?)<\/script>/gi,
  )].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
}

async function expectCurrentGraph(page: Page, expectedPath: string) {
  await expect(page).toHaveURL(new RegExp(`${expectedPath.replace("/", "\\/")}\\/?$`));
  await expect(page.locator(OWNED_JSON_LD)).toHaveCount(1);
  await expect(page.locator('script[id="4planet-page-jsonld"]')).toHaveCount(1);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBeTruthy();
  expect(normalisePath(new URL(canonical!).pathname)).toBe(normalisePath(expectedPath));

  const graph = JSON.parse(
    (await page.locator('script[id="4planet-page-jsonld"]').textContent()) || "{}",
  ) as Record<string, unknown>;
  expect(graph.url).toBe(canonical);
  expect(graph.mainEntity).toBeTruthy();
}

async function expectNonPublicPlace(page: Page, expectedPath: string) {
  await expect(page).toHaveURL(new RegExp(`${expectedPath.replace("/", "\\/")}\\/?$`));
  await expect(page.locator(OWNED_JSON_LD)).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
}

async function navigateSpa(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

test.describe("structured-data runtime ownership", () => {
  test("PLACE release fixtures require exact canonical authority", () => {
    const kenya = discoveryInventory.places.find((place) => place.slug === "kenya");
    expect(kenya).toBeTruthy();
    expect(kenya!.publicationState).toBe("READY_FOR_FOUNDER_RELEASE");
    expect(kenya!.canonicalOrigin).toBeNull();
    expect(placeIsReleasedForOrigin(kenya!)).toBe(false);

    const authorisedFixture = { ...kenya!, canonicalOrigin: PUBLIC_ORIGIN };
    expect(placeIsReleasedForOrigin(authorisedFixture)).toBe(true);
  });

  test("raw HTML has one owned prerender graph with canonical identity", async ({ request }) => {
    for (const route of RAW_ROUTES) {
      const response = await request.get(route);
      expect(response.ok(), `raw response for ${route}`).toBeTruthy();
      const html = await response.text();
      const canonical = canonicalFromRawHtml(html);
      const graphs = prerenderGraphsFromRawHtml(html);

      expect(canonical, `canonical for ${route}`).toBeTruthy();
      expect(normalisePath(new URL(canonical!).pathname)).toBe(normalisePath(route));
      expect(graphs, `owned prerender graphs for ${route}`).toHaveLength(1);
      expect(graphs[0].url).toBe(canonical);
    }
  });

  test("unreleased Kenya has no public raw graph and fails closed after hydration", async ({ page, request }) => {
    const response = await request.get(`${KENYA_PATH}/`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(canonicalFromRawHtml(html)).toBeUndefined();
    expect(prerenderGraphsFromRawHtml(html)).toHaveLength(0);

    await page.goto("/species/orca");
    await expectCurrentGraph(page, "/species/orca");
    await navigateSpa(page, KENYA_PATH);
    await expectNonPublicPlace(page, KENYA_PATH);
  });

  test("hydration removes the graph for unreleased Kenya and restores it on return", async ({ page }) => {
    await page.goto("/species/orca");
    await expectCurrentGraph(page, "/species/orca");

    await page.evaluate(() => {
      const script = document.createElement("script");
      script.id = "third-party-jsonld-proof";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Independent third-party proof",
      });
      document.head.appendChild(script);
    });

    await navigateSpa(page, KENYA_PATH);
    await expectNonPublicPlace(page, KENYA_PATH);
    await expect(page.locator("#third-party-jsonld-proof")).toHaveCount(1);

    await navigateSpa(page, "/species/orca");
    await expectCurrentGraph(page, "/species/orca");
    await expect(page.locator("#third-party-jsonld-proof")).toHaveCount(1);
  });

  test("About Story keeps metadata with the current host-specific robots policy", async ({ page, request }) => {
    const response = await request.get("/about/story/");
    expect(response.ok()).toBeTruthy();
    const raw = headMetadataFromRawHtml(await response.text());
    expect(raw.robots).toBe(PRODUCTION_ROBOTS);

    await page.goto("/about/story");
    await expectCurrentGraph(page, "/about/story");
    const hydratedRobots = expectedRobotsForHost(new URL(page.url()).hostname, raw.robots!);
    await expect(page).toHaveTitle(raw.title!);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", raw.description!);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", hydratedRobots);
    expect(normalisePath(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname))
      .toBe(normalisePath(new URL(raw.canonical!).pathname));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "The living planet is not an abstract issue.",
    );

    await navigateSpa(page, KENYA_PATH);
    await expectNonPublicPlace(page, KENYA_PATH);
    await navigateSpa(page, "/about/story");
    await expectCurrentGraph(page, "/about/story");
    await expect(page).toHaveTitle(raw.title!);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", raw.description!);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", hydratedRobots);
    expect(normalisePath(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname))
      .toBe(normalisePath(new URL(raw.canonical!).pathname));
  });

  test("an unknown route removes owned ghost graphs but preserves third-party JSON-LD", async ({ page }) => {
    await page.goto("/species/orca");
    await expectCurrentGraph(page, "/species/orca");

    await page.evaluate(() => {
      const script = document.createElement("script");
      script.id = "third-party-jsonld-unknown-route";
      script.type = "application/ld+json";
      script.textContent = '{"@context":"https://schema.org","@type":"Organization","name":"Independent"}';
      document.head.appendChild(script);
    });

    await navigateSpa(page, "/__jsonld-proof-missing-route__");
    await expect(page.getByText("Off the map.")).toBeVisible();
    await expect(page.locator(OWNED_JSON_LD)).toHaveCount(0);
    await expect(page.locator("#third-party-jsonld-unknown-route")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
