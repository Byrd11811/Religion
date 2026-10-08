import type { Collection, SearchHit } from "@/packages/shared/types";
import { editions } from "@/packages/shared/catalog";
import { protocolDecision } from "@/packages/shared/protocols";
export function exportableCollection(c: Collection): Collection {
  return { ...c, items: c.items.filter((item) => protocolDecision(item.id, "export").allowed) };
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
