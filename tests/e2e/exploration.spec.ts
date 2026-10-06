import { test, expect } from "@playwright/test";

test("map and timeline APIs share scoped counts and validate chronology filters", async ({
  request,
}) => {
  const map = await (await request.get("/api/map?view=coverage")).json();
  expect(map.coverage.mapped).toBe(37);
  expect(map.coverage.unlocated).toBe(233);
  expect(map.coverage.undated).toBe(236);
  const witnesses = await (
    await request.get("/api/timeline?view=coverage&layer=witness")
  ).json();
  expect(witnesses.coverage.dated).toBe(17);
  expect(witnesses.coverage.undated).toBe(3);
  expect((await request.get("/api/map?year=0")).status()).toBe(400);
  expect((await request.get("/api/map?undated=maybe")).status()).toBe(400);
  expect((await request.get("/api/map?geography=surveyed")).status()).toBe(400);
});

test("map includes unknown dates and preserves location evidence when filters change", async ({
  page,
}) => {
  await page.goto("/map");
  await expect(page.getByTestId("map-coverage")).toContainText(
    "37 mapped records",
  );
  await expect(page.locator(".map-list button")).toHaveCount(37);
  await page.getByLabel("Include records with unknown dates").uncheck();
  await expect(page.getByTestId("map-coverage")).toContainText(
    "26 mapped records",
  );
  await page.getByLabel("Include records with unknown dates").check();
  await page.getByLabel("Map layer").selectOption("witness");
  await expect(page.getByTestId("map-coverage")).toContainText(
    "0 mapped records",
  );
  await expect(page.getByTestId("map-coverage")).toContainText(
    "20 records without defensible coordinates",
  );
  await page
    .getByText("Records without defensible coordinates (20)", { exact: true })
    .click();
  await expect(page.locator(".spatial-records")).toContainText("Voynich");
});

test("timeline exposes unknown records, uses full chronology and distinguishes witness dates", async ({
  page,
}) => {
  await page.goto("/timeline");
  await expect(page.getByTestId("timeline-coverage")).toContainText(
    "236 undated records available below",
  );
  await expect(page.locator(".timeline-axis")).toContainText("5000 BCE");
  await page
    .getByLabel("Timeline tradition")
    .selectOption({ label: "Ancient Egypt" });
  await expect(page.getByTestId("timeline-coverage")).not.toContainText(
    "236 undated",
  );
  await page.getByLabel("Timeline tradition").selectOption("");
  await page.getByLabel("Timeline layer").selectOption("witness");
  await expect(page.getByTestId("timeline-coverage")).toContainText(
    "17 dated records",
  );
  await expect(page.getByTestId("timeline-coverage")).toContainText(
    "3 undated records",
  );
  await expect(page.locator(".timeline-row")).toHaveCount(17);
  await expect(page.locator(".timeline-row").first()).toContainText("witness");
});

test("map tile failures leave keyboard-accessible evidence and missing-location records usable", async ({
  page,
}) => {
  await page.route("**/*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.goto("/map");
  await expect(
    page.getByText("Map tiles are unavailable.", { exact: false }),
  ).toBeVisible();
  const first = page.locator(".map-list button").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Selected location evidence" }),
  ).toContainText("Approximate editorial anchor");
  await expect(
    page.getByRole("link", { name: "Open text profile" }),
  ).toBeVisible();
});
