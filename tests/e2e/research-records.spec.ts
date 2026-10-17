import { expect, test } from "@playwright/test";

test("linked research records expose all eight evidence types", async ({
  page,
}) => {
  await page.goto("/research");
  await expect(
    page.getByRole("heading", { name: "Research records" }),
  ).toBeVisible();
  for (const kind of [
    "event",
    "polity",
    "community",
    "site",
    "practice",
    "entity",
    "organization",
    "object",
  ])
    await expect(page.locator(".stat").filter({ hasText: kind })).toBeVisible();
  await page.getByLabel("Record type").selectOption("event");
  await page
    .getByRole("link", {
      name: /Thirty Years’ War and the Westphalian settlement: Pre-conflict/u,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Reviewed record" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Provenance" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /polity:/u }).first(),
  ).toBeVisible();
});
