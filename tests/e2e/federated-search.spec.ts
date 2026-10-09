import { expect, test } from "@playwright/test";

test("global search resolves aliases and separates metadata from passages", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Search the atlas").fill("Dao De Jing");
  await page.getByLabel("Search the atlas").press("Enter");
  await expect(page).toHaveURL(/\/search\?q=Dao%20De%20Jing/);
  await expect(
    page.getByRole("heading", { name: "Search the Atlas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tao Te Ching" }),
  ).toBeVisible();
  await expect(
    page.getByText("Search aliases: Dao De Jing, Daodejing"),
  ).toBeVisible();

  await page.getByText("Metadata filters").click();
  await page.getByLabel("Search all Atlas records").fill("Genesis");
  await page
    .getByText("Language or script")
    .getByRole("textbox")
    .fill("Hebrew");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 catalog results");
});

test("manuscript mode searches witness metadata and API validates filters", async ({
  page,
  request,
}) => {
  await page.goto("/search?q=MS%20408");
  await expect(
    page.getByRole("heading", { name: "Voynich Manuscript" }).first(),
  ).toBeVisible();
  await page.getByLabel("Search mode").selectOption("Manuscripts");
  await expect(
    page.getByRole("article").getByText("Physical witness", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await request.get("/api/federated-search?q=test&mode=Unsupported")
    ).status(),
  ).toBe(400);
  expect(
    (await request.get("/api/federated-search?q=test&type=claim")).status(),
  ).toBe(400);
  expect(
    (
      await request.get("/api/federated-search?q=test&confidence=Certain")
    ).status(),
  ).toBe(400);
});
