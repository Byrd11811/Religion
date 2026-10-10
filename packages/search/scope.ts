import type { SearchOptions } from "./index";
import type { Passage } from "@/packages/shared/types";
import {
  culturalProtocols,
  protocolDecision,
} from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";

export interface RankedPassageCandidate {
  metadata: Passage;
  rank: number;
  /** The normalized database column. When present it must agree with metadata. */
  textId?: string;
}

const restrictedSearchTextIds = [
  ...new Set(
    culturalProtocols
      .filter(
        (protocol) => !protocolDecision(protocol.workId, "search").allowed,
      )
      .map((protocol) => protocol.workId),
  ),
].sort();

export function searchProtocolAllowsText(textId: unknown): textId is string {
  return (
    typeof textId === "string" &&
    textId.length > 0 &&
    protocolDecision(textId, "search").allowed
  );
}

/**
 * Treat persisted metadata as untrusted input. Database-backed candidates carry
 * the normalized text_id alongside the JSON metadata; disagreement is rejected
 * so a stale or manipulated metadata object cannot bypass a protocol rule.
 */
export function filterSearchProtocolCandidates<
  T extends { metadata: Passage; textId?: string },
>(rows: readonly T[]): T[] {
  return rows.filter((row) => {
    const metadataTextId = row.metadata?.textId;
    const authoritativeTextId = row.textId ?? metadataTextId;
    return (
      searchProtocolAllowsText(authoritativeTextId) &&
      passageAiRightsAllowed(row.metadata) &&
      authoritativeTextId === metadataTextId
    );
  });
}

/**
 * Build the SQL predicates shared by lexical and semantic database retrieval.
 * The predicates are deliberately applied inside the candidate query, before
 * ranking limits, so a large out-of-scope result set cannot hide valid scoped
 * evidence.
 */
export function passageScopeSql(
  options: SearchOptions,
  params: unknown[],
  passageAlias = "p",
  textAlias = "t",
  editionAlias = "e",
) {
  const clauses = [
    `${passageAlias}.public_domain=true`,
    `${textAlias}.public_domain_available=true`,
    `${editionAlias}.public_domain=true`,
  ];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (options.contentTypes?.length)
    clauses.push(
      `${passageAlias}.content_type = ANY(${add(options.contentTypes)}::text[])`,
    );
  if (options.textIds?.length)
    clauses.push(
      `${passageAlias}.text_id = ANY(${add(options.textIds)}::text[])`,
    );
  if (options.editionIds?.length)
    clauses.push(
      `${passageAlias}.edition_id = ANY(${add(options.editionIds)}::text[])`,
    );
  if (options.traditions?.length)
    clauses.push(
      `${textAlias}.tradition_id = ANY(${add(options.traditions)}::text[])`,
    );
  if (options.region)
    clauses.push(`${textAlias}.origin_region = ${add(options.region)}`);
  if (options.before !== undefined)
    clauses.push(
      `${textAlias}.approximate_start_date IS NOT NULL AND ${textAlias}.approximate_start_date <= ${add(options.before)}`,
    );
  if (options.after !== undefined)
    clauses.push(
      `${textAlias}.approximate_end_date IS NOT NULL AND ${textAlias}.approximate_end_date >= ${add(options.after)}`,
    );

  // Apply cultural protocol exclusions before ranking and LIMIT. Filtering the
  // first 100 rows afterward would let a large restricted result set crowd out
  // eligible evidence.
  if (restrictedSearchTextIds.length)
    clauses.push(
      `NOT (${passageAlias}.text_id = ANY(${add(restrictedSearchTextIds)}::text[]))`,
    );

  return clauses.join(" AND ");
}
