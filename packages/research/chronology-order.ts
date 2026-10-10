import type { TextRecord } from "@/packages/shared/types";

export type ChronologyDirection = "earlier" | "later";

/**
 * Order dated works in the requested direction while keeping unknown dates at
 * the end. An unknown date must never be presented as the earliest or latest.
 */
export function orderTextsByCompositionDate<
  T extends Pick<TextRecord, "id" | "startDate">,
>(items: readonly T[], direction: ChronologyDirection): T[] {
  return [...items].sort((left, right) => {
    if (left.startDate === null && right.startDate === null)
      return left.id.localeCompare(right.id);
    if (left.startDate === null) return 1;
    if (right.startDate === null) return -1;
    const dateOrder =
      direction === "earlier"
        ? left.startDate - right.startDate
        : right.startDate - left.startDate;
    return dateOrder || left.id.localeCompare(right.id);
  });
}
