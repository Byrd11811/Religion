import { test, expect } from "@playwright/test";
test("archive pages distinguish works, undeciphered witnesses and images", async ({
  page,
  request,
}) => {
  await page.goto("/library/deep-archive");
  await expect(
    page.getByRole("heading", { name: "Deep Archive", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search archive").fill("Dhammapada");
  await page.getByRole("link", { name: "Dhammapada", exact: true }).click();
  await expect(
    page.getByText("Source depth · Complete available edition"),
  ).toBeVisible();
  await page.goto("/library/undeciphered");
  await page
    .getByRole("link", { name: "Voynich Manuscript", exact: true })
    .click();
  await expect(
    page.getByText("No accepted translation exists.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Modern / Popular Claims" }).click();
  await expect(
    page.getByText("No verified source currently available in this category."),
  ).toBeVisible();
  await page.goto("/witnesses/codex-gigas");
  await expect(
    page.getByText("Physical witness · Manuscript compilation", {
      exact: true,
    }),
  ).toBeVisible();
  expect((await request.get("/api/works?page=-1")).status()).toBe(400);
  expect((await request.get("/api/works?coverage=invented")).status()).toBe(
    400,
  );
  const result = await (await request.get("/api/works?coverage=Lost")).json();
  expect(result.items).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/library/manuscripts");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "work/archive-mobile.png", fullPage: true });
});

test("Egypt collection links attributed papyri and navigable IIIF images", async ({
  page,
  request,
}) => {
  await page.goto("/library/egypt");
  await expect(
    page.getByRole("heading", { name: "Ancient Egypt", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Book of the Dead for the Chantress of Amun, Nauny",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("IIIF image viewer", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous image" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next image" }).click();
  await expect(page.getByLabel("Image", { exact: true })).toHaveValue("1");
  await page.getByRole("slider", { name: "Image zoom" }).press("End");
  await expect
    .poll(
      () =>
        page
          .getByTestId("iiif-image")
          .evaluate((img) => (img as HTMLImageElement).naturalWidth),
      { timeout: 30000 },
    )
    .toBeGreaterThan(0);
  const manifest = await (await request.get("/api/iiif/met-548344")).json();
  expect(manifest.items.length).toBeGreaterThan(1);
  expect(manifest.requiredStatement.value.en[0]).toContain("CC0");
  await page.screenshot({ path: "work/egypt-viewer.png", fullPage: false });
});
