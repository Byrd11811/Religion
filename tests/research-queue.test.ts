import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import {
  assertResearchTransition,
  createResearchLead,
  getResearchLead,
  researchQueueStatuses,
  transitionResearchLead,
  type ResearchLead,
} from "../packages/db/research-queue";

const lead: ResearchLead = {
  id: "fixture-lead",
  title: "Synthetic test lead",
  summary: "A non-published fixture used to verify workflow gates.",
  status: "new-lead",
  sourceUrls: [],
  rightsReview: "unassessed",
  culturalReview: "unassessed",
  scholarlyReview: "unassessed",
  publicationTarget: null,
  metadata: { fixture: true },
};

test("research queue preserves the complete durable status vocabulary", () => {
  assert.deepEqual(researchQueueStatuses, [
    "new-lead",
    "source-needed",
    "primary-source-located",
    "awaiting-rights-review",
    "awaiting-cultural-review",
    "awaiting-scholarly-review",
    "disputed",
    "provisionally-resolved",
    "rejected-false-lead",
    "published-to-atlas",
  ]);
  assert.doesNotThrow(() => assertResearchTransition(lead, "source-needed"));
  assert.throws(
    () => assertResearchTransition(lead, "published-to-atlas"),
    /Invalid research-queue transition/,
  );
});

test("publication requires sources, a target, and all three review gates", () => {
  const provisional: ResearchLead = {
    ...lead,
    status: "provisionally-resolved",
  };
  assert.throws(
    () => assertResearchTransition(provisional, "published-to-atlas"),
    /Publication requires/,
  );
  assert.doesNotThrow(() =>
    assertResearchTransition(
      {
        ...provisional,
        sourceUrls: ["https://example.test/source"],
        publicationTarget: "work:reviewed-target",
        rightsReview: "not-required",
        culturalReview: "cleared",
        scholarlyReview: "cleared",
      },
      "published-to-atlas",
    ),
  );
});

test("research leads and status history persist without entering public APIs", async () => {
  const db = new PGlite({ extensions: { vector } });
  try {
    await db.waitReady;
    await db.exec(readFileSync("packages/db/schema.sql", "utf8"));
    await createResearchLead(db, lead);
    await transitionResearchLead(
      db,
      lead.id,
      "source-needed",
      "No primary source has been located.",
    );
    assert.equal((await getResearchLead(db, lead.id))?.status, "source-needed");
    const events = await db.query<{ from_status: string; to_status: string }>(
      "SELECT from_status,to_status FROM research_queue_events WHERE queue_id=$1",
      [lead.id],
    );
    assert.deepEqual(events.rows, [
      { from_status: "new-lead", to_status: "source-needed" },
    ]);
  } finally {
    await db.close();
  }
});
