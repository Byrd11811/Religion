import data from "@/data/seed/taxonomy.json";
import { traditions } from "./catalog";

export interface TaxonomyNode {
  id: string;
  name: string;
  kind: string;
  description: string;
  region: string | null;
  sourceRefs: {
    title: string;
    url: string;
    publisher: string;
    accessedAt: string;
  }[];
  reviewStatus: string;
  workIds: string[];
}
export interface TaxonomyEdge {
  parentId: string;
  childId: string;
  relationship: "navigation" | "within" | "cross-cutting";
  sourceUrl: string;
  notes: string;
}
export const subtraditions: TaxonomyNode[] = data.subtraditions;
export const taxonomyEdges = data.edges as TaxonomyEdge[];
export const navigationNodes: TaxonomyNode[] = traditions.map((t) => ({
  id: t.id,
  name: t.name,
  kind: "navigation-group",
  description: t.description,
  region: t.region,
  sourceRefs: [],
  reviewStatus: "Legacy navigation grouping; not a uniform community",
  workIds: [],
}));

export function validateTaxonomy(nodes: TaxonomyNode[], edges: TaxonomyEdge[]) {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (!node.id || ids.has(node.id))
      throw new Error(`Duplicate/missing taxonomy node: ${node.id}`);
    ids.add(node.id);
    if (
      node.kind !== "navigation-group" &&
      (!node.sourceRefs.length ||
        node.sourceRefs.some(
          (s) => !/^https:\/\//.test(s.url) || !s.title || !s.publisher,
        ))
    )
      throw new Error(`Unsourced taxonomy node: ${node.id}`);
  }
  const children = new Map<string, string[]>();
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    const key = `${edge.parentId}/${edge.childId}/${edge.relationship}`;
    if (
      edgeIds.has(key) ||
      !ids.has(edge.parentId) ||
      !ids.has(edge.childId) ||
      edge.parentId === edge.childId ||
      !/^https:\/\//.test(edge.sourceUrl) ||
      !edge.notes
    )
      throw new Error(`Invalid taxonomy edge: ${key}`);
    edgeIds.add(key);
    children.set(edge.parentId, [
      ...(children.get(edge.parentId) ?? []),
      edge.childId,
    ]);
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error("Taxonomy cycle");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of children.get(id) ?? []) visit(child);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of ids) visit(id);
}
validateTaxonomy([...navigationNodes, ...subtraditions], taxonomyEdges);
