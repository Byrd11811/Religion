import { test, expect } from "@playwright/test";

test("Phase 14 exposes three dedicated research collections with working filters", async ({
  page,
}) => {
  await page.goto("/library/forbidden");
  await expect(
    page.getByRole("heading", {
      name: "Forbidden, restricted & canon-excluded texts",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Search restriction records")).toBeVisible();
  await expect(page.getByLabel("Restriction type")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("10 matching records.");
  await expect(
    page.getByLabel("Restriction type").locator("option"),
  ).toHaveCount(10);
  await expect(
    page.getByRole("link", { name: "Forbidden & restricted", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page
    .getByRole("link", { name: "Lost & hypothetical", exact: true })
    .click();
  await expect(page).toHaveURL(/\/library\/lost$/);
  await expect(
    page.getByRole("heading", {
      name: "Lost, fragmentary & hypothetical sources",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Search lost and hypothetical records"),
  ).toBeVisible();
  await expect(page.getByLabel("Record kind")).toBeVisible();
  await expect(page.getByLabel("Confidence")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("17 matching records.");

  await page.goto("/library/disputed");
  await expect(
    page.getByRole("heading", {
      name: "Disputed, forged & hoax-associated works",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Search disputed records")).toBeVisible();
  await expect(page.getByLabel("Authenticity status")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("8 matching records.");
});

test("canon exclusion and audience restriction remain distinct from bans", async ({
  page,
}) => {
  await page.goto("/library/forbidden");
  const search = page.getByLabel("Search restriction records");

  await search.fill("Shepherd of Hermas");
  await expect(page.getByRole("status")).toContainText("1 matching records.");
  const shepherd = page.getByRole("article");
  await expect(shepherd).toContainText("Shepherd of Hermas");
  await expect(
    shepherd.getByText("Canon boundary / not banned", { exact: true }),
  ).toBeVisible();

  await search.fill("Hagigah");
  await expect(page.getByRole("status")).toContainText("1 matching records.");
  const hagigah = page.getByRole("article");
  await expect(hagigah).toContainText("Hagigah");
  await expect(
    hagigah.getByText("Audience-restricted teaching / not a book ban", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(hagigah).toContainText(
    "No book prohibition is claimed by this record",
  );
});

test("hypothetical sources show arguments without inventing a physical witness", async ({
  page,
}) => {
  await page.goto("/library/lost");
  await page
    .getByLabel("Record kind")
    .selectOption({ label: "Hypothetical source" });
  await expect(page.getByRole("status")).toContainText("6 matching records.");
  await expect(
    page.getByText("No physical witness", { exact: true }),
  ).toHaveCount(6);

  await page
    .getByLabel("Search lost and hypothetical records")
    .fill("Q source");
  await expect(page.getByRole("status")).toContainText("1 matching records.");
  const qSource = page.getByRole("article");
  await expect(qSource).toContainText("Q source");
  await expect(
    qSource.getByText("No physical witness", { exact: true }),
  ).toBeVisible();
  await expect(
    qSource.getByRole("heading", { name: "Arguments for" }),
  ).toBeVisible();
  await expect(
    qSource.getByRole("heading", { name: "Arguments against" }),
  ).toBeVisible();
  await expect(qSource).toContainText(/not a recovered manuscript/i);
});

test("Berossus is presented through its indirect source-derivation chain", async ({
  page,
}) => {
  await page.goto("/library/lost");
  await page
    .getByLabel("Search lost and hypothetical records")
    .fill("Berossus");
  await expect(page.getByRole("status")).toContainText("1 matching records.");
  const berossus = page.getByRole("article");
  await expect(berossus).toContainText("Berossus");
  await expect(
    berossus.getByRole("heading", { name: "Source derivation" }),
  ).toBeVisible();
  await expect(berossus).toContainText("Alexander Polyhistor");
  await expect(berossus).toContainText(/Josephus|Eusebius/);
  await expect(berossus).not.toContainText("Syncellus");
  await expect(berossus).toContainText(/indirect|later/i);
});

test("disputed works foreground authenticity and separate claimed from physical provenance", async ({
  page,
}) => {
  await page.goto("/library/disputed");
  const authenticity = page.getByLabel("Authenticity status");
  const forgeryStatus = await authenticity
    .getByRole("option")
    .filter({ hasText: /forgery/i })
    .first()
    .evaluate((option) => (option as HTMLOptionElement).value);
  await authenticity.selectOption(forgeryStatus);
  const filteredCards = page.getByRole("article").filter({
    hasText: "Authenticity status:",
  });
  expect(await filteredCards.count()).toBeGreaterThan(0);
  for (const card of await filteredCards.all())
    await expect(card).toContainText(forgeryStatus);

  await page
    .getByLabel("Search disputed records")
    .fill("Gospel of Jesus’ Wife");
  await expect(page.getByRole("status")).toContainText("1 matching records.");
  const gospel = page.getByRole("article");
  await expect(
    gospel.locator("p.notice").filter({ hasText: "Authenticity status:" }),
  ).toContainText(/forgery/i);
  await expect(
    gospel.getByRole("heading", { name: "Claimed provenance", exact: true }),
  ).toBeVisible();
  await expect(
    gospel.getByRole("heading", {
      name: "Physical and documented provenance",
      exact: true,
    }),
  ).toBeVisible();
  await expect(gospel).toContainText(/ancient Coptic fragment/i);
  await expect(gospel).toContainText(/papyrus|radiocarbon|ink/i);
  await expect(gospel).toContainText(/modern forgery/i);

  await authenticity.selectOption("");
  await page.getByLabel("Search disputed records").fill("Oera Linda");
  const oera = page.getByRole("article");
  await expect(oera).toContainText(
    "No credible supporting evidence identified",
  );
  await expect(
    oera.getByRole("heading", {
      name: "Reception or belief — not authenticity evidence",
    }),
  ).toBeVisible();

  await page.getByLabel("Search disputed records").fill("Jehoash");
  const jehoash = page.getByRole("article");
  await expect(
    jehoash.getByRole("heading", {
      name: "Legal disposition — not an authenticity finding",
    }),
  ).toBeVisible();
  await expect(jehoash).toContainText(/beyond a reasonable doubt/i);
});
