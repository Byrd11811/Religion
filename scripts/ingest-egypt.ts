import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { detectConcepts } from "../packages/ontology";
import type { Edition, Passage } from "../packages/shared/types";

type SourceSection = {
  startHeading: string;
  startOccurrence?: number;
  endHeading: string;
  endOccurrence?: number;
};

type Selection = {
  workId: string;
  title: string;
  sourceId: number;
  translator: string;
  startHeading?: string;
  startOccurrence?: number;
  endHeading?: string;
  endOccurrence?: number;
  sections?: SourceSection[];
  complete: boolean;
  contentType?: Passage["contentType"];
  classifyBlocks?: boolean;
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
  {
    workId: "book-of-knowing-evolutions-ra",
    title: "Book of Knowing the Evolutions of Ra",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    sections: [
      {
        startHeading: "THE HISTORY OF CREATION--A.",
        endHeading: "THE HISTORY OF CREATION--B.",
      },
      {
        startHeading: "THE HISTORY OF CREATION--B.",
        endHeading: "THE LEGEND OF THE DESTRUCTION OF MANKIND.",
        endOccurrence: 1,
      },
    ],
    complete: true,
    classifyBlocks: true,
    note: "Two source recensions printed by Budge from the Book of Overthrowing Apep in Papyrus Bremner-Rhind. Atlas keeps both recensions in one edition, separates translator footnotes, and does not collapse their differences.",
  },
  {
    workId: "book-of-heavenly-cow",
    title: "Book of the Heavenly Cow / Destruction of Mankind",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "THE LEGEND OF THE DESTRUCTION OF MANKIND.",
    startOccurrence: 1,
    endHeading: "THE LEGEND OF RA AND ISIS.",
    endOccurrence: 1,
    complete: true,
    classifyBlocks: true,
    note: "Bounded five-chapter historical translation conventionally associated with the Book of the Heavenly Cow. Repeated source headers remain Unknown and translator footnotes are separately classified.",
  },
  {
    workId: "legend-of-ra-and-isis",
    title: "The Legend of Ra and Isis",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "THE LEGEND OF RA AND ISIS.",
    startOccurrence: 1,
    endHeading: "THE LEGEND OF HORUS OF BEHUTET AND THE WINGED DISK.",
    complete: true,
    classifyBlocks: true,
    note: "Bounded historical translation of the composition about Isis, Ra, and the hidden divine name. Translator footnotes are separately classified.",
  },
  {
    workId: "horus-of-behutet-winged-disk",
    title: "Horus of Behutet and the Winged Disk",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "THE LEGEND OF HORUS OF BEHUTET AND THE WINGED DISK.",
    endHeading: "A HYMN TO OSIRIS AND A LEGEND OF THE ORIGIN OF HORUS.",
    complete: true,
    classifyBlocks: true,
    note: "Bounded historical translation of the Edfu temple legend. Translator footnotes are separately classified, and omitted source images remain visible as the Project Gutenberg #### marker.",
  },
  {
    workId: "great-hymn-to-osiris",
    title: "Great Hymn to Osiris and the Origin of Horus",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "A HYMN TO OSIRIS AND A LEGEND OF THE ORIGIN OF HORUS.",
    endHeading: "A LEGEND OF PTAH NEFER-HETEP AND THE PRINCESS OF BEKHTEN.",
    complete: true,
    classifyBlocks: true,
    note: "Bounded historical translation of the Osiris hymn and its account of Horus's origin. Translator footnotes are separately classified.",
  },
  {
    workId: "bentresh-stela",
    title: "Bentresh Stela",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "A LEGEND OF PTAH NEFER-HETEP AND THE PRINCESS OF BEKHTEN.",
    endHeading: "A LEGEND OF THE GOD KHNEMU AND OF A SEVEN YEARS' FAMINE.",
    complete: true,
    classifyBlocks: true,
    note: "Bounded historical translation of the Bentresh Stela narrative. The narrated reign and the later physical inscription are not treated as the same date; translator footnotes are separately classified.",
  },
  {
    workId: "famine-stela",
    title: "Famine Stela",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading: "A LEGEND OF THE GOD KHNEMU AND OF A SEVEN YEARS' FAMINE.",
    endHeading:
      "THE LEGEND OF THE DEATH OF HORUS THROUGH THE STING OF A SCORPION AND OF",
    complete: true,
    classifyBlocks: true,
    note: "Bounded historical translation of the Sehel inscription. Atlas distinguishes its later inscriptional setting from the earlier reign in which its story is set and separates translator footnotes.",
  },
  {
    workId: "metternich-stela-magical-texts",
    title: "Metternich Stela Magical Texts",
    sourceId: 9411,
    translator: "E. A. Wallis Budge (editor and translator)",
    startHeading:
      "I.--INCANTATIONS AGAINST REPTILES AND NOXIOUS CREATURES IN GENERAL.",
    endHeading: "THE HISTORY OF ISIS AND OSIRIS,",
    complete: true,
    classifyBlocks: true,
    note: "Bounded composite magical corpus including anti-reptile incantations, the Narrative of Isis, and the source-numbered Hymn of Praise to Horus. Atlas preserves the composite witness context, keeps headings Unknown, classifies translator footnotes separately, and excludes Plutarch's later account.",
  },
  {
    workId: "hymn-to-amun-ra-cairo-papyrus",
    title: "Hymn to Amen-Ra",
    sourceId: 15932,
    translator: "E. A. Wallis Budge (translator and compiler)",
    startHeading:
      "I. A Hymn to Amen-Ra,* the Bull, dweller in Anu, chief of all the gods,*",
    endHeading:
      "The following extract is taken from a work in which the power and glory",
    complete: true,
    classifyBlocks: true,
    note: "Bounded twenty-four-part Hymn to Amen-Ra from a Cairo papyrus as presented in Budge's public-domain anthology. The anthology introduction is excluded, source footnotes are separately classified, and the following Leyden extract is not included.",
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

function blockChunks(content: string) {
  const typed: { content: string; contentType: Passage["contentType"] }[] = [];
  const append = (content: string, contentType: Passage["contentType"]) => {
    const current = typed.at(-1);
    if (
      current &&
      current.contentType === contentType &&
      current.content.length + content.length + 2 <= 1600
    ) {
      current.content += `\n\n${content}`;
    } else {
      typed.push({ content, contentType });
    }
  };
  for (const rawBlock of content.trim().split(/\n\s*\n/)) {
    const block = rawBlock.trim();
    if (!block) continue;
    const contentType: Passage["contentType"] =
      /^(?:\[FN#\d+\]|\[Footnote \d+:)/.test(block)
      ? "Footnote"
      : block === block.toUpperCase() && /[A-Z]/.test(block)
        ? "Unknown"
        : "Primary text";
    let part = "";
    for (const line of block.split("\n")) {
      if (part && part.length + line.length + 1 > 1600) {
        append(part, contentType);
        part = "";
      }
      part += `${part ? "\n" : ""}${line}`;
    }
    if (part) append(part, contentType);
  }
  return typed;
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
  const sourceSections: SourceSection[] = selection.sections ?? [
    {
      startHeading: selection.startHeading!,
      startOccurrence: selection.startOccurrence,
      endHeading: selection.endHeading!,
      endOccurrence: selection.endOccurrence,
    },
  ];
  const selected = sourceSections
    .map((section) => {
      const start = headingIndex(
        body,
        section.startHeading,
        section.startOccurrence,
      );
      const end = headingIndex(
        body,
        section.endHeading,
        section.endOccurrence,
      );
      if (end <= start)
        throw new Error(`Invalid selection order: ${selection.title}`);
      return body.slice(start, end).trim();
    })
    .join("\n\n");
  if (selected.length < 500)
    throw new Error(`Selection unexpectedly short: ${selection.title}`);
  const editionId = `pg-${selection.sourceId}-${selection.workId}`;
  const selectedChunks = selection.classifyBlocks
    ? blockChunks(selected)
    : chunks(selected).map((content, index) => ({
        content,
        contentType: selectedContentType(selection, index, content),
      }));
  selectedChunks.forEach(({ content, contentType }, index) => {
    passages.push({
      id: `${editionId}-${index + 1}`,
      textId: selection.workId,
      editionId,
      sequence: index + 1,
      reference: `Edition segment ${index + 1}`,
      content,
      sourceUrl: `https://www.gutenberg.org/ebooks/${selection.sourceId}`,
      themes: detectConcepts(content),
      contentType,
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
    sourceSections,
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
