import data from "@/data/seed/indigenous-collections.json";
import additions from "@/data/seed/indigenous-additions.json";

export type ProtocolAction = "display" | "search" | "export" | "ai" | "cache";
export interface CulturalProtocol {
  id: string;
  workId: string;
  communityAuthority: string;
  region: string;
  recorderContext: string;
  protocolStatus: string;
  displayPolicy: "metadata-only" | "public" | "blocked";
  searchPolicy: "metadata-only" | "public" | "blocked";
  exportPolicy: "metadata-only" | "public" | "blocked";
  aiPolicy: "metadata-only" | "public" | "blocked";
  cachePolicy: "metadata-only" | "public" | "blocked";
  sourceUrl: string;
  reviewNote: string;
}

export const culturalProtocols = [
  ...(data.culturalProtocols as CulturalProtocol[]),
  ...(additions.culturalProtocols as CulturalProtocol[]),
];
export const protocolForWork = (workId: string) =>
  culturalProtocols.find((protocol) => protocol.workId === workId);

export function protocolDecision(workId: string, action: ProtocolAction) {
  const protocol = protocolForWork(workId);
  if (!protocol)
    return {
      allowed: true,
      metadataAllowed: true,
      level: "public" as const,
      protocol: null,
    };
  const level = protocol[`${action}Policy` as const];
  return {
    allowed: level === "public",
    metadataAllowed: level !== "blocked",
    level,
    protocol,
  };
}

export function assertProtocolAllows(workId: string, action: ProtocolAction) {
  const decision = protocolDecision(workId, action);
  if (!decision.allowed)
    throw new Error(
      `${action} blocked pending community protocol review for ${workId}`,
    );
  return decision;
}

function normalizedProtocolText(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function mentionsWorkId(value: string, workId: string) {
  const normalized = normalizedProtocolText(value);
  return (
    normalized === workId ||
    normalized.startsWith(`${workId}-`) ||
    normalized.endsWith(`-${workId}`) ||
    normalized.includes(`-${workId}-`)
  );
}

/**
 * Inspect arbitrary persisted/exported data, including JSON stored inside a
 * string field. This is deliberately recursive because comparison and query
 * findings are saved as serialized response objects.
 */
export function payloadProtocolViolations(
  payload: unknown,
  action: ProtocolAction,
): string[] {
  const blockedWorkIds = culturalProtocols
    .map(({ workId }) => workId)
    .filter((workId) => !protocolDecision(workId, action).allowed);
  const violations = new Set<string>();
  const seen = new WeakSet<object>();

  const visit = (value: unknown, depth: number) => {
    if (depth > 24 || value === null || value === undefined) return;
    if (typeof value === "string") {
      for (const workId of blockedWorkIds)
        if (mentionsWorkId(value, workId)) violations.add(workId);
      const trimmed = value.trim();
      if (
        trimmed.length > 1 &&
        ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
          (trimmed.startsWith("[") && trimmed.endsWith("]")))
      ) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {
          // It is ordinary prose rather than a serialized nested payload.
        }
      }
      return;
    }
    if (typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    for (const [key, item] of Object.entries(value)) {
      visit(key, depth + 1);
      visit(item, depth + 1);
    }
  };

  visit(payload, 0);
  return [...violations].sort();
}

export function payloadProtocolAllowed(
  payload: unknown,
  action: ProtocolAction,
) {
  return payloadProtocolViolations(payload, action).length === 0;
}

export function assertPayloadProtocols(
  payload: unknown,
  action: ProtocolAction,
) {
  const violations = payloadProtocolViolations(payload, action);
  if (violations.length)
    throw new Error(
      `${action} blocked pending community protocol review for ${violations.join(", ")}`,
    );
}
