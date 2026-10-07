import { expect, test } from "@playwright/test";

test("Mesopotamia collection exposes reviewed composites and physical tablets separately", async ({
  page,
}) => {
  await page.goto("/library/mesopotamia");
  await expect(
    page.getByRole("heading", { name: "Ancient Mesopotamia", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("77", { exact: true })).toBeVisible();
  await expect(
    page.getByText("26", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(/Q identifiers name scholarly composite texts/)).toBeVisible();

  await page.getByRole("tab", { name: "Primary Sources" }).click();
  await expect(page.getByText("Sumerian transliteration").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "ORACC composition ↗" }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Physical Witnesses" }).click();
  await expect(page.getByText("CBS 04561 (P260875)")).toBeVisible();
  await expect(page.getByText(/does not establish that every composite line/).first()).toBeVisible();
});

test("Anunnaki guide presents five sourced evidence layers", async ({ page }) => {
  await page.goto("/explore/anunnaki");
  await expect(
    page.getByRole("heading", { name: "Anunna / Anunnaki", exact: true }),
  ).toBeVisible();
  for (const label of [
    "Primary Sources",
    "Mainstream Scholarship",
    "Alternative Interpretations",
    "Modern / Popular Claims",
    "Ancient Text vs Modern Claim",
  ]) {
    await expect(page.getByRole("tab", { name: label })).toBeVisible();
  }
  await expect(page.getByText(/Primary attestation · Q000333 · line 4/)).toBeVisible();
  await expect(page.getByText(/no English translation/i).first()).toBeVisible();

  await page.getByRole("tab", { name: "Mainstream Scholarship" }).click();
  await expect(page.getByText("Nicole Brisch").first()).toBeVisible();
  await page.getByRole("tab", { name: "Modern / Popular Claims" }).click();
  await expect(page.getByRole("heading", { name: "Anunnaki as visitors from Nibiru" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open claimant publication record ↗" }).first()).toBeVisible();
  await expect(page.getByText(/not ancient evidence or Atlas endorsement/i).first()).toBeVisible();

  await page.getByRole("tab", { name: "Ancient Text vs Modern Claim" }).click();
  await expect(page.getByRole("heading", { name: "Ancient record" }).first()).toBeVisible();
  await expect(page.getByText(/Limitation:/).first()).toBeVisible();
});

test("Anunnaki search returns ancient primary evidence before catalog interpretation", async ({
  page,
  request,
}) => {
  const response = await request.get(
    "/api/search?q=Anunnaki&preferPrimary=true&limit=12",
  );
  expect(response.ok()).toBeTruthy();
  const rows = (await response.json()) as {
    contentType: string;
    sourceUrl: string;
    themes: string[];
  }[];
  expect(rows.length).toBeGreaterThan(0);
  expect(rows[0].contentType).toBe("Primary text");
  expect(rows[0].sourceUrl).toContain("oracc.museum.upenn.edu");
  expect(rows.some((row) => row.themes.includes("anunnaki"))).toBeTruthy();

  await page.goto("/search?q=Anunnaki");
  await page.getByLabel("Search mode").selectOption("Scholarly");
  await expect(page.getByRole("heading", { name: "Edition passages" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Anunnaki", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".passage-card").first()).toContainText("Primary text");
  const evidenceFirst = await page.evaluate(() => {
    const passages = [...document.querySelectorAll("h2")].find(
      (node) => node.textContent === "Edition passages",
    );
    const catalog = [...document.querySelectorAll("h2")].find(
      (node) => node.textContent === "Catalog and archive",
    );
    return Boolean(
      passages &&
        catalog &&
        passages.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(evidenceFirst).toBe(true);
});
