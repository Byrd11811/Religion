import {
  comparisonCases,
  researchEnginePolicy,
  type AlternativeInterpretation,
  type ChronologyFinding,
  type ComparisonCase,
  type ComparisonMode,
  type ComparisonSubjectClaim,
  type ComparisonSynthesisFinding,
  type ContradictionFinding,
  type InfluenceRelationship,
  type ScopedEvidence,
  type SimilarityFinding,
} from "@/packages/shared/research-engines";
import {
  evidenceFitsScope,
  normalizedLimit,
  uniqueSourceIds,
  type ResearchScope,
} from "@/packages/research/scope";

export const comparisonModes: ComparisonMode[] = [
  "synthesize",
  "contradictions",
  "similarities",
  "earlier-parallels",
  "later-echoes",
  "alternative-interpretations",
];

export interface ComparisonRequest {
  caseIds?: string[];
  textIds?: string[];
  theme?: string;
  scope?: ResearchScope;
  limitPerSection?: number;
}

export type ComparisonSection =
  | { kind: "synthesis"; items: ComparisonSynthesisFinding[] }
  | { kind: "propositions"; items: ComparisonSubjectClaim[] }
  | { kind: "contradictions"; items: ContradictionFinding[] }
  | { kind: "similarities"; items: SimilarityFinding[] }
  | { kind: "chronology"; items: ChronologyFinding[] }
  | { kind: "influence"; items: InfluenceRelationship[] }
  | { kind: "alternative-interpretations"; items: AlternativeInterpretation[] };

export interface ComparisonCaseOutput {
  caseId: string;
  title: string;
  topic: string;
  scopeNote: string;
  sections: ComparisonSection[];
  sourceIds: string[];
}

export interface ComparisonResponse {
  engine: "distinct-reviewed-comparison";
  mode: ComparisonMode;
  policy: string;
  chronologyPolicy: string;
  requestedTextIds: string[];
  requestedTheme: string;
  noApplicableAnalysis: string | null;
  cases: ComparisonCaseOutput[];
}

function normalizedWords(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function themeApplies(comparison: ComparisonCase, theme?: string) {
  const query = normalizedWords(theme ?? "");
  if (!query) return true;
  return comparison.themes.some((candidate) => {
    const reviewed = normalizedWords(candidate);
    return query === reviewed || ` ${query} `.includes(` ${reviewed} `);
  });
}

function textsApply(comparison: ComparisonCase, textIds?: string[]) {
  if (!textIds?.length) return true;
  const selected = new Set(textIds);
  return comparison.textIds.filter((textId) => selected.has(textId)).length >= 2;
}

function withinScope<T extends ScopedEvidence>(items: T[], scope: ResearchScope) {
  return items.filter((item) => evidenceFitsScope(item, scope));
}

function linkedInfluence(
  comparison: ComparisonCase,
  items: Array<SimilarityFinding | ChronologyFinding>,
  scope: ResearchScope,
) {
  const needed = new Set(
    items.flatMap(({ influenceRelationshipId }) =>
      influenceRelationshipId ? [influenceRelationshipId] : [],
    ),
  );
  return withinScope(comparison.influenceRelationships, scope).filter(({ id }) =>
    needed.has(id),
  );
}

function buildSections(
  mode: ComparisonMode,
  comparison: ComparisonCase,
  scope: ResearchScope,
  limit: number,
): ComparisonSection[] {
  if (mode === "synthesize") {
    const items = withinScope(comparison.synthesisFindings, scope).slice(0, limit);
    return items.length ? [{ kind: "synthesis", items }] : [];
  }

  if (mode === "contradictions") {
    const scopedClaims = withinScope(comparison.subjectClaims, scope);
    const claimsById = new Map(scopedClaims.map((claim) => [claim.id, claim]));
    const contradictions = withinScope(comparison.contradictionFindings, scope)
      .filter(
        ({ propositionAId, propositionBId }) =>
          claimsById.has(propositionAId) && claimsById.has(propositionBId),
      )
      .slice(0, limit);
    if (!contradictions.length) return [];
    const neededClaims = new Set(
      contradictions.flatMap(({ propositionAId, propositionBId }) => [
        propositionAId,
        propositionBId,
      ]),
    );
    const propositions = scopedClaims
      .filter(({ id }) => neededClaims.has(id))
      .slice(0, limit * 2);
    return [
      { kind: "contradictions", items: contradictions },
      { kind: "propositions", items: propositions },
    ];
  }

  if (mode === "similarities") {
    const scoped = withinScope(comparison.similarityFindings, scope);
    const influence = linkedInfluence(comparison, scoped, scope);
    const availableInfluence = new Set(influence.map(({ id }) => id));
    const similarities = scoped
      .filter(
        ({ influenceRelationshipId }) =>
          !influenceRelationshipId || availableInfluence.has(influenceRelationshipId),
      )
      .slice(0, limit);
    if (!similarities.length) return [];
    const retainedInfluence = new Set(
      similarities.flatMap(({ influenceRelationshipId }) =>
        influenceRelationshipId ? [influenceRelationshipId] : [],
      ),
    );
    const sections: ComparisonSection[] = [
      { kind: "similarities", items: similarities },
    ];
    const cited = influence
      .filter(({ id }) => retainedInfluence.has(id))
      .slice(0, limit);
    if (cited.length) sections.push({ kind: "influence", items: cited });
    return sections;
  }

  if (mode === "earlier-parallels" || mode === "later-echoes") {
    const kind = mode === "earlier-parallels" ? "earlier-parallel" : "later-echo";
    const scoped = withinScope(comparison.chronologyFindings, scope).filter(
      (finding) => finding.kind === kind,
    );
    const influence = linkedInfluence(comparison, scoped, scope);
    const availableInfluence = new Set(influence.map(({ id }) => id));
    const chronology = scoped
      .filter(
        ({ influenceRelationshipId }) =>
          !influenceRelationshipId || availableInfluence.has(influenceRelationshipId),
      )
      .slice(0, limit);
    if (!chronology.length) return [];
    const sections: ComparisonSection[] = [{ kind: "chronology", items: chronology }];
    const needed = new Set(
      chronology.flatMap(({ influenceRelationshipId }) =>
        influenceRelationshipId ? [influenceRelationshipId] : [],
      ),
    );
    const cited = influence.filter(({ id }) => needed.has(id)).slice(0, limit);
    if (cited.length) sections.push({ kind: "influence", items: cited });
    return sections;
  }

  const interpretations = withinScope(
    comparison.alternativeInterpretations,
    scope,
  ).slice(0, limit);
  return interpretations.length
    ? [{ kind: "alternative-interpretations", items: interpretations }]
    : [];
}

/** Run one of six evidence-backed, behaviorally distinct comparison engines. */
export function runComparison(
  mode: ComparisonMode,
  {
    caseIds,
    textIds,
    theme,
    scope = {},
    limitPerSection,
  }: ComparisonRequest = {},
): ComparisonResponse {
  if (!comparisonModes.includes(mode))
    throw new Error(`Unsupported comparison mode: ${mode}`);
  const limit = normalizedLimit(limitPerSection, 12);
  const hasExplicitTextScope = textIds !== undefined || scope.textIds !== undefined;
  const requestedTextIds = textIds ?? scope.textIds ?? [];
  const effectiveScope: ResearchScope = {
    ...scope,
    textIds: requestedTextIds.length ? requestedTextIds : undefined,
  };
  const selected = hasExplicitTextScope && requestedTextIds.length < 2
    ? []
    : comparisonCases.filter(
        (comparison) =>
          (!caseIds?.length || caseIds.includes(comparison.id)) &&
          textsApply(comparison, requestedTextIds) &&
          themeApplies(comparison, theme),
      );
  const cases = selected.flatMap((comparison) => {
    const sections = buildSections(mode, comparison, effectiveScope, limit);
    if (!sections.length) return [];
    const evidence = sections.flatMap((section) => section.items);
    return [
      {
        caseId: comparison.id,
        title: comparison.title,
        topic: comparison.topic,
        scopeNote: comparison.scopeNote,
        sections,
        sourceIds: uniqueSourceIds(evidence),
      },
    ];
  });
  return {
    engine: "distinct-reviewed-comparison",
    mode,
    policy: researchEnginePolicy.comparison,
    chronologyPolicy: researchEnginePolicy.chronology,
    requestedTextIds,
    requestedTheme: theme?.trim() ?? "",
    noApplicableAnalysis: cases.length
      ? null
      : "No reviewed analysis matches both the selected texts and the requested theme in this mode.",
    cases,
  };
}
