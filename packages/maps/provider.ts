import type { ExplorationRecord } from "../shared/exploration";

export interface MapHandle {
  update(records: ExplorationRecord[]): void;
  destroy(): void;
}
export interface MapProvider {
  label: string;
  create(
    element: HTMLElement,
    onSelect: (records: ExplorationRecord[]) => void,
    onError: (message: string) => void,
    signal: AbortSignal,
  ): Promise<MapHandle>;
}
