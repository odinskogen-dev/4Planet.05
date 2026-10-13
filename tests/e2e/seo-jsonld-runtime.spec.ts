import { expect, test, type Page } from "@playwright/test";

const OWNED_JSON_LD = [
  'script[id="4planet-page-jsonld"]',
  'script[type="application/ld+json"][data-4planet-prerender="true"]',
  'script[type="application/ld+json"][data-4planet-atlas-prerender="true"]',
].join(",");

const RAW_ROUTES = ["/species/orca/", "/place/kenya/", "/atlas/"] as const;

function normalisePath(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/$/, "");
}

function canonicalFromRawHtml(html: string) {
  const tag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
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

async function navigateSpa(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

test.describe("structured-data runtime ownership", () => {
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

  test("hydration keeps one current graph across A to B to A and preserves third-party JSON-LD", async ({ page }) => {
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

    await navigateSpa(page, "/place/kenya");
    await expectCurrentGraph(page, "/place/kenya");
    await expect(page.locator("#third-party-jsonld-proof")).toHaveCount(1);

    const placeGraph = JSON.parse(
      (await page.locator('script[id="4planet-page-jsonld"]').textContent()) || "{}",
    ) as { mainEntity?: { "@type"?: string }; about?: { name?: string } };
    expect(placeGraph.mainEntity?.["@type"]).toBe("Place");
    expect(placeGraph.about?.name).toBeTruthy();

    await navigateSpa(page, "/species/orca");
    await expectCurrentGraph(page, "/species/orca");
    await expect(page.locator("#third-party-jsonld-proof")).toHaveCount(1);
  });

  test("an unknown route removes owned ghost graphs but preserves third-party JSON-LD", async ({ page }) => {
    await page.goto("/place/kenya");
    await expectCurrentGraph(page, "/place/kenya");

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
