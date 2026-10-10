import type { Collection, SearchHit } from "@/packages/shared/types";
import { editions, texts } from "@/packages/shared/catalog";
import { payloadProtocolAllowed } from "@/packages/shared/protocols";
import { aiRightsDecision } from "@/packages/shared/rights";

/** Re-evaluate saved provenance against current edition/work rights. */
export function findingRightsAllowed(item: Collection["items"][number]) {
  if (item.kind === "passage") {
    const edition = editions.find(({ id }) => id === item.editionId);
    const work = texts.find(({ id }) => id === item.textId);
    return Boolean(
      edition &&
        work &&
        edition.textId === work.id &&
        aiRightsDecision(edition.license, work.copyright).allowed,
    );
  }
  const serialized = JSON.stringify(item);
  return editions.every(
    (edition) => {
      const work = texts.find(({ id }) => id === edition.textId);
      return (
        Boolean(
          work && aiRightsDecision(edition.license, work.copyright).allowed,
        ) || !serialized.includes(edition.id)
      );
    },
  );
}
export function exportableCollection(c: Collection): Collection {
  return {
    ...c,
    name: payloadProtocolAllowed(c.name, "export")
      ? c.name
      : "Restricted collection",
    notes: payloadProtocolAllowed(c.notes, "export") ? c.notes : "",
    items: c.items.filter(
      (item) =>
        payloadProtocolAllowed(item, "export") && findingRightsAllowed(item),
    ),
  };
}
export function cite(p: SearchHit) {
  const edition = editions.find((item) => item.id === p.editionId);
  const role = edition?.language.toLowerCase().includes("transliteration")
    ? "Composite transliteration ed."
    : "Trans.";
  return `${p.textTitle}. ${role} ${p.translator}. ${p.reference} (${p.editionId}; ${edition?.language ?? "language unavailable"}). ${p.sourceUrl}. Atlas locator: ${p.id}.`;
}
export function exportMarkdown(c: Collection) {
  const safe = exportableCollection(c);
  return (
    `# ${safe.name}\n\n${safe.notes}\n\n` +
    safe.items
      .map(
        (i) =>
          `## ${i.title}\n\n${i.content}\n\n${i.sourceUrl ? `Source: ${i.sourceUrl}\n` : ""}`,
      )
      .join("\n")
  );
}
export function exportCsv(c: Collection) {
  const safe = exportableCollection(c);
  const cell = (s: string) =>
    `"${(/^[=+@-]/.test(s) ? "'" : "") + s.replaceAll('"', '""')}"`;
  return [
    ["Title", "Type", "Content", "Source"],
    ...safe.items.map((i) => [i.title, i.kind, i.content, i.sourceUrl ?? ""]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
