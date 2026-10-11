import { expect, test } from "@playwright/test";

test("relationship graph filters heterogeneous nodes and exposes its evidence chain", async ({
  page,
}) => {
  await page.goto("/graph");
  await expect(
    page.getByRole("heading", { name: "Influence Graph", exact: true }),
  ).toBeVisible();
  expect(await page.locator(".graph-node").count()).toBeGreaterThan(10);
  await expect(page.locator(".graph-node--work").first()).toBeVisible();
  await expect(page.locator(".graph-node--tradition").first()).toBeVisible();
  await expect(page.locator(".graph-node--person").first()).toBeVisible();
  await expect(page.locator(".graph-node--concept").first()).toBeVisible();
  await expect(page.locator(".graph-node--organization").first()).toBeVisible();
  await expect(page.locator(".graph-node--artifact").first()).toBeVisible();

  await page.getByLabel("Evidence level").selectOption("strong");
  await expect(page.locator(".graph-edge").first()).toBeVisible();
  await page.locator(".graph-edge").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".graph-evidence--strong")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Supporting citations" }),
  ).toBeVisible();
  await expect(page.locator(".graph-citations a").first()).toBeVisible();
  await expect(page.locator(".graph-source-chain li").first()).toBeVisible();
  await expect(page.locator(".graph-claim-status")).toContainText(
    "Track C claim status",
  );
  await expect(
    page.getByRole("heading", { name: "Counterarguments and limits" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Find a node").fill("Freemasonry");
  await expect(
    page.getByRole("button", { name: /Freemasonry Organization/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Freemasonry Organization/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Freemasonry", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".graph-connection-list button").first()).toBeVisible();
});

test("relationship graph contains scrolling inside the graph on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/graph");
  await expect(page.locator(".graph-scroll")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    graphClientWidth: document.querySelector(".graph-scroll")?.clientWidth ?? 0,
    graphScrollWidth: document.querySelector(".graph-scroll")?.scrollWidth ?? 0,
  }));
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.graphScrollWidth).toBeGreaterThan(dimensions.graphClientWidth);
  await expect(page.getByLabel("Find a node")).toBeVisible();
});

test("random connection keeps a reviewable edge and can choose another", async ({
  page,
}) => {
  await page.goto("/random");
  await expect(
    page.getByRole("heading", { name: "A Random Connection", exact: true }),
  ).toBeVisible();
  const relationshipId = page.locator(".graph-claim-status dd").nth(1);
  const firstId = await relationshipId.textContent();
  await page.getByRole("button", { name: "Another connection" }).click();
  await expect(relationshipId).not.toHaveText(firstId ?? "");
  await expect(page.locator(".graph-citations a").first()).toBeVisible();
});
