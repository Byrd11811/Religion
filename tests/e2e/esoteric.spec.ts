import { test, expect } from "@playwright/test";

test("Phase 12 collection exposes distinct historical genres", async ({ page }) => {
  await page.goto("/library/esoteric");
  await expect(page.getByRole("heading", { name: "Esoteric, occult & religious literature" })).toBeVisible();
  await expect(page.getByText("Historical evidence, not an operating manual.")).toBeVisible();
  await page.getByRole("tab", { name: "Hermetic & alchemical" }).click();
  await expect(page.getByRole("link", { name: "Corpus Hermeticum" })).toBeVisible();
  await page.getByRole("tab", { name: "Demonology & polemic" }).click();
  await expect(page.getByRole("link", { name: "Malleus Maleficarum" })).toBeVisible();
  await page.getByRole("tab", { name: "Religious literature" }).click();
  await expect(page.getByRole("link", { name: "Divine Comedy" })).toBeVisible();
  await expect(page.getByText("NON-SCRIPTURAL", { exact: true }).first()).toBeVisible();
});

test("Phase 12 connects works to repository witnesses", async ({ page }) => {
  await page.goto("/library/esoteric");
  await page.getByRole("tab", { name: "Physical witnesses" }).click();
  await expect(page.getByRole("link", { name: /Sloane MS 3648/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Sloane MS 3825/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cod. Guelf. 47.13 Aug. 4/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Yates Thompson MS 36/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Malleus maleficarum, Nuremberg 1494/ })).toBeVisible();
});

test("Phase 12 exposes practice, sacrifice, and organization evidence boundaries", async ({ page }) => {
  await page.goto("/library/esoteric");
  await page.getByRole("tab", { name: "Practices" }).click();
  await expect(page.getByRole("heading", { name: "Mesopotamian kispu offerings for the dead" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consultation of the Delphic oracle" })).toBeVisible();
  await expect(page.getByText(/not interchangeable/).first()).toBeVisible();
  await page.getByRole("tab", { name: "Sacrifice evidence" }).click();
  await expect(page.getByText("UNVERIFIED CONSPIRACY CLAIM", { exact: true })).toBeVisible();
  await expect(page.getByText(/Graphic material is excluded/)).toBeVisible();
  await page.getByRole("tab", { name: "Organizations" }).click();
  await expect(page.getByRole("heading", { name: "Bavarian Illuminati" })).toBeVisible();
  await expect(page.getByText(/global Illuminati conspiracy traditions/)).toBeVisible();
  await expect(page.getByText(/No membership is inferred/)).toBeVisible();
});
