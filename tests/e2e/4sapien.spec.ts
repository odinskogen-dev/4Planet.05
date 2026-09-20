import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
}

test.describe("4SAPIEN Personal Choice Proof", () => {
  test("Embla front door is truthful and usable", async ({ page }) => {
    await page.goto("/4sapien");
    await expect(page).toHaveURL(/\/4sapien$/);

    await expect(page.getByRole("heading", { name: "Embla." })).toBeVisible();
    await expect(page.getByText(/Better choices for your life/i)).toBeVisible();
    await expect(page.getByText(/NO EVIDENCE → NO RECOMMENDATION/i)).toBeVisible();
    await expect(page.getByText(/does not claim live shelf availability/i)).toBeVisible();

    const foodChoice = page.getByRole("link", { name: /FOOD \/ LIVE PROOF/i });
    await expect(foodChoice).toHaveAttribute("href", "/4sapien/food");
    await foodChoice.click();
    await expect(page).toHaveURL(/\/4sapien\/food$/);
    await expect(page.getByRole("button", { name: /READ PRODUCT/i })).toBeVisible();

    await page.goto("/4sapien");
    await expectNoHorizontalOverflow(page);
  });

  test("FOOD proof exposes real lookup without a universal score", async ({ page }) => {
    await page.goto("/4sapien/food");
    await expect(page).toHaveURL(/\/4sapien\/food$/);

    await expect(page.getByRole("heading", { name: /Pick better/i })).toBeVisible();
    await expect(page.getByLabel("BARCODE / GTIN")).toBeVisible();
    await expect(page.getByRole("button", { name: /READ PRODUCT/i })).toBeVisible();
    await expect(page.getByText(/No universal score\. No paid ranking\. No fake precision\./i)).toBeVisible();
    await expect(page.getByText(/HEALTH, WALLET and PLANET separate/i)).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test("4FINANCE records a manual economy and preserves truth boundaries", async ({ page }) => {
    await page.goto("/4sapien/finance");
    await page.evaluate(() => window.localStorage.removeItem("4planet.4sapien.finance.manual.v1"));
    await page.reload();
    await expect(page).toHaveURL(/\/4sapien\/finance$/);

    await expect(page.getByRole("heading", { name: /Din økonomi/i })).toBeVisible();
    await expect(page.getByText("IKKE KOBLET", { exact: true })).toBeVisible();
    await expect(page.getByText(/Fire per døgn er et adaptivt mål/i)).toBeVisible();

    await page.getByLabel("Kontonavn").fill("Brukskonto");
    await page.getByLabel("Kontosaldo").fill("25000");
    await page.getByRole("button", { name: "Lagre konto" }).click();
    await expect(page.getByText("Brukskonto", { exact: true })).toBeVisible();

    await page.getByLabel("Ticker").fill("EQNR.OL");
    await page.getByLabel("Aksjenavn").fill("Equinor");
    await page.getByLabel("Antall aksjer").fill("10");
    await page.getByLabel("Gjennomsnittlig kjøpspris").fill("100");
    await page.getByLabel("Dagens aksjepris").fill("120");
    await page.getByRole("button", { name: "Legg til beholdning" }).click();
    await expect(page.getByText(/EQNR\.OL · NOK · MANUELL PRIS/i)).toBeVisible();
    await expect(page.getByText(/Verdi og urealisert endring er matematikk/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText("Brukskonto", { exact: true })).toBeVisible();
    await expect(page.getByText("Equinor", { exact: true })).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
