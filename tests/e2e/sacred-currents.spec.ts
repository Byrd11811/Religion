import { expect, test } from "@playwright/test";

test("decluttered home and navigation keep the full atlas discoverable", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Follow humanity’s long conversation/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sacred Currents", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation").getByText("Research tools", { exact: true })).toBeVisible();
  await page.getByRole("navigation").getByText("Research tools", { exact: true }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Relationship graph" }),
  ).toBeVisible();
  await expect(page.getByText("Timeline streams · not geographic routes")).toBeVisible();
});

test("compare mode aligns two selected records without implying influence", async ({ page }) => {
  await page.goto("/map");
  await page.getByRole("button", { name: /Compare/ }).click();
  await page.getByText(/Keyboard anchor list/).click();
  const anchors = page.locator("details").filter({ hasText: "Keyboard anchor list" }).getByRole("button");
  await anchors.nth(0).click();
  await anchors.nth(1).click();
  const drawer = page.getByTestId("currents-evidence-drawer");
  await expect(drawer.getByRole("heading", { name: "Compare records" })).toBeVisible();
  await expect(drawer).toContainText("Similarity is not treated as influence");
  await expect(drawer.getByRole("link", { name: "Open record" })).toHaveCount(2);
});

test("shared anchors expose every record instead of silently choosing one", async ({ page }) => {
  await page.goto("/map");
  await page.getByText(/Keyboard anchor list/).click();
  await page
    .locator("details")
    .filter({ hasText: "Keyboard anchor list" })
    .getByRole("button")
    .filter({ hasText: "2 records" })
    .first()
    .click();
  const drawer = page.getByTestId("currents-evidence-drawer");
  await expect(
    drawer.getByRole("heading", { name: "2 records at this coordinate" }),
  ).toBeVisible();
  await expect(drawer.locator("section").getByRole("button")).toHaveCount(2);
});

test("all record layers and missing-data records remain browseable", async ({ page }) => {
  await page.goto("/map");
  await page.getByTestId("currents-layers").locator("summary").click();
  await expect(page.getByRole("button", { name: /Museum objects/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Tradition groupings/ })).toBeVisible();
  await page.getByRole("button", { name: /Museum objects/ }).click();
  await page
    .getByLabel("Sacred Currents geographic evidence")
    .selectOption("unlocated");
  await page.getByTestId("currents-layers").locator("summary").click();

  const directory = page.getByTestId("currents-record-directory");
  await directory.locator("summary").click();
  await expect(
    directory.getByRole("heading", { name: /Dated, undated/ }),
  ).toBeVisible();
  await expect(directory).toContainText("Unlocated");
  await expect(directory.getByRole("button", { name: /Next/ })).toBeVisible();
});

test("trace search selects a matching relationship and labels its target", async ({ page }) => {
  await page.goto("/map");
  await page
    .getByPlaceholder("Find a text, witness, region or tradition…")
    .fill("Mawangdui");
  await page.getByRole("button", { name: /Trace/ }).click();

  const traceShelf = page
    .locator("section")
    .filter({ hasText: "Evidence-backed connections" });
  await expect(traceShelf.getByRole("button")).toHaveCount(1);
  const drawer = page.getByTestId("currents-evidence-drawer");
  await expect(drawer).toContainText("Mawangdui Laozi silk manuscripts");
  await expect(drawer.getByRole("button", { name: /^Target/ })).toBeVisible();
});

test("Sacred Currents remains usable on mobile without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/map");
  await expect(page.getByTestId("sacred-currents")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play time playback" })).toBeVisible();
  await page.getByText(/Keyboard anchor list/).click();
  await page
    .locator("details")
    .filter({ hasText: "Keyboard anchor list" })
    .getByRole("button")
    .first()
    .click();
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText(
    "Approximate editorial anchor",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
