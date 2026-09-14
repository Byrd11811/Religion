import type { AtlasDatabase } from "./client";
import {
  subtraditions,
  taxonomyEdges,
  validateTaxonomy,
  type TaxonomyNode,
  type TaxonomyEdge,
} from "../shared/taxonomy";

export async function syncTaxonomy(db: Pick<AtlasDatabase, "query">) {
  // Add new source-checked records without replacing legacy IDs or later curator edits.
  for (const node of subtraditions)
    await db.query(
      "INSERT INTO traditions(id,name,region,description,metadata) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING",
      [node.id, node.name, node.region, node.description, JSON.stringify(node)],
    );
  const present = new Set(
    (await db.query<{ id: string }>("SELECT id FROM traditions")).rows.map(
      (r) => r.id,
    ),
  );
  for (const edge of taxonomyEdges)
    if (present.has(edge.parentId) && present.has(edge.childId))
      await db.query(
        "INSERT INTO tradition_hierarchy(parent_id,child_id,relationship,source_url,notes) VALUES($1,$2,$3,$4,$5) ON CONFLICT(parent_id,child_id,relationship) DO NOTHING",
        [
          edge.parentId,
          edge.childId,
          edge.relationship,
          edge.sourceUrl,
          edge.notes,
        ],
      );
}

export async function readTaxonomy(db: Pick<AtlasDatabase, "query">) {
  const rows = await db.query<{
    id: string;
    name: string;
    region: string | null;
    description: string;
    metadata: Partial<TaxonomyNode>;
  }>(
    "SELECT id,name,region,description,metadata FROM traditions ORDER BY lower(name),id",
  );
  const nodes: TaxonomyNode[] = rows.rows.map((r) => ({
    id: r.id,
    name: r.name,
    region: r.region,
    description: r.description,
    kind: r.metadata.kind ?? "navigation-group",
    sourceRefs: r.metadata.sourceRefs ?? [],
    reviewStatus:
      r.metadata.reviewStatus ??
      "Legacy navigation grouping; not a uniform community",
    workIds: r.metadata.workIds ?? [],
  }));
  const relationships = await db.query<{
    parent_id: string;
    child_id: string;
    relationship: TaxonomyEdge["relationship"];
    source_url: string;
    notes: string;
  }>(
    "SELECT parent_id,child_id,relationship,source_url,notes FROM tradition_hierarchy ORDER BY parent_id,child_id,relationship",
  );
  const edges = relationships.rows.map((e) => ({
    parentId: e.parent_id,
    childId: e.child_id,
    relationship: e.relationship,
    sourceUrl: e.source_url,
    notes: e.notes,
  }));
  validateTaxonomy(nodes, edges);
  return {
    nodes,
    edges,
    limitations:
      "Introductory sourced branches only; regional/community depth and reviewed work assignments remain incomplete.",
  };
}
