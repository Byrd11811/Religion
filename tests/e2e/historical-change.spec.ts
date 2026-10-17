import { expect, test } from "@playwright/test";

test("Sacred Currents exposes sourced historical change modes", async ({
  page,
}) => {
  await page.goto("/map");
  await page
    .getByRole("button", { name: /Change Compare sourced historical states/u })
    .click();
  await expect(
    page.getByRole("heading", { name: "Show what changed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Transition stages" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Pre-conflict/u }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Side by side" }).click();
  await expect(page.getByLabel("Pre-conflict map")).toBeVisible();
  await expect(page.getByLabel("Immediate settlement map")).toBeVisible();
  await page.getByRole("tab", { name: "Delta only" }).click();
  await expect(
    page.getByText(/legal and constitutional change/iu),
  ).toBeVisible();
  await page.getByLabel("Case study").selectOption("safavid-shiism");
  await page.getByRole("tab", { name: "Influence flows" }).click();
  await expect(page.locator("article").getByText("state-sponsorship")).toBeVisible();
  await expect(
    page.getByText(/not a precise journey or population count/iu),
  ).toBeVisible();
});
