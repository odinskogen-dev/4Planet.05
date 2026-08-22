import { expect, test } from "@playwright/test";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64",
);

for (const path of ["/lens", "/food/lens"]) {
  test(`${path} uses the shared local capture proof`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("CAMERA OFF")).toBeVisible();
    await expect(page.getByText(/No automatic species, food or verification claim/i)).toBeVisible();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles({ name: "proof.png", mimeType: "image/png", buffer: png });
    await expect(page.getByText("CAPTURED · NOT UPLOADED")).toBeVisible();
    await expect(page.getByText("MEDIA ATTACHED")).toBeVisible();
  });
}
