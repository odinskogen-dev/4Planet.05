import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";

test("ORGANISATIONS_ is discoverable from the public homepage", async ({ page }) => {
  await page.goto(`${BASE}/`);
  await expect(page.getByRole("heading", { name: /Meet the organisations turning knowledge/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /EXPLORE ORGANISATIONS/ })).toHaveAttribute("href", "/actors");
  await page.getByRole("link", { name: /EXPLORE ORGANISATIONS/ }).click();
  await expect(page).toHaveURL(/\/actors$/);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
});

test("actor index presents the expanded private-beta set without ranking and preserves filter state", async ({ page }) => {
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "20 organisations", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Who helps make the planet knowable/ })).toBeVisible();
  await page.getByLabel("Actor type").selectOption("DATA_INFRASTRUCTURE");
  await expect(page).toHaveURL(/type=DATA_INFRASTRUCTURE/);
  await expect(page.getByRole("heading", { name: "4 organisations", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Global Biodiversity Information Facility", exact: true }).first()).toBeVisible();
  await expect(page.getByText(/do not create a universal score/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Actor type")).toHaveValue("DATA_INFRASTRUCTURE");
});

test("knowledge-domain and API-state filters are URL-persistent", async ({ page }) => {
  await page.goto(`${BASE}/actors`);
  await page.getByLabel("Knowledge domain").selectOption("OCEAN");
  await expect(page).toHaveURL(/knowledge=OCEAN/);
  await expect(page.getByRole("heading", { name: "Ocean Biodiversity Information System", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Knowledge domain")).toHaveValue("OCEAN");
  await page.getByRole("button", { name: /Clear all/i }).click();
  await page.getByLabel("API state").selectOption("DOCUMENTED_PUBLIC_API");
  await expect(page).toHaveURL(/api=DOCUMENTED_PUBLIC_API/);
  await expect(page.getByRole("heading", { name: "World Register of Marine Species", exact: true })).toBeVisible();
});

test("knowledge profile v2.1 separates institution, datasets, access, licence and limitations", async ({ page }) => {
  await page.goto(`${BASE}/actors/ocean-biodiversity-information-system`);
  await expect(page.locator("h1").filter({ hasText: /^Ocean Biodiversity Information System$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Institution → programme → dataset → access → product/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Rights travel with the data/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /What this information must not be made to say/ })).toBeVisible();
  await expect(page.getByText(/Occurrence density is not abundance/)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://4planet.org/actors/ocean-biodiversity-information-system");
});

test("existing GBIF identity resolves through the knowledge profile without duplicate canonical actor identity", async ({ page }) => {
  await page.goto(`${BASE}/actors/global-biodiversity-information-facility`);
  await expect(page.locator("h1").filter({ hasText: /^Global Biodiversity Information Facility$/ })).toBeVisible();
  await expect(page.getByText("actor:p17:P17-A003", { exact: true })).toBeVisible();
  await expect(page.getByText(/Institution is not dataset/)).toBeVisible();
});

test("IPBES uses a clean canonical URL and preserves redirect from the pre-production truncated slug", async ({ page }) => {
  await page.goto(`${BASE}/actors/intergovernmental-science-policy-platform-on-biodiversity-and-ecosyste`);
  await expect(page).toHaveURL(/\/actors\/ipbes$/);
  await expect(page.locator("h1").filter({ hasText: /^Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services$/ })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://4planet.org/actors/ipbes");
});

test("Global Fishing Watch remains a data-driven field/intelligence profile with source boundaries", async ({ page }) => {
  await page.goto(`${BASE}/actors/global-fishing-watch`);
  await expect(page.locator("h1").filter({ hasText: /^Global Fishing Watch$/ })).toBeVisible();
  await expect(page.getByText(/Making human activity at sea more visible/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Modelled vessel activity or apparent fishing effort is not automatic evidence/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore datasets and code/ })).toHaveAttribute("href", /globalfishingwatch\.org/);
});

test("World Land Trust profile leads with meaning and exposes evidence boundaries", async ({ page }) => {
  await page.goto(`${BASE}/actors/world-land-trust`);
  await expect(page.locator("h1").filter({ hasText: /^World Land Trust$/ })).toBeVisible();
  await expect(page.getByText(/Helping local conservation partners protect threatened habitats/).first()).toBeVisible();
  await expect(page.getByText("A donation is not automatically a transferable 4PLANET land unit.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /OFFICIAL WEBSITE/ })).toHaveAttribute("href", /worldlandtrust\.org/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://4planet.org/actors/world-land-trust");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /world-land-trust\.svg/);
});

test("claim and correction flow fails closed without storing personal data", async ({ page }) => {
  await page.goto(`${BASE}/actors/rainforest-foundation-norway`);
  await page.getByLabel("Name").fill("Private Beta Reviewer");
  await page.getByLabel("Role").fill("Authorised representative");
  await page.getByLabel("Official email").fill("reviewer@example.org");
  await page.getByLabel("Organisation domain").fill("example.org");
  await page.getByLabel("Authorisation context").fill("I am authorised to request factual review for this organisation.");
  await page.getByLabel("Requested change").fill("Please review the organisation identity and programme description against the official sources.");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: /CHECK SECURE REVIEW PATH/ }).click();
  await expect(page.getByRole("heading", { name: /Secure submission remains closed/ })).toBeVisible();
  await expect(page.getByText(/No contact or request data was stored/)).toBeVisible();
  const stored = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(JSON.stringify(stored)).not.toContain("Private Beta Reviewer");
  expect(JSON.stringify(stored)).not.toContain("reviewer@example.org");
});

test("knowledge claim and correction flow uses the same fail-closed review contract", async ({ page }) => {
  await page.goto(`${BASE}/actors/ocean-biodiversity-information-system`);
  await page.getByLabel("Name").fill("Knowledge Reviewer");
  await page.getByLabel("Role").fill("Authorised representative");
  await page.getByLabel("Official email").fill("reviewer@example.org");
  await page.getByLabel("Organisation domain").fill("example.org");
  await page.getByLabel("Authorisation context").fill("Authorised to request factual review.");
  await page.getByLabel("Requested change").fill("Review dataset and licence description.");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: /CHECK SECURE REVIEW PATH/ }).click();
  await expect(page.getByText(/Secure submission remains closed/)).toBeVisible();
  const stored = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(JSON.stringify(stored)).not.toContain("Knowledge Reviewer");
});

test("Actor Mode remains on the existing Atlas route with native geography semantics", async ({ page }) => {
  await page.goto(`${BASE}/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003&actorGeo=geo%3Agbif%3Asecretariat&c=12.57,55.68&z=5.2`);
  const overlay = page.getByRole("complementary", { name: "Actor Mode private beta" });
  await expect(overlay).toBeVisible();
  await expect(page.getByText("HEADQUARTERS REFERENCE").first()).toBeVisible();
  await expect(page.getByText("OPERATING GEOGRAPHY").first()).toBeVisible();
  await expect(page).toHaveURL(/\/atlas\?mode=actors/);
  await expect(page.getByRole("link", { name: /OPEN PROFILE/ })).toHaveAttribute("href", "/actors/global-biodiversity-information-facility");
  await expect(overlay).toHaveAttribute("data-p17-native-actor-layer", /ready|unavailable/, { timeout: 15_000 });
});
