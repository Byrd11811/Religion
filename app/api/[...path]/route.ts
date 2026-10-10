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
import { allPassages } from "@/packages/search";
import {
  assertPayloadProtocols,
  protocolDecision,
} from "@/packages/shared/protocols";
import { hybridSearch } from "@/packages/search/hybrid";
import { federatedSearch } from "@/packages/search/federated";
import { answerEvidenceOnlyQuestion } from "@/packages/ai";
import { configuredResearchProvider } from "@/packages/ai/compatible-research-provider";
import { prepareResearchQuestion } from "@/packages/ai/research-query";
import { createQuestionNdjsonStream } from "@/packages/ai/stream";
import {
  comparisonModes,
  findOpposition,
  findTeachingConductCases,
  runComparison,
} from "@/packages/research";
import { buildLegacyComparisonSections } from "@/packages/research/legacy-comparison";
import {
  researchSources,
  type ResearchConfidence,
} from "@/packages/shared/research-engines";
import { getCollections, mutateCollections } from "@/packages/db/collections";
import { randomUUID } from "node:crypto";
import { database } from "@/packages/db/client";
import { readTaxonomy } from "@/packages/db/taxonomy";
import {
  readConcept,
  readEntity,
  readEntityOccurrences,
  readEvolution,
  readOntology,
} from "@/packages/db/ontology";
import { createManifest } from "@/packages/shared/iiif";
import { findingRightsAllowed } from "@/packages/citation";
import { explorationRecords } from "@/packages/shared/exploration-catalog";
import { explorationScope } from "@/packages/shared/exploration";
import { parseExplorationQuery } from "@/packages/shared/exploration-query";
import {
  archiveImageDisplayAllowed,
  coverageStatuses,
  witnesses,
  museumArtifacts,
  archiveImages,
} from "@/packages/shared/archive";
import { passageAiRightsAllowed } from "@/packages/shared/rights";
export const runtime = "nodejs";
type Context = { params: Promise<{ path: string[] }> };
const finding = z.object({
  id: z.string().max(100),
  kind: z.enum(["text", "passage", "query", "comparison"]),
  textId: z.string().max(160).optional(),
  editionId: z.string().max(160).optional(),
  title: z.string().max(500),
  content: z.string().max(60000),
  sourceUrl: z
    .string()
    .url()
    .regex(/^https?:\/\//)
    .optional(),
  createdAt: z.string(),
}).superRefine((value, context) => {
  if (
    value.kind === "passage" &&
    (!value.textId || !value.editionId)
  )
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passage findings require canonical work and edition IDs",
    });
});
const send = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });
const questionRequest = z.object({
  question: z.string().trim().min(3).max(1000),
  traditions: z.array(z.string()).max(26).optional(),
  textIds: z.array(z.string()).max(12).optional(),
  editionIds: z.array(z.string()).max(24).optional(),
  contentTypes: z
    .array(
      z.enum([
        "Primary text",
        "Translator note",
        "Editorial introduction",
        "Scholarly commentary",
        "Footnote",
        "Appendix",
        "Unknown",
      ]),
    )
    .max(7)
    .optional(),
  before: z.number().optional(),
  after: z.number().optional(),
  region: z.string().max(200).optional(),
});
const researchScopeRequest = z.object({
  textIds: z.array(z.string().max(160)).max(12).optional(),
  traditionIds: z.array(z.string().max(120)).max(30).optional(),
  regions: z.array(z.string().max(120)).max(30).optional(),
  sourceIds: z.array(z.string().max(160)).max(50).optional(),
  sourceKinds: z.array(z.string().max(160)).max(30).optional(),
  beforeYear: z.number().int().min(-10000).max(3000).optional(),
  afterYear: z.number().int().min(-10000).max(3000).optional(),
  minConfidence: z.enum(["high", "medium", "low", "contested"]).optional(),
  contentTypes: z
    .array(
      z.enum([
        "Primary text",
        "Translator note",
        "Editorial introduction",
        "Scholarly commentary",
        "Footnote",
        "Appendix",
        "Unknown",
      ]),
    )
    .max(7)
    .optional(),
});

function engineSources(sourceIds: string[]) {
  const ids = new Set(sourceIds);
  return researchSources.filter((source) => ids.has(source.id));
}

function ndjsonResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function preparedQuestionStream(
  data: z.infer<typeof questionRequest>,
  requestSignal: AbortSignal,
) {
  const encoder = new TextEncoder();
  const controller = new AbortController();
  const signal = AbortSignal.any([requestSignal, controller.signal]);
  let innerReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const line = (value: unknown) => encoder.encode(`${JSON.stringify(value)}\n`);

  return new ReadableStream<Uint8Array>({
    start(stream) {
      stream.enqueue(
        line({
          type: "status",
          stage: "retrieval-started",
          message:
            "Applying source scope and retrieving canonical evidence before synthesis.",
        }),
      );
      if (signal.aborted) {
        stream.close();
        return;
      }
      void (async () => {
        try {
          const prepared = await prepareResearchQuestion(
            data.question,
            data,
            signal,
          );
          if (prepared.kind === "unresolved-safeguard") {
            stream.enqueue(
              line({
                type: "status",
                stage: "safeguard-applied",
                message:
                  "Unresolved-corpus safeguard applied; no canonical source span was emitted or claimed as verified evidence.",
              }),
            );
            stream.enqueue(line({ type: "complete", result: prepared.result }));
            stream.close();
            return;
          }
          innerReader = createQuestionNdjsonStream({
            question: data.question,
            evidence: prepared.evidence,
            provider: configuredResearchProvider(),
            signal,
          }).getReader();
          while (true) {
            const chunk = await innerReader.read();
            if (chunk.done) break;
            stream.enqueue(chunk.value);
          }
          stream.close();
        } catch (error) {
          if (!signal.aborted) stream.error(error);
          else {
            try {
              stream.close();
            } catch {
              // The consumer may already have cancelled the stream.
            }
          }
        }
      })();
    },
    async cancel(reason) {
      controller.abort(
        reason ?? new DOMException("Stream consumer cancelled", "AbortError"),
      );
      await innerReader?.cancel(reason);
    },
  });
}
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const [route, id, subroute] = (await params).path;
    const q = req.nextUrl.searchParams;
    switch (route) {
      case "taxonomy":
        return send(await readTaxonomy(await database()));
      case "ontology":
        return send(await readOntology(await database()));
      case "iiif": {
        const artifact = museumArtifacts.find((a) => a.id === id);
        const images = archiveImages.filter(
          (i) =>
            i.artifactId === id && archiveImageDisplayAllowed(i),
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
        return send(archiveImages.filter(archiveImageDisplayAllowed));
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
      case "concepts": {
        if (!id) return send(concepts);
        const result = await readConcept(await database(), id);
        return result
          ? send(result)
          : send({ error: "Concept not found" }, 404);
      }
      case "entities": {
        if (!id) return send({ error: "Entity ID is required" }, 400);
        if (subroute && subroute !== "occurrences")
          return send({ error: "Endpoint not found" }, 404);
        const result = subroute
          ? await readEntityOccurrences(await database(), id)
          : await readEntity(await database(), id);
        return result ? send(result) : send({ error: "Entity not found" }, 404);
      }
      case "evolution": {
        if (!id) return send({ error: "Entity or path ID is required" }, 400);
        const result = await readEvolution(await database(), id);
        return result
          ? send(result)
          : send({ error: "Evolution path not found" }, 404);
      }
      case "images":
        return send(
          artifacts.filter((artifact) =>
            archiveImages.some(
              (image) =>
                image.artifactId === artifact.id &&
                archiveImageDisplayAllowed(image),
            ),
          ),
        );
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
        const limitValue = q.get("limit");
        const limit = limitValue === null ? 24 : Number(limitValue);
        const beforeValue = q.get("before");
        const afterValue = q.get("after");
        const before = beforeValue === null ? undefined : Number(beforeValue);
        const after = afterValue === null ? undefined : Number(afterValue);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100)
          return send({ error: "Search limit must be an integer from 1 to 100" }, 400);
        if (
          (before !== undefined &&
            (!Number.isFinite(before) || before < -10000 || before > 3000)) ||
          (after !== undefined &&
            (!Number.isFinite(after) || after < -10000 || after > 3000))
        )
          return send({ error: "Invalid search date boundary" }, 400);
        const region = q.get("region") ?? undefined;
        if (region && region.length > 200)
          return send({ error: "Search region is too long" }, 400);
        return send(
          await hybridSearch(q.get("q") ?? "", {
            textIds: q.getAll("text"),
            editionIds: q.getAll("edition"),
            traditions: q.getAll("tradition"),
            region,
            before,
            after,
            limit,
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
          "entity",
          "unresolved-corpus",
          "witness",
          "artifact",
        ] as const;
        const types = q.getAll("type");
        if (types.some((type) => !new Set<string>(validTypes).has(type)))
          return send({ error: "Invalid entity type" }, 400);
        const rights = q.get("rights") ?? "";
        const validRights = [
          "Public-domain text",
          "Public metadata",
          "Rights review required",
        ] as const;
        if (rights && !new Set<string>(validRights).has(rights))
          return send({ error: "Invalid rights filter" }, 400);
        const confidence = q.get("confidence") ?? "";
        const validConfidence = [
          "Reviewed",
          "Provisional",
          "Unreviewed",
        ] as const;
        if (confidence && !new Set<string>(validConfidence).has(confidence))
          return send({ error: "Invalid confidence filter" }, 400);
        const items = federatedSearch(q.get("q") ?? "", {
          mode: mode as (typeof validModes)[number],
          types: types as (typeof validTypes)[number][],
          region: q.get("region") ?? undefined,
          language: q.get("language") ?? undefined,
          canon: q.get("canon") ?? undefined,
          rights: rights ? (rights as (typeof validRights)[number]) : undefined,
          confidence: confidence
            ? (confidence as (typeof validConfidence)[number])
            : undefined,
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
          const p = allPassages().find(
            (p) =>
              p.id === id &&
              protocolDecision(p.textId, "display").allowed &&
              passageAiRightsAllowed(p),
          );
          return p ? send(p) : send({ error: "Passage not found" }, 404);
        }
        const filtered = allPassages().filter(
          (p) =>
            p.editionId === q.get("edition") &&
            protocolDecision(p.textId, "display").allowed &&
            passageAiRightsAllowed(p),
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
    const [route, subroute] = (await params).path;
    if (route === "query" && subroute === "stream") {
      const data = questionRequest.parse(body);
      return ndjsonResponse(preparedQuestionStream(data, req.signal));
    }
    if (route === "query") {
      const data = questionRequest.parse(body);
      // This retained JSON contract has no place to preserve per-claim and
      // per-citation audits. Keep it retrieval-only; audited model synthesis is
      // available through the structured /api/query/stream contract above.
      return send(await answerEvidenceOnlyQuestion(data.question, data));
    }
    if (route === "opposition") {
      const data = z
        .object({
          propositionId: z.string().max(160).optional(),
          query: z.string().trim().max(1000).optional(),
          scope: researchScopeRequest.optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .parse(body);
      const result = findOpposition(data);
      return send({
        ...result,
        sources: engineSources(
          result.matches.flatMap((match) => [
            ...match.proposition.sourceIds,
            ...match.stances.flatMap((stance) => stance.sourceIds),
          ]),
        ),
      });
    }
    if (route === "teaching-conduct") {
      const data = z
        .object({
          caseIds: z.array(z.string().max(160)).max(20).optional(),
          scope: researchScopeRequest.optional(),
          limit: z.number().int().min(1).max(20).optional(),
        })
        .parse(body);
      const result = findTeachingConductCases(data);
      return send({
        ...result,
        sources: engineSources(result.cases.flatMap((item) => item.sourceIds)),
      });
    }
    if (["compare", "similarity", "contradictions"].includes(route)) {
      const data = z
        .object({
          textIds: z
            .array(z.string())
            .min(2)
            .max(12)
            .refine((ids) => new Set(ids).size === ids.length, {
              message: "Text selections must be unique",
            }),
          theme: z.string().max(200).default("soul"),
          mode: z.enum(comparisonModes as [string, ...string[]]).optional(),
          caseIds: z.array(z.string().max(160)).max(20).optional(),
          scope: researchScopeRequest.optional(),
          limitPerSection: z.number().int().min(1).max(100).optional(),
        })
        .parse(body);
      const selected = texts.filter((t) => data.textIds.includes(t.id));
      if (selected.length !== new Set(data.textIds).size)
        return send({ error: "Unknown text selection" }, 400);
      const requestedMode =
        route === "similarity"
          ? "similarities"
          : route === "contradictions"
            ? "contradictions"
            : (data.mode ?? "synthesize");
      const researchScope = {
        ...data.scope,
        minConfidence: data.scope?.minConfidence as
          ResearchConfidence | undefined,
      };
      const legacy = buildLegacyComparisonSections({
        textIds: data.textIds,
        theme: data.theme,
        scope: researchScope,
      });
      const scopedTextIds = legacy.texts.map(({ id }) => id);
      const engineAnalysis = runComparison(
        requestedMode as (typeof comparisonModes)[number],
        {
          caseIds: data.caseIds,
          textIds: scopedTextIds,
          theme: data.theme,
          scope: researchScope,
          limitPerSection: data.limitPerSection,
        },
      );
      return send({
        ...legacy,
        engineAnalysis,
        researchSources: engineSources(
          engineAnalysis.cases.flatMap((item) => item.sourceIds),
        ),
        note: "Retrieved parallels are reading aids. Doctrinal contradiction and historical influence require interpretation and supporting evidence.",
      });
    }
    if (route === "collections") {
      const data = z
        .object({ name: z.string().trim().min(1).max(120) })
        .parse(body);
      assertPayloadProtocols(data, "cache");
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
    // A removal must remain possible after a protocol revocation. Validate
    // only fields that can introduce or retain payload content.
    assertPayloadProtocols(
      { name: data.name, notes: data.notes, add: data.add },
      "cache",
    );
    if (data.add && !findingRightsAllowed(data.add))
      throw new Error("Finding is not eligible for storage under current rights");
    if (data.add?.kind === "passage") {
      const passage = allPassages().find(({ id }) => id === data.add!.id);
      if (
        !passage ||
        passage.textId !== data.add.textId ||
        passage.editionId !== data.add.editionId
      )
        throw new Error("Passage finding does not match a canonical passage");
    }
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
