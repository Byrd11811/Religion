import {
  relationshipEdges,
  relationshipNodes,
  relationshipObjectFacts,
} from "@/packages/shared/relationships";
import { texts } from "@/packages/shared/catalog";

const workIds = new Set(texts.map(({ id }) => id));

interface RelationshipDatabase {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}

export async function syncRelationships(db: RelationshipDatabase) {
  for (const node of relationshipNodes)
    await db.query(
      `INSERT INTO relationship_nodes(id,node_type,label,subtitle,description,href,source_urls,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT(id) DO UPDATE SET node_type=EXCLUDED.node_type,label=EXCLUDED.label,subtitle=EXCLUDED.subtitle,description=EXCLUDED.description,href=EXCLUDED.href,source_urls=EXCLUDED.source_urls,metadata=EXCLUDED.metadata`,
      [
        node.id,
        node.type,
        node.label,
        node.subtitle,
        node.description,
        node.href,
        node.sourceUrls,
        JSON.stringify(node),
      ],
    );

  for (const fact of relationshipObjectFacts)
    await db.query(
      `INSERT INTO relationship_object_facts(id,artifact_node_id,fact_type,statement,citation,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET artifact_node_id=EXCLUDED.artifact_node_id,fact_type=EXCLUDED.fact_type,statement=EXCLUDED.statement,citation=EXCLUDED.citation,metadata=EXCLUDED.metadata`,
      [
        fact.id,
        fact.artifactId,
        fact.factType,
        fact.statement,
        JSON.stringify(fact.citation),
        JSON.stringify(fact),
      ],
    );

  for (const edge of relationshipEdges) {
    await db.query(
      `INSERT INTO relationship_edges(id,source_node_id,target_node_id,relationship_type,display_type,evidence_level,confidence,scholar_summary,chronology,contact_summary,difference_summary,primary_citation_url,claim_status,interpretation_kind,asserts_occult_intent,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT(id) DO UPDATE SET source_node_id=EXCLUDED.source_node_id,target_node_id=EXCLUDED.target_node_id,relationship_type=EXCLUDED.relationship_type,display_type=EXCLUDED.display_type,evidence_level=EXCLUDED.evidence_level,confidence=EXCLUDED.confidence,scholar_summary=EXCLUDED.scholar_summary,chronology=EXCLUDED.chronology,contact_summary=EXCLUDED.contact_summary,difference_summary=EXCLUDED.difference_summary,primary_citation_url=EXCLUDED.primary_citation_url,claim_status=EXCLUDED.claim_status,interpretation_kind=EXCLUDED.interpretation_kind,asserts_occult_intent=EXCLUDED.asserts_occult_intent,metadata=EXCLUDED.metadata`,
      [
        edge.id,
        edge.source,
        edge.target,
        edge.relationshipType,
        edge.type,
        edge.evidenceLevel,
        edge.confidence,
        edge.summary,
        edge.chronology,
        edge.contact,
        edge.difference,
        edge.sourceUrl,
        edge.claimStatus,
        edge.interpretation?.kind ?? null,
        edge.interpretation?.assertsOccultIntent ?? null,
        JSON.stringify(edge),
      ],
    );
    await db.query("DELETE FROM relationship_source_chain WHERE edge_id=$1", [
      edge.id,
    ]);
    await db.query("DELETE FROM relationship_counterarguments WHERE edge_id=$1", [
      edge.id,
    ]);
    await db.query("DELETE FROM relationship_citations WHERE edge_id=$1", [edge.id]);
    await db.query("DELETE FROM relationship_edge_object_facts WHERE edge_id=$1", [
      edge.id,
    ]);

    for (const citation of edge.citations)
      await db.query(
        `INSERT INTO relationship_citations(edge_id,id,label,url,locator,source_type)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [
          edge.id,
          citation.id,
          citation.label,
          citation.url,
          citation.locator ?? null,
          citation.sourceType,
        ],
      );
    for (const counterargument of edge.counterarguments)
      await db.query(
        `INSERT INTO relationship_counterarguments(edge_id,id,summary,citation_ids)
         VALUES($1,$2,$3,$4)`,
        [
          edge.id,
          counterargument.id,
          counterargument.summary,
          counterargument.citationIds,
        ],
      );
    for (const [ordinal, link] of edge.sourceChain.entries())
      await db.query(
        `INSERT INTO relationship_source_chain(edge_id,ordinal,citation_id,role,note)
         VALUES($1,$2,$3,$4,$5)`,
        [edge.id, ordinal, link.citationId, link.role, link.note],
      );
    for (const factId of edge.interpretation?.objectFactIds ?? [])
      await db.query(
        `INSERT INTO relationship_edge_object_facts(edge_id,fact_id) VALUES($1,$2)`,
        [edge.id, factId],
      );

    // Keep legacy consumers and counts populated. Non-work endpoints remain
    // null in the old text foreign-key columns and retain their typed endpoint
    // IDs in metadata and the normalized Phase 17 tables.
    await db.query(
      `INSERT INTO relationships(id,source_text_id,target_text_id,relationship_type,evidence_level,scholar_summary,confidence,citation,metadata)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(id) DO UPDATE SET source_text_id=EXCLUDED.source_text_id,target_text_id=EXCLUDED.target_text_id,relationship_type=EXCLUDED.relationship_type,evidence_level=EXCLUDED.evidence_level,scholar_summary=EXCLUDED.scholar_summary,confidence=EXCLUDED.confidence,citation=EXCLUDED.citation,metadata=EXCLUDED.metadata`,
      [
        edge.id,
        workIds.has(edge.source) ? edge.source : null,
        workIds.has(edge.target) ? edge.target : null,
        edge.relationshipType,
        edge.evidenceLevel,
        edge.summary,
        edge.confidence,
        edge.sourceUrl,
        JSON.stringify(edge),
      ],
    );
  }
}
