import { concepts, tokenize } from "@/packages/ontology";
import { museumArtifacts, witnesses } from "@/packages/shared/archive";
import { texts, traditions } from "@/packages/shared/catalog";
import { subtraditions } from "@/packages/shared/taxonomy";
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
};

function candidate(
  value: Omit<Candidate, "searchable">,
  fields: (string | string[] | null | undefined)[],
): Candidate {
  return {
    ...value,
    searchable: fields.flatMap((field) => field ?? []).join(" "),
  };
}

function candidates(): Candidate[] {
  const works = texts.map((work) =>
    candidate(
      {
        id: work.id,
        type: "work" as const,
        title: work.title,
        subtitle: `${work.tradition} · ${work.region}`,
        description: work.description,
        href: `/texts/${work.id}`,
        aliases: workAliases[work.id] ?? [],
        availability: work.editionId ? work.sourceStatus : "Metadata only",
        opposition:
          work.traditionId === "skeptical-atheistic-materialist-critical",
      },
      [
        work.title,
        workAliases[work.id],
        work.tradition,
        work.region,
        work.category,
        work.canonStatus,
        work.languages,
        work.author,
        work.themes,
        work.description,
      ],
    ),
  );
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
    ),
  );
  const themes = Object.entries(concepts).map(([name, aliases]) =>
    candidate(
      {
        id: name,
        type: "concept" as const,
        title: name[0].toUpperCase() + name.slice(1),
        subtitle: "Comparative search concept",
        description: `Search label connected to: ${aliases.join(", ")}. Similar words do not establish equivalent teachings.`,
        href: `/themes?q=${encodeURIComponent(name)}`,
        aliases,
        availability: "Exploratory vocabulary",
      },
      [name, aliases],
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
  ];
}

const archiveTypes = new Set<FederatedEntityType>([
  "work",
  "witness",
  "artifact",
]);

export function federatedSearch(
  query: string,
  options: {
    mode?: FederatedSearchMode;
    types?: FederatedEntityType[];
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
      if (mode === "Deep Archive" && !archiveTypes.has(item.type)) return false;
      if (mode === "Manuscripts" && item.type !== "witness") return false;
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
