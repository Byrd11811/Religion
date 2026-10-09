import data from "@/data/seed/undeciphered-corpora.json";

export const unresolvedStatuses = [
  "SCRIPT UNDECIPHERED",
  "SCRIPT PARTIALLY DECIPHERED",
  "SCRIPT DECIPHERED / LANGUAGE UNKNOWN",
  "LANGUAGE PARTIALLY UNDERSTOOD",
  "UNIQUE / TINY CORPUS",
  "UNKNOWN SCRIPT / POSSIBLE CIPHER",
  "DISPUTED WRITING SYSTEM",
  "CLAIMED DECIPHERMENT — UNVERIFIED",
  "MULTIPLE COMPETING DECIPHERMENTS",
  "PARTIALLY ACCEPTED DECIPHERMENT",
  "HOAX / PSEUDO-SCRIPT QUESTION",
] as const;

export type UnresolvedStatus = (typeof unresolvedStatuses)[number];
export type UndecipheredSource = {
  label: string;
  url: string;
  kind: string;
};
export type UnresolvedCorpus = {
  id: string;
  title: string;
  aliases: string[];
  region: string;
  period: string;
  corpusScale: string;
  artifact: string;
  discovery: string;
  status: UnresolvedStatus;
  scriptState: string;
  signValuesState: string;
  languageState: string;
  translationState: string;
  signInventory: string;
  probableLanguage: string;
  known: string;
  unknown: string;
  strongestHypothesis: string;
  strongestObjection: string;
  witnessIds: string[];
  sources: UndecipheredSource[];
};
export type DeciphermentHypothesis = {
  id: string;
  corpusId: string;
  proponent: string;
  publication: string;
  year: number | null;
  proposedLanguage: string;
  proposedSignValues: string;
  method: string;
  bilingualAnchor: string;
  claimedReadings: string;
  peerReviewStatus: string;
  independentReplication: string;
  supportingScholarship: string[];
  criticism: string;
  reception: string;
  confidence: string;
  status: string;
};

export const undecipheredPolicy = data.policy;
export const unresolvedCorpora = data.corpora as UnresolvedCorpus[];
export const deciphermentHypotheses =
  data.hypotheses as DeciphermentHypothesis[];

const normalizedTerms = unresolvedCorpora.flatMap((corpus) =>
  [corpus.title, ...corpus.aliases].map((term) => ({
    corpus,
    term: term
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, ""),
  })),
);

export function unresolvedCorpus(id: string) {
  return unresolvedCorpora.find((corpus) => corpus.id === id);
}

export function hypothesesForCorpus(id: string) {
  return deciphermentHypotheses.filter(
    (hypothesis) => hypothesis.corpusId === id,
  );
}

export function unresolvedCorpusForQuestion(question: string) {
  const normalized = question
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalizedTerms.find(({ term }) => normalized.includes(term))?.corpus;
}

export function validateUnresolvedCorpusData() {
  const ids = new Set<string>();
  for (const corpus of unresolvedCorpora) {
    if (ids.has(corpus.id)) throw new Error(`Duplicate unresolved corpus ${corpus.id}`);
    ids.add(corpus.id);
    if (!unresolvedStatuses.includes(corpus.status))
      throw new Error(`Invalid unresolved status for ${corpus.id}`);
    if (
      !corpus.translationState.trim() ||
      /complete accepted translation exists|fully translated$/i.test(
        corpus.translationState,
      )
    )
      throw new Error(`Translation boundary missing for ${corpus.id}`);
    if (!corpus.sources.length || corpus.sources.some((source) => !source.url.startsWith("https://")))
      throw new Error(`HTTPS source required for ${corpus.id}`);
  }
  for (const hypothesis of deciphermentHypotheses) {
    if (!ids.has(hypothesis.corpusId))
      throw new Error(`Unknown corpus for hypothesis ${hypothesis.id}`);
    if (!hypothesis.proponent || !hypothesis.method || !hypothesis.criticism || !hypothesis.reception)
      throw new Error(`Incomplete hypothesis ${hypothesis.id}`);
  }
  return true;
}
