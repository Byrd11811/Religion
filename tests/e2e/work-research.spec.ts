import { expect, test } from "@playwright/test";

const tabs = [
  "Overview",
  "Read",
  "Original Language",
  "Translation Compare",
  "Witnesses",
  "Images",
  "History",
  "Canon",
  "Themes",
  "People",
  "Relationships",
  "Timeline",
  "Map",
  "Scholarship",
  "Evidence",
];

test("text and work URLs share the complete research experience", async ({
  page,
}) => {
  for (const route of ["texts", "works"]) {
    await page.goto(`/${route}/tao-te-ching`);
    await expect(
      page.getByRole("heading", { name: "Tao Te Ching", exact: true }),
    ).toBeVisible();
    const tablist = page.getByRole("tablist", { name: "Work research views" });
    await expect(tablist).toBeVisible();
    for (const tab of tabs)
      await expect(
        tablist.getByRole("tab", { name: tab, exact: true }),
      ).toBeVisible();
  }
});

test("work research tabs expose evidence, chronology, and source gaps", async ({
  page,
}) => {
  await page.goto("/works/tao-te-ching");
  await page.getByRole("tab", { name: "Evidence", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Source reliability" }),
  ).toBeVisible();
  await expect(page.getByText("Model versus curator:")).toBeVisible();
  await expect(page.getByText("Current source gap:")).toBeVisible();

  await page.getByRole("tab", { name: "Timeline", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Open in Sacred Currents timeline" }),
  ).toHaveAttribute("href", /\/timeline\?q=Tao%20Te%20Ching/u);

  await page.getByRole("tab", { name: "Map", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Geographic evidence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open in Sacred Currents map" }),
  ).toHaveAttribute("href", /\/map\?q=Tao%20Te%20Ching/u);
});
