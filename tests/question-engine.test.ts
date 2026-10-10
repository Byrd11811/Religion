import test from "node:test";
import assert from "node:assert/strict";
import {
  neutralityChecklistIds,
  researchSectionIds,
  type CanonicalResearchSource,
  type ResearchClaim,
  type ResearchClaimDraft,
  type StructuredQuestionDraft,
} from "../packages/shared/research";
import {
  assertCanonicalEvidence,
  atlasCanonicalSource,
  boundedCanonicalEvidence,
  canonicalSourcesFromPassages,
  evidenceOnlyAnswer,
  MAX_PROVIDER_DRAFT_CHARS,
  MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS,
  MAX_PROVIDER_SOURCE_TEXT_CHARS,
  parseStructuredQuestionDraft,
  resolveStructuredQuestion,
} from "../packages/ai/claims";
import {
  runStructuredQuestion,
  type ResearchProvider,
} from "../packages/ai/provider";
import {
  deterministicNeutralityAudit,
  parseProviderNeutralityAudit,
} from "../packages/ai/neutrality";
import {
  createQuestionNdjsonStream,
  streamStructuredQuestion,
} from "../packages/ai/stream";
import { prepareResearchQuestion } from "../packages/ai/research-query";
import { answerQuestion } from "../packages/ai";
import { allPassages } from "../packages/search";
import type { Passage } from "../packages/shared/types";
import { editions, texts } from "../packages/shared/catalog";
import { aiRightsDecision } from "../packages/shared/rights";
import {
  MAX_QUESTION_PROVENANCE_CHARS,
  questionProvenanceSnapshot,
} from "../packages/shared/research-provenance";

const question = "What does this source say about wisdom?";
const source: CanonicalResearchSource = {
  id: "source-1",
  sourceId: "source-1",
  sourceRole: "primary-source",
  evidenceType: "primary-text",
  title: "Verified source",
  text: "In this verified passage, wisdom begins with careful attention.",
  url: "https://example.org/source-1",
  locator: "line 1",
  workId: "verified-work",
  editionId: "verified-edition",
  translator: "Careful Translator",
  eligibleForAi: true,
  rights: "Public domain",
};
const exactExcerpt = "wisdom begins with careful attention";

function emptyDraft(): StructuredQuestionDraft {
  return {
    question,
    sources: [],
    shortAnswer: [],
    primaryEvidence: [],
    oldestSurvivingEvidence: [],
    crossCulturalSimilarities: [],
    importantDifferences: [],
    historicalDevelopment: [],
    documentedInfluence: [],
    possibleInfluence: [],
    independentDevelopment: [],
    oppositionCompetingViews: [],
    modernReinterpretations: [],
    scholarlyConsensus: [],
    disputedIssues: [],
    imagesArtifacts: [],
    uncertainty: [],
  };
}

function citedClaim(id = "claim-1"): ResearchClaimDraft {
  return {
    id,
    statement: "The source directly associates wisdom with careful attention.",
    claimType: "textual-attestation",
    status: "known",
    confidence: "A",
    reasoning:
      "The wording is directly attested; this does not establish a separate historical event.",
    alternatives: [],
    citations: [
      {
        sourceId: source.sourceId,
        excerpt: exactExcerpt,
        expectedRole: "primary-source",
      },
    ],
    evidenceLadder: [
      {
        sourceId: source.sourceId,
        contribution: "Supplies the exact wording.",
        limitation: "Establishes textual attestation only.",
      },
    ],
  };
}

function validDraft() {
  const draft = emptyDraft();
  draft.shortAnswer.push(citedClaim());
  draft.primaryEvidence.push(citedClaim("claim-primary"));
  draft.uncertainty.push({
    id: "claim-uncertainty",
    statement:
      "This source alone does not establish a cross-cultural consensus or transmission history.",
    claimType: "uncertainty",
    status: "unknown",
    confidence: "Unreviewed",
    reasoning: "No independent comparative evidence was supplied.",
    alternatives: [],
    citations: [
      {
        sourceId: source.sourceId,
        excerpt: exactExcerpt,
        expectedRole: "primary-source",
      },
    ],
    evidenceLadder: [
      {
        sourceId: source.sourceId,
        contribution: "Shows the bounded wording available to Atlas.",
        limitation:
          "One source cannot establish cross-cultural consensus or transmission.",
      },
    ],
  });
  draft.sources.push(citedClaim().citations[0]);
  return draft;
}

function auditResponse(
  rejectedId?: (typeof neutralityChecklistIds)[number],
  rejectedCitationId?: string,
) {
  const items = neutralityChecklistIds.map((id) => ({
    id,
    passed: id !== rejectedId,
    explanation:
      id === rejectedId
        ? "Fixture rejection."
        : "Fixture audit found no issue.",
    claimIds: id === rejectedId ? ["claim-1"] : [],
  }));
  return {
    verdict:
      rejectedId || rejectedCitationId
        ? ("reject" as const)
        : ("pass" as const),
    items,
    claimAudits: [
      ["claim-1", ["claim-1:citation:1"]],
      ["claim-primary", ["claim-primary:citation:1"]],
      ["claim-uncertainty", ["claim-uncertainty:citation:1"]],
    ].map(([claimId, citationIds]) => {
      const citationAudits = (citationIds as string[]).map((citationId) => ({
        citationId,
        sourceId: source.sourceId,
        entailed: citationId !== rejectedCitationId,
        explanation:
          citationId === rejectedCitationId
            ? "The cited excerpt does not entail this claim."
            : "The citation entails the bounded claim.",
      }));
      const passed = citationAudits.every((citation) => citation.entailed);
      return {
        claimId: claimId as string,
        citationAudits,
        inScope: true,
        sourceRoleValid: true,
        confidenceValid: true,
        passed,
        explanation: passed
          ? "The claim is supported and remains inside scope."
          : "The cited excerpt does not entail this claim.",
      };
    }),
  };
}

function mockProvider(
  options: {
    generate?: (
      attempt: 1 | 2,
      signal: AbortSignal,
    ) => unknown | Promise<unknown>;
    audit?: (attempt: 1 | 2, signal: AbortSignal) => unknown | Promise<unknown>;
  } = {},
): ResearchProvider & { generationCalls: number; auditCalls: number } {
  return {
    name: "mock-provider",
    generationCalls: 0,
    auditCalls: 0,
    async generate(request, signal) {
      this.generationCalls += 1;
      return options.generate
        ? options.generate(request.attempt, signal)
        : JSON.stringify(validDraft());
    },
    async audit(request, signal) {
      this.auditCalls += 1;
      return options.audit
        ? options.audit(request.attempt, signal)
        : auditResponse();
    },
  };
}

test("structured question output covers every section and resolves canonical citations", async () => {
  const provider = mockProvider();
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "audited-synthesis");
  assert.equal(result.synthesisAudited, true);
  assert.equal(result.attempts, 1);
  assert.equal(provider.generationCalls, 1);
  assert.equal(provider.auditCalls, 1);
  for (const section of researchSectionIds)
    assert.ok(Array.isArray(result.answer[section]), section);
  const citation = result.answer.shortAnswer[0].citations[0];
  assert.equal(citation.url, source.url);
  assert.equal(citation.title, source.title);
  assert.equal(citation.sourceRole, "primary-source");
  assert.equal(citation.excerpt, exactExcerpt);
  assert.equal(
    result.answer.shortAnswer[0].evidenceLadder[0].citationId,
    citation.id,
  );
  assert.equal(result.deterministicAudit.items.length, 12);
  assert.equal(result.providerAudit?.items.length, 12);
  assert.equal(result.providerAudit?.claimAudits.length, 3);
});

test("an exact but unrelated excerpt fails the claim-level entailment audit", async () => {
  const draft = validDraft();
  draft.shortAnswer[0].statement = "The moon is made of cheese.";
  const provider = mockProvider({
    generate: () => draft,
    audit: () => auditResponse(undefined, "claim-1:citation:1"),
  });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(provider.auditCalls, 2);
  assert.ok(result.notices.every((notice) => /does not entail/iu.test(notice)));
});

test("unknown interpretive claims still require citations and cannot bypass scope", async () => {
  const draft = validDraft();
  draft.modernReinterpretations.push({
    id: "uncited-modern-claim",
    statement: "An out-of-scope community now reads the text this way.",
    claimType: "modern-interpretation",
    status: "unknown",
    confidence: "Unreviewed",
    reasoning: "No in-scope evidence was supplied.",
    alternatives: [],
    citations: [],
    evidenceLadder: [],
  });
  const provider = mockProvider({ generate: () => draft });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(provider.auditCalls, 0);
  assert.ok(result.notices.every((notice) => /no citation/iu.test(notice)));

  const mislabeled = validDraft();
  mislabeled.modernReinterpretations.push({
    id: "mislabeled-retrieval-status",
    statement: "An out-of-scope doctrine is universally authoritative.",
    claimType: "retrieval-status",
    status: "known",
    confidence: "A",
    reasoning: "The provider mislabeled a doctrinal claim as retrieval status.",
    alternatives: [],
    citations: [],
    evidenceLadder: [],
  });
  const mislabeledResult = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => mislabeled }),
  });
  assert.equal(mislabeledResult.mode, "evidence-only");
  assert.equal(mislabeledResult.providerAudit, null);
  assert.ok(
    mislabeledResult.notices.every((notice) => /no citation/iu.test(notice)),
  );
});

test("provider-authored uncertainty cannot smuggle an uncited interpretation", async () => {
  const draft = validDraft();
  draft.uncertainty[0] = {
    id: "fabricated-uncertainty",
    statement:
      "A previously unknown school secretly taught this doctrine everywhere.",
    claimType: "uncertainty",
    status: "unknown",
    confidence: "Unreviewed",
    reasoning: "The provider presented fabrication as an evidence gap.",
    alternatives: [],
    citations: [],
    evidenceLadder: [],
  };
  const provider = mockProvider({ generate: () => draft });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.providerAudit, null);
  assert.equal(provider.auditCalls, 0);
  assert.ok(result.notices.every((notice) => /no citation/iu.test(notice)));
});

test("every resolved citation receives its own entailment verdict", async () => {
  const draft = validDraft();
  draft.shortAnswer[0].citations.push({
    sourceId: source.sourceId,
    excerpt: "In this verified passage",
    expectedRole: "primary-source",
  });
  const rejected = auditResponse();
  const claimAudit = rejected.claimAudits.find(
    (item) => item.claimId === "claim-1",
  )!;
  claimAudit.citationAudits.push({
    citationId: "claim-1:citation:2",
    sourceId: source.sourceId,
    entailed: false,
    explanation: "This sibling excerpt does not entail the claim.",
  });
  claimAudit.passed = false;
  claimAudit.explanation = "One sibling citation does not entail the claim.";
  rejected.verdict = "reject";
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => draft, audit: () => rejected }),
  });
  assert.equal(result.mode, "evidence-only");
  assert.ok(
    result.notices.every((notice) => /sibling citation/iu.test(notice)),
  );
});

test("canonical Atlas passage adapters retain source roles and eligibility", () => {
  const canonical = atlasCanonicalSource("pg-10-genesis-1");
  assert.ok(canonical);
  assert.equal(canonical.sourceRole, "primary-source");
  assert.equal(canonical.evidenceType, "primary-text");
  assert.equal(canonical.eligibleForAi, true);
  assert.equal(canonical.witnessDateLabel, undefined);
  assert.match(canonical.url, /^https:\/\//u);
});

test("copyrighted and unverified edition rights never enter Question context", async () => {
  assert.deepEqual(
    editions
      .filter(
        (item) =>
          !aiRightsDecision(
            item.license,
            texts.find((work) => work.id === item.textId)?.copyright,
          ).allowed,
      )
      .map(({ id }) => id),
    [],
  );
  const passage = allPassages().find(
    (item) => item.textId === "genesis" && item.contentType === "Primary text",
  );
  assert.ok(passage);
  const edition = editions.find((item) => item.id === passage.editionId);
  const work = texts.find((item) => item.id === passage.textId);
  assert.ok(edition);
  assert.ok(work);
  const originalLicense = edition.license;
  const originalCopyright = work.copyright;

  try {
    for (const rejectedLicense of [
      "Copyrighted edition. All rights reserved.",
      "Rights unverified pending review.",
    ]) {
      edition.license = rejectedLicense;
      const [canonical] = canonicalSourcesFromPassages([passage]);
      assert.equal(canonical.eligibleForAi, false);
      const prepared = await prepareResearchQuestion("creation in Genesis", {
        textIds: ["genesis"],
      });
      assert.equal(prepared.kind, "research");
      if (prepared.kind !== "research")
        throw new Error("Expected a research Question context");
      assert.equal(
        prepared.evidence.some((source) => source.editionId === edition.id),
        false,
      );
      const provider = mockProvider();
      await assert.rejects(
        runStructuredQuestion({
          question,
          evidence: [canonical],
          provider,
        }),
        /not eligible for AI processing/iu,
      );
      assert.equal(provider.generationCalls, 0);
    }

    edition.license = originalLicense;
    work.copyright = "Rights unverified pending review.";
    assert.equal(
      canonicalSourcesFromPassages([passage])[0].eligibleForAi,
      false,
    );
  } finally {
    edition.license = originalLicense;
    work.copyright = originalCopyright;
  }

  assert.equal(
    aiRightsDecision(originalLicense, originalCopyright).allowed,
    true,
  );
  assert.equal(aiRightsDecision(undefined, originalCopyright).allowed, false);
});

test("rights wording is exact and ambiguous public-domain claims fail closed", () => {
  const allowedEdition = editions[0].license;
  const allowedWork = texts.find(
    (work) => work.id === editions[0].textId,
  )!.copyright;
  for (const license of [
    "Public domain status is unverified",
    "Public domain status remains under review",
    "Public domain claim has not been verified",
    "Public domain, subject to rights review",
    "Assumed public domain",
    "Public domain? verification needed",
    "Public domain status not reviewed",
    "Not CC0",
    "CC0 status under review",
  ])
    assert.equal(
      aiRightsDecision(license, allowedWork).allowed,
      false,
      license,
    );
  for (const workRights of [
    "Data unavailable",
    "Contact publisher",
    "Proprietary",
    "© 2026 Example",
    "Rights reserved",
    "Copyright applies",
    "Public domain status is unverified",
    "Public domain status remains under review",
    "Public domain claim has not been verified",
    "Public domain, subject to rights review",
    "Assumed public domain",
    "Public domain? verification needed",
    "Public domain status not reviewed",
  ])
    assert.equal(
      aiRightsDecision(allowedEdition, workRights).allowed,
      false,
      workRights,
    );
  assert.equal(aiRightsDecision(allowedEdition, allowedWork).allowed, true);
});

test("provider evidence is deterministically bounded around the query", () => {
  const needle = "格物";
  const longSource = {
    ...source,
    id: "long-source",
    sourceId: "long-source",
    text: `${"前".repeat(7_500)}${needle}${"後".repeat(7_500)}`,
  };
  const bounded = boundedCanonicalEvidence([longSource], needle);
  assert.equal(bounded.length, 1);
  assert.ok(bounded[0].text.includes(needle));
  assert.ok(bounded[0].text.length <= MAX_PROVIDER_SOURCE_TEXT_CHARS);
  assert.ok(
    JSON.stringify(bounded).length <= MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS,
  );
});

test("oversized provider drafts and audits are rejected before persistence", () => {
  assert.throws(
    () =>
      parseStructuredQuestionDraft("x".repeat(MAX_PROVIDER_DRAFT_CHARS + 1)),
    /size limit/iu,
  );
  const audit = auditResponse();
  audit.items[0].explanation = "x".repeat(25_000);
  assert.throws(
    () =>
      parseProviderNeutralityAudit(
        audit,
        "mock",
        resolveStructuredQuestion(validDraft(), [source]),
      ),
    /size limit/iu,
  );
});

test("Unknown passages remain explicitly unclassified and cannot enter synthesis", () => {
  const unknownPassage: Passage = {
    id: "unknown-classification-fixture",
    textId: "genesis",
    editionId: "pg-10-genesis",
    sequence: 999_999,
    reference: "Unreviewed fixture",
    content:
      "This deliberately unreviewed segment remains discoverable as Unknown.",
    sourceUrl: "https://www.gutenberg.org/ebooks/10",
    themes: [],
    contentType: "Unknown",
  };
  const [canonical] = canonicalSourcesFromPassages([unknownPassage]);
  assert.equal(canonical.sourceRole, "unclassified");
  assert.equal(canonical.evidenceType, "unclassified");
  assert.equal(canonical.eligibleForAi, false);
  assert.throws(
    () =>
      assertCanonicalEvidence([
        {
          ...canonical,
          eligibleForAi: true,
        },
      ]),
    /unclassified and cannot enter model synthesis/iu,
  );
});

test("evidence-only output keeps non-primary retrieval context out of Primary Evidence", () => {
  const scholarship: CanonicalResearchSource = {
    ...source,
    id: "scholarly-context",
    sourceId: "scholarly-context",
    sourceRole: "scholarly-source",
    evidenceType: "scholarly-secondary",
    title: "Reviewed scholarly context",
    text: "This reviewed study supplies historical context for the passage.",
  };
  const answer = evidenceOnlyAnswer(
    question,
    [source, scholarship],
    "No synthesis was requested.",
  );
  assert.equal(answer.primaryEvidence.length, 1);
  assert.equal(
    answer.primaryEvidence[0].citations[0].sourceId,
    source.sourceId,
  );
  assert.ok(
    answer.primaryEvidence.every((claim) =>
      claim.citations.some(
        (citation) => citation.sourceRole === "primary-source",
      ),
    ),
  );
  assert.equal(answer.sources.length, 2);
  assert.equal(
    answer.sources.find((item) => item.sourceId === scholarship.sourceId)
      ?.sourceRole,
    "scholarly-source",
  );
});

test("production passage adaptation adds only verified linked witness and artifact evidence", () => {
  const passage = allPassages().find(
    (item) => item.textId === "book-of-the-dead",
  );
  assert.ok(passage);
  const evidence = canonicalSourcesFromPassages([passage]);
  const passageSource = evidence.find((item) => item.sourceId === passage.id);
  const witnessSource = evidence.find(
    (item) => item.evidenceType === "manuscript",
  );
  const artifactSource = evidence.find(
    (item) => item.evidenceType === "image-artifact",
  );

  assert.equal(passageSource?.sourceRole, "scholarly-source");
  assert.equal(witnessSource?.witnessId, "met-witness-550820");
  assert.match(witnessSource?.witnessDateLabel ?? "", /1080.*945 BCE/iu);
  assert.match(
    witnessSource?.witnessDateConfidence ?? "",
    /Approximate repository catalog date or range/iu,
  );
  assert.doesNotMatch(
    witnessSource?.witnessDateConfidence ?? "",
    /Securely attested/iu,
  );
  assert.match(
    witnessSource?.survivalBiasNote ?? "",
    /catalog is incomplete/iu,
  );
  assert.equal(witnessSource?.compositionDateLabel, undefined);
  assert.equal(artifactSource?.artifactId, "met-550820");
  assert.equal(artifactSource?.witnessId, witnessSource?.witnessId);
  assert.match(artifactSource?.rights ?? "", /CC0/iu);

  const fallback = evidenceOnlyAnswer(
    "What physical evidence survives?",
    evidence,
    "No model synthesis is configured.",
  );
  assert.equal(fallback.primaryEvidence.length, 0);
  assert.equal(fallback.oldestSurvivingEvidence.length, 1);
  assert.equal(fallback.imagesArtifacts.length, 2);
  assert.ok(
    fallback.sources.some(
      (item) =>
        item.sourceId === passage.id && item.sourceRole === "scholarly-source",
    ),
  );
});

test("question preparation gives a shared witness one canonical source ID per work", async () => {
  const prepared = await prepareResearchQuestion("spirit");
  assert.equal(prepared.kind, "research");
  if (prepared.kind !== "research") return;

  const vaticanus = prepared.evidence.filter(
    (item) => item.witnessId === "codex-vaticanus",
  );
  assert.deepEqual(
    new Set(vaticanus.map((item) => item.workId)),
    new Set(["genesis", "gospel-of-matthew", "gospel-of-mark"]),
  );
  assert.equal(
    new Set(vaticanus.map((item) => item.sourceId)).size,
    vaticanus.length,
  );
  assert.ok(
    vaticanus.every(
      (item) => item.sourceId === `witness:${item.witnessId}:${item.workId}`,
    ),
  );

  const answer = evidenceOnlyAnswer(
    "spirit",
    prepared.evidence,
    "No model synthesis is configured.",
  );
  assert.equal(
    new Set(answer.sources.map((item) => item.sourceId)).size,
    answer.sources.length,
  );
});

test("production passage adaptation leaves object sections empty without a verified link", () => {
  const passage = allPassages().find(
    (item) => item.textId === "job" && item.contentType === "Primary text",
  );
  assert.ok(passage);
  const evidence = canonicalSourcesFromPassages([passage]);
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].sourceId, passage.id);
  const fallback = evidenceOnlyAnswer(question, evidence, "Evidence only.");
  assert.equal(fallback.oldestSurvivingEvidence.length, 0);
  assert.equal(fallback.imagesArtifacts.length, 0);
});

test("Images and Artifacts rejects text-only citations and accepts linked object evidence", () => {
  const invalid = emptyDraft();
  invalid.imagesArtifacts.push(citedClaim("misclassified-image-claim"));
  invalid.sources.push(citedClaim().citations[0]);
  assert.throws(
    () => resolveStructuredQuestion(invalid, [source]),
    /Images-and-artifacts section is misclassified|canonical artifact or witness ID/iu,
  );

  const passage = allPassages().find(
    (item) => item.textId === "book-of-the-dead",
  );
  assert.ok(passage);
  const evidence = canonicalSourcesFromPassages([passage]);
  const artifactSource = evidence.find(
    (item) => item.evidenceType === "image-artifact",
  );
  assert.ok(artifactSource);
  const excerpt = artifactSource.text.slice(0, 120);
  const citation = {
    sourceId: artifactSource.sourceId,
    excerpt,
    expectedRole: "primary-source" as const,
  };
  const valid = emptyDraft();
  valid.imagesArtifacts.push({
    id: "verified-object-claim",
    statement: "The institutional catalog supplies a linked object record.",
    claimType: "artifact-observation",
    status: "known",
    confidence: "A",
    reasoning:
      "The claim reports catalog metadata and does not interpret image pixels.",
    alternatives: [],
    citations: [citation],
    evidenceLadder: [
      {
        sourceId: artifactSource.sourceId,
        contribution: "Supplies the linked institutional object record.",
        limitation: "Does not establish an interpretation of the image.",
      },
    ],
  });
  valid.sources.push(citation);
  const resolved = resolveStructuredQuestion(valid, evidence);
  assert.equal(
    resolved.imagesArtifacts[0].citations[0].artifactId,
    "met-550820",
  );
});

function earliestEvidenceClaim(sourceId: string): ResearchClaimDraft {
  return {
    id: "earliest-evidence",
    statement:
      "This is the earliest surviving evidence currently represented in Atlas for this bounded comparison.",
    claimType: "historical-context",
    status: "known",
    confidence: "A",
    reasoning:
      "The cited object supplies a physical witness date, while preservation and survival bias limit what the surviving sample can establish.",
    alternatives: [
      "Earlier evidence may have existed without surviving or without being represented in Atlas.",
    ],
    citations: [
      {
        sourceId,
        excerpt: exactExcerpt,
        expectedRole: "primary-source",
      },
    ],
    evidenceLadder: [
      {
        sourceId,
        contribution: "Supplies an object-level date for a surviving witness.",
        limitation:
          "Preservation and Atlas coverage cannot establish the first historical belief.",
      },
    ],
  };
}

test("a work composition range cannot stand in for surviving-witness chronology", () => {
  const compositionOnly: CanonicalResearchSource = {
    ...source,
    compositionDateLabel: "500–400 BCE",
    compositionDateConfidence: "Provisional editorial estimate",
  };
  const draft = validDraft();
  draft.oldestSurvivingEvidence.push(
    earliestEvidenceClaim(compositionOnly.sourceId),
  );
  assert.throws(
    () => resolveStructuredQuestion(draft, [compositionOnly]),
    /physical-witness chronology|composition range is insufficient/iu,
  );
});

test("general witness attestation status cannot masquerade as date confidence", () => {
  assert.throws(
    () =>
      assertCanonicalEvidence([
        {
          ...source,
          evidenceType: "manuscript",
          witnessId: "verified-witness",
          witnessDateLabel: "ca. 350 BCE",
          witnessDateConfidence: "Securely attested",
          survivalBiasNote:
            "Survival bias limits this incomplete witness sample.",
        },
      ]),
    /general attestation status as date confidence/iu,
  );
});

test("earliest-surviving claims require bounded witness dates and survival-bias metadata", () => {
  const witnessSource: CanonicalResearchSource = {
    ...source,
    evidenceType: "manuscript",
    witnessId: "verified-witness",
    compositionDateLabel: "500–400 BCE",
    compositionDateConfidence: "Reviewed range",
    witnessDateLabel: "ca. 350 BCE",
    witnessDateConfidence: "Repository-reviewed object date",
    survivalBiasNote:
      "Survival and catalog coverage are uneven, so this object cannot establish the first historical belief.",
  };
  const draft = validDraft();
  draft.oldestSurvivingEvidence.push(
    earliestEvidenceClaim(witnessSource.sourceId),
  );
  const resolved = resolveStructuredQuestion(draft, [witnessSource]);
  const citation = resolved.oldestSurvivingEvidence[0].citations[0];
  assert.equal(citation.witnessId, "verified-witness");
  assert.equal(citation.witnessDateLabel, "ca. 350 BCE");
  assert.match(citation.survivalBiasNote ?? "", /cannot establish the first/iu);
});

test("malformed JSON and missing citations get one retry then evidence-only fallback", async () => {
  const malformed = mockProvider({ generate: () => "{not json" });
  const malformedResult = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: malformed,
  });
  assert.equal(malformedResult.mode, "evidence-only");
  assert.equal(malformedResult.attempts, 2);
  assert.equal(malformed.generationCalls, 2);
  assert.equal(malformed.auditCalls, 0);
  assert.match(malformedResult.notices[0], /malformed JSON/iu);

  const noCitations = validDraft();
  noCitations.shortAnswer[0].citations = [];
  noCitations.shortAnswer[0].evidenceLadder = [];
  const missing = mockProvider({ generate: () => noCitations });
  const missingResult = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: missing,
  });
  assert.equal(missingResult.mode, "evidence-only");
  assert.ok(
    missingResult.notices.every((notice) => /no citation/iu.test(notice)),
  );
});

test("one valid citation cannot conceal an invalid sibling citation", async () => {
  const draft = validDraft();
  const invalid = {
    sourceId: "invented-source",
    excerpt: "This source does not exist.",
    expectedRole: "scholarly-source" as const,
  };
  draft.shortAnswer[0].citations.push(invalid);
  draft.shortAnswer[0].evidenceLadder.push({
    sourceId: invalid.sourceId,
    contribution: "Purports to support the claim.",
    limitation: "Cannot be inspected.",
  });
  draft.sources.push(invalid);
  const provider = mockProvider({ generate: () => draft });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(provider.auditCalls, 0);
  assert.ok(
    result.notices.every((notice) =>
      /not in the verified evidence set/iu.test(notice),
    ),
  );
});

test("wrong excerpts and wrong source roles are independently rejected", async () => {
  const wrongExcerpt = validDraft();
  wrongExcerpt.shortAnswer[0].citations[0].excerpt =
    "A quotation that is absent from the canonical source.";
  const first = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => wrongExcerpt }),
  });
  assert.equal(first.mode, "evidence-only");
  assert.ok(first.notices.every((notice) => /does not occur/iu.test(notice)));

  const wrongRole = validDraft();
  wrongRole.shortAnswer[0].citations[0].expectedRole = "scholarly-source";
  const second = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => wrongRole }),
  });
  assert.equal(second.mode, "evidence-only");
  assert.ok(
    second.notices.every((notice) => /not scholarly-source/iu.test(notice)),
  );
});

test("confidence grades cannot be upgraded beyond the cited source role", async () => {
  const draft = validDraft();
  draft.shortAnswer[0].confidence = "B";
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => draft }),
  });
  assert.equal(result.mode, "evidence-only");
  assert.ok(
    result.notices.every((notice) =>
      /without a scholarly source/iu.test(notice),
    ),
  );
});

test("confidence D requires evidence of meaningful scholarly dispute", async () => {
  const draft = validDraft();
  draft.shortAnswer[0].confidence = "D";
  draft.shortAnswer[0].status = "disputed";
  draft.shortAnswer[0].alternatives = ["A competing interpretation exists."];
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider({ generate: () => draft }),
  });
  assert.equal(result.mode, "evidence-only");
  assert.ok(
    result.notices.every((notice) => /without a scholarly source/iu.test(notice)),
  );
});

test("audit rejection regenerates and re-audits exactly once", async () => {
  const provider = mockProvider({
    audit: (attempt) =>
      attempt === 1
        ? auditResponse("alternative-scholarship-omitted")
        : auditResponse(),
  });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "audited-synthesis");
  assert.equal(result.attempts, 2);
  assert.equal(provider.generationCalls, 2);
  assert.equal(provider.auditCalls, 2);
  assert.match(result.notices[0], /Attempt 1/iu);
});

test("two audit rejections exhaust the retry and return explicit evidence-only output", async () => {
  const provider = mockProvider({
    audit: () => auditResponse("religious-truth-ranking"),
  });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.synthesisAudited, false);
  assert.equal(result.attempts, 2);
  assert.equal(provider.generationCalls, 2);
  assert.equal(provider.auditCalls, 2);
  assert.match(
    result.answer.uncertainty[0].statement,
    /failed evidence or neutrality/iu,
  );
  assert.equal(result.answer.sources[0].sourceId, source.sourceId);
  assert.equal(result.providerAudit, null);
});

test("large rejected audits remain bounded and still return a persistable fallback", async () => {
  const evidence = Array.from({ length: 8 }, (_, index) => ({
    ...source,
    id: `large-source-${index + 1}`,
    sourceId: `large-source-${index + 1}`,
    title: `Large fixture source ${index + 1}`,
    url: `https://example.org/large-source-${index + 1}`,
    workId: `large-work-${index + 1}`,
    editionId: `large-edition-${index + 1}`,
  }));
  const draft = emptyDraft();
  const largeSource = evidence[0];
  const makeClaim = (id: string): ResearchClaimDraft => ({
    ...citedClaim(id),
    citations: [
      {
        sourceId: largeSource.sourceId,
        excerpt: exactExcerpt,
        expectedRole: "primary-source",
      },
    ],
    evidenceLadder: [
      {
        sourceId: largeSource.sourceId,
        contribution: "Supplies the exact wording.",
        limitation: "Establishes textual attestation only.",
      },
    ],
  });
  for (let index = 1; index <= 10; index += 1) {
    draft.shortAnswer.push(makeClaim(`large-answer-${index}`));
    draft.uncertainty.push(makeClaim(`large-uncertainty-${index}`));
  }
  draft.sources.push(draft.shortAnswer[0].citations[0]);

  const provider: ResearchProvider = {
    name: "large-rejected-audit-provider",
    async generate() {
      return draft;
    },
    async audit(request) {
      const failedClaimId = request.requiredClaimAudits[0].claimId;
      const response = {
        verdict: "reject" as const,
        items: neutralityChecklistIds.map((id, index) => ({
          id,
          passed: index !== 0,
          explanation: index === 0 ? "X".repeat(800) : "No issue found.",
          claimIds: index === 0 ? [failedClaimId] : [],
        })),
        claimAudits: request.requiredClaimAudits.map((claim) => ({
          claimId: claim.claimId,
          citationAudits: claim.citations.map((citation) => ({
            ...citation,
            entailed: false,
            explanation: "X".repeat(800),
          })),
          inScope: true,
          sourceRoleValid: true,
          confidenceValid: true,
          passed: false,
          explanation: "X".repeat(800),
        })),
      };
      const serializedLength = JSON.stringify(response).length;
      assert.ok(serializedLength > 20_000);
      assert.ok(serializedLength < 24_000);
      return response;
    },
  };

  const result = await runStructuredQuestion({ question, evidence, provider });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.attempts, 2);
  assert.equal(result.providerAudit, null);
  assert.equal(result.notices.length, 2);
  assert.ok(result.notices.every((notice) => notice.length <= 2_000));
  const snapshot = questionProvenanceSnapshot(
    result,
    {},
    "2026-10-10T00:00:00.000Z",
  );
  assert.ok(
    JSON.stringify(snapshot, null, 2).length <= MAX_QUESTION_PROVENANCE_CHARS,
  );
});

test("provider failures do not remove verified evidence", async () => {
  const provider = mockProvider({
    generate: () => {
      throw new Error("provider unavailable");
    },
  });
  const result = await runStructuredQuestion({
    question,
    evidence: [source],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.answer.primaryEvidence.length, 1);
  assert.equal(result.answer.primaryEvidence[0].citations[0].url, source.url);
  assert.ok(
    result.notices.every((notice) => /provider unavailable/iu.test(notice)),
  );
});

test("no-provider mode is explicit and performs no synthesis", async () => {
  const result = await runStructuredQuestion({ question, evidence: [source] });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.attempts, 0);
  assert.equal(result.providerAudit, null);
  assert.match(result.notices[0], /no model provider/iu);
});

test("empty evidence performs no provider call", async () => {
  const provider = mockProvider();
  const result = await runStructuredQuestion({
    question,
    evidence: [],
    provider,
  });
  assert.equal(result.mode, "evidence-only");
  assert.equal(result.attempts, 0);
  assert.equal(provider.generationCalls, 0);
  assert.equal(provider.auditCalls, 0);
});

test("stream emits only verified evidence/status before an audited complete result", async () => {
  const events = [];
  for await (const event of streamStructuredQuestion({
    question,
    evidence: [source],
    provider: mockProvider(),
  }))
    events.push(event);
  assert.equal(events[0].type, "status");
  assert.equal(events[1].type, "evidence");
  assert.equal(events.at(-1)?.type, "complete");
  for (const event of events.slice(0, -1))
    assert.ok(event.type === "status" || event.type === "evidence");
  const complete = events.at(-1);
  assert.equal(
    complete?.type === "complete" ? complete.result.synthesisAudited : false,
    true,
  );
});

test("cancelling the NDJSON stream aborts in-flight provider work", async () => {
  let sawAbort = false;
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const provider = mockProvider({
    generate: (_attempt, signal) =>
      new Promise((_resolve, reject) => {
        started();
        signal.addEventListener(
          "abort",
          () => {
            sawAbort = true;
            reject(signal.reason ?? new DOMException("aborted", "AbortError"));
          },
          { once: true },
        );
      }),
  });
  const reader = createQuestionNdjsonStream({
    question,
    evidence: [source],
    provider,
  }).getReader();
  const first = await reader.read();
  assert.equal(first.done, false);
  await began;
  await reader.cancel();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(sawAbort, true);
  assert.equal(provider.auditCalls, 0);
});

function answerWithClaim(statement: string, section = "shortAnswer") {
  const answer = evidenceOnlyAnswer(
    question,
    [source],
    "Limits remain visible.",
  );
  const claim: ResearchClaim = {
    ...answer.shortAnswer[0],
    id: "neutrality-fixture",
    statement,
    reasoning: "Fixture reasoning.",
  };
  for (const key of researchSectionIds) answer[key] = [];
  answer[section as (typeof researchSectionIds)[number]].push(claim);
  return answer;
}

test("deterministic audit implements every original neutrality checklist item", () => {
  const phraseCases: [string, string][] = [
    ["religious-truth-ranking", "This is the only true religion."],
    ["primitive-religion-framing", "That is a primitive religion."],
    ["western-default-categories", "All religions teach salvation."],
    ["oral-tradition-as-scripture", "This oral tradition is a scripture."],
    ["mythology-as-falsehood", "This mythology is false."],
    [
      "canon-as-historical-truth",
      "It is canonical and therefore proves it is historically true.",
    ],
    [
      "skepticism-as-superior",
      "Skepticism is inherently more rational than belief.",
    ],
    ["religion-as-irrational", "Religious belief is automatically irrational."],
    ["overstated-textual-borrowing", "One text obviously copied the other."],
  ];
  for (const [id, phrase] of phraseCases) {
    const audit = deterministicNeutralityAudit(answerWithClaim(phrase));
    assert.equal(
      audit.items.find((entry) => entry.id === id)?.passed,
      false,
      id,
    );
  }

  const chronology = answerWithClaim(
    "Tradition A influenced Tradition B.",
    "documentedInfluence",
  );
  chronology.documentedInfluence[0].claimType = "historical-influence";
  chronology.documentedInfluence[0].alternatives = ["Independent development."];
  assert.equal(
    deterministicNeutralityAudit(chronology).items.find(
      (entry) => entry.id === "chronology-ignored",
    )?.passed,
    false,
  );

  const similarity = answerWithClaim(
    "Their similarity proves direct influence.",
    "crossCulturalSimilarities",
  );
  assert.equal(
    deterministicNeutralityAudit(similarity).items.find(
      (entry) => entry.id === "similarity-as-direct-influence",
    )?.passed,
    false,
  );

  const alternatives = answerWithClaim(
    "This disputed interpretation has one possible reading.",
    "disputedIssues",
  );
  alternatives.disputedIssues[0].status = "disputed";
  alternatives.disputedIssues[0].alternatives = [];
  assert.equal(
    deterministicNeutralityAudit(alternatives).items.find(
      (entry) => entry.id === "alternative-scholarship-omitted",
    )?.passed,
    false,
  );
  assert.deepEqual(
    deterministicNeutralityAudit(
      evidenceOnlyAnswer(question, [source], "Unknown."),
    ).items.map((entry) => entry.id),
    [...neutralityChecklistIds],
  );
});

test("provider audit JSON must contain each checklist item exactly once", () => {
  const answer = resolveStructuredQuestion(validDraft(), [source]);
  const incomplete = auditResponse();
  incomplete.items.pop();
  assert.throws(
    () => parseProviderNeutralityAudit(incomplete, "mock", answer),
    /checklist is incomplete/iu,
  );
  const inconsistent = auditResponse();
  inconsistent.items[0].passed = false;
  inconsistent.items[0].claimIds = ["claim-1"];
  assert.throws(
    () => parseProviderNeutralityAudit(inconsistent, "mock", answer),
    /verdict is inconsistent/iu,
  );
  const missingClaim = auditResponse();
  missingClaim.claimAudits.pop();
  assert.throws(
    () => parseProviderNeutralityAudit(missingClaim, "mock", answer),
    /missing claim audits/iu,
  );
  const inventedChecklistClaim = auditResponse();
  inventedChecklistClaim.items[0].claimIds = ["invented-claim"];
  assert.throws(
    () => parseProviderNeutralityAudit(inventedChecklistClaim, "mock", answer),
    /references unknown claims/iu,
  );
  assert.throws(
    () => parseStructuredQuestionDraft("not-json"),
    /malformed JSON/iu,
  );
});

test("restricted evidence is rejected before any provider call", async () => {
  const provider = mockProvider();
  await assert.rejects(
    runStructuredQuestion({
      question,
      evidence: [{ ...source, eligibleForAi: false }],
      provider,
    }),
    /not eligible for AI processing/iu,
  );
  assert.equal(provider.generationCalls, 0);
  const events = streamStructuredQuestion({
    question,
    evidence: [{ ...source, eligibleForAi: false }],
    provider,
  });
  await assert.rejects(events.next(), /not eligible for AI processing/iu);
});

test("scoped unresolved-corpus requests return a generic safeguard without leaking metadata", async () => {
  const prepared = await prepareResearchQuestion(
    "Translate the Voynich Manuscript",
    { textIds: ["dhammapada"] },
  );
  assert.equal(prepared.kind, "unresolved-safeguard");
  if (prepared.kind !== "unresolved-safeguard") return;
  assert.equal(prepared.result.mode, "evidence-only");
  assert.equal(prepared.result.answer.sources.length, 0);
  assert.equal(prepared.result.answer.historicalDevelopment.length, 0);
  assert.equal(prepared.result.answer.disputedIssues.length, 0);
  assert.match(
    prepared.result.answer.shortAnswer[0].statement,
    /outside the active source scope/iu,
  );
  const disclosed = JSON.stringify({
    sections: Object.fromEntries(
      researchSectionIds.map((section) => [
        section,
        prepared.result.answer[section],
      ]),
    ),
    notices: prepared.result.notices,
  });
  assert.doesNotMatch(
    disclosed,
    /Beinecke|fifteenth|Wilfrid|Yale|https:\/\//iu,
  );

  const legacy = await answerQuestion("Translate the Voynich Manuscript", {
    textIds: ["dhammapada"],
  });
  assert.equal(legacy.passages.length, 0);
  assert.match(legacy.summary, /outside the active source scope/iu);
  assert.doesNotMatch(
    JSON.stringify({ ...legacy, question: undefined }),
    /Beinecke|fifteenth|Wilfrid|Yale|https:\/\//iu,
  );
});

test("question preparation honors an already-aborted retrieval signal", async () => {
  const controller = new AbortController();
  controller.abort(new DOMException("cancelled in fixture", "AbortError"));
  await assert.rejects(
    prepareResearchQuestion(question, {}, controller.signal),
    (error: unknown) =>
      error instanceof DOMException && error.name === "AbortError",
  );
});

test("question preparation yields so an in-flight lexical search can be cancelled", async () => {
  const controller = new AbortController();
  const pending = prepareResearchQuestion(
    "What does this source say about wisdom?",
    {},
    controller.signal,
  );
  setTimeout(
    () =>
      controller.abort(
        new DOMException("Cancelled during lexical retrieval", "AbortError"),
      ),
    0,
  );
  await assert.rejects(pending, /Cancelled during lexical retrieval/iu);
});
