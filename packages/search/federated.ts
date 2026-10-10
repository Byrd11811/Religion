import { concepts, tokenize } from "@/packages/ontology";
import { museumArtifacts, witnesses } from "@/packages/shared/archive";
import { texts, traditions } from "@/packages/shared/catalog";
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
        rights: work.editionId
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
  const themes = Object.entries(concepts).map(([name, aliases]) =>
    candidate(
      {
        id: name,
        type: "concept" as const,
        title: name[0].toUpperCase() + name.slice(1),
        subtitle:
          name === "anunnaki"
            ? "Sourced Mesopotamian research guide"
            : "Comparative search concept",
        description:
          name === "anunnaki"
            ? "Review ancient Anunna attestations, physical witnesses, mainstream scholarship, alternative readings, and separately sourced modern claims."
            : `Search label connected to: ${aliases.join(", ")}. Similar words do not establish equivalent teachings.`,
        href:
          name === "anunnaki"
            ? "/explore/anunnaki"
            : `/themes?q=${encodeURIComponent(name)}`,
        aliases,
        availability:
          name === "anunnaki"
            ? "Sourced research guide"
            : "Exploratory vocabulary",
      },
      [name, aliases],
      name === "anunnaki" ? { confidence: "Reviewed" } : {},
    ),
  );
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
    ...themes,
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
  const terms = tokenize(query);
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
          tokenize(value).join(" ").includes(tokenize(sought).join(" ")),
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
      const title = tokenize(item.title).join(" ");
      const aliases = item.aliases.map((alias) => tokenize(alias).join(" "));
      const searchable = new Set(tokenize(item.searchable));
      if (!terms.every((term) => searchable.has(term))) return [];
      const score =
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
          availability: item.availability,
          score,
        },
      ];
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, Math.min(Math.max(options.limit ?? 30, 1), 100));
}
