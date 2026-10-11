import nodeData from "@/data/seed/relationship-nodes.json";
import edgeData from "@/data/seed/relationships.json";
import objectFactData from "@/data/seed/relationship-object-facts.json";
import {
  relationshipTypes,
  type Relationship,
  type RelationshipNode,
  type RelationshipObjectFact,
} from "./types";

const https = (value: string) => value.startsWith("https://");

function uniqueIds(records: { id: string }[], label: string) {
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id) throw new Error(`${label} record is missing an id`);
    if (ids.has(record.id)) throw new Error(`Duplicate ${label} id: ${record.id}`);
    ids.add(record.id);
  }
  return ids;
}

export function validateRelationshipGraph(
  nodes: RelationshipNode[],
  edges: Relationship[],
  objectFacts: RelationshipObjectFact[],
) {
  const nodeIds = uniqueIds(nodes, "relationship node");
  uniqueIds(edges, "relationship edge");
  const objectFactIds = uniqueIds(objectFacts, "relationship object fact");
  const nodeTypes = new Set(nodes.map(({ type }) => type));
  for (const required of ["work", "tradition", "person", "concept"] as const)
    if (!nodeTypes.has(required))
      throw new Error(`Relationship graph requires ${required} nodes`);
  if (edges.length <= 5)
    throw new Error("Relationship graph must be materially larger than the demo");

  const edgeTypes = new Set(edges.map(({ relationshipType }) => relationshipType));
  for (const required of relationshipTypes.slice(0, 12))
    if (!edgeTypes.has(required))
      throw new Error(`Relationship graph is missing ${required}`);

  for (const node of nodes) {
    if (!node.label || !node.description || !node.subtitle)
      throw new Error(`Relationship node ${node.id} lacks display context`);
    if (node.sourceUrls.length === 0 || node.sourceUrls.some((url) => !https(url)))
      throw new Error(`Relationship node ${node.id} requires HTTPS provenance`);
  }

  for (const fact of objectFacts) {
    const artifact = nodes.find(({ id }) => id === fact.artifactId);
    if (!artifact || artifact.type !== "artifact")
      throw new Error(`Object fact ${fact.id} must reference an artifact node`);
    if (!fact.statement || !https(fact.citation.url))
      throw new Error(`Object fact ${fact.id} requires a statement and HTTPS citation`);
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target))
      throw new Error(`Relationship ${edge.id} has an unknown endpoint`);
    if (!relationshipTypes.includes(edge.relationshipType))
      throw new Error(`Relationship ${edge.id} has unsupported type ${edge.relationshipType}`);
    if (!edge.summary || !edge.chronology || !edge.contact || !edge.difference)
      throw new Error(`Relationship ${edge.id} lacks inspectable analysis`);
    const citationIds = uniqueIds(edge.citations, `citation on ${edge.id}`);
    if (edge.citations.length === 0 || edge.citations.some(({ url }) => !https(url)))
      throw new Error(`Relationship ${edge.id} requires inspectable HTTPS citations`);
    if (!edge.citations.some(({ url }) => url === edge.sourceUrl))
      throw new Error(`Relationship ${edge.id} sourceUrl must be an inspectable citation`);
    if (
      (edge.evidenceLevel === "documented" || edge.evidenceLevel === "strong") &&
      edge.citations.length === 0
    )
      throw new Error(`Strong relationship ${edge.id} requires a citation`);
    uniqueIds(edge.counterarguments, `counterargument on ${edge.id}`);
    for (const counterargument of edge.counterarguments)
      for (const citationId of counterargument.citationIds)
        if (!citationIds.has(citationId))
          throw new Error(`Counterargument ${counterargument.id} cites unknown source`);
    if (edge.counterarguments.length === 0)
      throw new Error(`Relationship ${edge.id} requires a visible counterargument or limit`);
    for (const link of edge.sourceChain)
      if (!citationIds.has(link.citationId))
        throw new Error(`Relationship ${edge.id} source chain cites unknown source`);
    if (edge.sourceChain.length === 0)
      throw new Error(`Relationship ${edge.id} requires an inspectable source chain`);

    if (edge.relationshipType === "organization-membership") {
      if (!edge.claimStatus.endsWith("member") && edge.claimStatus !== "strong-documentary-evidence")
        throw new Error(`Membership edge ${edge.id} requires a membership evidence status`);
      if (!edge.sourceChain.some(({ role }) => role === "evidence"))
        throw new Error(`Membership edge ${edge.id} requires documentary evidence`);
    }
    if (
      edge.relationshipType === "organization-contact" &&
      edge.claimStatus !== "documented-contact-not-membership"
    )
      throw new Error(`Contact edge ${edge.id} must exclude membership`);
    if (edge.relationshipType === "successor-claim") {
      if (!edge.sourceChain.some(({ role }) => role === "claim-origin"))
        throw new Error(`Successor claim ${edge.id} requires a claim-origin source`);
      if (!edge.sourceChain.some(({ role }) => role === "counterevidence"))
        throw new Error(`Successor claim ${edge.id} requires counterevidence`);
    }

    if (edge.relationshipType === "object-interpretation") {
      const source = nodes.find(({ id }) => id === edge.source);
      if (source?.type !== "artifact" || !edge.interpretation)
        throw new Error(`Object interpretation ${edge.id} must begin with an artifact fact`);
      if (edge.interpretation.assertsOccultIntent !== false)
        throw new Error(`Object interpretation ${edge.id} may not infer occult intent`);
      if (edge.interpretation.objectFactIds.length === 0)
        throw new Error(`Object interpretation ${edge.id} requires object facts`);
      for (const factId of edge.interpretation.objectFactIds) {
        if (!objectFactIds.has(factId))
          throw new Error(`Object interpretation ${edge.id} cites unknown fact ${factId}`);
        const fact = objectFacts.find(({ id }) => id === factId)!;
        if (fact.artifactId !== edge.source)
          throw new Error(`Object interpretation ${edge.id} cites another artifact's fact`);
      }
    } else if (edge.interpretation) {
      throw new Error(`Non-object relationship ${edge.id} may not carry object interpretation data`);
    }
  }
}

export const relationshipNodes = nodeData as RelationshipNode[];
export const relationshipEdges = edgeData as Relationship[];
export const relationshipObjectFacts = objectFactData as RelationshipObjectFact[];

validateRelationshipGraph(
  relationshipNodes,
  relationshipEdges,
  relationshipObjectFacts,
);

export function relationshipNode(id: string) {
  return relationshipNodes.find((node) => node.id === id) ?? null;
}

export function relationshipsForNode(id: string) {
  return relationshipEdges.filter(({ source, target }) => source === id || target === id);
}
