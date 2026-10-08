import { test, expect } from "@playwright/test";

test("taxonomy API exposes source-backed, nonexclusive branches without assigning texts", async ({
  request,
}) => {
  const response = await request.get("/api/taxonomy");
  expect(response.ok()).toBeTruthy();
  const taxonomy = await response.json();
  expect(taxonomy.nodes).toHaveLength(71);
  expect(taxonomy.edges).toHaveLength(49);
  const theravada = taxonomy.nodes.find(
    (node: { id: string }) => node.id === "branch-theravada",
  );
  expect(theravada.sourceRefs[0].url).toMatch(/^https:\/\//);
  expect(theravada.workIds).toEqual([]);
  expect(
    taxonomy.edges.find(
      (edge: { childId: string }) => edge.childId === "branch-sufi",
    ).relationship,
  ).toBe("cross-cutting");
});

test("tradition navigation exposes branch sources and preserves unknown-route handling", async ({
  page,
}) => {
  await page.goto("/traditions/buddhism");
  await expect(
    page.getByRole("heading", { name: "Source-backed branches and movements" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Theravada Buddhism" }).click();
  await expect(
    page.getByRole("heading", { name: "Theravada Buddhism", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.getByText("No work assignments for this branch")).toBeVisible();
  await page.goto("/traditions/no-such-tradition");
  await expect(page.getByText("Tradition not found.")).toBeVisible();
});
