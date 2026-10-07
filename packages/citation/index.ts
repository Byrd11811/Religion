import type { Collection, SearchHit } from "@/packages/shared/types";
import { editions } from "@/packages/shared/catalog";
export function cite(p: SearchHit) {
  const edition = editions.find((item) => item.id === p.editionId);
  const role = edition?.language.toLowerCase().includes("transliteration")
    ? "Composite transliteration ed."
    : "Trans.";
  return `${p.textTitle}. ${role} ${p.translator}. ${p.reference} (${p.editionId}; ${edition?.language ?? "language unavailable"}). ${p.sourceUrl}. Atlas locator: ${p.id}.`;
}
export function exportMarkdown(c: Collection) {
  return (
    `# ${c.name}\n\n${c.notes}\n\n` +
    c.items
      .map(
        (i) =>
          `## ${i.title}\n\n${i.content}\n\n${i.sourceUrl ? `Source: ${i.sourceUrl}\n` : ""}`,
      )
      .join("\n")
  );
}
export function exportCsv(c: Collection) {
  const cell = (s: string) =>
    `"${(/^[=+@-]/.test(s) ? "'" : "") + s.replaceAll('"', '""')}"`;
  return [
    ["Title", "Type", "Content", "Source"],
    ...c.items.map((i) => [i.title, i.kind, i.content, i.sourceUrl ?? ""]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
