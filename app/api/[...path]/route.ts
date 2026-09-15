import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  texts,
  traditions,
  editions,
  relationships,
  artifacts,
} from "@/packages/shared/catalog";
import { themes, concepts } from "@/packages/ontology";
import { allPassages, search } from "@/packages/search";
import { hybridSearch } from "@/packages/search/hybrid";
import { federatedSearch } from "@/packages/search/federated";
import { answerQuestion } from "@/packages/ai";
import { comparisonCases } from "@/packages/ai/guides";
import { getCollections, mutateCollections } from "@/packages/db/collections";
import { randomUUID } from "node:crypto";
import { database } from "@/packages/db/client";
import { readTaxonomy } from "@/packages/db/taxonomy";
import { createManifest } from "@/packages/shared/iiif";
import { explorationRecords } from "@/packages/shared/exploration-catalog";
import { explorationScope } from "@/packages/shared/exploration";
import { parseExplorationQuery } from "@/packages/shared/exploration-query";
import {
  coverageStatuses,
  witnesses,
  museumArtifacts,
  archiveImages,
} from "@/packages/shared/archive";
export const runtime = "nodejs";
type Context = { params: Promise<{ path: string[] }> };
const finding = z.object({
  id: z.string().max(100),
  kind: z.enum(["text", "passage", "query", "comparison"]),
  title: z.string().max(500),
  content: z.string().max(60000),
  sourceUrl: z
    .string()
    .url()
    .regex(/^https?:\/\//)
    .optional(),
  createdAt: z.string(),
});
const send = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const [route, id] = (await params).path;
    const q = req.nextUrl.searchParams;
    switch (route) {
      case "taxonomy":
        return send(await readTaxonomy(await database()));
      case "iiif": {
        const artifact = museumArtifacts.find((a) => a.id === id);
        const images = archiveImages.filter(
          (i) =>
            i.artifactId === id && i.publicDomain && i.rights.includes("CC0"),
        );
        return artifact && images.length
          ? send(
              createManifest(
                `${req.nextUrl.origin}/api/iiif/${encodeURIComponent(id)}`,
                artifact.title,
                images,
              ),
            )
          : send({ error: "No verified manifest available" }, 404);
      }
      case "works": {
        const db = await database();
        if (id) {
          const result = await db.query<{ metadata: unknown }>(
            "SELECT metadata FROM works WHERE id=$1 AND access <> 'Restricted'",
            [id],
          );
          return result.rows.length
            ? send(result.rows[0].metadata)
            : send({ error: "Work not found" }, 404);
        }
        const page = Number(q.get("page") ?? 0),
          coverage = q.get("coverage") ?? "",
          query = q.get("q") ?? "";
        if (
          !Number.isSafeInteger(page) ||
          page < 0 ||
          page > 10000000 ||
          query.length > 500 ||
          (coverage && !coverageStatuses.some((s) => s === coverage))
        )
          return send({ error: "Invalid archive filters" }, 400);
        const values = [`%${query.replace(/[\\%_]/g, "\\$&")}%`, coverage];
        const where =
          "access <> 'Restricted' AND title ILIKE $1 AND ($2='' OR coverage_status=$2)";
        const count = await db.query<{ total: number }>(
          `SELECT count(*)::int AS total FROM works WHERE ${where}`,
          values,
        );
        const rows = await db.query<{ metadata: unknown }>(
          `SELECT metadata FROM works WHERE ${where} ORDER BY lower(title),id LIMIT 24 OFFSET $3`,
          [...values, page * 24],
        );
        return send({
          items: rows.rows.map((r) => r.metadata),
          total: count.rows[0].total,
          page,
        });
      }
      case "witnesses":
        return id
          ? witnesses.some((w) => w.id === id && w.access !== "Restricted")
            ? send(witnesses.find((w) => w.id === id))
            : send({ error: "Witness not found" }, 404)
          : send(witnesses.filter((w) => w.access !== "Restricted"));
      case "artifacts":
        return id
          ? museumArtifacts.some((a) => a.id === id)
            ? send(museumArtifacts.find((a) => a.id === id))
            : send({ error: "Artifact not found" }, 404)
          : send(museumArtifacts);
      case "archive-images":
        return send(archiveImages);
      case "texts":
        return id
          ? texts.find((t) => t.id === id)
            ? send({
                text: texts.find((t) => t.id === id),
                editions: editions.filter((e) => e.textId === id),
              })
            : send({ error: "Text not found" }, 404)
          : send(texts);
      case "traditions":
        return id
          ? send(traditions.find((t) => t.id === id) ?? null)
          : send(traditions);
      case "themes":
        return send(themes);
      case "concepts":
        return send(concepts);
      case "images":
        return send(artifacts);
      case "timeline":
      case "map": {
        const parsed = parseExplorationQuery(q);
        if (!parsed.success)
          return send(
            {
              error: "Invalid exploration filters",
              details: parsed.error.flatten(),
            },
            400,
          );
        const p = parsed.data;
        const scope = explorationScope(explorationRecords, {
          kind: p.layer,
          year: p.year,
          traditionId: p.tradition,
          region: p.region,
          geography: p.geography,
          includeUndated: p.undated,
          fullText: p.fullText,
          images: p.images,
        });
        if (p.view === "coverage")
          return send({
            records: scope.inPeriod,
            mappedIds: scope.mapped.map((r) => r.id),
            undatedIds: scope.undated.map((r) => r.id),
            coverage: {
              scoped: scope.scoped.length,
              dated: scope.dated.length,
              undated: scope.undated.length,
              mapped: scope.mapped.length,
              unlocated: scope.unlocated.length,
              afterYear: scope.afterYear.length,
            },
            includesUndated: p.undated,
            limitations:
              "Approximate editorial anchors only; unknown dates and coordinates remain unknown. Political borders and religious influence are not supplied by these records.",
          });
        if (p.layer !== "work")
          return send(
            { error: "Use view=coverage for typed non-work records" },
            400,
          );
        const ids = new Set(
          (route === "map" ? scope.mapped : scope.inPeriod).map((r) =>
            r.id.slice(5),
          ),
        );
        return send(texts.filter((t) => ids.has(t.id)));
      }
      case "graph":
        return send(relationships);
      case "search": {
        const contentType = q.getAll("contentType");
        const validContentTypes = [
          "Primary text",
          "Translator note",
          "Editorial introduction",
          "Scholarly commentary",
          "Footnote",
          "Appendix",
          "Unknown",
        ] as const;
        const validContentTypeSet = new Set<string>(validContentTypes);
        if (contentType.some((type) => !validContentTypeSet.has(type)))
          return send({ error: "Invalid content type" }, 400);
        return send(
          await hybridSearch(q.get("q") ?? "", {
            textIds: q.getAll("text"),
            editionIds: q.getAll("edition"),
            traditions: q.getAll("tradition"),
            limit: Math.min(Number(q.get("limit")) || 24, 100),
            exact: q.get("exact") === "true",
            contentTypes: contentType as (typeof validContentTypes)[number][],
            preferPrimary: q.get("preferPrimary") !== "false",
          }),
        );
      }
      case "federated-search": {
        const mode = q.get("mode") ?? "Broad";
        const validModes = [
          "Broad",
          "Scholarly",
          "Opposition",
          "Deep Archive",
          "Manuscripts",
        ] as const;
        if (!new Set<string>(validModes).has(mode))
          return send({ error: "Invalid search mode" }, 400);
        const validTypes = [
          "work",
          "tradition",
          "subtradition",
          "person",
          "concept",
          "witness",
          "artifact",
        ] as const;
        const types = q.getAll("type");
        if (types.some((type) => !new Set<string>(validTypes).has(type)))
          return send({ error: "Invalid entity type" }, 400);
        const items = federatedSearch(q.get("q") ?? "", {
          mode: mode as (typeof validModes)[number],
          types: types as (typeof validTypes)[number][],
          limit: Math.min(Number(q.get("limit")) || 30, 100),
        });
        return send({
          items,
          total: items.length,
          counts: Object.fromEntries(
            validTypes.map((type) => [
              type,
              items.filter((item) => item.type === type).length,
            ]),
          ),
        });
      }
      case "passages": {
        if (id) {
          const p = allPassages().find((p) => p.id === id);
          return p ? send(p) : send({ error: "Passage not found" }, 404);
        }
        const filtered = allPassages().filter(
          (p) => p.editionId === q.get("edition"),
        );
        const page = Math.max(0, Number(q.get("page")) || 0);
        return send({
          total: filtered.length,
          passages: filtered.slice(page * 20, (page + 1) * 20),
        });
      }
      case "collections": {
        const all = await getCollections();
        return id
          ? all.find((c) => c.id === id)
            ? send(all.find((c) => c.id === id))
            : send({ error: "Collection not found" }, 404)
          : send(all);
      }
      case "health":
        return send({
          status: "ok",
          texts: texts.length,
          editions: editions.length,
          works: new Set(editions.map((e) => e.textId)).size,
          passages: allPassages().length,
          modelConfigured: !!(
            process.env.ATLAS_LLM_API_KEY && process.env.ATLAS_LLM_MODEL
          ),
          storage: process.env.ATLAS_DATABASE_URL
            ? "PostgreSQL"
            : "Embedded PostgreSQL (PGlite)",
        });
      default:
        return send({ error: "Endpoint not found" }, 404);
    }
  } catch {
    return send({ error: "Unable to read atlas data" }, 500);
  }
}
export async function POST(req: NextRequest, { params }: Context) {
  try {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host"))
      return send({ error: "Cross-origin writes are not allowed" }, 403);
    const raw = await req.text();
    if (raw.length > 250000) return send({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    const [route] = (await params).path;
    if (route === "query") {
      const data = z
        .object({
          question: z.string().trim().min(3).max(1000),
          traditions: z.array(z.string()).max(26).optional(),
          textIds: z.array(z.string()).max(12).optional(),
          before: z.number().optional(),
          after: z.number().optional(),
          region: z.string().optional(),
        })
        .parse(body);
      return send(await answerQuestion(data.question, data));
    }
    if (["compare", "similarity", "contradictions"].includes(route)) {
      const data = z
        .object({
          textIds: z.array(z.string()).min(2).max(12),
          theme: z.string().max(200).default("soul"),
        })
        .parse(body);
      const selected = texts.filter((t) => data.textIds.includes(t.id));
      if (selected.length !== new Set(data.textIds).size)
        return send({ error: "Unknown text selection" }, 400);
      return send({
        texts: selected,
        cases: comparisonCases(data.textIds, data.theme),
        passages: selected.map((t) => ({
          textId: t.id,
          passages: search(data.theme, { textIds: [t.id], limit: 2 }),
        })),
        relationships: relationships.filter(
          (r) =>
            data.textIds.includes(r.source) || data.textIds.includes(r.target),
        ),
        note: "Retrieved parallels are reading aids. Doctrinal contradiction and historical influence require interpretation and supporting evidence.",
      });
    }
    if (route === "collections") {
      const data = z
        .object({ name: z.string().trim().min(1).max(120) })
        .parse(body);
      const now = new Date().toISOString();
      const c = {
        id: randomUUID(),
        name: data.name,
        notes: "",
        items: [],
        createdAt: now,
        updatedAt: now,
      };
      await mutateCollections((all) => [...all, c]);
      return send(c, 201);
    }
    return send({ error: "Endpoint not found" }, 404);
  } catch (error) {
    return send(
      {
        error:
          error instanceof z.ZodError
            ? "Please check the supplied fields"
            : "Unable to process request",
      },
      400,
    );
  }
}
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host"))
      return send({ error: "Cross-origin writes are not allowed" }, 403);
    const [route, id] = (await params).path;
    if (route !== "collections")
      return send({ error: "Endpoint not found" }, 404);
    const raw = await req.text();
    if (raw.length > 250000) return send({ error: "Request too large" }, 413);
    const data = z
      .object({
        name: z.string().trim().min(1).max(120).optional(),
        notes: z.string().max(100000).optional(),
        add: finding.optional(),
        remove: z.string().optional(),
      })
      .parse(JSON.parse(raw));
    let found = false;
    const all = await mutateCollections((all) =>
      all.map((c) => {
        if (c.id !== id) return c;
        found = true;
        return {
          ...c,
          name: data.name ?? c.name,
          notes: data.notes ?? c.notes,
          items: data.add
            ? [...c.items.filter((i) => i.id !== data.add!.id), data.add]
            : data.remove
              ? c.items.filter((i) => i.id !== data.remove)
              : c.items,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    return found
      ? send(all.find((c) => c.id === id))
      : send({ error: "Collection not found" }, 404);
  } catch {
    return send({ error: "Unable to update collection" }, 400);
  }
}
export async function DELETE(req: NextRequest, { params }: Context) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host"))
    return send({ error: "Cross-origin writes are not allowed" }, 403);
  const [route, id] = (await params).path;
  if (route !== "collections" || !id) return send({ error: "Not found" }, 404);
  await mutateCollections((all) => all.filter((c) => c.id !== id));
  return send({ ok: true });
}
