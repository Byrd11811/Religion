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
import { answerQuestion } from "@/packages/ai";
import { comparisonCases } from "@/packages/ai/guides";
import { getCollections, mutateCollections } from "@/packages/db/collections";
import { randomUUID } from "node:crypto";
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
      case "map":
        return send(texts.filter((t) => t.startDate !== null));
      case "graph":
        return send(relationships);
      case "search":
        return send(
          await hybridSearch(q.get("q") ?? "", {
            textIds: q.getAll("text"),
            editionIds: q.getAll("edition"),
            limit: Math.min(Number(q.get("limit")) || 24, 100),
            exact: q.get("exact") === "true",
          }),
        );
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
