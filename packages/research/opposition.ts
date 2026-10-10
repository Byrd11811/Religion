import {
  oppositionPropositions,
  oppositionStances,
  researchSources,
  researchEnginePolicy,
  type OppositionCategory,
  type OppositionProposition,
  type OppositionStance,
} from "@/packages/shared/research-engines";
import {
  evidenceFitsScope,
  normalizedLimit,
  uniqueSourceIds,
  type ResearchScope,
} from "@/packages/research/scope";

export interface OppositionRequest {
  propositionId?: string;
  query?: string;
  scope?: ResearchScope;
  limit?: number;
}

export interface OppositionMatch {
  proposition: OppositionProposition;
  stances: OppositionStance[];
  categories: OppositionCategory[];
  totalBeforeLimit: number;
}

export interface OppositionResponse {
  engine: "reviewed-proposition-opposition";
  query: string | null;
  policy: string;
  matches: OppositionMatch[];
}

const categoryOrder: OppositionCategory[] = [
  "doctrinal-opposition",
  "philosophical-critique",
  "internal-heterodox-opposition",
  "skeptical-critique",
  "materialist-critique",
  "alternative-religious-interpretation",
  "mystical-reinterpretation",
  "adversarial-reinterpretation",
  "modern-secular-critique",
];

const sourceById = new Map(researchSources.map((source) => [source.id, source]));

function scopedPropositionSourceIds(
  proposition: OppositionProposition,
  stanceSourceIds: string[],
  scope: ResearchScope,
) {
  return proposition.sourceIds.filter((sourceId) => {
    if (!stanceSourceIds.includes(sourceId)) return false;
    if (scope.sourceIds?.length && !scope.sourceIds.includes(sourceId)) return false;
    if (scope.sourceKinds?.length) {
      const source = sourceById.get(sourceId);
      if (!source || !scope.sourceKinds.includes(source.kind)) return false;
    }
    return true;
  });
}

function tokens(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function propositionScore(proposition: OppositionProposition, query: string) {
  const queryTokens = new Set(tokens(query));
  if (!queryTokens.size) return 0;
  const fields = [
    { text: proposition.title, weight: 4 },
    { text: proposition.proposition, weight: 3 },
    { text: proposition.topic, weight: 2 },
    { text: proposition.keywords.join(" "), weight: 5 },
  ];
  return fields.reduce(
    (score, field) =>
      score +
      tokens(field.text).filter((token) => queryTokens.has(token)).length *
        field.weight,
    0,
  );
}

/**
 * Return only manually reviewed stances linked to a proposition. The query
 * selects propositions; it never treats a tradition name as proof of a stance.
 */
export function findOpposition({
  propositionId,
  query,
  scope = {},
  limit,
}: OppositionRequest = {}): OppositionResponse {
  const perPropositionLimit = normalizedLimit(limit, 24);
  let candidates: OppositionProposition[];
  if (propositionId) {
    candidates = oppositionPropositions.filter(({ id }) => id === propositionId);
  } else if (query?.trim()) {
    candidates = oppositionPropositions
      .map((proposition) => ({
        proposition,
        score: propositionScore(proposition, query),
      }))
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.proposition.id.localeCompare(b.proposition.id),
      )
      .map(({ proposition }) => proposition);
  } else {
    candidates = [...oppositionPropositions];
  }

  const matches = candidates.flatMap((proposition) => {
    const scoped = oppositionStances
      .filter(({ propositionId: id }) => id === proposition.id)
      .filter((stance) => evidenceFitsScope(stance, scope))
      .sort(
        (a, b) =>
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
          a.id.localeCompare(b.id),
      );
    if (!scoped.length) return [];
    const stances = scoped.slice(0, perPropositionLimit);
    const propositionSourceIds = scopedPropositionSourceIds(
      proposition,
      uniqueSourceIds(stances),
      scope,
    );
    if (!propositionSourceIds.length) return [];
    return [
      {
        proposition: { ...proposition, sourceIds: propositionSourceIds },
        stances,
        categories: [...new Set(stances.map(({ category }) => category))],
        totalBeforeLimit: scoped.length,
      },
    ];
  });

  return {
    engine: "reviewed-proposition-opposition",
    query: query?.trim() || null,
    policy: researchEnginePolicy.opposition,
    matches,
  };
}
