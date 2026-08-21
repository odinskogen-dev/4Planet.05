import { expect, test } from "@playwright/test";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z2S8AAAAASUVORK5CYII=",
  "base64",
);

test.describe("LENS 01 capture proof", () => {
  test.use({
    geolocation: { latitude: 43.4, longitude: -3.0 },
    permissions: ["geolocation"],
  });

  test("keeps capture local, exposes fallback and records optional location", async ({ page }) => {
    await page.goto("/lens");

    await expect(page.getByRole("heading", { name: "See it. Capture it." })).toBeVisible();
    await expect(page.getByText("PASS 01 / LOCAL CAPTURE ONLY")).toBeVisible();
    await expect(page.getByText("No species ID, verification or research-grade status is created in Pass 01.")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "lens-proof.png",
      mimeType: "image/png",
      buffer: ONE_PIXEL_PNG,
    });

    await expect(page.getByText("CAPTURED · NOT UPLOADED")).toBeVisible();
    await expect(page.getByText("MEDIA ATTACHED")).toBeVisible();
    await expect(page.getByText("Photo selected")).toBeVisible();

    await page.getByRole("button", { name: "Add location" }).click();
    await expect(page.getByText("43.40000, -3.00000")).toBeVisible();

    await page.getByRole("button", { name: "Retake" }).click();
    await expect(page.getByText("CAMERA OFF")).toBeVisible();
    await expect(page.getByText("NOT REPORTED")).toBeVisible();
  });
});
