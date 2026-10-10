import { comparisonCases as curatedTextualTensions } from "@/packages/ai/guides";
import { allPassages, search } from "@/packages/search";
import { relationships, texts } from "@/packages/shared/catalog";
import { researchSources } from "@/packages/shared/research-engines";
import { protocolDecision } from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";
import type {
  Passage,
  Relationship,
  SearchHit,
  TextRecord,
} from "@/packages/shared/types";
import type { ResearchScope } from "@/packages/research/scope";

export interface LegacyComparisonSections {
  texts: TextRecord[];
  cases: ReturnType<typeof curatedTextualTensions>;
  passages: { textId: string; passages: SearchHit[] }[];
  relationships: Relationship[];
}

function normalizedToken(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function includesNormalized(allowed: string[] | undefined, actual: string) {
  return (
    !allowed?.length ||
    allowed.some((value) => normalizedToken(value) === normalizedToken(actual))
  );
}

function normalizedUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function hasSourceScope(scope: ResearchScope) {
  return Boolean(scope.sourceIds?.length || scope.sourceKinds?.length);
}

/** Resolve the exact source URLs admitted by a research source scope. */
export function legacySourceUrls(scope: ResearchScope) {
  if (!hasSourceScope(scope)) return undefined;
  return researchSources
    .filter(
      (source) =>
        (!scope.sourceIds?.length || scope.sourceIds.includes(source.id)) &&
        (!scope.sourceKinds?.length || scope.sourceKinds.includes(source.kind)),
    )
    .map((source) => normalizedUrl(source.url));
}

function urlFitsScope(
  url: string | null | undefined,
  scope: ResearchScope,
  admittedUrls = legacySourceUrls(scope),
) {
  if (!hasSourceScope(scope)) return true;
  return Boolean(url && admittedUrls?.includes(normalizedUrl(url)));
}

function textDimensionsFitScope(text: TextRecord, scope: ResearchScope) {
  if (!protocolDecision(text.id, "display").allowed) return false;
  if (scope.textIds?.length && !scope.textIds.includes(text.id)) return false;
  if (!includesNormalized(scope.traditionIds, text.traditionId)) return false;
  if (!includesNormalized(scope.regions, text.region)) return false;
  if (
    scope.beforeYear !== undefined &&
    (text.startDate === null || text.startDate > scope.beforeYear)
  )
    return false;
  if (
    scope.afterYear !== undefined &&
    (text.endDate === null || text.endDate < scope.afterYear)
  )
    return false;
  // A-E catalog grades and research-engine confidence labels have different
  // meanings. Fail closed rather than silently converting between them.
  if (scope.minConfidence) return false;
  return urlFitsScope(text.sourceUrl, scope);
}

function passageFitsScope(
  passage: Pick<
    SearchHit,
    "contentType" | "sourceUrl" | "textId" | "editionId"
  >,
  scope: ResearchScope,
) {
  if (!protocolDecision(passage.textId, "search").allowed) return false;
  if (!passageAiRightsAllowed(passage)) return false;
  if (scope.textIds?.length && !scope.textIds.includes(passage.textId))
    return false;
  if (
    scope.contentTypes?.length &&
    !scope.contentTypes.includes(passage.contentType)
  )
    return false;
  return urlFitsScope(passage.sourceUrl, scope);
}

/** Filter before slicing so high-ranking out-of-scope rows cannot consume a limit. */
export function filterLegacyComparisonPassages(
  passages: SearchHit[],
  scope: ResearchScope,
  limit: number,
) {
  return passages
    .filter((passage) => passageFitsScope(passage, scope))
    .slice(0, Math.max(0, Math.floor(limit)));
}

function textHasEligibleContent(textId: string, scope: ResearchScope) {
  return allPassages().some(
    (passage: Passage) =>
      passage.textId === textId && passageFitsScope(passage, scope),
  );
}

function relationshipFitsScope(
  relationship: Relationship,
  allowedTextIds: Set<string>,
  scope: ResearchScope,
) {
  if (
    !allowedTextIds.has(relationship.source) ||
    !allowedTextIds.has(relationship.target)
  )
    return false;
  // Legacy relationships are not passage-classified and their A-E confidence
  // is not the research engine's confidence vocabulary.
  if (scope.contentTypes?.length || scope.minConfidence) return false;
  return urlFitsScope(relationship.sourceUrl, scope);
}

export function buildLegacyComparisonSections({
  textIds,
  theme,
  scope = {},
  passageLimit = 2,
}: {
  textIds: string[];
  theme: string;
  scope?: ResearchScope;
  passageLimit?: number;
}): LegacyComparisonSections {
  const effectiveTextIds =
    scope.textIds === undefined
      ? textIds
      : textIds.filter((textId) => scope.textIds!.includes(textId));
  const requested = new Set(effectiveTextIds);
  const effectiveScope: ResearchScope = {
    ...scope,
    textIds: effectiveTextIds,
  };
  const scopedTexts = texts.filter(
    (text) =>
      requested.has(text.id) &&
      textDimensionsFitScope(text, effectiveScope) &&
      textHasEligibleContent(text.id, effectiveScope),
  );
  const scopedTextIds = scopedTexts.map(({ id }) => id);
  const allowedTextIds = new Set(scopedTextIds);

  // Ask lexical search for every ranked candidate, then apply source scope and
  // only then take the two-per-work response limit.
  const ranked = scopedTextIds.length
    ? search(theme, {
        textIds: scopedTextIds,
        contentTypes: scope.contentTypes,
        limit: allPassages().length,
      })
    : [];
  const scopedRanked = filterLegacyComparisonPassages(
    ranked,
    effectiveScope,
    ranked.length,
  );
  const passages = scopedTextIds.map((textId) => ({
    textId,
    passages: scopedRanked
      .filter((passage) => passage.textId === textId)
      .slice(0, passageLimit),
  }));
  const cases = curatedTextualTensions(scopedTextIds, theme).filter((item) =>
    item.passages.every(
      (passage) =>
        allowedTextIds.has(passage.textId) &&
        passageFitsScope(passage, effectiveScope),
    ),
  );

  return {
    texts: scopedTexts,
    cases,
    passages,
    relationships: relationships.filter((relationship) =>
      relationshipFitsScope(relationship, allowedTextIds, effectiveScope),
    ),
  };
}
