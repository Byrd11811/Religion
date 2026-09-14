import { createHash } from "node:crypto";
import type { TextRecord } from "../shared/types";

export function corpusTargets(
  product: string,
  expansion: string,
  works: TextRecord[],
) {
  const slug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const list = product
    .split("# 9. INITIAL 100+ TEXT TARGET LIST")[1]
    ?.split("# 10. DATA MODEL")[0];
  if (!list) throw new Error("Original title inventory missing");
  const byId = new Map(works.map((w) => [w.id, w]));
  const groups = [
    "6",
    "5",
    "9A/10",
    "9A/10",
    "9A",
    "9A",
    "9A",
    "9A",
    "9A",
    "9A",
    "7",
    "9A",
    "9A",
    "9A",
    "9A",
    "9A",
    "9",
    "9",
    "9",
    "9",
    "9",
    "12",
    "12",
    "12/13",
    "9A",
    "13",
  ];
  let owner = "9A";
  let community = "";
  const original = [];
  for (const line of list.split(/\r?\n/)) {
    const group = line.match(/^## ([A-Z])\. (.+)/);
    if (group) {
      owner = groups[group[1].charCodeAt(0) - 65];
      community = group[2];
    }
    const title = line.match(/^(\d+)\. (.+)/);
    if (!title) continue;
    const id = slug(title[2]);
    const record = byId.get(id);
    original.push({
      id: `ORIGINAL-${title[1]}`,
      title: title[2],
      community,
      owner,
      workId: record?.id ?? null,
      targetId: id,
      source: "docs/product-spec.md, section 9",
      status: record ? "catalog-present-depth-unverified" : "intake-target",
      complete: false,
    });
  }
  // Preserve every expansion section and its explicit bullets, including collections
  // not yet represented by a work. These are requirements, not invented corpus rows.
  const expansionTargets = [
    ...expansion.matchAll(/^# ([^\r\n]+)\r?\n([\s\S]*?)(?=^# |$(?![\s\S]))/gm),
  ].map((m) => {
    const title = m[1];
    const owners: [RegExp, string][] = [
      [/EGYPT/, "5"],
      [/MESOPOTAMIA|ANUNNAKI/, "6"],
      [/CHINA/, "7"],
      [/ETHIOPI|ERITRE|HORN/, "8"],
      [
        /AFRICAN|MESOAMERICA|SOUTH AMERICA|NORTH AMERICAN|OCEANIA|CIRCUMPOLAR/,
        "9",
      ],
      [/SOUTH AND SOUTHEAST|JAPAN AND KOREA/, "9A"],
      [/MANUSCRIPT|CODEX GIGAS/, "10"],
      [/UNDECIPHER/, "11"],
      [/GRIMOIRE|LITERATURE/, "12"],
      [/SCIENTOLOGY|MODERN RELIGION/, "13"],
      [/FORBIDDEN|LOST TEXT|HYPOTHETICAL|DISPUTED|CONTROVERSIAL/, "14"],
      [/IMAGES/, "19"],
      [/COMPARISON|QUESTION|OPPOSITION/, "16"],
      [/GRAPH/, "17"],
      [/ALIAS/, "15"],
      [/COPYRIGHT|CULTURAL|SECURITY|EVIDENCE|SOURCE|DATA-MODEL/, "2/3/4/27"],
    ];
    return {
      id: `EXPANSION-${slug(title)}`,
      title,
      owner:
        owners.find(([pattern]) => pattern.test(title))?.[1] ??
        "0/22/final-gate",
      source: `docs/expansion-spec.md:${expansion.slice(0, m.index).split("\n").length}`,
      acceptanceSha256: createHash("sha256")
        .update(m[0].replace(/\r\n/g, "\n").trim())
        .digest("hex"),
      explicitTargets: [...m[2].matchAll(/^\* (.+)$/gm)].map((b) =>
        b[1].trim(),
      ),
      status: "requirement-inventory-not-reviewed-corpus",
      complete: false,
    };
  });
  return { original, expansion: expansionTargets };
}

export function sections(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  return [
    ...normalized.matchAll(
      /^# (\d+)\. (.+)\n([\s\S]*?)(?=^# \d+\. |$(?![\s\S]))/gm,
    ),
  ].map((m) => ({
    number: Number(m[1]),
    title: m[2],
    body: m[3].trim(),
    line: normalized.slice(0, m.index).split("\n").length,
    sha256: createHash("sha256").update(m[0].trim()).digest("hex"),
  }));
}

export function phaseOwners(n: number): string[] {
  if (n === 110)
    return ["0", "2", "5–9A", "12", "15", "20", "22", "27", "Final gate"];
  if (n === 111)
    return ["0", "2", "3", "4", "15", "17", "18", "20", "26", "27"];
  if (n === 112)
    return ["0", "1", "2", "15", "19", "20", "22", "27", "Final gate"];
  if (n === 113)
    return ["0", "20", "22", "25", "27", "Reserved Contested History"];
  if ((n >= 73 && n <= 85) || n === 108)
    return [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5–9A",
      "15",
      "16",
      "20",
      "25",
      "27",
      "Track A",
    ];
  if (n >= 86 && n <= 88)
    return ["2", "12", "15", "18", "20", "24", "27", "Track B"];
  if (n >= 89 && n <= 92)
    return ["2", "12", "15", "17", "20", "26", "27", "Track C"];
  if (n >= 93 && n <= 99) return ["2", "15", "19", "20", "24", "27", "Track D"];
  if (n === 104) return ["2", "4", "25", "26", "27", "Track E"];
  if (
    [0, 1, 2, 38, 39, 41, 42, 43, 65, 72, 101, 105, 106, 107, 109].includes(n)
  )
    return ["0", "22", "27", "Final gate"];
  if ([40, 100].includes(n))
    return ["Core boundary", "Deferred Contested History"];
  const groups: [number[], string[]][] = [
    [
      [3, 4, 71],
      ["1", "4", "20"],
    ],
    [[5], ["2"]],
    [[6, 66], ["5–9A"]],
    [[7], ["5"]],
    [[8, 9], ["6"]],
    [[10], ["7"]],
    [[11], ["8"]],
    [[12], ["9"]],
    [[13], ["10"]],
    [[14], ["11"]],
    [[15], ["10", "12"]],
    [[16], ["12"]],
    [[17], ["13"]],
    [[18], ["14"]],
    [
      [19, 29, 30],
      ["4", "15"],
    ],
    [
      [20, 21, 22, 68, 69, 70, 102, 103],
      ["3", "4", "16", "27"],
    ],
    [[23, 24], ["18"]],
    [
      [25, 26, 31, 35, 47],
      ["2", "20"],
    ],
    [
      [27, 28],
      ["16", "17"],
    ],
    [
      [32, 61],
      ["3", "20"],
    ],
    [[33], ["3"]],
    [[34], ["4"]],
    [[36], ["19"]],
    [
      [37, 45, 55, 63],
      ["21", "28"],
    ],
    [[44, 48], ["23"]],
    [[46], ["25"]],
    [[49, 50, 51, 52, 53, 54], ["24"]],
    [[56], ["26"]],
    [[57, 58, 59], ["27"]],
    [
      [60, 67],
      ["2", "4", "5–9A", "26"],
    ],
    [[62], ["16", "27"]],
    [[64], ["Tracks A–D", "Other items deferred"]],
  ];
  const match = groups.find(([ids]) => ids.includes(n));
  if (!match) throw new Error(`Audit section ${n} has no execution owner`);
  return match[1];
}

export function numberedRules(
  markdown: string,
  heading: string,
  expected: number,
) {
  const start = markdown.indexOf(heading);
  if (start < 0) throw new Error(`Missing requirement heading: ${heading}`);
  const body = markdown.slice(start + heading.length).split(/\n# /)[0];
  const rules = [...body.matchAll(/^(\d+)\. (.+)$/gm)].map((m) => ({
    number: Number(m[1]),
    text: m[2].trim(),
  }));
  if (rules.length !== expected || rules.some((r, i) => r.number !== i + 1))
    throw new Error(`Invalid rule inventory: ${heading}`);
  return rules;
}

export function requirementInventory(
  audit: string,
  expansion: string,
  roadmap: string,
) {
  const inventory = sections(audit);
  if (inventory.length !== 114 || inventory.some((s, i) => s.number !== i))
    throw new Error(
      "Audit section inventory changed: reconcile owners and acceptance mapping",
    );
  const requirements = inventory.map((s) => ({
    id: `AUDIT-${String(s.number).padStart(3, "0")}`,
    title: s.title,
    source: `docs/atlas-completion-gap-audit.md:${s.line}`,
    acceptanceSha256: s.sha256,
    acceptance:
      "Full source section applies, including linked original requirements; section existence is not fulfillment.",
    owners: phaseOwners(s.number),
    status:
      s.number === 40
        ? "deferred"
        : s.number === 43
          ? "baseline-record"
          : "incomplete",
    seeded: "See coverage metrics; requirement-level depth not certified",
    persisted: "Unknown: deployment database not inspected",
    exposed: "Not certified by this instrumentation run",
    tested: "Not certified; existing workflow tests are not completion tests",
    complete: false,
    remaining:
      "Meet the source section's real-data/functionality criteria and attach test evidence before closing.",
  }));
  const quality = [
    ...numberedRules(expansion, "# QUALITY TESTS", 23).map((r) => ({
      id: `EXP-${String(r.number).padStart(2, "0")}`,
      requirement: r.text,
      source: "docs/expansion-spec.md#quality-tests",
      owner: "Relevant data/feature phase; 22/27 consolidation",
    })),
    ...numberedRules(
      roadmap,
      "# 38. ADDITIONAL REQUIRED QUALITY / REGRESSION GATES",
      35,
    ).map((r) => ({
      id: `HIST-${String(r.number).padStart(2, "0")}`,
      requirement: r.text,
      source:
        "docs/atlas-completion-roadmap.md#38-additional-required-quality--regression-gates",
      owner: "Tracks A–E; 22/27 consolidation",
    })),
  ].map((r) => ({
    ...r,
    status: "unverified",
    complete: false,
    evidence: [],
    remaining:
      "Attach meaningful integration/UI evidence; helper tests alone do not certify this rule.",
  }));
  return { requirements, quality };
}
