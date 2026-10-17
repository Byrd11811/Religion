import { expect, test } from "@playwright/test";

test("work page exposes source-linked shared-reference alignment", async ({ page }) => {
  await page.goto("/texts/tao-te-ching");
  await page.getByRole("button", { name: "Compare translations" }).click();
  await expect(page.getByText("These rows share a real canonical reference")).toBeVisible();
  await expect(page.getByLabel("Shared reference")).toHaveValue("tao-te-ching-1");
  await expect(page.getByText("道可道，非常道。", { exact: false })).toBeVisible();
  await expect(page.getByText("James Legge · English · Latin", { exact: false })).toBeVisible();
  await expect(page.getByText("Not available in the reviewed corpus.")).toHaveCount(2);
});

test("unaligned editions expose the evidence gap instead of keyword pairing", async ({ page }) => {
  await page.goto("/texts/quran");
  await page.getByRole("button", { name: "Compare translations" }).click();
  await expect(page.getByText("No reviewed shared-reference alignment is bundled for this work.", { exact: false })).toBeVisible();
  await page.getByText("Priority-language coverage").click();
  await expect(page.getByText("Two attributed English Qur’an editions", { exact: false })).toBeVisible();
});
