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
} from "../packages/shared/catalog";
import {
  witnesses,
  museumArtifacts,
  archiveImages,
} from "../packages/shared/archive";
import type { Passage } from "../packages/shared/types";
import { passageSeedFiles } from "../packages/shared/seed-files";
import { absentDatasets, measureCoverage } from "../packages/audit/coverage";
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
  "downloads.json",
  "editions.json",
  "egypt-additions.json",
  "egypt-editions.json",
  "egypt-passages.json",
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
  "passages.json",
  "regional-coverage.json",
  "relationships.json",
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
  "packages/shared/seed-files.ts",
  "packages/shared/types.ts",
  "packages/shared/protocols.ts",
  "packages/shared/taxonomy.ts",
  "packages/db/taxonomy.ts",
  "packages/db/research-queue.ts",
  "packages/db/schema.sql",
  "packages/db/client.ts",
  "packages/db/archive.ts",
  "packages/search/index.ts",
  "packages/search/hybrid.ts",
  "packages/search/federated.ts",
  "packages/ai/index.ts",
  "packages/citation/index.ts",
  "scripts/database.ts",
  "scripts/classify.ts",
  "scripts/download.py",
  "scripts/ingest-egypt.ts",
  "scripts/ingest-mesopotamia.py",
  "scripts/ingest-china.py",
  "scripts/ingest-horn.py",
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
  "components/Explore.tsx",
  "components/SpatialExplorer.tsx",
  "packages/shared/exploration.ts",
  "packages/shared/exploration-catalog.ts",
  "packages/shared/exploration-query.ts",
  "app/api/[...path]/route.ts",
  "packages/maps/provider.ts",
  "packages/maps/leaflet.ts",
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
const input = {
  texts,
  traditions,
  editions,
  relationships,
  witnesses,
  artifacts: museumArtifacts,
  images: archiveImages,
  passages: passageSeedFiles.flatMap(
    (filename) => parsedSeeds.get(filename) as Passage[],
  ),
  additionalCollections: Object.fromEntries(
    absentDatasets.map(([id]) => {
      const records: { id: string }[] = [];
      for (const filename of actualSeeds) {
        const data = parsedSeeds.get(filename);
        if (
          data &&
          typeof data === "object" &&
          !Array.isArray(data) &&
          id in data
        ) {
          const collection = (data as Record<string, unknown>)[id];
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
        currentFocus: "Phase 9 — Global Indigenous traditions",
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
          { id: "9", status: "in-progress" },
          ...Array.from({ length: 20 }, (_, index) => ({
            id: String(index + 10),
            status: "not-started",
          })),
        ],
        requirementCounts: {
          total: inventory.requirements.length,
          certifiedComplete: inventory.requirements.filter((item) => item.complete).length,
          incomplete: inventory.requirements.filter((item) => !item.complete).length,
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
