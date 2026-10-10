import type { SearchOptions } from "@/packages/search";
import { hybridSearch } from "@/packages/search/hybrid";
import { detectConcepts } from "@/packages/ontology";
import { guideFor, evidence } from "./guides";
import type { QueryAnswer } from "@/packages/shared/types";
import {
  unresolvedCorpusForQuestion,
} from "@/packages/shared/undeciphered";
export function neutral(text: string) {
  return !/most true religion|inferior religion|primitive belief|obviously false|copied directly|religion is irrational/i.test(
    text,
  );
}
/**
 * Compatibility response for the original JSON question endpoint.
 *
 * Model output cannot be represented with this legacy aggregate shape without
 * discarding Phase 16's per-claim and per-citation audit record. Keep this path
 * evidence-only; callers that need synthesis use the structured stream.
 */
export async function answerEvidenceOnlyQuestion(
  question: string,
  filters: SearchOptions = {},
): Promise<QueryAnswer> {
  const unresolved = unresolvedCorpusForQuestion(question);
  if (unresolved) {
    const inScope = !(
      filters.textIds?.length ||
      filters.editionIds?.length ||
      filters.traditions?.length ||
      filters.contentTypes?.length ||
      filters.before !== undefined ||
      filters.after !== undefined ||
      (filters.region && filters.region !== unresolved.region)
    );
    if (!inScope)
      return {
        question,
        mode: "Unresolved-corpus evidence safeguard",
        summary:
          "The named unresolved-corpus record is outside the active source scope. Atlas returned no corpus metadata, hypotheses, source links, or generated reading.",
        agreements: [],
        disagreements: [],
        distinctive: [],
        history: "No in-scope historical evidence was returned.",
        influence: "No in-scope influence evidence was returned.",
        independent: "No in-scope development claim was returned.",
        alternatives: "No in-scope interpretive claim was returned.",
        uncertainty: [
          "No generated reading is available outside the selected source scope.",
        ],
        passages: [],
      };
    return {
      question,
      mode: "Unresolved-corpus evidence safeguard",
      summary: `Atlas cannot translate ${unresolved.title}: no inspectable canonical source span is available for this request, so no generated reading or evidence-verification claim is produced.`,
      agreements: [],
      disagreements: [],
      distinctive: [],
      history: "No cited historical evidence was returned.",
      influence:
        "No cited influence evidence was returned.",
      independent:
        "No cited independent-development evidence was returned.",
      alternatives: "No cited interpretive hypothesis was returned.",
      uncertainty: [
        "No additional claims are returned without inspectable canonical evidence.",
      ],
      passages: [],
    };
  }
  const passages = await hybridSearch(question, {
    ...filters,
    diverse: true,
    limit: 12,
    preferPrimary: true,
  });
  const themes = detectConcepts(question);
  const guide = guideFor(question, filters);
  if (guide) {
    for (const id of guide.perspectives.flatMap((p) => p.passageIds)) {
      if (!passages.some((p) => p.id === id)) passages.push(evidence(id));
    }
  }
  const count = new Set(passages.map((p) => p.tradition)).size;
  const answer: QueryAnswer = {
    question,
    guide,
    mode: "Local evidence explorer",
    summary: passages.length
      ? `Found ${passages.length} relevant edition segments across ${count} catalog groupings${themes.length ? ` for ${themes.join(", ")}` : ""}. These are retrieval results, not a consensus statement. Open each passage to examine its argument and edition context.`
      : "No matching passages were found in the bundled editions. Try a narrower concept or another term; absence from this corpus is not absence from a tradition.",
    agreements: [
      "Shared vocabulary can suggest a useful comparison; it does not establish doctrinal agreement.",
    ],
    disagreements: [
      "Read the passages side by side to distinguish differences in terminology, genre and argument. No contradiction is asserted from keyword matches alone.",
    ],
    distinctive: passages.map(
      (p) => `${p.textTitle} · ${p.translator} · ${p.reference}`,
    ),
    history:
      "Composition ranges on text profiles are provisional editorial estimates. Manuscript chronology and textual development need separately reviewed historical sources.",
    influence:
      "Search relevance is not historical influence. Consult the evidence-labeled relationships in the influence graph.",
    independent:
      "Independent development remains a possibility. Thematic overlap alone cannot choose between independence and transmission.",
    alternatives:
      "Use Show the Opposition to retrieve philosophical, skeptical and adversarial texts. These categories are distinct and do not represent one shared position.",
    uncertainty: [
      "The bundled corpus is selective and uneven across cultures.",
      "Bundled editions may contain translations, transliterations, introductions, notes, or scholarly commentary; inspect each source label.",
      "Local retrieval combines lexical relevance and theme expansion; it is not a generated cross-tradition interpretation.",
    ],
    passages,
  };
  return answer;
}

/** @deprecated Use the structured question pipeline for generated synthesis. */
export const answerQuestion = answerEvidenceOnlyQuestion;
