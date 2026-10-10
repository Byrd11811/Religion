import type { SearchOptions } from "@/packages/search";
import { hybridSearch } from "@/packages/search/hybrid";
import { unresolvedCorpusForQuestion } from "@/packages/shared/undeciphered";
import type {
  CanonicalResearchSource,
  QuestionEngineResult,
} from "@/packages/shared/research";
import {
  boundedCanonicalEvidence,
  canonicalSourcesFromPassages,
  evidenceOnlyAnswer,
} from "./claims";
import { deterministicNeutralityAudit } from "./neutrality";

export type PreparedResearchQuestion =
  | { kind: "research"; evidence: CanonicalResearchSource[] }
  | { kind: "unresolved-safeguard"; result: QuestionEngineResult };

/**
 * Unresolved-corpus records are archive metadata, not searchable edition
 * passages. A work, edition, tradition, content-type, or date filter therefore
 * excludes them. Region is the only field that can be checked directly.
 */
export function unresolvedCorpusMatchesSearchScope(
  corpus: { region: string },
  filters: SearchOptions,
) {
  if (
    filters.textIds?.length ||
    filters.editionIds?.length ||
    filters.traditions?.length ||
    filters.contentTypes?.length ||
    filters.before !== undefined ||
    filters.after !== undefined
  )
    return false;
  return !filters.region || filters.region === corpus.region;
}

function unresolvedResult(
  question: string,
  filters: SearchOptions,
): QuestionEngineResult | undefined {
  const corpus = unresolvedCorpusForQuestion(question);
  if (!corpus) return undefined;
  const inScope = unresolvedCorpusMatchesSearchScope(corpus, filters);
  const answer = evidenceOnlyAnswer(
    question,
    [],
    inScope
      ? "No canonical source span is available for this unresolved corpus. No generated reading, decipherment, historical detail, or interpretive claim has been produced."
      : "The requested unresolved-corpus record is outside the selected source scope. No corpus details, hypotheses, source links, or generated reading are returned.",
  );
  answer.shortAnswer[0] = {
    ...answer.shortAnswer[0],
    id: inScope
      ? "unresolved-retrieval-status"
      : "unresolved-out-of-scope-status",
    statement: inScope
      ? `Atlas has no inspectable canonical source span for ${corpus.title}; generated translation and decipherment are disabled.`
      : "Atlas detected an unresolved-corpus request outside the active source scope and returned no corpus metadata or interpretation.",
    reasoning:
      "This is a retrieval and safeguard status, not a claim about the corpus's meaning or history.",
  };
  const deterministicAudit = deterministicNeutralityAudit(answer);
  return {
    mode: "evidence-only",
    answer,
    attempts: 0,
    synthesisAudited: false,
    deterministicAudit,
    providerAudit: null,
    notices: inScope
      ? [
          "Unresolved-corpus safeguard: no canonical evidence span was emitted, so no evidence-verification or synthesis claim is made.",
        ]
      : [
          "Scope safeguard: unresolved-corpus metadata and interpretations were withheld because the record does not satisfy the active source filters.",
        ],
  };
}

export async function prepareResearchQuestion(
  question: string,
  filters: SearchOptions = {},
  signal?: AbortSignal,
): Promise<PreparedResearchQuestion> {
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("Operation aborted", "AbortError");
  const guarded = unresolvedResult(question, filters);
  if (guarded) return { kind: "unresolved-safeguard", result: guarded };
  const eligibleContentTypes = (
    filters.contentTypes ?? [
      "Primary text",
      "Translator note",
      "Editorial introduction",
      "Scholarly commentary",
      "Footnote",
      "Appendix",
    ]
  ).filter((contentType) => contentType !== "Unknown");
  if (!eligibleContentTypes.length) return { kind: "research", evidence: [] };
  const passages = await hybridSearch(question, {
    ...filters,
    contentTypes: eligibleContentTypes,
    diverse: true,
    limit: 18,
    preferPrimary: true,
  }, signal);
  // Search and AI permissions are separate controls. Keep search-visible but
  // AI-ineligible material out of both provider input and streamed excerpts.
  const evidence = boundedCanonicalEvidence(
    canonicalSourcesFromPassages(passages).filter(
      (source) => source.eligibleForAi,
    ),
    question,
  );
  return { kind: "research", evidence };
}
