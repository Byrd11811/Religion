import {
  entityNameAssertions,
  ontologyConcepts,
  ontologyConceptTerms,
  ontologyEntities,
} from "@/packages/shared/ontology-entities";

const discoveryKeywords: Record<string, string[]> = {
  afterlife: ["dead", "immortal", "heaven", "hell", "soul"],
  creation: ["created", "beginning", "origin", "world"],
  flood: ["deluge", "waters", "ark"],
  suffering: ["pain", "sorrow", "grief"],
  soul: ["self", "personhood"],
  reincarnation: ["transmigration"],
  rebirth: ["born", "reborn"],
  forgiveness: ["forgive", "enemy", "enemies"],
  evil: ["wicked", "wickedness"],
  wisdom: ["understanding", "truth"],
  law: ["duty", "obedience", "command"],
  wealth: ["rich", "money"],
  poverty: ["poor"],
  peace: ["nonviolence", "reconciliation"],
  war: ["battle", "warfare"],
  enlightenment: ["nirvana", "nibbana"],
  ritual: ["worship", "ceremony"],
  consciousness: ["perception", "awareness"],
  judgment: ["judgement", "punishment", "reward"],
  "divine-beings": ["deity", "deities", "divinity"],
  demons: ["demon", "demonic"],
  angels: ["angel", "angelic"],
  apocalypse: ["apocalyptic", "end time", "eschatology"],
  prayer: ["pray"],
  sacrifice: ["offering", "offerings"],
  mysticism: ["mystical", "mystic"],
  divination: ["oracle", "omens", "lots"],
};

// These identifiers and discovery terms predate the normalized ontology. They
// remain part of the public concepts/themes API and of passage classification;
// the richer hierarchy is exposed separately through ontologyConcepts.
const legacyConcepts: Record<string, string[]> = {
  afterlife: ["death", "dead", "immortal", "heaven", "hell", "soul"],
  creation: ["creation", "created", "beginning", "origin", "world"],
  flood: ["flood", "deluge", "waters", "ark"],
  suffering: ["suffering", "pain", "sorrow", "grief"],
  soul: ["soul", "self", "spirit", "mind"],
  reincarnation: ["rebirth", "birth", "born", "transmigration"],
  forgiveness: ["forgive", "forgiveness", "enemy", "enemies", "mercy"],
  evil: ["evil", "wicked", "sin", "satan"],
  wisdom: ["wisdom", "knowledge", "understanding", "truth"],
  law: ["law", "duty", "obedience", "command"],
  wealth: ["wealth", "rich", "poor", "poverty", "money"],
  peace: ["peace", "war", "violence", "battle"],
  enlightenment: ["enlightenment", "liberation", "desire", "nirvana"],
  ritual: ["prayer", "sacrifice", "ritual", "worship"],
  consciousness: ["consciousness", "mind", "perception", "reality"],
  judgment: ["judgment", "judgement", "punishment", "reward"],
  anunnaki: ["anunna", "anuna", "anunnaku", "anunnaki"],
};

/**
 * Backward-compatible concept-keyword index derived from the reviewed hierarchy.
 * These are discovery terms, not claims that two traditions mean the same thing.
 */
export const concepts: Record<string, string[]> = Object.fromEntries([
  ...ontologyConcepts
    .filter(({ level }) => level === "concept")
    .map(
      ({ id, keywords, label }) =>
        [
          id,
          [
            ...new Set([
              ...(legacyConcepts[id] ?? []),
              id,
              label,
              ...keywords,
              ...(discoveryKeywords[id] ?? []),
            ]),
          ],
        ] as [string, string[]],
    ),
  ...Object.entries(legacyConcepts).filter(
    ([id]) => !ontologyConcepts.some((concept) => concept.id === id),
  ),
]);

export const themes = Object.keys(concepts);

function folded(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase();
}

/** Keep non-Latin scripts searchable while also adding accent-folded forms. */
export function tokenize(value: string) {
  const originals =
    value
      .normalize("NFC")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  const foldedTokens =
    folded(value).match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  return [...new Set([...originals, ...foldedTokens])];
}

function normalizedPhrases(value: string) {
  const lowered = value.normalize("NFC").toLocaleLowerCase();
  const accentFolded = folded(value);
  return lowered === accentFolded ? [lowered] : [lowered, accentFolded];
}

function tokenVariants(value: string) {
  return normalizedPhrases(value).map(
    (variant) => variant.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [],
  );
}

function containsTokenSequence(haystack: string[], needle: string[]) {
  if (!needle.length || needle.length > haystack.length) return false;
  return haystack.some(
    (_, start) =>
      start + needle.length <= haystack.length &&
      needle.every((token, offset) => haystack[start + offset] === token),
  );
}

function matchesForm(queryVariants: string[][], form: string) {
  return tokenVariants(form).some((formTokens) =>
    queryVariants.some((queryTokens) =>
      containsTokenSequence(queryTokens, formTokens),
    ),
  );
}

export function detectConcepts(value: string) {
  const queryVariants = tokenVariants(value);
  const discovered = new Set(
    Object.entries(concepts)
      .filter(([key, words]) =>
        [key, ...words].some((word) => matchesForm(queryVariants, word)),
      )
      .map(([key]) => key),
  );

  for (const conceptTerm of ontologyConceptTerms) {
    if (conceptTerm.semanticRelation === "contrast") continue;
    const forms = [conceptTerm.term, conceptTerm.transliteration];
    if (forms.some((form) => matchesForm(queryVariants, form)))
      discovered.add(conceptTerm.conceptId);
  }
  return [...discovered];
}

export interface ResolvedOntologyEntity {
  entityId: string;
  canonicalName: string;
  matchedName: string;
  assertionId: string;
  assertionType: string;
  scope: string;
}

/** Resolve reviewed names while retaining the assertion that caused the match. */
export function resolveOntologyEntities(value: string) {
  const queryVariants = tokenVariants(value);
  const entitiesById = new Map(
    ontologyEntities.map((entity) => [entity.id, entity]),
  );
  const matches = new Map<string, ResolvedOntologyEntity>();
  for (const assertion of entityNameAssertions) {
    const matchesName = matchesForm(queryVariants, assertion.name);
    if (!matchesName || matches.has(assertion.entityId)) continue;
    const entity = entitiesById.get(assertion.entityId);
    if (!entity) continue;
    matches.set(assertion.entityId, {
      entityId: entity.id,
      canonicalName: entity.canonicalName,
      matchedName: assertion.name,
      assertionId: assertion.id,
      assertionType: assertion.assertionType,
      scope: assertion.scope,
    });
  }
  return [...matches.values()];
}

export const questions = [
  "What happens after death?",
  "Why do we suffer?",
  "What is the soul?",
  "How should we treat our enemies?",
  "Which traditions describe a world flood?",
  "Is reality an illusion?",
  "What makes a life meaningful?",
  "What is the origin of evil?",
];

export {
  ontologyConcepts,
  ontologyConceptEdges,
  ontologyConceptTerms,
  ontologyEntities,
  entityNameAssertions,
  entityOccurrences,
  entityRelationships,
  entityEvolutionPaths,
  entityEvolutionStages,
  classificationSchemes,
} from "@/packages/shared/ontology-entities";
