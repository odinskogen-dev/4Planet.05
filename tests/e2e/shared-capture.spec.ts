import { expect, test } from "@playwright/test";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64",
);

for (const path of ["/lens", "/food/lens"]) {
  test(`${path} uses the shared local capture proof`, async ({ page }) => {
    if (path === "/lens") {
      await page.route("**/api/species-identify", async (route) => {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            ok: false,
            configured: false,
            provider: "artsorakel-norway",
            error: "PROVIDER_NOT_CONFIGURED",
            truthBoundary: "No recognition claim was created.",
          }),
        });
      });
    }

    await page.goto(path);
    await expect(page.getByText("CAMERA OFF")).toBeVisible();
    await expect(page.getByText(/No automatic species, food or verification claim/i)).toBeVisible();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: "proof.png", mimeType: "image/png", buffer: png });
    await expect(page.getByText("CAPTURED · NOT UPLOADED")).toBeVisible();
    await expect(page.getByText("MEDIA ATTACHED")).toBeVisible();

    if (path === "/lens") {
      await page.getByRole("button", { name: /IDENTIFY SPECIES/i }).click();
      await expect(page.getByText(/PROVIDER NOT CONFIGURED · NO CLAIM CREATED/i)).toBeVisible();
      await expect(page.getByText(/has no API token yet/i)).toBeVisible();
    }
  });
}
