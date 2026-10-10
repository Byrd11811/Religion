import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("comparison pack discovery exposes exactly seven honest presets", async ({
  page,
}) => {
  await page.goto("/compare/packs");
  const packNav = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Curated Comparison Packs" });
  await expect(packNav).toHaveClass(/active/);
  await expect(packNav.locator(".nav-dot")).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Curated comparison packs",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Comparison pack coverage")).toContainText("7");
  await expect(page.locator("[data-pack-id]")).toHaveCount(7);
  await expect(
    page.getByText(/Metadata-only titles never count as evidence/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Afterlife", exact: true }),
  ).toHaveAttribute("href", "/compare/afterlife");

  await page.getByLabel("Search comparison packs").fill("Meqabyan");
  await expect(page.getByRole("status")).toContainText(
    "1 matching comparison pack",
  );
  await expect(
    page.locator('[data-pack-id="ethiopian-tradition"]'),
  ).toBeVisible();
});

test("Afterlife pack shows all requested ranges, real citations, and distinct findings", async ({
  page,
}) => {
  await page.goto("/compare/afterlife");
  const packNav = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Curated Comparison Packs" });
  await expect(packNav).toHaveClass(/active/);
  await expect(packNav.locator(".nav-dot")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Afterlife", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-slot-id]")).toHaveCount(16);
  await expect(
    page.locator('[data-slot-id="afterlife-book-of-dead"]'),
  ).toHaveAttribute("data-evidence-status", "evidence-ready");
  await expect(
    page.locator('[data-slot-id="afterlife-pyramid-texts"]'),
  ).toHaveAttribute("data-evidence-status", "metadata-only");
  await expect(
    page.locator('[data-slot-id="afterlife-indigenous"]'),
  ).toHaveAttribute("data-evidence-status", "culturally-restricted");
  await expect(
    page.locator('[data-slot-id="afterlife-pyramid-texts"]'),
  ).toContainText("Visible gap");
  await expect(page.locator("[data-comparison-mode]")).toHaveCount(3);
  await expect(
    page.locator('[data-comparison-mode="similarity"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-comparison-mode="difference"]'),
  ).toBeVisible();
  await expect(
    page.locator('[data-comparison-mode="chronology"]'),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Afterlife ontology" }),
  ).toHaveAttribute("href", "/ontology/afterlife");
});

test("Anunnaki pack separates ancient attestations, scholarship, alternatives, and modern claims", async ({
  page,
}) => {
  await page.goto("/compare/anunnaki");
  await expect(page.locator("[data-slot-id]")).toHaveCount(5);
  const ancient = page.locator('[data-slot-id="anunnaki-ancient"]');
  const scholarship = page.locator('[data-slot-id="anunnaki-scholarship"]');
  const alternatives = page.locator('[data-slot-id="anunnaki-alternatives"]');
  const modern = page.locator('[data-slot-id="anunnaki-modern"]');
  await expect(ancient).toContainText("Primary Transliteration");
  await expect(scholarship).toContainText("Mainstream Scholarship");
  await expect(alternatives).toContainText(
    "Competing Scholarly Interpretation",
  );
  await expect(modern).toContainText("Modern Claim Primary Source");
  await expect(modern).toContainText("not evidence about ancient Mesopotamia");
  await expect(
    page.locator(
      '[data-influence-assessment="unsupported-by-cited-ancient-evidence"]',
    ),
  ).toBeVisible();
});

test("Ethiopian and Indigenous packs preserve identity and cultural protocol boundaries", async ({
  page,
}) => {
  await page.goto("/compare/ethiopian-tradition");
  const meqabyan = page.locator('[data-slot-id="ethiopian-meqabyan"]');
  const western = page.locator('[data-slot-id="ethiopian-western-canon"]');
  await expect(meqabyan).toContainText("First–Third Ethiopian Meqabyan");
  await expect(meqabyan).toContainText(/not Greek 1–3 Maccabees/i);
  await expect(western).toContainText("Greek 1–2 Maccabees records");
  await expect(page.locator('[data-slot-id="ethiopian-enoch"]')).toContainText(
    /English historical edition.*Geʽez textual-tradition/i,
  );
  await expect(page.locator('[data-slot-id="ethiopian-kebra"]')).toContainText(
    "British Library Or 818",
  );

  await page.goto("/compare/indigenous-creation");
  await expect(page.locator("[data-slot-id]")).toHaveCount(6);
  await expect(
    page.locator('[data-evidence-status="culturally-restricted"]'),
  ).toHaveCount(6);
  await expect(page.getByText(/intentionally incomplete/i)).toBeVisible();
  await expect(
    page.locator('[data-influence-assessment="not-assessed"]'),
  ).toHaveCount(3);
  await expect(
    page.getByText(
      /no borrowing, diffusion, or independent-development verdict/i,
    ),
  ).toBeVisible();
});

test("pack provenance export is serializable and excludes passage content", async ({
  page,
}) => {
  await page.goto("/compare/creation");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export provenance JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "atlas-comparison-creation-provenance.json",
  );
  const path = await download.path();
  expect(path).not.toBeNull();
  const raw = await readFile(path!, "utf8");
  const snapshot = JSON.parse(raw) as {
    pack: { id: string; title: string; route: string };
    evidence: { passageIds: string[]; status: string; gap: string }[];
    omittedRestrictedSlotCount: number;
  };
  expect(snapshot.pack).toEqual({
    id: "creation",
    title: "Creation",
    route: "/compare/creation",
  });
  expect(snapshot.evidence).toHaveLength(7);
  expect(snapshot.omittedRestrictedSlotCount).toBe(5);
  expect(
    snapshot.evidence.every(
      (entry) => entry.status !== "culturally-restricted",
    ),
  ).toBe(true);
  expect(raw).not.toMatch(/"content"\s*:/);
  expect(
    snapshot.evidence.some(
      (entry) => entry.status !== "evidence-ready" && entry.gap.length > 0,
    ),
  ).toBe(true);
});
