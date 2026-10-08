import { expect, test } from "@playwright/test";

test("global coverage exposes every Phase 9A batch with evidence limits", async ({ page }) => {
  await page.goto("/library/global");
  await expect(page.getByRole("heading", { name: "Global religious coverage" })).toBeVisible();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
  await page.getByLabel("Regional intake batch").selectOption("iranian");
  await expect(page.getByRole("heading", { name: "Avesta", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manichaean Kephalaia" })).toBeVisible();
  await page.getByLabel("Regional intake batch").selectOption("japan-korea");
  await expect(page.getByRole("heading", { name: "Tripitaka Koreana" })).toBeVisible();
  await expect(page.getByText(/Chronicle, ritual, Buddhist canon/)).toBeVisible();
});

test("regional research records retain unknown dates and no edition", async ({ request }) => {
  const response = await request.get("/api/works?q=Tripitaka%20Koreana&page=0");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.items[0]).toMatchObject({ id: "tripitaka-koreana", compositionStart: null, compositionEnd: null, editionIds: [], coverage: "Metadata only" });
});
