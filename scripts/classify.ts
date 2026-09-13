import { readFileSync, writeFileSync } from "node:fs";
import { detectConcepts } from "../packages/ontology";
import type { Passage } from "../packages/shared/types";
const file = "data/seed/passages.json";
const passages = JSON.parse(readFileSync(file, "utf8")) as Passage[];
writeFileSync(
  file,
  JSON.stringify(
    passages.map((p) => ({ ...p, themes: detectConcepts(p.content) })),
  ),
);
console.log(
  `Classified ${passages.length} segments with the explicit English keyword taxonomy. Tags are exploratory, not scholarly assertions.`,
);
