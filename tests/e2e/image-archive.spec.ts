import { expect, test } from "@playwright/test";

test("image archive exposes balanced institutional and object filters", async ({ page }) => {
  await page.goto("/artifacts");
  await expect(page.getByRole("heading", { name: "Images, Manuscripts & Objects" })).toBeVisible();
  await expect(page.getByText("500", { exact: true })).toBeVisible();
  await expect(page.getByText("verified images", { exact: true })).toBeVisible();
  await page.getByLabel("Institution").selectOption("Art Institute of Chicago");
  await expect(page.getByText("125 matching images", { exact: false })).toBeVisible();
  await page.getByLabel("Object type").selectOption("Sculpture");
  await expect(page.locator(".institutional-image-card")).toHaveCount(24);
  await page.locator(".institutional-image-card h2 a").first().click();
  await expect(page.getByText("Institutional IIIF manifest ↗")).toBeVisible();
});
