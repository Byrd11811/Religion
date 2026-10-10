import { test, expect } from "@playwright/test";
test("two Quran editions can be compared without losing attribution", async ({
  page,
}) => {
  await page.goto("/texts/quran");
  await page
    .getByRole("button", { name: "Compare translations", exact: true })
    .click();
  const compareEditions = page.getByRole("button", {
    name: "Compare editions",
    exact: true,
  });
  await compareEditions.click();
  // A fresh isolated PGlite directory performs its one-time corpus seed here.
  await expect(compareEditions).toBeEnabled({ timeout: 60_000 });
  await expect(page.locator(".two-col .passage-card").first()).toBeVisible();
  await expect(page.locator(".two-col")).toContainText("J. M. Rodwell");
  await expect(page.locator(".two-col")).toContainText("George Sale");
  expect(await page.locator(".two-col > section").count()).toBe(2);
});
test("home, library filtering, reader, citations and saving", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Explore humanity/ }),
  ).toBeVisible();
  await page.goto("/library");
  await page.getByLabel("Search text library").fill("Dhammapada");
  await expect(page.locator(".text-card")).toHaveCount(1);
  await page.getByRole("heading", { name: "Dhammapada", exact: true }).click();
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.locator(".passage-card").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Open citation", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("F. Max Müller");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Save text", exact: true }).click();
  await page.getByLabel("Collection", { exact: true }).selectOption("");
  await page.getByLabel("Collection name").fill("E2E source collection");
  await page.getByRole("button", { name: "Save finding", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved to E2E source collection",
  );
  await page.goto("/workspace");
  await page.getByRole("button", { name: /E2E source collection/ }).click();
  await expect(
    page.getByRole("heading", { name: "Dhammapada", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Research notes")
    .fill("Compare the meaning of self across editions.");
  await page.getByRole("button", { name: "Save notes" }).click();
  await page.reload();
  await page.getByRole("button", { name: /E2E source collection/ }).click();
  await expect(page.getByLabel("Research notes")).toHaveValue(
    "Compare the meaning of self across editions.",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.json$/);
  await page
    .getByRole("button", { name: "Delete collection", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete collection", exact: true })
    .click();
});
test("question returns diverse evidence and comparison retrieves passages", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/questions");
  await page
    .getByLabel("Your research question")
    .fill("What happens after death?");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".answer-overview")).toContainText(
    "Evidence-only mode is active",
    { timeout: 90_000 },
  );
  await expect(page.locator(".research-claim").first()).toBeVisible();
  await page.goto("/compare");
  await page
    .getByRole("button", { name: "Compare passages", exact: true })
    .click();
  await expect(
    page.locator(".comparison-passages .passage-card").first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Show Contradictions", exact: true })
    .click();
  await expect(page.locator(".notice").first()).toContainText(
    "No automatic doctrinal contradiction",
  );
});
test("timeline, map, graph and canon controls work", async ({ page }) => {
  await page.goto("/timeline");
  await page.getByRole("button", { name: "Vertical view" }).click();
  await expect(page.locator(".vertical-timeline")).toBeVisible();
  await page.getByLabel("Timeline year").fill("-5000");
  await expect(page.locator(".empty")).toContainText("No reviewed");
  await page.goto("/map");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.locator(".map-list button").first().click();
  await expect(
    page.getByRole("link", { name: "Open text profile" }),
  ).toBeVisible();
  await page.goto("/graph");
  await expect(page.locator(".graph-surface svg")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Plato - Phaedo ↔ Bhagavad Gita",
      exact: true,
    })
    .click();
  await expect(page.locator(".graph-layout .panel")).toContainText(
    "exploratory comparison",
  );
  await page.goto("/canon");
  await page
    .getByLabel("Community grouping")
    .selectOption({ label: "Christianity" });
  await expect(page.locator("tbody")).toContainText("Gospel of Thomas");
});
test("mobile navigation and dark mode remain usable without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Text Library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Text Library", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "work/mobile.png", fullPage: true });
});
test("API validates bad input and missing sources", async ({ request }) => {
  expect(
    (await request.post("/api/query", { data: { question: "" } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/compare", { data: { textIds: ["dhammapada"] } })
    ).status(),
  ).toBe(400);
  expect((await request.get("/api/passages/missing")).status()).toBe(404);
  const health = await (await request.get("/api/health")).json();
  expect(health.works).toBeGreaterThanOrEqual(20);
  expect(health.passages).toBeGreaterThan(1000);
});

test("audited question sections render linked sources and comparison cases retain alternatives", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  await page.goto("/questions");
  await page
    .getByLabel("Your research question")
    .fill("How should we respond to injury?");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Primary evidence", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".research-claim").first(),
  ).toContainText(/evidence|source/i);
  const catalog = await (await request.get("/api/texts")).json();
  const textIds = catalog
    .filter((t: { title: string }) => /^(Tao Te Ching|Analects)$/.test(t.title))
    .map((t: { id: string }) => t.id);
  expect(textIds).toHaveLength(2);
  const comparison = await (
    await request.post("/api/compare", { data: { textIds, theme: "injury" } })
  ).json();
  expect(comparison.cases).toHaveLength(1);
  expect(comparison.cases[0].passages).toHaveLength(2);
  expect(comparison.cases[0].alternative).toContain("justice");
  await page.screenshot({ path: "work/editorial-guide.png", fullPage: true });
});
