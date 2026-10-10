import { expect, test } from "@playwright/test";

test("ontology exposes the complete hierarchy and scoped language terms", async ({
  page,
}) => {
  await page.goto("/ontology");
  await expect(
    page.getByRole("heading", { name: "Concept ontology", exact: true }),
  ).toBeVisible();
  const coverage = page.getByLabel("Ontology coverage");
  await expect(coverage).toContainText("89");
  await expect(coverage).toContainText("9");
  await expect(coverage).toContainText("115");
  await expect(coverage).toContainText("20");
  await expect(page.getByLabel("Search ontology concepts")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Religion & worldview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/related term is not automatically a translation/i),
  ).toBeVisible();

  await page.getByLabel("Search ontology concepts").fill("soul");
  await expect(page.getByRole("status")).toHaveText(
    /[1-9]\d* matching concept records?\./,
  );
  await page.getByRole("link", { name: "Soul", exact: true }).click();
  await expect(page).toHaveURL(/\/ontology\/soul$/);
  await expect(
    page.getByRole("heading", { name: "Source-language terms" }),
  ).toBeVisible();
  await expect(page.getByText(/related.*contrast.*not aliases/i)).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();

  await page.goto("/ontology");
  await page.getByLabel("Search ontology concepts").fill("आत्मन्");
  await expect(page.getByRole("status")).toHaveText(
    /[1-9]\d* matching concept records?\./,
  );
  await expect(
    page.getByRole("link", { name: "Soul", exact: true }),
  ).toBeVisible();

  await page.getByLabel("Search ontology concepts").fill("worldview");
  await expect(page.getByRole("status")).toHaveText(
    /[1-9]\d* matching concept records?\./,
  );
  await expect(
    page.getByRole("link", { name: "Religion & worldview", exact: true }),
  ).toBeVisible();
});

test("classification cases show competing causes and bounded conversion evidence", async ({
  page,
}) => {
  await page.goto("/ontology");

  const conflicts = page.getByLabel("Conflict case applications");
  await expect(
    conflicts.getByRole("heading", {
      name: "Conflict case applications",
      exact: true,
    }),
  ).toBeVisible();
  await expect(conflicts.locator("[data-conflict-case-id]")).toHaveCount(2);

  const thirtyYears = conflicts.locator(
    '[data-conflict-case-id="conflict-thirty-years-war"]',
  );
  await expect(
    thirtyYears.getByRole("heading", { name: "Thirty Years' War" }),
  ).toBeVisible();
  await expect(thirtyYears).toContainText("1618–1648");
  await expect(thirtyYears).toContainText("Holy Roman Empire");
  await expect(thirtyYears).toContainText("France");
  await expect(thirtyYears).toContainText("Participant justifications");
  await expect(thirtyYears).toContainText("Scholarly interpretations");
  await expect(thirtyYears).toContainText("Disputed causation");
  await expect(thirtyYears).toContainText("Uncertainty");
  await expect(thirtyYears.locator("[data-cause-id]")).toHaveCount(4);
  await expect(
    thirtyYears.locator('[data-cause-id="religious"]'),
  ).toBeVisible();
  await expect(
    thirtyYears.locator('[data-cause-id="territorial"]'),
  ).toBeVisible();
  await expect(
    thirtyYears.locator('[data-cause-id="political"]'),
  ).toBeVisible();
  await expect(thirtyYears.locator('[data-cause-id="mixed"]')).toBeVisible();
  expect(
    await thirtyYears.locator('[aria-label="Sources"] a').count(),
  ).toBeGreaterThan(0);

  const india1857 = conflicts.locator(
    '[data-conflict-case-id="conflict-india-1857"]',
  );
  await expect(
    india1857.getByRole("heading", { name: "Indian Rebellion of 1857" }),
  ).toBeVisible();
  await expect(india1857.locator("[data-cause-id]")).toHaveCount(5);
  await expect(
    india1857.locator('[data-cause-id="anti-colonial"]'),
  ).toBeVisible();
  await expect(india1857.locator('[data-cause-id="religious"]')).toBeVisible();
  await expect(india1857.locator('[data-cause-id="disputed"]')).toBeVisible();

  const conversions = page.getByLabel("Conversion case applications");
  await expect(
    conversions.getByRole("heading", {
      name: "Conversion case applications",
      exact: true,
    }),
  ).toBeVisible();
  await expect(conversions.locator("[data-conversion-case-id]")).toHaveCount(2);

  const constantinian = conversions.locator(
    '[data-conversion-case-id="conversion-constantinian-christian-sponsorship"]',
  );
  await expect(constantinian).toContainText("Stated policy");
  await expect(constantinian).toContainText("Stated justification");
  await expect(constantinian).toContainText("Resistance and continuity");
  await expect(constantinian).toContainText("Disputes and uncertainty");
  await expect(
    constantinian.locator('[data-mode-id="state-sponsorship"]'),
  ).toBeVisible();
  await expect(
    constantinian.locator('[data-mode-id="continuity-despite-change"]'),
  ).toBeVisible();
  await expect(
    constantinian.locator('[data-mode-id="forced-conversion"]'),
  ).toHaveCount(0);

  const safavid = conversions.locator(
    '[data-conversion-case-id="conversion-safavid-shiism-iran"]',
  );
  const forced = safavid.locator('[data-mode-id="forced-conversion"]');
  await expect(forced).toHaveCount(1);
  await expect(forced).toHaveAttribute(
    "data-evidence-standard",
    "documented-direct-force",
  );
  await expect(forced).toContainText("Forced conversion");
  await expect(forced).toContainText("ordered Sunni Muslims to become Shia");
  expect(
    await safavid.locator('[aria-label="Sources"] a').count(),
  ).toBeGreaterThan(0);
});

test("entity browser keeps Unicode forms searchable and links Yijing to its work", async ({
  page,
  request,
}) => {
  await page.goto("/entities");
  await expect(
    page.getByRole("heading", { name: "Historical entities", exact: true }),
  ).toBeVisible();
  const coverage = page.getByLabel("Entity coverage");
  await expect(coverage).toContainText("17");
  await expect(coverage).toContainText("73");
  await expect(coverage).toContainText("54");
  await expect(coverage).toContainText("8");

  await page.getByLabel("Search historical entities").fill("易經");
  await expect(page.getByRole("status")).toContainText("1 matching entity");
  await page.getByRole("link", { name: "Yijing", exact: true }).first().click();
  await expect(page).toHaveURL(/\/entities\/yijing$/);
  await expect(
    page.getByRole("heading", { name: "Names and original-language forms" }),
  ).toBeVisible();
  await expect(page.getByText("易經", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open linked Atlas work" }).first(),
  ).toHaveAttribute("href", "/texts/i-ching");

  const response = await request.get(
    `/api/federated-search?q=${encodeURIComponent("易經")}&type=entity`,
  );
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { items: { id: string }[] };
  expect(body.items.some((item) => item.id === "yijing")).toBe(true);
});

test("contextual relationships never merge Belial with Baal or Lucifer with Satan", async ({
  page,
}) => {
  await page.goto("/entities/belial");
  await expect(
    page.getByRole("heading", { name: "Belial", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Belial and Baal remain separate entity records/i),
  ).toBeVisible();
  await expect(
    page
      .getByText(/Contextual relation · not an unconditional equivalence/i)
      .first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Baal/ }).first()).toBeVisible();

  await page.goto("/entities/lucifer");
  await expect(
    page.getByText(/Lucifer and Satan remain separate entity records/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Satan", exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(/later conflation/i).first()).toBeVisible();
});

test("entity records expose source-specific occurrences and evolution evidence", async ({
  page,
}) => {
  await page.goto("/entities/anunna");
  await expect(
    page.getByRole("heading", { name: "Anunna", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Source occurrences" }),
  ).toBeVisible();
  expect(
    await page.locator(".entity-occurrence-list article").count(),
  ).toBeGreaterThanOrEqual(9);
  await expect(page.getByText("Confidence:").first()).toBeVisible();
  await expect(page.getByLabel("Sources").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Evolution through sources" }),
  ).toBeVisible();
  expect(await page.locator(".entity-evolution li").count()).toBeGreaterThan(0);
});
