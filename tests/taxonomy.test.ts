import test from "node:test";
import assert from "node:assert/strict";
import {
  navigationNodes,
  subtraditions,
  taxonomyEdges,
  validateTaxonomy,
} from "../packages/shared/taxonomy";

test("source-backed taxonomy preserves nonexclusive reviewed branch records", () => {
  validateTaxonomy([...navigationNodes, ...subtraditions], taxonomyEdges);
  assert.equal(subtraditions.length, 14);
  assert.ok(subtraditions.every((node) => node.sourceRefs.length > 0));
  assert.ok(
    subtraditions.every(
      (node) => node.workIds.length === 0 && node.reviewStatus.includes("incomplete"),
    ),
  );
  const sufi = taxonomyEdges.find((edge) => edge.childId === "branch-sufi");
  assert.equal(sufi?.relationship, "cross-cutting");
  assert.ok(
    taxonomyEdges.some(
      (edge) =>
        edge.parentId === "branch-mahayana" &&
        edge.childId === "branch-vajrayana" &&
        edge.relationship === "within",
    ),
  );
});

test("taxonomy validation rejects unsourced nodes and cycles", () => {
  const unsourced = structuredClone(subtraditions);
  unsourced[0].sourceRefs = [];
  assert.throws(
    () => validateTaxonomy([...navigationNodes, ...unsourced], taxonomyEdges),
    /Unsourced taxonomy node/,
  );
  assert.throws(
    () =>
      validateTaxonomy([...navigationNodes, ...subtraditions], [
        ...taxonomyEdges,
        {
          parentId: "branch-zen",
          childId: "branch-mahayana",
          relationship: "within",
          sourceUrl: "https://pluralism.org/mahayana-buddhism",
          notes: "Invalid reverse relationship used only as a validation fixture.",
        },
      ]),
    /Taxonomy cycle/,
  );
});
