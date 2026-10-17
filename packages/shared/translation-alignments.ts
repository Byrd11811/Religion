import alignmentData from "@/data/seed/translation-alignments.json";
import { allPassages } from "@/packages/search";
import { editions } from "./catalog";
import { protocolDecision } from "./protocols";
import type { TranslationAlignment } from "./types";

export const translationAlignments = alignmentData as TranslationAlignment[];

export const priorityLanguageCoverage = [
  { language: "Hebrew", status: "unavailable", note: "No reviewed original-language edition is bundled." },
  { language: "Greek", status: "unavailable", note: "No reviewed original-language edition is bundled." },
  { language: "Arabic", status: "unavailable", note: "Two attributed English Qur’an editions are bundled, but no reviewed Arabic edition is available for alignment." },
  { language: "Sanskrit", status: "unavailable", note: "English translations are present for selected works; no reviewed Sanskrit edition is bundled." },
  { language: "Pali", status: "unavailable", note: "No reviewed Pali edition is bundled." },
  { language: "Chinese", status: "aligned", note: "Four shared-reference alignments use reviewed Project Gutenberg transcriptions and James Legge translations." },
  { language: "Egyptian transliteration", status: "unavailable", note: "Historical English Egyptological editions are present; no reviewed passage-level transliteration is bundled." },
  { language: "Sumerian/Akkadian transliteration", status: "source-only", note: "Twenty-six ORACC Sumerian composites are searchable, but Atlas does not invent unlicensed or unsourced translations to create pairs." },
] as const;

export function alignmentsForText(textId: string) {
  if (!protocolDecision(textId, "display").allowed) return [];
  return translationAlignments.filter((row) => row.textId === textId);
}

function compact(value: string) {
  return value.replace(/\s+/g, "").replace(/[﹔；]/g, ";").replace(/[「」]/g, "");
}

export function validateTranslationAlignments() {
  const passages = new Map(allPassages().map((passage) => [passage.id, passage]));
  const editionIds = new Set(editions.map((edition) => edition.id));
  const ids = new Set<string>();
  for (const row of translationAlignments) {
    if (ids.has(row.id)) throw new Error(`Duplicate alignment ${row.id}`);
    ids.add(row.id);
    if (!row.sharedReference.trim()) throw new Error(`Missing shared reference for ${row.id}`);
    const renderings = [row.original, row.transliteration, row.literalRendering, ...row.translations].filter(Boolean) as TranslationAlignment["translations"];
    if (!row.translations.length) throw new Error(`No attributed translation for ${row.id}`);
    for (const rendering of renderings) {
      if (!editionIds.has(rendering.source.editionId)) throw new Error(`Unknown edition in ${row.id}`);
      const passage = passages.get(rendering.source.passageId);
      if (!passage || passage.editionId !== rendering.source.editionId || passage.textId !== row.textId) throw new Error(`Invalid passage link in ${row.id}`);
      if (!compact(passage.content).includes(compact(rendering.text))) throw new Error(`Rendering is not present in cited passage for ${row.id}`);
      if (rendering.machineGenerated && !rendering.source.attribution.toLowerCase().includes("ai")) throw new Error(`Unlabeled AI rendering in ${row.id}`);
      if (!rendering.source.url.startsWith("https://")) throw new Error(`Unsafe source URL in ${row.id}`);
    }
  }
  return true;
}
