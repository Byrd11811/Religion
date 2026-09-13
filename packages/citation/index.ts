import type { Collection, SearchHit } from "@/packages/shared/types";
export function cite(p: SearchHit) {
  return `${p.textTitle}. Trans. ${p.translator}. ${p.reference} (${p.editionId}). ${p.sourceUrl}. Atlas locator: ${p.id}.`;
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
