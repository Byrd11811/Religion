import { readFileSync, writeFileSync } from "node:fs";
import { detectConcepts } from "../packages/ontology";
import type { Passage } from "../packages/shared/types";
const file = "data/seed/passages.json";
const passages = JSON.parse(readFileSync(file, "utf8")) as Passage[];
function contentType(p: Passage): Passage["contentType"] {
  // The KJV records are extracted from exact named-book boundaries; their
  // verse segments and retained book headings belong to that primary edition.
  if (p.editionId.startsWith("pg-10-")) return "Primary text";
  // These two bundled sources are historical scholarly studies containing
  // quotations, not continuous primary-text translations.
  if (
    ["pg-11000-epic-of-gilgamesh", "pg-7145-book-of-the-dead"].includes(
      p.editionId,
    )
  )
    return "Scholarly commentary";
  // Mixed historical editions require segment-level review before a stronger
  // label is safe. Unknown is deliberate and remains visible in retrieval.
  return "Unknown";
}
writeFileSync(
  file,
  JSON.stringify(
    passages.map((p) => ({
      ...p,
      themes: detectConcepts(p.content),
      contentType: contentType(p),
    })),
  ),
);
console.log(
  `Classified ${passages.length} segments by theme and conservative source type. Unknown remains explicit pending segment review.`,
);
