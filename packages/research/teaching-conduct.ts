import {
  researchEnginePolicy,
  teachingConductCases,
  type AttributedEvidence,
  type TeachingConductCase,
} from "@/packages/shared/research-engines";
import {
  evidenceFitsScope,
  normalizedLimit,
  uniqueSourceIds,
  type ResearchScope,
} from "@/packages/research/scope";

export interface TeachingConductRequest {
  caseIds?: string[];
  scope?: ResearchScope;
  limit?: number;
}

export interface TeachingConductResponse {
  engine: "teaching-historical-conduct";
  policy: string;
  cases: TeachingConductCase[];
}

const sectionKeys = [
  "teachingEvidence",
  "conductEvidence",
  "justificationsAtTheTime",
  "textsUsedToJustify",
  "supportingReligiousVoices",
  "opposingReligiousVoices",
  "nonreligiousMotives",
  "laterTheologicalInterpretations",
  "modernScholarlyInterpretations",
] as const;

function scopedCase(
  conductCase: TeachingConductCase,
  scope: ResearchScope,
): TeachingConductCase | undefined {
  if (
    scope.traditionIds?.length &&
    !scope.traditionIds.includes(conductCase.traditionId)
  )
    return undefined;
  if (
    scope.beforeYear !== undefined &&
    conductCase.startYear > scope.beforeYear
  )
    return undefined;
  if (scope.afterYear !== undefined && conductCase.endYear < scope.afterYear)
    return undefined;
  if (
    scope.textIds?.length &&
    !sectionKeys.some((key) =>
      conductCase[key].some(
        (item) =>
          item.textIds?.length &&
          item.textIds.every((textId) => scope.textIds!.includes(textId)),
      ),
    )
  )
    return undefined;

  // A tradition selection chooses the reviewed dossier. Its evidence lanes
  // deliberately retain separately attributed institutions, legal schools,
  // states, reformers, and critics. Reapplying the case-level tradition as an
  // item-level allowlist would erase those essential independent witnesses.
  const evidenceScope = { ...scope };
  delete evidenceScope.traditionIds;
  // Like a tradition selection, an exact mapped text selects the reviewed
  // dossier. The other lanes are historical records, institutions, critics,
  // and scholarship rather than claims about that text, so retain them once
  // the case-level mapping has been established.
  delete evidenceScope.textIds;
  const sections = Object.fromEntries(
    sectionKeys.map((key) => [
      key,
      conductCase[key].filter((item) => evidenceFitsScope(item, evidenceScope)),
    ]),
  ) as Record<(typeof sectionKeys)[number], AttributedEvidence[]>;
  if (sectionKeys.some((key) => !sections[key].length)) return undefined;
  const evidence = sectionKeys.flatMap((key) => sections[key]);
  return {
    ...conductCase,
    ...sections,
    sourceIds: uniqueSourceIds(evidence),
  };
}

/**
 * Return reviewed teaching/conduct dossiers with all nine required lanes. A
 * lane can contain an explicitly tagged, cited evidence gap; it must never be
 * counted as supported evidence. A case is omitted when a scope would remove
 * an entire required lane, so a partial structure cannot masquerade as a
 * balanced comparison.
 */
export function findTeachingConductCases({
  caseIds,
  scope = {},
  limit,
}: TeachingConductRequest = {}): TeachingConductResponse {
  const maxCases = normalizedLimit(limit, 20);
  const cases = teachingConductCases
    .filter(({ id }) => !caseIds?.length || caseIds.includes(id))
    .flatMap((conductCase) => {
      const scoped = scopedCase(conductCase, scope);
      return scoped ? [scoped] : [];
    })
    .slice(0, maxCases);
  return {
    engine: "teaching-historical-conduct",
    policy: researchEnginePolicy.teachingConduct,
    cases,
  };
}
