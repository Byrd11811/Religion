import { test, expect } from "@playwright/test";

test("Phase 13 navigation opens the complete modern-religions research guide", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByText("Collections", { exact: true }).click();
  await navigation
    .getByRole("link", { name: "Modern religions", exact: true })
    .click();
  await expect(page).toHaveURL(/\/library\/modern$/);
  await expect(
    page.getByRole("heading", {
      name: "Modern religions & new religious movements",
      exact: true,
    }),
  ).toBeVisible();
  for (const tab of [
    "Overview",
    "Official Teaching",
    "Historical / Academic Analysis",
    "Legal / Government Records",
    "Criticism / Controversy",
    "Church Responses",
    "Bibliography",
    "Other modern traditions",
  ])
    await expect(
      page.getByRole("tab", { name: tab, exact: true }),
    ).toBeVisible();

  const overviewTab = page.getByRole("tab", { name: "Overview", exact: true });
  await overviewTab.focus();
  await overviewTab.press("ArrowRight");
  const officialTab = page.getByRole("tab", {
    name: "Official Teaching",
    exact: true,
  });
  await expect(officialTab).toBeFocused();
  await expect(officialTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toBeVisible();
});

test("legal records expose jurisdiction, docket, decision date, and bounded disposition", async ({
  page,
}) => {
  await page.goto("/library/modern");
  await page
    .getByRole("tab", { name: "Legal / Government Records", exact: true })
    .click();
  const hernandez = page
    .getByRole("article")
    .filter({ hasText: "Hernandez v. Commissioner, 490 U.S. 680" });
  await expect(hernandez).toContainText("Jurisdiction");
  await expect(hernandez).toContainText("United States");
  await expect(hernandez).toContainText("No. 87-963");
  await expect(hernandez).toContainText("1989-06-05");
  await expect(hernandez).toContainText(
    "fixed payments were not deductible as charitable contributions",
  );
  await expect(hernandez).toContainText(
    "not a general judgment on every Scientology belief or practice",
  );
});

test("controversy categories stay distinct and Church responses retain links to claims", async ({
  page,
}) => {
  await page.goto("/library/modern");
  await page
    .getByRole("tab", { name: "Criticism / Controversy", exact: true })
    .click();
  for (const [title, category] of [
    ["Going Clear", "Criticism"],
    ["Troublemaker", "Former-member account"],
    ["Leah Remini sues Scientology", "Media report"],
    [
      "Scientology global-scale claim and ONS Census context",
      "Unverified claim",
    ],
  ]) {
    const record = page.getByRole("article").filter({ hasText: title });
    await expect(record).toContainText(category);
  }
  await expect(
    page.getByText("Unverified", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/filing an allegation is not adjudication/i),
  ).toBeVisible();

  await page
    .getByRole("tab", { name: "Church Responses", exact: true })
    .click();
  await expect(
    page.getByText("Responds to: scientology-criticism-going-clear", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Responds to: scientology-former-member-remini", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/not independent corroboration/i).first(),
  ).toBeVisible();
});

test("copyrighted Scientology works have no reader while the Book of Mormon keeps pg-17", async ({
  page,
}) => {
  await page.goto("/works/dianetics-modern-science-mental-health");
  await expect(
    page.getByRole("heading", {
      name: "Dianetics: The Modern Science of Mental Health",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/copyrighted text not reproduced/i).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.getByLabel("Translation / edition")).toBeDisabled();
  await expect(
    page.getByLabel("Translation / edition").locator("option"),
  ).toHaveText("No edition bundled");
  await expect(
    page.getByText(
      "This is a metadata record. No licensed full edition has been ingested.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".passage-card")).toHaveCount(0);

  await page.goto("/texts/book-of-mormon");
  await page.getByRole("button", { name: "Read edition", exact: true }).click();
  await expect(page.getByLabel("Translation / edition")).toBeEnabled();
  await expect(page.getByLabel("Translation / edition")).toHaveValue("pg-17");
  await expect(page.locator(".passage-card").first()).toBeVisible({
    timeout: 60_000,
  });
});

test("all other modern profiles are discoverable as distinct records", async ({
  page,
}) => {
  await page.goto("/library/modern");
  await page
    .getByRole("tab", { name: "Other modern traditions", exact: true })
    .click();
  const profileCards = page
    .getByRole("article")
    .filter({ hasText: "Modern tradition profile" });
  for (const profile of [
    "Bahá’í Faith",
    "Latter Day Saint movement",
    "Christian Science",
    "Theosophy",
    "Anthroposophy",
    "Modern Spiritualism",
    "Cao Đài",
    "Tenrikyo",
    "Falun Gong / Falun Dafa",
    "Rastafari",
    "Nation of Islam",
    "Thelema",
    "Modern Satanism",
    "Luciferian traditions",
    "New Thought",
    "New Age movements",
    "UFO religions",
  ])
    await expect(
      profileCards.getByRole("heading", { name: profile, exact: true }),
    ).toBeVisible();

  await page.getByLabel("Search modern traditions").fill("Nation of Islam");
  await expect(
    profileCards.getByRole("heading", { name: "Nation of Islam", exact: true }),
  ).toBeVisible();
  await expect(
    profileCards.getByRole("heading", { name: "Bahá’í Faith", exact: true }),
  ).toHaveCount(0);
});

test("origin claims display documented modern dates separately from claimed origins", async ({
  page,
}) => {
  await page.goto("/library/modern");
  await expect(
    page.getByRole("heading", {
      name: "Claimed origins and documented dates",
      exact: true,
    }),
  ).toBeVisible();
  for (const work of [
    "Book of Mormon",
    "Oahspe",
    "The Urantia Book",
    "A Course in Miracles",
    "The Law of One / Ra Material",
    "The Seth Material",
    "The Book of the Law / Liber AL vel Legis",
  ])
    await expect(
      page.getByRole("heading", { name: work, exact: true }),
    ).toBeVisible();
  await expect(page.getByText("Claimed origin", { exact: true })).toHaveCount(
    7,
  );
  await expect(
    page.getByText("Documented modern date", { exact: true }),
  ).toHaveCount(7);
  await expect(page.getByText(/1882 first publication/i)).toBeVisible();
  await expect(page.getByText(/1955 first publication/i)).toBeVisible();
});
