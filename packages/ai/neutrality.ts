import { z } from "zod";
import {
  neutralityChecklistIds,
  researchSectionIds,
  type NeutralityAudit,
  type NeutralityAuditItem,
  type NeutralityChecklistId,
  type ProviderNeutralityAudit,
  type StructuredQuestionAnswer,
} from "@/packages/shared/research";
import { ResearchValidationError } from "./claims";
const MAX_PROVIDER_AUDIT_CHARS = 24_000;

export const neutralityChecklist: Record<NeutralityChecklistId, string> = {
  "religious-truth-ranking":
    "Does the answer portray one religion as obviously true?",
  "primitive-religion-framing":
    "Does it portray another religion or tradition as primitive?",
  "western-default-categories":
    "Does it use Christian or Western categories as universal defaults?",
  "oral-tradition-as-scripture":
    "Does it incorrectly call an oral tradition scripture?",
  "mythology-as-falsehood": "Does it confuse mythology with falsehood?",
  "canon-as-historical-truth":
    "Does it confuse canonical status with historical truth?",
  "skepticism-as-superior":
    "Does it present skepticism as automatically superior?",
  "religion-as-irrational":
    "Does it present religious belief as automatically irrational?",
  "overstated-textual-borrowing": "Does it overstate textual borrowing?",
  "chronology-ignored": "Does it ignore chronology?",
  "similarity-as-direct-influence":
    "Does it confuse similarity with direct influence?",
  "alternative-scholarship-omitted":
    "Does it omit alternative scholarly interpretations?",
};

function claimsWithText(answer: StructuredQuestionAnswer) {
  return researchSectionIds.flatMap((section) =>
    answer[section].map((claim) => ({
      claim,
      section,
      text: `${claim.statement} ${claim.reasoning} ${claim.alternatives.join(" ")}`,
    })),
  );
}

function matches(
  answer: StructuredQuestionAnswer,
  pattern: RegExp,
  sections = researchSectionIds as readonly (typeof researchSectionIds)[number][],
) {
  return claimsWithText(answer)
    .filter(
      ({ section, text }) => sections.includes(section) && pattern.test(text),
    )
    .map(({ claim }) => claim.id);
}

function item(
  id: NeutralityChecklistId,
  claimIds: string[],
  failure: string,
): NeutralityAuditItem {
  return {
    id,
    passed: claimIds.length === 0,
    explanation: claimIds.length
      ? failure
      : `No ${neutralityChecklist[id].toLowerCase()}`,
    claimIds,
  };
}

export function deterministicNeutralityAudit(
  answer: StructuredQuestionAnswer,
): NeutralityAudit {
  const all = claimsWithText(answer);
  const religiousTruth = matches(
    answer,
    /\b(?:the\s+)?(?:only|most)\s+true\s+(?:religion|faith)|\b(?:religion|faith)\s+is\s+(?:obviously|objectively)\s+(?:true|correct)|\bother\s+religions\s+are\s+false\b/iu,
  );
  const primitive = matches(
    answer,
    /\bprimitive\s+(?:religion|belief|faith|people|tradition)|\b(?:religion|faith|tradition)\s+is\s+(?:inferior|backward|uncivilized)\b/iu,
  );
  const westernDefault = matches(
    answer,
    /\ball\s+(?:religions|traditions|cultures)\s+(?:believe|teach|have|require)\s+(?:in\s+)?(?:sin|salvation|scripture|church|creed|hell)\b|\bevery\s+(?:religion|tradition)\s+has\s+(?:a\s+)?(?:scripture|church|creed)\b/iu,
  );
  const oralAsScripture = matches(
    answer,
    /\b(?:oral|performed|recited)\s+tradition\b[^.]{0,100}\b(?:is|as|called)\s+(?:a\s+)?scripture\b|\bscripture\b[^.]{0,100}\b(?:purely\s+)?oral\s+tradition\b/iu,
  );
  const mythFalse = matches(
    answer,
    /\bmyth(?:ology|ological)?\b[^.]{0,80}\b(?:false|lie|fictional therefore untrue|made[- ]up)\b|\b(?:false|lie|made[- ]up)\b[^.]{0,80}\bmyth(?:ology|ological)?\b/iu,
  );
  const canonTruth = matches(
    answer,
    /\b(?:canonical|in the canon)\b[^.]{0,100}\b(?:therefore|proves?|guarantees?)\b[^.]{0,60}\b(?:historically true|happened|historical fact)\b/iu,
  );
  const skepticSuperior = matches(
    answer,
    /\bskeptic(?:s|ism|al)?\b[^.]{0,100}\b(?:automatically|inherently|obviously)\s+(?:superior|more rational|more logical|correct)\b/iu,
  );
  const irrational = matches(
    answer,
    /\b(?:religion|religious belief|faith|believers?)\b[^.]{0,100}\b(?:automatically|inherently|obviously|always)\s+irrational\b/iu,
  );
  const borrowing = matches(
    answer,
    /\b(?:obviously|certainly|clearly|must have)\s+(?:copied|borrowed)\b|\bcopied\s+directly\b|\bsimilarity\s+proves?\s+(?:borrowing|copying)\b/iu,
  );
  const influenceClaims = [
    ...answer.documentedInfluence,
    ...answer.possibleInfluence,
  ];
  const developmentText = answer.historicalDevelopment
    .map((claim) => `${claim.statement} ${claim.reasoning}`)
    .join(" ");
  const chronologyPattern =
    /\b(?:before|after|earlier|later|contemporar|chronolog|century|millennium|BCE|CE|BC|AD|\d{3,4})\b/iu;
  const chronologyIgnored = influenceClaims
    .filter(
      (claim) =>
        !chronologyPattern.test(
          `${claim.statement} ${claim.reasoning} ${developmentText}`,
        ),
    )
    .map((claim) => claim.id);
  const similarityInfluence = all
    .filter(
      ({ claim, section, text }) =>
        (section === "crossCulturalSimilarities" ||
          claim.claimType === "historical-influence") &&
        /\b(?:similarity|similar|shared theme|resemblance)\b/iu.test(text) &&
        /\b(?:proves?|demonstrates?|establishes?)\s+(?:direct\s+)?(?:influence|borrowing|copying)\b/iu.test(
          text,
        ),
    )
    .map(({ claim }) => claim.id);
  const claimsNeedingAlternatives = all.filter(
    ({ claim, section }) =>
      claim.status === "disputed" ||
      section === "documentedInfluence" ||
      section === "possibleInfluence" ||
      section === "disputedIssues",
  );
  const hasAlternativeSection =
    answer.oppositionCompetingViews.length > 0 ||
    answer.disputedIssues.length > 1;
  const alternativesOmitted = claimsNeedingAlternatives
    .filter(
      ({ claim }) => claim.alternatives.length === 0 && !hasAlternativeSection,
    )
    .map(({ claim }) => claim.id);

  const items = [
    item(
      "religious-truth-ranking",
      religiousTruth,
      "A claim portrays a religion as obviously or uniquely true.",
    ),
    item(
      "primitive-religion-framing",
      primitive,
      "A claim uses primitive or inferior framing for a religion or tradition.",
    ),
    item(
      "western-default-categories",
      westernDefault,
      "A claim universalizes a Christian or Western category.",
    ),
    item(
      "oral-tradition-as-scripture",
      oralAsScripture,
      "A claim labels an oral tradition as scripture without qualification.",
    ),
    item(
      "mythology-as-falsehood",
      mythFalse,
      "A claim treats mythology as synonymous with falsehood.",
    ),
    item(
      "canon-as-historical-truth",
      canonTruth,
      "A claim treats canonical status as proof of historicity.",
    ),
    item(
      "skepticism-as-superior",
      skepticSuperior,
      "A claim treats skepticism as automatically superior.",
    ),
    item(
      "religion-as-irrational",
      irrational,
      "A claim treats religious belief as automatically irrational.",
    ),
    item(
      "overstated-textual-borrowing",
      borrowing,
      "A claim asserts textual borrowing beyond its evidence.",
    ),
    item(
      "chronology-ignored",
      chronologyIgnored,
      "An influence claim does not establish chronological possibility.",
    ),
    item(
      "similarity-as-direct-influence",
      similarityInfluence,
      "A claim treats resemblance as proof of direct influence.",
    ),
    item(
      "alternative-scholarship-omitted",
      alternativesOmitted,
      "A disputed or influence claim omits alternative scholarly interpretations.",
    ),
  ];
  return { passed: items.every((entry) => entry.passed), items };
}

const providerItemSchema = z
  .object({
    id: z.enum(neutralityChecklistIds),
    passed: z.boolean(),
    explanation: z.string().trim().min(1).max(1_000),
    claimIds: z.array(z.string().trim().min(1).max(200)).max(180),
  })
  .strict();

const providerAuditSchema = z
  .object({
    verdict: z.enum(["pass", "reject"]),
    items: z.array(providerItemSchema),
    claimAudits: z.array(
      z
        .object({
          claimId: z.string().trim().min(1).max(200),
          citationAudits: z.array(
            z
              .object({
                citationId: z.string().trim().min(1).max(260),
                sourceId: z.string().trim().min(1).max(200),
                entailed: z.boolean(),
                explanation: z.string().trim().min(1).max(1_000),
              })
              .strict(),
          ),
          inScope: z.boolean(),
          sourceRoleValid: z.boolean(),
          confidenceValid: z.boolean(),
          passed: z.boolean(),
          explanation: z.string().trim().min(1).max(1_000),
        })
        .strict(),
    ),
  })
  .strict();

export function parseProviderNeutralityAudit(
  value: unknown,
  provider: string,
  answer: StructuredQuestionAnswer,
): ProviderNeutralityAudit {
  let json = value;
  if (typeof value === "string") {
    if (value.length > MAX_PROVIDER_AUDIT_CHARS)
      throw new ResearchValidationError("Provider audit exceeds size limit", [
        `audit response must be at most ${MAX_PROVIDER_AUDIT_CHARS} characters`,
      ]);
    try {
      json = JSON.parse(value);
    } catch {
      throw new ResearchValidationError(
        "Provider audit returned malformed JSON",
        ["audit response is not valid JSON"],
      );
    }
  }
  if (JSON.stringify(json).length > MAX_PROVIDER_AUDIT_CHARS)
    throw new ResearchValidationError("Provider audit exceeds size limit", [
      `parsed audit must be at most ${MAX_PROVIDER_AUDIT_CHARS} characters`,
    ]);
  const result = providerAuditSchema.safeParse(json);
  if (!result.success)
    throw new ResearchValidationError(
      "Provider audit does not match the neutrality contract",
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "audit"}: ${issue.message}`,
      ),
    );
  const ids = result.data.items.map((entry) => entry.id);
  const missing = neutralityChecklistIds.filter((id) => !ids.includes(id));
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (missing.length || duplicates.length)
    throw new ResearchValidationError(
      "Provider audit checklist is incomplete",
      [
        ...(missing.length ? [`missing ${missing.join(", ")}`] : []),
        ...(duplicates.length
          ? [`duplicate ${[...new Set(duplicates)].join(", ")}`]
          : []),
      ],
    );
  const expectedClaims = researchSectionIds.flatMap(
    (section) => answer[section],
  );
  const expectedById = new Map(
    expectedClaims.map((claim) => [
      claim.id,
      new Map(
        claim.citations.map((citation) => [citation.id, citation.sourceId]),
      ),
    ]),
  );
  const auditedClaimIds = result.data.claimAudits.map((entry) => entry.claimId);
  const missingClaims = [...expectedById.keys()].filter(
    (id) => !auditedClaimIds.includes(id),
  );
  const extraClaims = auditedClaimIds.filter((id) => !expectedById.has(id));
  const duplicateClaims = auditedClaimIds.filter(
    (id, index) => auditedClaimIds.indexOf(id) !== index,
  );
  const claimIssues: string[] = [];
  for (const checklistItem of result.data.items) {
    const unknownClaimIds = checklistItem.claimIds.filter(
      (claimId) => !expectedById.has(claimId),
    );
    const duplicateClaimIds = checklistItem.claimIds.filter(
      (claimId, index) => checklistItem.claimIds.indexOf(claimId) !== index,
    );
    if (unknownClaimIds.length)
      claimIssues.push(
        `${checklistItem.id} references unknown claims ${[
          ...new Set(unknownClaimIds),
        ].join(", ")}`,
      );
    if (duplicateClaimIds.length)
      claimIssues.push(
        `${checklistItem.id} repeats claims ${[
          ...new Set(duplicateClaimIds),
        ].join(", ")}`,
      );
    if (checklistItem.passed && checklistItem.claimIds.length)
      claimIssues.push(
        `${checklistItem.id} passes but still identifies flagged claims`,
      );
    if (!checklistItem.passed && checklistItem.claimIds.length === 0)
      claimIssues.push(`${checklistItem.id} fails without identifying a claim`);
  }
  if (missingClaims.length)
    claimIssues.push(`missing claim audits ${missingClaims.join(", ")}`);
  if (extraClaims.length)
    claimIssues.push(
      `unknown claim audits ${[...new Set(extraClaims)].join(", ")}`,
    );
  if (duplicateClaims.length)
    claimIssues.push(
      `duplicate claim audits ${[...new Set(duplicateClaims)].join(", ")}`,
    );
  for (const audit of result.data.claimAudits) {
    const expectedCitations = expectedById.get(audit.claimId);
    if (!expectedCitations) continue;
    const citationIds = audit.citationAudits.map((item) => item.citationId);
    const duplicateCitationIds = citationIds.filter(
      (id, index) => citationIds.indexOf(id) !== index,
    );
    const missingCitationIds = [...expectedCitations.keys()].filter(
      (id) => !citationIds.includes(id),
    );
    const extraCitationIds = citationIds.filter(
      (id) => !expectedCitations.has(id),
    );
    if (missingCitationIds.length)
      claimIssues.push(
        `${audit.claimId} missing citation audits ${missingCitationIds.join(", ")}`,
      );
    if (extraCitationIds.length)
      claimIssues.push(
        `${audit.claimId} has unknown citation audits ${[
          ...new Set(extraCitationIds),
        ].join(", ")}`,
      );
    if (duplicateCitationIds.length)
      claimIssues.push(
        `${audit.claimId} has duplicate citation audits ${[
          ...new Set(duplicateCitationIds),
        ].join(", ")}`,
      );
    for (const citationAudit of audit.citationAudits) {
      const expectedSourceId = expectedCitations.get(citationAudit.citationId);
      if (expectedSourceId && expectedSourceId !== citationAudit.sourceId)
        claimIssues.push(
          `${audit.claimId} citation ${citationAudit.citationId} must audit source ${expectedSourceId}`,
        );
    }
    const checksPassed =
      audit.citationAudits.every((item) => item.entailed) &&
      audit.inScope &&
      audit.sourceRoleValid &&
      audit.confidenceValid;
    if (audit.passed !== checksPassed)
      claimIssues.push(
        `${audit.claimId} passed flag is inconsistent with its four checks`,
      );
  }
  if (claimIssues.length)
    throw new ResearchValidationError(
      "Provider claim audit is incomplete or inconsistent",
      claimIssues,
    );
  const allPassed =
    result.data.items.every((entry) => entry.passed) &&
    result.data.claimAudits.every((entry) => entry.passed);
  if ((result.data.verdict === "pass") !== allPassed)
    throw new ResearchValidationError(
      "Provider audit verdict is inconsistent",
      [
        "verdict must be pass if and only if every checklist item and claim audit passes",
      ],
    );
  return {
    provider,
    passed: result.data.verdict === "pass",
    items: result.data.items,
    claimAudits: result.data.claimAudits,
  };
}
