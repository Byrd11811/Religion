import { test, expect } from "@playwright/test";

test("unresolved-writing collection exposes the complete minimum corpus", async ({
  page,
}) => {
  await page.goto("/library/undeciphered");
  await expect(
    page.getByRole("heading", { name: "Unresolved writing systems" }),
  ).toBeVisible();
  await expect(page.getByText("25", { exact: true }).first()).toBeVisible();
  await expect(page.locator("article.panel")).toHaveCount(25);
  await expect(
    page.getByRole("link", { name: "Linear A", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Indus / Harappan Script", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Rohonc Codex", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Evidence state").selectOption("DISPUTED WRITING SYSTEM");
  await expect(page.locator("article.panel")).toHaveCount(3);
});

test("corpus detail separates four evidence questions and competing claims", async ({
  page,
}) => {
  await page.goto("/undeciphered/isthmian-script");
  await expect(page.getByText("MULTIPLE COMPETING DECIPHERMENTS", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Script identification" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2. Sign values" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3. Language identification" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "4. Semantic translation" })).toBeVisible();
  await expect(page.getByText(/No generally accepted word-for-word decipherment/).first()).toBeVisible();
  await expect(page.getByText("John Justeson and Terrence Kaufman", { exact: true })).toBeVisible();
  await expect(page.getByText(/Independent tests have challenged/)).toBeVisible();
});

test("question API refuses to invent unresolved-script readings", async ({ request }) => {
  const response = await request.post("/api/query", {
    data: { question: "Translate Linear A and tell me what god is named" },
  });
  expect(response.status()).toBe(200);
  const answer = await response.json();
  expect(answer.mode).toBe("Unresolved-corpus evidence safeguard");
  expect(answer.passages).toEqual([]);
  expect(answer.synthesis).toBeUndefined();
  expect(answer.summary).toContain("cannot translate Linear A");
  expect(answer.distinctive).toHaveLength(4);
});

test("federated search finds unresolved corpora as metadata", async ({ page }) => {
  await page.goto("/search?q=Eteocypriot");
  await expect(
    page.getByRole("heading", { name: "Eteocypriot", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").getByText("Unresolved corpus", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("article").getByText(/No generally accepted full translation/).first(),
  ).toBeVisible();
});
