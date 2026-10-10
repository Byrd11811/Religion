import { museumArtifacts, witnesses } from "@/packages/shared/archive";
import { editions, texts, traditions } from "@/packages/shared/catalog";
import { aiRightsDecision } from "@/packages/shared/rights";
import {
  entityNameAssertions,
  entityOccurrences,
  ontologyConcepts,
  ontologyConceptTerms,
  ontologyEntities,
} from "@/packages/shared/ontology-entities";
import { subtraditions } from "@/packages/shared/taxonomy";
import { unresolvedCorpora } from "@/packages/shared/undeciphered";
import type {
  FederatedEntityType,
  FederatedSearchHit,
  FederatedSearchMode,
} from "@/packages/shared/types";

const workAliases: Record<string, string[]> = {
  "epic-of-gilgamesh": ["Gilgamesh"],
  "egyptian-book-of-the-dead": ["Book of the Dead"],
  "bhagavad-gita": ["Gita"],
  "tao-te-ching": ["Dao De Jing", "Daodejing"],
  quran: ["Qur'an", "Koran"],
  "rig-veda": ["Rigveda"],
  "book-of-mormon": ["BoM"],
};

/**
 * Search normalization keeps letters and numbers from every script. Marks are
 * removed after compatibility decomposition so pointed and unpointed forms,
 * or Latin text with and without accents, can meet without deleting the base
 * characters. This intentionally does not transliterate or equate names;
 * source-specific name assertions supply those search paths.
 */
export function tokenizeFederatedSearch(value: string): string[] {
  const originals =
    value
      .normalize("NFC")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  const folded =
    value
      .normalize("NFKD")
      .toLocaleLowerCase()
      .replace(/\p{M}+/gu, "")
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  return [...new Set([...originals, ...folded])];
}

export function normalizeFederatedSearch(value: string): string {
  return tokenizeFederatedSearch(value).join(" ");
}

type Candidate = Omit<FederatedSearchHit, "score"> & {
  searchable: string;
  opposition?: boolean;
  facets: {
    regions: string[];
    languages: string[];
    canon: string[];
    rights: "Public-domain text" | "Public metadata" | "Rights review required";
    confidence: "Reviewed" | "Provisional" | "Unreviewed";
  };
};

function candidate(
  value: Omit<Candidate, "searchable" | "facets">,
  fields: (string | string[] | null | undefined)[],
  facets: Partial<Candidate["facets"]> = {},
): Candidate {
  return {
    ...value,
    searchable: fields.flatMap((field) => field ?? []).join(" "),
    facets: {
      regions: facets.regions ?? [],
      languages: facets.languages ?? [],
      canon: facets.canon ?? [],
      rights: facets.rights ?? "Public metadata",
      confidence: facets.confidence ?? "Unreviewed",
    },
  };
}

function candidates(): Candidate[] {
  const works = texts.map((work) => {
    const aliases = [
      ...(workAliases[work.id] ?? []),
      ...(work.alternateTitles ?? []),
    ].filter((alias, index, all) => all.indexOf(alias) === index);
    const hasRightsClearedEdition = editions.some(
      (edition) =>
        edition.textId === work.id &&
        aiRightsDecision(edition.license, work.copyright).allowed,
    );
    return candidate(
      {
        id: work.id,
        type: "work" as const,
        title: work.title,
        subtitle: `${work.tradition} · ${work.region}`,
        description: work.description,
        href: `/texts/${work.id}`,
        aliases,
        availability: work.editionId ? work.sourceStatus : "Metadata only",
        opposition:
          work.traditionId === "skeptical-atheistic-materialist-critical",
      },
      [
        work.title,
        aliases,
        work.tradition,
        work.region,
        work.category,
        work.canonStatus,
        work.languages,
        work.author,
        work.themes,
        work.description,
      ],
      {
        regions: [work.region],
        languages: work.languages,
        canon: [work.canonStatus],
        rights: hasRightsClearedEdition
          ? "Public-domain text"
          : "Rights review required",
        confidence:
          work.confidence === "Unreviewed"
            ? "Unreviewed"
            : ["A", "B", "C"].includes(work.confidence)
              ? "Reviewed"
              : "Provisional",
      },
    );
  });
  const navigation = traditions.map((tradition) =>
    candidate(
      {
        id: tradition.id,
        type: "tradition" as const,
        title: tradition.name,
        subtitle: tradition.region,
        description: tradition.description,
        href: `/traditions/${tradition.id}`,
        aliases: [],
        availability: "Catalog grouping",
        opposition: tradition.id === "skeptical-atheistic-materialist-critical",
      },
      [tradition.name, tradition.region, tradition.description],
      { regions: [tradition.region] },
    ),
  );
  const branches = subtraditions.map((branch) =>
    candidate(
      {
        id: branch.id,
        type: "subtradition" as const,
        title: branch.name,
        subtitle: [branch.kind, branch.region].filter(Boolean).join(" · "),
        description: branch.description,
        href: `/traditions/${branch.id}`,
        aliases: [],
        availability: branch.reviewStatus,
      },
      [branch.name, branch.kind, branch.region, branch.description],
      {
        regions: branch.region ? [branch.region] : [],
        confidence: branch.reviewStatus.startsWith("Source-checked")
          ? "Reviewed"
          : "Unreviewed",
      },
    ),
  );
  const themes = ontologyConcepts.map((concept) => {
    const terms = ontologyConceptTerms.filter(
      (term) => term.conceptId === concept.id,
    );
    return candidate(
      {
        id: concept.id,
        type: "concept" as const,
        title: concept.label,
        subtitle: `${concept.level === "branch" ? "Ontology branch" : concept.level === "root" ? "Ontology root" : "Comparative concept"} · ${terms.length} scoped term${terms.length === 1 ? "" : "s"}`,
        description: concept.description,
        href: `/ontology/${concept.id}`,
        aliases: concept.keywords.filter(
          (keyword, index, all) =>
            normalizeFederatedSearch(keyword) !==
              normalizeFederatedSearch(concept.label) &&
            all.indexOf(keyword) === index,
        ),
        availability: "Source-linked ontology record",
      },
      [
        concept.label,
        concept.keywords,
        concept.description,
        terms.flatMap((term) => [
          term.term,
          term.transliteration,
          term.language,
          term.script,
          term.scope,
        ]),
      ],
      { confidence: "Reviewed" },
    );
  });
  // This established guide remains the preferred Anunna/Anunnaki result. The
  // Phase 15 entity record appears separately and never turns later
  // identifications or relationships into unconditional aliases.
  const researchGuides = [
    candidate(
      {
        id: "anunnaki",
        type: "concept" as const,
        title: "Anunnaki",
        subtitle: "Sourced Mesopotamian research guide",
        description:
          "Review ancient Anunna attestations, physical witnesses, mainstream scholarship, alternative readings, and separately sourced modern claims.",
        href: "/explore/anunnaki",
        aliases: ["Anunna", "Anuna", "Anunnaku", "Anunnaki"],
        availability: "Sourced research guide",
      },
      ["Anunnaki", "Anunna", "Anuna", "Anunnaku"],
      { confidence: "Reviewed" },
    ),
  ];
  const entities = ontologyEntities.map((entity) => {
    const names = entityNameAssertions.filter(
      (assertion) => assertion.entityId === entity.id,
    );
    const occurrences = entityOccurrences.filter(
      (occurrence) => occurrence.entityId === entity.id,
    );
    // Entity names are assertions with language, period/source scope, and an
    // assertion kind. Keep them searchable, but never flatten them into the
    // unconditional alias list used by ordinary catalog titles.
    const nameAssertions = names.map((assertion) => ({
      name: assertion.name,
      assertionType: assertion.assertionType,
      language: assertion.language,
      script: assertion.script,
      scope: assertion.scope,
      confidence: assertion.confidence,
    }));
    return candidate(
      {
        id: entity.id,
        type: "entity" as const,
        title: entity.canonicalName,
        subtitle: [
          entity.entityType.replaceAll("-", " "),
          ...entity.traditions,
        ].join(" · "),
        description: entity.description,
        href: `/entities/${entity.id}`,
        aliases: [],
        nameAssertions,
        availability: `${names.length} sourced name assertion${names.length === 1 ? "" : "s"} · ${occurrences.length} occurrence${occurrences.length === 1 ? "" : "s"}`,
      },
      [
        entity.canonicalName,
        entity.entityType,
        entity.traditions,
        entity.earliestAttestation,
        entity.description,
        names.flatMap((name) => [
          name.name,
          name.normalizedName,
          name.language,
          name.script,
          name.transliteration,
          name.scope,
        ]),
        occurrences.flatMap((occurrence) => [
          occurrence.attestedForm,
          occurrence.transliteration,
          occurrence.language,
          occurrence.script,
          occurrence.role,
          occurrence.description,
          occurrence.locator,
        ]),
      ],
      {
        languages: names.flatMap((name) => [name.language, name.script]),
        confidence: "Reviewed",
      },
    );
  });
  const people = ["Plato", "Marcus Aurelius", "John Milton"].map((name) => {
    const related = texts.filter((work) => work.author === name);
    return candidate(
      {
        id: name.toLowerCase().replaceAll(" ", "-"),
        type: "person" as const,
        title: name,
        subtitle: "Edition-attributed author",
        description: `Linked to ${related.map((work) => work.title).join(", ")}. Authorship claims retain each work's evidence status.`,
        href: `/people?q=${encodeURIComponent(name)}`,
        aliases: [],
        availability: "Attribution review required",
        opposition: related.some(
          (work) =>
            work.traditionId === "skeptical-atheistic-materialist-critical",
        ),
      },
      [name, related.map((work) => work.title)],
      {
        regions: [...new Set(related.map((work) => work.region))],
        languages: [...new Set(related.flatMap((work) => work.languages))],
        rights: "Rights review required",
        confidence: "Provisional",
      },
    );
  });
  const physicalWitnesses = witnesses
    .filter((witness) => witness.access !== "Restricted")
    .map((witness) =>
      candidate(
        {
          id: witness.id,
          type: "witness" as const,
          title: witness.title,
          subtitle: [witness.repository, witness.inventoryNumber]
            .filter(Boolean)
            .join(" · "),
          description: witness.description,
          href: `/witnesses/${witness.id}`,
          aliases: witness.inventoryNumber ? [witness.inventoryNumber] : [],
          availability: witness.decipherment,
        },
        [
          witness.title,
          witness.inventoryNumber,
          witness.repository,
          witness.currentLocation,
          witness.languages,
          witness.scripts,
          witness.description,
        ],
        {
          regions: [witness.currentLocation],
          languages: [...witness.languages, ...witness.scripts],
          rights: "Public metadata",
          confidence: [
            "Securely attested",
            "Strong scholarly consensus",
            "Majority scholarly position",
          ].includes(witness.evidence)
            ? "Reviewed"
            : witness.evidence === "Unreviewed"
              ? "Unreviewed"
              : "Provisional",
        },
      ),
    );
  const objects = museumArtifacts.map((artifact) =>
    candidate(
      {
        id: artifact.id,
        type: "artifact" as const,
        title: artifact.title,
        subtitle: [artifact.institution, artifact.inventoryNumber]
          .filter(Boolean)
          .join(" · "),
        description: artifact.description,
        href: `/artifacts/${artifact.id}`,
        aliases: artifact.inventoryNumber ? [artifact.inventoryNumber] : [],
        availability: "Public institutional metadata",
      },
      [
        artifact.title,
        artifact.inventoryNumber,
        artifact.institution,
        artifact.description,
      ],
      {
        regions: [artifact.collection ?? "", artifact.culture ?? ""].filter(
          Boolean,
        ),
        rights: "Public metadata",
        confidence: artifact.verifiedAt ? "Reviewed" : "Unreviewed",
      },
    ),
  );
  const unresolved = unresolvedCorpora.map((corpus) =>
    candidate(
      {
        id: corpus.id,
        type: "unresolved-corpus" as const,
        title: corpus.title,
        subtitle: `${corpus.region} · ${corpus.status}`,
        description: `${corpus.known} ${corpus.translationState}.`,
        href: `/undeciphered/${corpus.id}`,
        aliases: corpus.aliases,
        availability: corpus.translationState,
      },
      [
        corpus.title,
        corpus.aliases,
        corpus.region,
        corpus.artifact,
        corpus.status,
        corpus.scriptState,
        corpus.languageState,
      ],
      {
        regions: [corpus.region],
        languages: [corpus.languageState, corpus.scriptState],
        rights: "Public metadata",
        confidence: "Reviewed",
      },
    ),
  );
  return [
    ...works,
    ...navigation,
    ...branches,
    ...researchGuides,
    ...themes,
    ...entities,
    ...people,
    ...physicalWitnesses,
    ...objects,
    ...unresolved,
  ];
}

const archiveTypes = new Set<FederatedEntityType>([
  "work",
  "witness",
  "artifact",
  "unresolved-corpus",
]);

export function federatedSearch(
  query: string,
  options: {
    mode?: FederatedSearchMode;
    types?: FederatedEntityType[];
    region?: string;
    language?: string;
    canon?: string;
    rights?: Candidate["facets"]["rights"];
    confidence?: Candidate["facets"]["confidence"];
    limit?: number;
  } = {},
): FederatedSearchHit[] {
  const terms = tokenizeFederatedSearch(query);
  if (!terms.length) return [];
  const normalized = terms.join(" ");
  const mode = options.mode ?? "Broad";
  return candidates()
    .filter((item) => {
      if (options.types?.length && !options.types.includes(item.type))
        return false;
      if (mode === "Opposition" && !item.opposition) return false;
      if (mode === "Scholarly" && item.facets.confidence === "Unreviewed")
        return false;
      if (mode === "Deep Archive" && !archiveTypes.has(item.type)) return false;
      if (mode === "Manuscripts" && item.type !== "witness") return false;
      const includes = (values: string[], sought?: string) =>
        !sought ||
        values.some((value) =>
          normalizeFederatedSearch(value).includes(
            normalizeFederatedSearch(sought),
          ),
        );
      if (!includes(item.facets.regions, options.region)) return false;
      if (!includes(item.facets.languages, options.language)) return false;
      if (!includes(item.facets.canon, options.canon)) return false;
      if (options.rights && item.facets.rights !== options.rights) return false;
      if (options.confidence && item.facets.confidence !== options.confidence)
        return false;
      return true;
    })
    .flatMap((item) => {
      const title = normalizeFederatedSearch(item.title);
      const aliases = [
        ...item.aliases,
        ...(item.nameAssertions?.map((assertion) => assertion.name) ?? []),
      ]
        .map(normalizeFederatedSearch)
        .filter((alias) => alias !== title);
      const searchable = new Set(tokenizeFederatedSearch(item.searchable));
      if (!terms.every((term) => searchable.has(term))) return [];
      const score =
        (item.href === "/explore/anunnaki" ? 20 : 0) +
        (title === normalized ? 100 : 0) +
        (aliases.includes(normalized) ? 90 : 0) +
        (title.startsWith(normalized) ? 40 : 0) +
        terms.filter((term) => title.includes(term)).length * 8 +
        (item.type === "work" ? 2 : 0);
      return [
        {
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          href: item.href,
          aliases: item.aliases,
          nameAssertions: item.nameAssertions,
          availability: item.availability,
          score,
        },
      ];
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, Math.min(Math.max(options.limit ?? 30, 1), 100));
}
