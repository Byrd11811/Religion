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

  await page.goto("/texts/tale-of-sinuhe");
  await expect(page.getByText("W. M. Flinders Petrie · English")).toBeVisible();
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.locator(".passage-card").first()).toContainText(
    "Primary text",
  );
});

test("Egyptian translation search remains scoped to reviewed primary text", async ({
  request,
}) => {
  const response = await request.get(
    "/api/search?q=king&text=tale-of-sinuhe&contentType=Primary%20text",
  );
  expect(response.ok()).toBeTruthy();
  const rows = await response.json();
  expect(rows.length).toBeGreaterThan(0);
  expect(
    rows.every(
      (row: { textId: string; contentType: string }) =>
        row.textId === "tale-of-sinuhe" && row.contentType === "Primary text",
    ),
  ).toBeTruthy();

  const reconstructed = await request.get(
    "/api/search?q=mighty&text=setna-i-magic-book&contentType=Unknown",
  );
  expect(reconstructed.ok()).toBeTruthy();
  const reconstructedRows = await reconstructed.json();
  expect(reconstructedRows.length).toBeGreaterThan(0);
  expect(
    reconstructedRows.every(
      (row: { contentType: string }) => row.contentType === "Unknown",
    ),
  ).toBeTruthy();
  const translated = await request.get(
    "/api/search?q=book&text=setna-i-magic-book&contentType=Primary%20text",
  );
  const translatedRows = await translated.json();
  expect(translatedRows.length).toBeGreaterThan(0);
  expect(
    translatedRows.every(
      (row: { contentType: string }) => row.contentType === "Primary text",
    ),
  ).toBeTruthy();
});
