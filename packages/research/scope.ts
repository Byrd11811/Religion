import {
  researchSources,
  type ResearchConfidence,
  type ScopedEvidence,
} from "@/packages/shared/research-engines";
import type { Passage } from "@/packages/shared/types";
import { allPassages } from "@/packages/search";
import { protocolDecision } from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";

export interface ResearchScope {
  textIds?: string[];
  traditionIds?: string[];
  regions?: string[];
  sourceIds?: string[];
  sourceKinds?: string[];
  beforeYear?: number;
  afterYear?: number;
  minConfidence?: ResearchConfidence;
  contentTypes?: Passage["contentType"][];
}

const confidenceRank: Record<ResearchConfidence, number> = {
  contested: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const sourcesById = new Map(
  researchSources.map((source) => [source.id, source]),
);

function allAllowed(actual: string[], allowed?: string[]) {
  return !allowed?.length || actual.every((value) => allowed.includes(value));
}

/**
 * Apply scope to one complete evidence unit. Requiring every cited source,
 * tradition, and region to fit avoids leaking out-of-scope claims from a
 * multi-source comparison.
 */
export function evidenceFitsScope(
  evidence: ScopedEvidence,
  scope: ResearchScope = {},
) {
  if (
    evidence.textIds?.some(
      (textId) => !protocolDecision(textId, "search").allowed,
    )
  )
    return false;
  if (evidence.canonicalPassageIds?.length) {
    const passageById = new Map(allPassages().map((passage) => [passage.id, passage]));
    if (
      evidence.canonicalPassageIds.some((passageId) => {
        const passage = passageById.get(passageId);
        return (
          !passage ||
          !protocolDecision(passage.textId, "search").allowed ||
          !passageAiRightsAllowed(passage)
        );
      })
    )
      return false;
  }
  if (
    scope.textIds?.length &&
    (!evidence.textIds?.length || !allAllowed(evidence.textIds, scope.textIds))
  )
    return false;
  if (!allAllowed(evidence.traditionIds, scope.traditionIds)) return false;
  if (!allAllowed(evidence.regions, scope.regions)) return false;
  if (!allAllowed(evidence.sourceIds, scope.sourceIds)) return false;
  if (
    scope.sourceKinds?.length &&
    !evidence.sourceIds.every((sourceId) => {
      const source = sourcesById.get(sourceId);
      return source ? scope.sourceKinds!.includes(source.kind) : false;
    })
  )
    return false;
  if (
    scope.contentTypes?.length &&
    (!evidence.contentTypes?.length ||
      !allAllowed(evidence.contentTypes, scope.contentTypes))
  )
    return false;
  if (
    scope.beforeYear !== undefined &&
    (evidence.startYear === null || evidence.startYear > scope.beforeYear)
  )
    return false;
  if (
    scope.afterYear !== undefined &&
    (evidence.endYear === null || evidence.endYear < scope.afterYear)
  )
    return false;
  if (
    scope.minConfidence &&
    confidenceRank[evidence.confidence] < confidenceRank[scope.minConfidence]
  )
    return false;
  return true;
}

export function filterEvidence<T extends ScopedEvidence>(
  evidence: T[],
  scope: ResearchScope = {},
  limit?: number,
) {
  const filtered = evidence.filter((item) => evidenceFitsScope(item, scope));
  if (limit === undefined) return filtered;
  return filtered.slice(0, Math.max(0, Math.floor(limit)));
}

export function normalizedLimit(value: number | undefined, fallback: number) {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.floor(value)));
}

export function uniqueSourceIds(evidence: ScopedEvidence[]) {
  return [...new Set(evidence.flatMap(({ sourceIds }) => sourceIds))];
}
