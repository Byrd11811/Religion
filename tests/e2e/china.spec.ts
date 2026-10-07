import { expect, test } from "@playwright/test";

test("China collection separates schools and displays native title metadata", async ({ page }) => {
  await page.goto("/library/china");
  await expect(page.getByRole("heading", { name: "Chinese Texts & Traditions" })).toBeVisible();
  await expect(page.getByText("109", { exact: true })).toBeVisible();
  await expect(page.getByText("30", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/does not merge Confucian, Daoist, Buddhist/)).toBeVisible();
  await page.getByLabel("School or community").selectOption("Mohist");
  await expect(page.getByText("5 records in this view")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mozi", exact: true })).toBeVisible();
  await expect(page.getByText(/墨子 · Mòzǐ/)).toBeVisible();
});

test("China sources and physical witnesses remain separate", async ({ page }) => {
  await page.goto("/library/china");
  await page.getByRole("tab", { name: "Sources" }).click();
  await expect(page.getByText("Classical Chinese transcription").first()).toBeVisible();
  await expect(page.getByText(/No translation is bundled/).first()).toBeVisible();
  await page.getByRole("tab", { name: "Witnesses" }).click();
  await expect(page.getByText("Diamond Sutra, Or.8210/P.2")).toBeVisible();
  await expect(page.getByText(/do not assert that the bundled Project Gutenberg transcription/)).toBeVisible();
});
