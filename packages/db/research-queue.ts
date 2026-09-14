import type { AtlasDatabase } from "./client";

export const researchQueueStatuses = [
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
] as const;
export type ResearchQueueStatus = (typeof researchQueueStatuses)[number];
export type ReviewStatus =
  "unassessed" | "not-required" | "cleared" | "blocked";

export interface ResearchLead {
  id: string;
  title: string;
  summary: string;
  status: ResearchQueueStatus;
  sourceUrls: string[];
  rightsReview: ReviewStatus;
  culturalReview: ReviewStatus;
  scholarlyReview: ReviewStatus;
  publicationTarget: string | null;
  metadata: Record<string, unknown>;
}

const transitions: Record<ResearchQueueStatus, ResearchQueueStatus[]> = {
  "new-lead": [
    "source-needed",
    "primary-source-located",
    "rejected-false-lead",
  ],
  "source-needed": ["primary-source-located", "rejected-false-lead"],
  "primary-source-located": [
    "awaiting-rights-review",
    "awaiting-cultural-review",
    "awaiting-scholarly-review",
    "disputed",
    "provisionally-resolved",
    "rejected-false-lead",
  ],
  "awaiting-rights-review": [
    "awaiting-cultural-review",
    "awaiting-scholarly-review",
    "disputed",
    "provisionally-resolved",
    "rejected-false-lead",
  ],
  "awaiting-cultural-review": [
    "awaiting-rights-review",
    "awaiting-scholarly-review",
    "disputed",
    "provisionally-resolved",
    "rejected-false-lead",
  ],
  "awaiting-scholarly-review": [
    "awaiting-rights-review",
    "awaiting-cultural-review",
    "disputed",
    "provisionally-resolved",
    "rejected-false-lead",
  ],
  disputed: [
    "source-needed",
    "primary-source-located",
    "provisionally-resolved",
    "rejected-false-lead",
  ],
  "provisionally-resolved": ["disputed", "published-to-atlas"],
  "rejected-false-lead": [],
  "published-to-atlas": [],
};

function httpsUrls(urls: string[]) {
  return urls.length > 0 && urls.every((url) => /^https:\/\//.test(url));
}

export function assertResearchTransition(
  lead: ResearchLead,
  next: ResearchQueueStatus,
) {
  if (!transitions[lead.status].includes(next))
    throw new Error(
      `Invalid research-queue transition: ${lead.status} -> ${next}`,
    );
  if (next !== "published-to-atlas") return;
  const reviews = [
    lead.rightsReview,
    lead.culturalReview,
    lead.scholarlyReview,
  ];
  if (
    !httpsUrls(lead.sourceUrls) ||
    !lead.publicationTarget?.trim() ||
    reviews.some((status) => !["cleared", "not-required"].includes(status))
  )
    throw new Error(
      "Publication requires HTTPS sources, a target, and completed rights, cultural, and scholarly review",
    );
}

function rowToLead(row: {
  id: string;
  title: string;
  summary: string;
  status: ResearchQueueStatus;
  source_urls: string[];
  rights_review: ReviewStatus;
  cultural_review: ReviewStatus;
  scholarly_review: ReviewStatus;
  publication_target: string | null;
  metadata: Record<string, unknown>;
}): ResearchLead {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    sourceUrls: row.source_urls,
    rightsReview: row.rights_review,
    culturalReview: row.cultural_review,
    scholarlyReview: row.scholarly_review,
    publicationTarget: row.publication_target,
    metadata: row.metadata,
  };
}

const selectFields =
  "id,title,summary,status,source_urls,rights_review,cultural_review,scholarly_review,publication_target,metadata";

export async function createResearchLead(
  db: Pick<AtlasDatabase, "query">,
  lead: ResearchLead,
) {
  if (
    !lead.id.trim() ||
    !lead.title.trim() ||
    !lead.summary.trim() ||
    lead.status !== "new-lead" ||
    lead.sourceUrls.some((url) => !/^https:\/\//.test(url))
  )
    throw new Error("Invalid new research lead");
  await db.query(
    "INSERT INTO research_queue(id,title,summary,status,source_urls,rights_review,cultural_review,scholarly_review,publication_target,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [
      lead.id,
      lead.title,
      lead.summary,
      lead.status,
      JSON.stringify(lead.sourceUrls),
      lead.rightsReview,
      lead.culturalReview,
      lead.scholarlyReview,
      lead.publicationTarget,
      JSON.stringify(lead.metadata),
    ],
  );
}

export async function getResearchLead(
  db: Pick<AtlasDatabase, "query">,
  id: string,
) {
  const result = await db.query<Parameters<typeof rowToLead>[0]>(
    `SELECT ${selectFields} FROM research_queue WHERE id=$1`,
    [id],
  );
  return result.rows[0] ? rowToLead(result.rows[0]) : null;
}

export async function transitionResearchLead(
  db: Pick<AtlasDatabase, "query">,
  id: string,
  next: ResearchQueueStatus,
  note: string,
) {
  const lead = await getResearchLead(db, id);
  if (!lead) throw new Error("Research lead not found");
  if (!note.trim()) throw new Error("Transition note is required");
  assertResearchTransition(lead, next);
  const result = await db.query<{ id: number }>(
    `WITH changed AS (
       UPDATE research_queue SET status=$2,updated_at=now()
       WHERE id=$1 AND status=$3 RETURNING id
     )
     INSERT INTO research_queue_events(queue_id,from_status,to_status,note)
     SELECT id,$3,$2,$4 FROM changed RETURNING id`,
    [id, next, lead.status, note.trim()],
  );
  if (!result.rows.length)
    throw new Error("Research lead changed concurrently");
  return { ...lead, status: next };
}
