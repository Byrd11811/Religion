import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { syncRelationships } from "../packages/db/relationships";
import {
  relationshipEdges,
  relationshipNodes,
  relationshipObjectFacts,
  validateRelationshipGraph,
} from "../packages/shared/relationships";
import { relationshipTypes, type Relationship } from "../packages/shared/types";

const roadmapTypes = [
  "direct-citation",
  "translation-lineage",
  "commentary",
  "polemical-response",
  "shared-source",
  "likely-influence",
  "possible-influence",
  "cultural-contact",
  "thematic-parallel",
  "ritual-parallel",
  "linguistic-relationship",
  "modern-reinterpretation",
] as const;

test("Phase 17 graph is heterogeneous and covers every roadmap relationship class", () => {
  validateRelationshipGraph(
    relationshipNodes,
    relationshipEdges,
    relationshipObjectFacts,
  );
  assert.ok(relationshipEdges.length > 5);
  const nodeTypes = new Set(relationshipNodes.map(({ type }) => type));
  for (const type of ["work", "tradition", "person", "concept"])
    assert.ok(nodeTypes.has(type as never), `missing ${type} nodes`);
  const edgeTypes = new Set(relationshipEdges.map(({ relationshipType }) => relationshipType));
  for (const type of roadmapTypes)
    assert.ok(edgeTypes.has(type), `missing ${type}`);
  assert.deepEqual(relationshipTypes.slice(0, roadmapTypes.length), roadmapTypes);
});

test("strong relationships expose HTTPS citations, limits, and source chains", () => {
  for (const edge of relationshipEdges) {
    assert.ok(edge.citations.length > 0, edge.id);
    assert.ok(edge.citations.every(({ url }) => url.startsWith("https://")), edge.id);
    assert.ok(edge.counterarguments.length > 0, edge.id);
    assert.ok(edge.sourceChain.length > 0, edge.id);
    if (edge.evidenceLevel === "documented" || edge.evidenceLevel === "strong")
      assert.ok(edge.citations.length > 0, edge.id);
  }
});

test("Track C separates membership, contact, and unsupported succession", () => {
  const membership = relationshipEdges.find(
    ({ id }) => id === "washington-freemasonry-membership",
  );
  const contact = relationshipEdges.find(
    ({ id }) => id === "washington-illuminati-correspondence",
  );
  const successor = relationshipEdges.find(
    ({ id }) => id === "illuminati-modern-continuity-claim",
  );
  assert.equal(membership?.claimStatus, "documented-member");
  assert.equal(contact?.claimStatus, "documented-contact-not-membership");
  assert.equal(successor?.claimStatus, "no-verified-evidence");
  assert.ok(successor?.sourceChain.some(({ role }) => role === "claim-origin"));
  assert.ok(successor?.sourceChain.some(({ role }) => role === "counterevidence"));

  const invalid = structuredClone(relationshipEdges);
  invalid.find(({ id }) => id === "washington-illuminati-correspondence")!.claimStatus =
    "documented-member";
  assert.throws(
    () => validateRelationshipGraph(relationshipNodes, invalid, relationshipObjectFacts),
    /must exclude membership/,
  );
});

test("Track D interpretations begin with object facts and never infer occult intent", () => {
  const objectEdges = relationshipEdges.filter(
    ({ relationshipType }) => relationshipType === "object-interpretation",
  );
  assert.ok(objectEdges.length >= 2);
  for (const edge of objectEdges) {
    assert.equal(edge.interpretation?.assertsOccultIntent, false);
    assert.ok(edge.interpretation?.objectFactIds.length);
  }
  const invalid = structuredClone(relationshipEdges) as Relationship[];
  const interpretation = invalid.find(
    ({ relationshipType }) => relationshipType === "object-interpretation",
  )!.interpretation! as { assertsOccultIntent: boolean };
  interpretation.assertsOccultIntent = true;
  assert.throws(
    () => validateRelationshipGraph(relationshipNodes, invalid, relationshipObjectFacts),
    /may not infer occult intent/,
  );
});

test("Phase 17 graph persists normalized nodes, evidence, and object facts", async () => {
  const db = new PGlite({ extensions: { vector } });
  try {
    await db.exec(readFileSync("packages/db/schema.sql", "utf8"));
    for (const node of relationshipNodes.filter(({ type }) => type === "work"))
      await db.query(
        `INSERT INTO texts(id,title,category,metadata) VALUES($1,$2,'Relationship fixture',$3)`,
        [node.id, node.label, JSON.stringify(node)],
      );
    await syncRelationships(db);
    const count = async (table: string) =>
      Number(
        (
          await db.query<{ total: number }>(
            `SELECT count(*)::int AS total FROM ${table}`,
          )
        ).rows[0].total,
      );
    assert.equal(await count("relationship_nodes"), relationshipNodes.length);
    assert.equal(await count("relationship_edges"), relationshipEdges.length);
    assert.equal(
      await count("relationship_citations"),
      relationshipEdges.reduce((total, edge) => total + edge.citations.length, 0),
    );
    assert.equal(
      await count("relationship_counterarguments"),
      relationshipEdges.reduce(
        (total, edge) => total + edge.counterarguments.length,
        0,
      ),
    );
    assert.equal(
      await count("relationship_source_chain"),
      relationshipEdges.reduce((total, edge) => total + edge.sourceChain.length, 0),
    );
    assert.equal(
      await count("relationship_object_facts"),
      relationshipObjectFacts.length,
    );
    const intent = await db.query<{ asserts_occult_intent: boolean | null }>(
      "SELECT asserts_occult_intent FROM relationship_edges WHERE interpretation_kind IS NOT NULL",
    );
    assert.ok(intent.rows.every(({ asserts_occult_intent }) => asserts_occult_intent === false));
  } finally {
    await db.close();
  }
});
