import { editions, texts } from "@/packages/shared/catalog";
import type { Passage } from "@/packages/shared/types";

export interface AiRightsDecision {
  allowed: boolean;
  reason: string;
}

function normalizedRights(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase();
}

// Rights are intentionally an exact, fail-closed vocabulary. A string that
// merely contains “public domain” or “CC0” can also contain a negation,
// uncertainty, or later restriction. New source wording must be reviewed and
// added here before it can enter search, AI, saving, or export paths.
const approvedEditionRights = new Set(
  [
    "CC0 1.0 Universal · Met Open Access",
    "Project Gutenberg License; Public domain in the USA",
    "Public domain dedication: CC0 1.0 for the ORACC JSON data; source and scholarly responsibility retained.",
    "Public domain in the USA. Project Gutenberg license retained in source file; check local restrictions elsewhere.",
    "Public domain in the USA. Project Gutenberg license retained in source file; jurisdictional restrictions may differ.",
    "Public domain in the USA. Project Gutenberg license retained in the source file; check local restrictions elsewhere.",
    "Public domain in the USA. Source license retained; jurisdictional restrictions may differ.",
    "Public domain in the USA. The KJV has additional Crown-rights restrictions in the United Kingdom.",
  ].map(normalizedRights),
);

const approvedWorkRights = new Set(
  [
    "Metadata only unless an existing edition states otherwise; item-level rights still govern reproduction.",
    "ORACC JSON data released under CC0 1.0; no English translation bundled",
    "Project Gutenberg public-domain ebook (USA)",
    "Public-domain 1830 English edition and Project Gutenberg transcription in the United States; modern editions and Church site content may be protected.",
    "Public-domain English edition (USA)",
    "Public-domain English translation (USA)",
    "Work is public domain; edition rights are recorded separately",
  ].map(normalizedRights),
);

/** Require affirmative edition reuse rights and non-conflicting work rights. */
export function aiRightsDecision(
  editionLicense: string | null | undefined,
  workCopyright: string | null | undefined,
): AiRightsDecision {
  const license = normalizedRights(editionLicense);
  const copyright = normalizedRights(workCopyright);
  if (!license || !approvedEditionRights.has(license))
    return {
      allowed: false,
      reason: "Edition rights are absent, unreviewed, or restrictive.",
    };
  if (!copyright || !approvedWorkRights.has(copyright))
    return {
      allowed: false,
      reason: "Work rights are absent, unverified, or restrictive.",
    };
  return {
    allowed: true,
    reason:
      "Edition rights affirm public-domain or CC0 reuse without a conflicting work restriction.",
  };
}

export function passageAiRightsDecision(
  passage: Pick<Passage, "textId" | "editionId">,
): AiRightsDecision {
  const edition = editions.find((item) => item.id === passage.editionId);
  const work = texts.find((item) => item.id === passage.textId);
  if (!edition || !work || edition.textId !== work.id)
    return {
      allowed: false,
      reason: "The passage does not resolve to one matching work and edition.",
    };
  return aiRightsDecision(edition.license, work.copyright);
}

export function passageAiRightsAllowed(
  passage: Pick<Passage, "textId" | "editionId">,
) {
  return passageAiRightsDecision(passage).allowed;
}
