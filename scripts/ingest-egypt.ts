import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { detectConcepts } from "../packages/ontology";
import type { Edition, Passage } from "../packages/shared/types";

type Selection = {
  workId: string;
  title: string;
  sourceId: number;
  translator: string;
  startHeading: string;
  startOccurrence?: number;
  endHeading: string;
  endOccurrence?: number;
  complete: boolean;
  contentType?: Passage["contentType"];
  note: string;
};

const selections: Selection[] = [
  {
    workId: "taking-of-joppa",
    title: "The Taking of Joppa",
    sourceId: 7413,
    translator:
      "W. M. Flinders Petrie (editor and restorer; translator not stated)",
    startHeading: "THE TAKING OF JOPPA",
    startOccurrence: 1,
    endHeading: "REMARKS",
    endOccurrence: 4,
    complete: false,
    contentType: "Unknown",
    note: "Historical translation of an incomplete tale. Petrie states that he reconstructed the lost opening, so Atlas preserves the bounded edition but does not classify its segments as primary text.",
  },
  {
    workId: "doomed-prince",
    title: "The Doomed Prince",
    sourceId: 7413,
    translator:
      "Gaston Maspero; adapted by W. M. Flinders Petrie with F. Ll. Griffith",
    startHeading: "THE DOOMED PRINCE",
    startOccurrence: 1,
    endHeading: "REMARKS",
    endOccurrence: 5,
    complete: false,
    note: "Translation of the surviving incomplete tale; Atlas excludes the translator's subsequent Remarks section and retains the source's explicit break marker.",
  },
  {
    workId: "tale-of-two-brothers",
    title: "The Tale of Two Brothers",
    sourceId: 7413,
    translator: "F. Ll. Griffith; edited by W. M. Flinders Petrie",
    startHeading: "ANPU AND BATA.",
    endHeading: "REMARKS",
    endOccurrence: 6,
    complete: true,
    note: "Complete translated tale as presented under the names Anpu and Bata in Petrie's public-domain anthology; Atlas excludes the translator's subsequent Remarks section.",
  },
  {
    workId: "setna-i-magic-book",
    title: "Setna I: Setna and the Magic Book",
    sourceId: 7413,
    translator:
      "W. M. Flinders Petrie, following J. J. Hess and Gaston Maspero",
    startHeading: "SETNA AND THE MAGIC BOOK",
    startOccurrence: 1,
    endHeading: "REMARKS",
    endOccurrence: 7,
    complete: false,
    note: "Historical edition of an incomplete tale. Petrie states that he restored the lost opening and inserted a later plot summary; Atlas keeps those mixed segments Unknown and classifies only the remaining translated segments as primary text.",
  },
  {
    workId: "westcar-papyrus-tales",
    title: "Westcar Papyrus Tales",
    sourceId: 7386,
    translator: "W. M. Flinders Petrie",
    startHeading: "KHAFRA'S TALE",
    endHeading: "Remarks",
    endOccurrence: 0,
    complete: false,
    note: "Surviving translated portion from Petrie's public-domain anthology. The source states that the beginning and end are lost; Atlas excludes the translator's subsequent Remarks section.",
  },
  {
    workId: "eloquent-peasant",
    title: "The Eloquent Peasant",
    sourceId: 7386,
    translator: "W. M. Flinders Petrie",
    startHeading: "THE PEASANT AND THE WORKMAN",
    endHeading: "Remarks",
    endOccurrence: 1,
    complete: false,
    note: "Translated surviving tale from Petrie's public-domain anthology. The source describes incomplete witnesses; Atlas excludes the translator's subsequent Remarks section.",
  },
  {
    workId: "shipwrecked-sailor",
    title: "The Shipwrecked Sailor",
    sourceId: 7386,
    translator: "W. M. Flinders Petrie",
    startHeading: "THE SHIPWRECKED SAILOR",
    endHeading: "Remarks",
    endOccurrence: 2,
    complete: true,
    note: "Complete translated tale as presented in Petrie's public-domain anthology; Atlas excludes the translator's subsequent Remarks section.",
  },
  {
    workId: "tale-of-sinuhe",
    title: "Tale of Sinuhe",
    sourceId: 7386,
    translator: "W. M. Flinders Petrie",
    startHeading: "THE ADVENTURES OF SANEHAT",
    endHeading: "Remarks",
    endOccurrence: 3,
    complete: true,
    note: "Complete translated narrative as presented under the historical title Adventures of Sanehat in Petrie's public-domain anthology; Atlas excludes the translator's subsequent Remarks section.",
  },
  {
    workId: "instruction-of-ptahhotep",
    title: "Instruction of Ptahhotep",
    sourceId: 30508,
    translator: "Battiscombe G. Gunn",
    startHeading: "THE INSTRUCTION OF PTAH-HOTEP",
    endHeading: "[1] The King.",
    complete: true,
    note: "Named translation from Gunn's public-domain edition. Atlas excludes the introduction and translator footnotes from the primary-text selection.",
  },
  {
    workId: "instruction-of-kagemni",
    title: "Instruction of Ke’Gemni",
    sourceId: 30508,
    translator: "Battiscombe G. Gunn",
    startHeading: "THE INSTRUCTION OF KE'GEMNI",
    endHeading: "[1] The original is not divided into sections.",
    complete: true,
    note: "Named translation from Gunn's public-domain edition. Atlas excludes the introduction, appendix and translator footnotes from the primary-text selection.",
  },
];

function sourceBody(sourceId: number) {
  const raw = readFileSync(
    `data/public-domain/${sourceId}.txt`,
    "utf8",
  ).replace(/\r\n|\r/g, "\n");
  const start = raw.match(
    /\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i,
  );
  const end = raw.search(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
  if (!start || end < 0)
    throw new Error(`Missing source boundary: ${sourceId}`);
  return { raw, body: raw.slice(start.index! + start[0].length, end) };
}

function headingIndex(body: string, heading: string, occurrence?: number) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [
    ...body.matchAll(new RegExp(`^[ \\t]*${escaped}[ \\t]*$`, "gm")),
  ];
  const match = occurrence === undefined ? matches.at(-1) : matches[occurrence];
  if (!match)
    throw new Error(`Missing heading ${heading} occurrence ${occurrence}`);
  return match.index;
}

function chunks(content: string) {
  const result: string[] = [];
  let buffer = "";
  for (const block of content.trim().split(/\n\s*\n/)) {
    if (buffer && buffer.length + block.length > 1600) {
      result.push(buffer.trim());
      buffer = "";
    }
    buffer += `${block}\n\n`;
  }
  if (buffer.trim()) result.push(buffer.trim());
  return result;
}

function selectedContentType(
  selection: Selection,
  index: number,
  content: string,
): Passage["contentType"] {
  if (selection.contentType) return selection.contentType;
  if (
    selection.workId === "doomed-prince" &&
    content.includes("[Here the papyrus breaks off.]")
  )
    return "Unknown";
  if (
    selection.workId === "setna-i-magic-book" &&
    (index < 2 || content.includes("[Here follows a story"))
  )
    return "Unknown";
  return "Primary text";
}

const editions: Edition[] = [];
const passages: Passage[] = [];
for (const selection of selections) {
  const { raw, body } = sourceBody(selection.sourceId);
  const start = headingIndex(body, selection.startHeading);
  const end = headingIndex(body, selection.endHeading, selection.endOccurrence);
  if (end <= start)
    throw new Error(`Invalid selection order: ${selection.title}`);
  const selected = body.slice(start, end).trim();
  if (selected.length < 500)
    throw new Error(`Selection unexpectedly short: ${selection.title}`);
  const editionId = `pg-${selection.sourceId}-${selection.workId}`;
  const selectedChunks = chunks(selected);
  selectedChunks.forEach((content, index) => {
    passages.push({
      id: `${editionId}-${index + 1}`,
      textId: selection.workId,
      editionId,
      sequence: index + 1,
      reference: `Edition segment ${index + 1}`,
      content,
      sourceUrl: `https://www.gutenberg.org/ebooks/${selection.sourceId}`,
      themes: detectConcepts(content),
      contentType: selectedContentType(selection, index, content),
    });
  });
  editions.push({
    id: editionId,
    textId: selection.workId,
    title: `${selection.title} · ${selection.translator}`,
    translator: selection.translator,
    sourceUrl: `https://www.gutenberg.org/ebooks/${selection.sourceId}`,
    downloadUrl: `https://www.gutenberg.org/cache/epub/${selection.sourceId}/pg${selection.sourceId}.txt`,
    license:
      "Public domain in the USA. Project Gutenberg license retained in source file; jurisdictional restrictions may differ.",
    language: "English",
    sha256: createHash("sha256").update(raw).digest("hex"),
    passageCount: selectedChunks.length,
    complete: selection.complete,
    sourceFile: `${selection.sourceId}.txt`,
    sourceSections: [
      {
        startHeading: selection.startHeading,
        startOccurrence: selection.startOccurrence,
        endHeading: selection.endHeading,
        endOccurrence: selection.endOccurrence,
      },
    ],
    note:
      selection.sourceId === 7413
        ? `${selection.note} Project Gutenberg flags the retained HTML digitization as an early, unsatisfactory edition that needs further work.`
        : selection.note,
  });
}

writeFileSync(
  "data/seed/egypt-editions.json",
  JSON.stringify(editions, null, 2),
);
writeFileSync("data/seed/egypt-passages.json", JSON.stringify(passages));
console.log(
  `Wrote ${editions.length} bounded Egyptian editions and ${passages.length} edition segments.`,
);
