import type {
  SacredCurrentsConnection,
  SacredCurrentsRecord,
  SacredCurrentsScene,
  SacredCurrentsStream,
} from "@/packages/shared/sacred-currents";

export type SacredCurrentsMode =
  "explore" | "trace" | "compare" | "guided" | "change";
export type SacredCurrentsView = "map" | "timeline";
export type CurrentsLayer = "work" | "witness" | "artifact" | "tradition";
export type CurrentsRecord = SacredCurrentsRecord;
export type CurrentsStream = SacredCurrentsStream;
export type CurrentsConnection = SacredCurrentsConnection;
export type CurrentsScene = SacredCurrentsScene;

export interface CurrentsSelection {
  recordIds: string[];
  connectionId: string | null;
}

export interface GuidedChapter {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  relationshipId: string | null;
  recordIds: string[];
  note: string;
}

export const layerLabels: Record<CurrentsLayer, string> = {
  work: "Work origins",
  witness: "Physical witnesses",
  artifact: "Museum objects",
  tradition: "Tradition groupings",
};
