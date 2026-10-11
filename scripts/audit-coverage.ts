import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { createHash } from "node:crypto";
import {
  texts,
  traditions,
  editions,
  relationships,
  relationshipNodes,
} from "../packages/shared/catalog";
import {
  witnesses,
  museumArtifacts,
  archiveImages,
} from "../packages/shared/archive";
import type { Passage } from "../packages/shared/types";
import { passageSeedFiles } from "../packages/shared/seed-files";
import {
  absentDatasets,
  measureCoverage,
  phase16CoverageMetrics,
} from "../packages/audit/coverage";
import {
  corpusTargets,
  requirementInventory,
} from "../packages/audit/requirements";

const args = new Set(process.argv.slice(2));
if ([...args].some((a) => a !== "--check"))
  throw new Error("Usage: npm run audit:coverage [-- --check]");
const read = (file: string) =>
  readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const hash = (content: string) =>
  createHash("sha256").update(content).digest("hex");
const knownSeeds = [
  "archive-additions.json",
  "china-additions.json",
  "china-archive.json",
  "china-editions.json",
  "china-passages.json",
  "comparison-packs.json",
  "downloads.json",
  "editions.json",
  "egypt-additions.json",
  "egypt-editions.json",
  "egypt-passages.json",
  "esoteric-archive.json",
  "esoteric-editions.json",
  "esoteric-literature.json",
  "esoteric-passages.json",
  "forbidden-lost-disputed.json",
  "horn-additions.json",
  "horn-archive.json",
  "images.json",
  "indigenous-additions.json",
  "indigenous-collections.json",
  "manuscript-expansion.json",
  "mesopotamia-additions.json",
  "mesopotamia-archive.json",
  "mesopotamia-editions.json",
  "mesopotamia-passages.json",
  "modern-religions.json",
  "ontology-entities.json",
  "passages.json",
  "regional-coverage.json",
  "relationship-nodes.json",
  "relationship-object-facts.json",
  "relationships.json",
  "research-engines.json",
  "taxonomy.json",
  "texts.json",
  "traditions.json",
  "undeciphered-corpora.json",
];
const actualSeeds = readdirSync("data/seed")
  .filter((f) => f.endsWith(".json"))
  .sort();
if (JSON.stringify(actualSeeds) !== JSON.stringify(knownSeeds))
  throw new Error(
    "Seed registry changed: reconcile coverage adapters before reporting absence",
  );
const sourcePaths = [
  ...actualSeeds.map((f) => `data/seed/${f}`),
  "packages/shared/archive.ts",
  "packages/shared/catalog.ts",
  "packages/shared/esoteric.ts",
  "packages/shared/forbidden-lost-disputed.ts",
  "packages/shared/modern-religions.ts",
  "packages/shared/ontology-entities.ts",
  "packages/shared/comparison-packs.ts",
  "packages/shared/research-engines.ts",
  "packages/shared/research-provenance.ts",
  "packages/shared/research.ts",
  "packages/shared/relationships.ts",
  "packages/shared/seed-files.ts",
  "packages/shared/types.ts",
  "packages/shared/protocols.ts",
  "packages/shared/taxonomy.ts",
  "packages/db/taxonomy.ts",
  "packages/db/research-queue.ts",
  "packages/db/relationships.ts",
  "packages/db/ontology.ts",
  "packages/db/schema.sql",
  "packages/db/client.ts",
  "packages/db/archive.ts",
  "packages/ontology/index.ts",
  "packages/search/index.ts",
  "packages/search/abort.ts",
  "packages/search/hybrid.ts",
  "packages/search/federated.ts",
  "packages/search/scope.ts",
  "packages/ai/index.ts",
  "packages/ai/claims.ts",
  "packages/ai/compatible-research-provider.ts",
  "packages/ai/neutrality.ts",
  "packages/ai/provider.ts",
  "packages/ai/research-query.ts",
  "packages/ai/stream.ts",
  "packages/research/comparison.ts",
  "packages/research/index.ts",
  "packages/research/opposition.ts",
  "packages/research/scope.ts",
  "packages/research/teaching-conduct.ts",
  "packages/citation/index.ts",
  "scripts/database.ts",
  "scripts/classify.ts",
  "scripts/download.py",
  "scripts/ingest-egypt.ts",
  "scripts/ingest-mesopotamia.py",
  "scripts/ingest-china.py",
  "scripts/ingest-horn.py",
  "scripts/ingest-esoteric-literature.py",
  "scripts/ingest-forbidden-lost-disputed.py",
  "scripts/ingest-modern-religions.py",
  "scripts/ingest-ontology-entities.py",
  "scripts/ingest-comparison-packs.py",
  "scripts/ingest-research-engines.py",
  "scripts/refresh-manifest.py",
  "components/common.tsx",
  "components/Library.tsx",
  "components/FederatedSearch.tsx",
  "components/Atlas.tsx",
  "components/Mesopotamia.tsx",
  "components/China.tsx",
  "components/Horn.tsx",
  "components/GlobalCoverage.tsx",
  "components/Indigenous.tsx",
  "components/Esoteric.tsx",
  "components/ForbiddenLostDisputed.tsx",
  "components/ModernReligions.tsx",
  "components/OntologyEntities.tsx",
  "components/ComparisonPacks.tsx",
  "components/Research.tsx",
  "components/ResearchEngines.tsx",
  "components/StructuredQuestion.tsx",
  "components/Explore.tsx",
  "components/SpatialExplorer.tsx",
  "app/globals.css",
  "packages/shared/exploration.ts",
  "packages/shared/exploration-catalog.ts",
  "packages/shared/exploration-query.ts",
  "app/api/[...path]/route.ts",
  "packages/maps/provider.ts",
  "packages/maps/leaflet.ts",
  "tests/comparison-engines.test.ts",
  "tests/comparison-packs.test.ts",
  "tests/question-engine.test.ts",
  "tests/research-provenance.test.ts",
  "tests/search-scope.test.ts",
  "tests/e2e/comparison-packs.spec.ts",
  "tests/e2e/research-engines.spec.ts",
  "docs/atlas-completion-gap-audit.md",
  "docs/atlas-completion-roadmap.md",
  "docs/atlas-final-completion-directive.md",
  "docs/atlas-comprehensive-missing-dimensions-audit-expanded.md",
  "docs/product-spec.md",
  "docs/expansion-spec.md",
  "docs/phase-0-model-evaluation.md",
  "packages/audit/coverage.ts",
  "packages/audit/requirements.ts",
  "scripts/audit-coverage.ts",
  "data/open-data/oracc-epsd2-literary-selected.json",
  "data/open-data/oracc-qcat-selected.json",
  "data/research/anunnaki-evidence.json",
  "data/public-domain/58.txt",
  "data/public-domain/779.txt",
  "data/public-domain/1004.txt",
  "data/public-domain/2230.txt",
  "data/public-domain/14591.txt",
];
const sources = Object.fromEntries(
  sourcePaths.sort().map((file) => [file, hash(read(file))]),
);
const parsedSeeds = new Map(
  actualSeeds.map((filename) => [
    filename,
    JSON.parse(read(`data/seed/${filename}`)) as unknown,
  ]),
);
const collectionAliases: Partial<
  Record<(typeof absentDatasets)[number][0], Record<string, string>>
> = {
  modernProfiles: { "modern-religions.json": "profiles" },
  ontologyConcepts: { "ontology-entities.json": "concepts" },
  conceptEdges: { "ontology-entities.json": "conceptEdges" },
  conceptTerms: { "ontology-entities.json": "conceptTerms" },
  spiritEntities: { "ontology-entities.json": "entities" },
  entityAliases: { "ontology-entities.json": "nameAssertions" },
  entityOccurrences: { "ontology-entities.json": "occurrences" },
  entityRelationships: { "ontology-entities.json": "relationships" },
  entityEvolutionPaths: { "ontology-entities.json": "evolutionPaths" },
  entityEvolutionStages: { "ontology-entities.json": "evolutionStages" },
  conflictCauses: {
    "ontology-entities.json": "classificationSchemes.conflictCauses",
  },
  conversionModes: {
    "ontology-entities.json": "classificationSchemes.conversionModes",
  },
  conflictClassificationCases: {
    "ontology-entities.json": "conflictCases",
  },
  conflictCauseAssignments: {
    "ontology-entities.json": "conflictCauseAssignments",
  },
  conversionClassificationCases: {
    "ontology-entities.json": "conversionCases",
  },
  conversionModeAssignments: {
    "ontology-entities.json": "conversionModeAssignments",
  },
};

type IdRecord = Record<string, unknown> & { id: string };
const asObject = (value: unknown, label: string) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`Invalid ${label} object`);
  return value as Record<string, unknown>;
};
const asIdRecords = (value: unknown, label: string): IdRecord[] => {
  if (
    !Array.isArray(value) ||
    value.some(
      (row) =>
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        typeof (row as Record<string, unknown>).id !== "string",
    )
  )
    throw new Error(`Invalid ${label} collection`);
  return value as IdRecord[];
};
const flattenIdCollections = (
  parents: IdRecord[],
  keys: readonly string[],
  label: string,
) =>
  parents.flatMap((parent) =>
    keys.flatMap((key) => asIdRecords(parent[key], `${label}.${key}`)),
  );

const comparisonPackSeed = asObject(
  parsedSeeds.get("comparison-packs.json"),
  "comparison-packs.json",
);
const comparisonPacks = asIdRecords(
  comparisonPackSeed.packs,
  "comparison-packs.json packs",
);
const comparisonPackSlots = flattenIdCollections(
  comparisonPacks,
  ["slots"],
  "comparison pack",
);
const comparisonPackOutputs = flattenIdCollections(
  comparisonPacks,
  ["comparisons"],
  "comparison pack",
);

const researchEngineSeed = asObject(
  parsedSeeds.get("research-engines.json"),
  "research-engines.json",
);
const researchComparisonCases = asIdRecords(
  researchEngineSeed.comparisonCases,
  "research comparison cases",
);
const teachingConductCases = asIdRecords(
  researchEngineSeed.teachingConductCases,
  "teaching/conduct cases",
);
const phase16Collections: Record<string, IdRecord[]> = {
  comparisonPacks,
  comparisonPackSlots,
  comparisonEvidenceReadySlots: comparisonPackSlots.filter(
    (record) => record.status === "evidence-ready",
  ),
  comparisonMetadataOnlySlots: comparisonPackSlots.filter(
    (record) => record.status === "metadata-only",
  ),
  comparisonUnclassifiedSelectionSlots: comparisonPackSlots.filter(
    (record) => record.status === "unclassified-selection",
  ),
  comparisonMissingSourceSlots: comparisonPackSlots.filter(
    (record) => record.status === "missing-source",
  ),
  comparisonRestrictedSlots: comparisonPackSlots.filter(
    (record) => record.status === "culturally-restricted",
  ),
  comparisonPackOutputs,
  researchEngineSources: asIdRecords(
    researchEngineSeed.sources,
    "research engine sources",
  ),
  oppositionPropositions: asIdRecords(
    researchEngineSeed.propositions,
    "opposition propositions",
  ),
  oppositionStances: asIdRecords(
    researchEngineSeed.oppositionStances,
    "opposition stances",
  ),
  comparisonEngineCases: researchComparisonCases,
  comparisonEngineEvidence: flattenIdCollections(
    researchComparisonCases,
    [
      "subjectClaims",
      "synthesisFindings",
      "similarityFindings",
      "contradictionFindings",
      "chronologyFindings",
      "influenceRelationships",
      "alternativeInterpretations",
    ],
    "research comparison case",
  ),
  teachingConductCases,
  teachingConductEvidence: flattenIdCollections(
    teachingConductCases,
    [
      "teachingEvidence",
      "conductEvidence",
      "justificationsAtTheTime",
      "textsUsedToJustify",
      "supportingReligiousVoices",
      "opposingReligiousVoices",
      "nonreligiousMotives",
      "laterTheologicalInterpretations",
      "modernScholarlyInterpretations",
    ],
    "teaching/conduct case",
  ).filter((record) => record.recordKind !== "documented-gap"),
  teachingConductEvidenceGaps: flattenIdCollections(
    teachingConductCases,
    [
      "teachingEvidence",
      "conductEvidence",
      "justificationsAtTheTime",
      "textsUsedToJustify",
      "supportingReligiousVoices",
      "opposingReligiousVoices",
      "nonreligiousMotives",
      "laterTheologicalInterpretations",
      "modernScholarlyInterpretations",
    ],
    "teaching/conduct case",
  ).filter((record) => record.recordKind === "documented-gap"),
};
for (const metric of phase16CoverageMetrics) {
  if (!phase16Collections[metric.id])
    throw new Error(`Missing Phase 16 coverage adapter for ${metric.id}`);
}
const input = {
  texts,
  traditions,
  editions,
  relationships,
  witnesses,
  artifacts: museumArtifacts,
  images: archiveImages,
  relationshipNodes,
  passages: passageSeedFiles.flatMap(
    (filename) => parsedSeeds.get(filename) as Passage[],
  ),
  additionalCollections: {
    ...Object.fromEntries(
      absentDatasets.map(([id]) => {
      const records: { id: string }[] = [];
      for (const filename of actualSeeds) {
        const data = parsedSeeds.get(filename);
        const collectionKey = collectionAliases[id]?.[filename] ?? id;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          const collection = collectionKey
            .split(".")
            .reduce<unknown>(
              (value, key) =>
                value && typeof value === "object" && !Array.isArray(value)
                  ? (value as Record<string, unknown>)[key]
                  : undefined,
              data,
            );
          if (collection === undefined) continue;
          if (
            !Array.isArray(collection) ||
            collection.some((row) => !row || typeof row.id !== "string")
          )
            throw new Error(`Invalid ${id} collection in ${filename}`);
          records.push(...collection);
        }
      }
      return [id, records];
      }),
    ),
    ...phase16Collections,
  },
};
const metrics = measureCoverage(input, 2026);
const inventory = requirementInventory(
  read("docs/atlas-completion-gap-audit.md"),
  read("docs/expansion-spec.md"),
  read("docs/atlas-completion-roadmap.md"),
  read("docs/atlas-final-completion-directive.md"),
);
const targets = corpusTargets(
  read("docs/product-spec.md"),
  read("docs/expansion-spec.md"),
  texts,
);
const report = {
  formatVersion: 1,
  scope:
    "Repository seed baseline; no deployment database access, migrations, initialization, providers or network requests",
  throughYear: 2026,
  reproducibility:
    "Normalized UTF-8/LF source hashes; no wall-clock timestamp; fixed legacy map year explicitly recorded",
  runtime: {
    inspected: false,
    reason:
      "The app database accessor initializes/migrates data. It is deliberately not used by this read-only audit. Persisted counts remain null/unknown.",
  },
  limitations: [
    "Source presence is not scholarly review or completion.",
    "Image rights are retained intake metadata, not live URL/license re-verification.",
    "Zero absent-dataset counts are limited to the reviewed seed registry; new source files require adapter reconciliation.",
    "No production/private notes or credentials are read or published.",
  ],
  sources,
  metrics,
};
const md = [
  "# Atlas coverage baseline",
  "",
  report.scope,
  "",
  "Generated by `npm run audit:coverage`. Do not edit generated reports. `--check` fails on source/report drift.",
  "",
  "Deployment persisted/reviewed/tested counts are **unknown**, not zero. A seeded row or route is never a completion certificate. See [model evaluation](../phase-0-model-evaluation.md) and [requirement matrix](requirements.md).",
  "",
  "| ID | Metric | Seeded | Persisted | Reviewed | Exposed | Tested | Complete |",
  "|---|---|---:|---|---|---|---|---|",
  ...metrics.map(
    (m) =>
      `| ${m.id} | ${m.label} | ${m.seeded} | Unknown | Unknown | ${m.exposed ?? "Unknown"} | Unknown | No |`,
  ),
  "",
  "## Counting rules",
  "",
  ...metrics.map((m) => `- **${m.id}:** ${m.rule} Source: \`${m.source}\`.`),
  "",
  "## Limitations",
  "",
  ...report.limitations.map((l) => `- ${l}`),
  "",
].join("\n");
const reqMd = [
  "# Atlas requirement matrix",
  "",
  "Generated from the authoritative audit and expansion quality rules. Source sections supply the full acceptance criteria. No feature is closed by this inventory. Unknown/unverified means not certified, not necessarily absent.",
  "",
  "| ID | Requirement | Owner phases | Status |",
  "|---|---|---|---|",
  ...inventory.requirements.map(
    (r) =>
      `| ${r.id} | ${r.title.replaceAll("|", "/")} | ${r.owners.join(", ")} | ${r.status} |`,
  ),
  "",
  "## Quality and regression rules",
  "",
  "All rules remain unverified until actual requirement-level evidence is attached. Existing passing tests do not automatically close these rules.",
  "",
  ...inventory.quality.map(
    (q) => `- **${q.id} — unverified:** ${q.requirement}`,
  ),
  "",
].join("\n");
const outputs = new Map([
  [
    "docs/generated/corpus-targets.json",
    JSON.stringify(targets, null, 2) + "\n",
  ],
  ["docs/generated/coverage.json", JSON.stringify(report, null, 2) + "\n"],
  ["docs/generated/coverage.md", md],
  [
    "docs/generated/requirements.json",
    JSON.stringify(inventory, null, 2) + "\n",
  ],
  ["docs/generated/requirements.md", reqMd],
  [
    "docs/generated/completion-state.json",
    JSON.stringify(
      {
        formatVersion: 1,
        declarationAllowed: false,
        currentFocus: "Phase 18 — Original language / translation alignment",
        continuation:
          "Run npm run audit:check, read the authoritative requirement matrix, finish the current focus acceptance criteria, then proceed in roadmap order. Never infer completion from route or schema presence.",
        phases: [
          { id: "0", status: "implemented-not-finally-certified" },
          { id: "1", status: "partially-implemented" },
          { id: "2", status: "partially-implemented" },
          { id: "3", status: "partially-implemented" },
          { id: "4", status: "partially-implemented" },
          { id: "5", status: "acceptance-implemented-not-finally-certified" },
          { id: "6", status: "acceptance-implemented-not-finally-certified" },
          { id: "7", status: "acceptance-implemented-not-finally-certified" },
          { id: "8", status: "acceptance-implemented-not-finally-certified" },
          { id: "9", status: "acceptance-implemented-not-finally-certified" },
          { id: "10", status: "acceptance-implemented-not-finally-certified" },
          { id: "11", status: "acceptance-implemented-not-finally-certified" },
          { id: "12", status: "acceptance-implemented-not-finally-certified" },
          { id: "13", status: "acceptance-implemented-not-finally-certified" },
          { id: "14", status: "acceptance-implemented-not-finally-certified" },
          { id: "15", status: "acceptance-implemented-not-finally-certified" },
          { id: "16", status: "acceptance-implemented-not-finally-certified" },
          { id: "17", status: "acceptance-implemented-not-finally-certified" },
          ...Array.from({ length: 12 }, (_, index) => ({
            id: String(index + 18),
            status: "not-started",
          })),
        ],
        requirementCounts: {
          total: inventory.requirements.length,
          certifiedComplete: inventory.requirements.filter(
            (item) => item.complete,
          ).length,
          incomplete: inventory.requirements.filter((item) => !item.complete)
            .length,
        },
      },
      null,
      2,
    ) + "\n",
  ],
]);
if (!args.has("--check")) mkdirSync("docs/generated", { recursive: true });
for (const [file, content] of outputs) {
  if (args.has("--check")) {
    if (!existsSync(file) || read(file) !== content)
      throw new Error(
        `Stale or missing ${file}; regenerate with npm run audit:coverage`,
      );
  } else writeFileSync(file, content, "utf8");
}
console.log(
  `${args.has("--check") ? "Verified" : "Wrote"} ${outputs.size} deterministic reports; ${metrics.length} metrics, ${inventory.requirements.length} audit sections and ${inventory.quality.length} quality rules. Deployment counts remain unknown.`,
);
