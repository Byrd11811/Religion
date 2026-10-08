import data from "@/data/seed/indigenous-collections.json";

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

export const culturalProtocols = data.culturalProtocols as CulturalProtocol[];
export const protocolForWork = (workId: string) =>
  culturalProtocols.find((protocol) => protocol.workId === workId);

export function protocolDecision(workId: string, action: ProtocolAction) {
  const protocol = protocolForWork(workId);
  if (!protocol) return { allowed: true, metadataAllowed: true, level: "public" as const, protocol: null };
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
    throw new Error(`${action} blocked pending community protocol review for ${workId}`);
  return decision;
}
