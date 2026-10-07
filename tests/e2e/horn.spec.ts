import { expect, test } from "@playwright/test";

test("Horn collection exposes distinct community and canon evidence", async ({ page }) => {
  await page.goto("/library/horn");
  await expect(page.getByRole("heading", { name: "Ethiopia, Eritrea & the Horn" })).toBeVisible();
  await expect(page.getByText(/independent community records linked through shared Geʽez heritage/)).toBeVisible();
  await page.getByRole("tab", { name: "Communities" }).click();
  await expect(page.getByRole("heading", { name: "Ethiopian Orthodox Tewahedo Church" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eritrean Orthodox Tewahedo Church" })).toBeVisible();
  await page.getByRole("tab", { name: "Canon" }).click();
  await expect(page.getByText(/An Ethiopian enumeration is not copied to the Eritrean church/)).toBeVisible();
  await expect(page.getByRole("link", { name: "1 Enoch" })).toBeVisible();
});

test("Meqabyan and manuscript evidence retain their limits", async ({ page }) => {
  await page.goto("/library/horn");
  await page.getByLabel("Community or corpus").selectOption("Ethiopian Orthodox Tewahedo");
  await expect(page.getByRole("heading", { name: "First Book of Ethiopian Meqabyan" })).toBeVisible();
  await expect(page.getByText(/not identified with the Greek Maccabees records/).first()).toBeVisible();
  await page.getByRole("tab", { name: "Manuscripts" }).click();
  await expect(page.getByText("Kebra Nagast, British Library Or 818")).toBeVisible();
  await expect(page.getByText(/Empty work associations are deliberate/)).toBeVisible();
});

test("world map links unlocated Horn records without inventing a centroid", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByRole("link", { name: "Ethiopia, Eritrea & the Horn collection" })).toBeVisible();
  await expect(page.getByText(/does not place those records at a regional centroid/)).toBeVisible();
});
