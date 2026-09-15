import { test, expect } from "@playwright/test";

test("search validates and enforces passage source types", async ({
  request,
}) => {
  const primaryResponse = await request.get(
    "/api/search?q=God&contentType=Primary%20text",
  );
  expect(primaryResponse.ok()).toBeTruthy();
  const primary = await primaryResponse.json();
  expect(primary.length).toBeGreaterThan(0);
  expect(
    primary.every(
      (row: { contentType: string }) => row.contentType === "Primary text",
    ),
  ).toBeTruthy();

  const commentaryResponse = await request.get(
    "/api/search?q=Gilgamesh&contentType=Scholarly%20commentary",
  );
  const commentary = await commentaryResponse.json();
  expect(commentary.length).toBeGreaterThan(0);
  expect(
    commentary.every(
      (row: { contentType: string }) =>
        row.contentType === "Scholarly commentary",
    ),
  ).toBeTruthy();
  expect(
    (await request.get("/api/search?q=test&contentType=Scripture")).status(),
  ).toBe(400);
});

test("reader labels reviewed primary text and scholarly study excerpts", async ({
  page,
}) => {
  await page.goto("/texts/genesis");
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.locator(".passage-card").first()).toContainText(
    "Primary text",
  );

  await page.goto("/texts/epic-of-gilgamesh");
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.locator(".passage-card").first()).toContainText(
    "Scholarly commentary",
  );
});
