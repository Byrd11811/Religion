import { test, expect } from "@playwright/test";

test("map and timeline APIs share scoped counts and validate chronology filters", async ({
  request,
}) => {
  const map = await (await request.get("/api/map?view=coverage")).json();
  expect(map.coverage.mapped).toBe(33);
  expect(map.coverage.unlocated).toBe(567);
  expect(map.coverage.undated).toBe(489);
  const witnesses = await (
    await request.get("/api/timeline?view=coverage&layer=witness")
  ).json();
  expect(witnesses.coverage.dated).toBe(46);
  expect(witnesses.coverage.undated).toBe(15);
  expect((await request.get("/api/map?year=0")).status()).toBe(400);
  expect((await request.get("/api/map?undated=maybe")).status()).toBe(400);
  expect((await request.get("/api/map?geography=surveyed")).status()).toBe(400);
});

test("Sacred Currents keeps map coverage and missing evidence visible while filters change", async ({
  page,
}) => {
  await page.goto("/map");
  await expect(page.getByTestId("sacred-currents")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence anchors" })).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  const firstMarker = page.locator(".leaflet-interactive").first();
  await expect(firstMarker).toBeVisible();
  await firstMarker.click();
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText(
    "Approximate editorial anchor",
  );
  await page.getByRole("button", { name: "Clear evidence selection" }).click();
  await page.getByRole("button", { name: "Reset world map view" }).click();
  await expect(firstMarker).toBeVisible();

  await page.getByTestId("currents-coverage").locator("summary").click();
  await expect(page.getByTestId("currents-coverage")).toContainText("33 mapped records");
  await expect(page.getByTestId("currents-coverage")).toContainText("157 dated · 504 undated");
  await page.getByTestId("currents-coverage").locator("summary").click();

  await page.getByTestId("currents-layers").locator("summary").click();
  await page.getByLabel("Include undated records").uncheck();
  await expect(page.getByTestId("currents-coverage")).toContainText("22 mapped records");
  await page.getByLabel("Include undated records").check();
  await page.getByRole("button", { name: /Work origins/ }).click();
  await expect(page.getByTestId("currents-coverage")).toContainText("0 mapped records");
  await expect(page.locator(".leaflet-interactive")).toHaveCount(0);
  await page.getByTestId("currents-layers").locator("summary").click();
  await page.getByTestId("currents-coverage").locator("summary").click();
  await expect(page.getByTestId("currents-coverage")).toContainText("61 unlocated");
  await page.getByTestId("currents-coverage").locator("summary").click();

  await page.getByPlaceholder("Find a text, witness, region or tradition…").fill("Voynich");
  await page.getByRole("option", { name: /Voynich/ }).click();
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText("Voynich");
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText(
    "Coordinates unavailable",
  );
});

test("Sacred Currents timeline, trace and guided modes expose synchronized evidence", async ({
  page,
}) => {
  await page.goto("/timeline");
  await expect(page.getByRole("heading", { name: "River of surviving records" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Timeline", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("Historical time cursor")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play time playback" })).toBeVisible();
  await page.getByRole("button", { name: "Return to 5000 BCE" }).click();
  await expect(page.getByRole("heading", { name: "5,000 BCE" })).toBeVisible();

  await page.getByRole("button", { name: /Trace/ }).click();
  await expect(page.getByRole("heading", { name: "Choose a relationship to inspect" })).toBeVisible();
  const traceShelf = page.locator("section").filter({ hasText: "Evidence-backed connections" });
  await expect(traceShelf.getByRole("button")).toHaveCount(22);
  await traceShelf.getByRole("button").first().click();
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText(
    "Relationship evidence, not a route",
  );
  await expect(page.getByTestId("currents-evidence-drawer")).toContainText("Evidence chain");

  await page.getByRole("button", { name: /Guided/ }).click();
  await expect(page.getByRole("heading", { name: /Flood stories|Wisdom across|quotation/i })).toBeVisible();
  await expect(page.getByText(/does not reconstruct a journey/i)).toBeVisible();
});

test("map tile failures leave keyboard-accessible evidence and missing-location records usable", async ({
  page,
}) => {
  await page.route("**/*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.goto("/map");
  await expect(
    page.getByText("Map tiles are unavailable.", { exact: false }),
  ).toBeVisible();
  await page.getByText(/Keyboard anchor list/).click();
  const anchorList = page.locator("details").filter({ hasText: "Keyboard anchor list" });
  const first = anchorList.getByRole("button").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByTestId("currents-evidence-drawer"),
  ).toContainText("Approximate editorial anchor");
  await expect(
    page.getByRole("link", { name: "Open record" }),
  ).toBeVisible();
});
