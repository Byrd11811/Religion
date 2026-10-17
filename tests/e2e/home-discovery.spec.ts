import { expect, test } from "@playwright/test";

test("home exposes every Phase 21 gateway and evidence-aware discovery module", async ({
  page,
}) => {
  await page.goto("/");
  for (const label of [
    "Egypt",
    "Mesopotamia",
    "Anunna / Anunnaki",
    "China",
    "Ethiopia & the Horn",
    "Indigenous traditions",
    "Manuscripts",
    "Undeciphered",
    "Lost",
    "Forbidden",
    "Disputed",
    "Esoteric",
    "Modern religions",
    "Religious literature",
  ])
    await expect(
      page.locator(".gateway-card").filter({ hasText: label }),
    ).toBeVisible();
  await expect(page.getByText("Artifact of the Week")).toBeVisible();
  await expect(page.getByText("Manuscript of the Week")).toBeVisible();
  await expect(page.getByText("Surprising Parallel")).toBeVisible();
  await expect(page.getByRole("link", { name: /Deep Archive/u })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Show the Opposition/u }),
  ).toBeVisible();
  await expect(
    page.getByText(/similarity is not proof of influence/iu),
  ).toBeVisible();
});
