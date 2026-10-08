import { expect, test } from "@playwright/test";

test("Indigenous collection is community-specific and protocol-first", async ({ page }) => {
  await page.goto("/library/indigenous");
  await expect(page.getByRole("heading", { name: "Global Indigenous traditions" })).toBeVisible();
  await expect(page.getByText(/not one religion/)).toBeVisible();
  await page.getByLabel("Map region").selectOption("North America");
  await expect(page.getByText("Diné communities", { exact: false })).toBeVisible();
  await expect(page.getByText("Haudenosaunee Confederacy nations", { exact: false })).toBeVisible();
  await expect(page.getByText(/no narrative reproduced/i).first()).toBeVisible();
});

test("Australian intake warning does not publish a generic narrative", async ({ page }) => {
  await page.goto("/library/indigenous");
  await page.getByLabel("Map region").selectOption("Australia");
  await expect(page.getByText(/nation-specific authority required/)).toBeVisible();
  await expect(page.getByText(/Generic title is retained only as an intake warning/)).toBeVisible();
  await expect(page.getByText("restricted narratives reproduced")).toBeVisible();
});
