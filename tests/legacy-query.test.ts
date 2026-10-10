import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/[...path]/route";
import type { SearchHit } from "../packages/shared/types";

type FetchCall = { input: string; init?: RequestInit };

async function withConfiguredLegacyProvider<T>(
  callback: (calls: FetchCall[]) => Promise<T>,
) {
  const previous = {
    base: process.env.ATLAS_LLM_BASE_URL,
    key: process.env.ATLAS_LLM_API_KEY,
    model: process.env.ATLAS_LLM_MODEL,
    fetch: globalThis.fetch,
  };
  const calls: FetchCall[] = [];
  process.env.ATLAS_LLM_BASE_URL = "https://provider.invalid/v1";
  process.env.ATLAS_LLM_API_KEY = "test-key";
  process.env.ATLAS_LLM_MODEL = "legacy-test-model";
  globalThis.fetch = async (input, init) => {
    calls.push({ input: String(input), init });
    // This exact-ID claim plus a global PASS would have cleared the retired
    // legacy provider's two coarse checks despite lacking claim-level audits.
    const response =
      calls.length === 1
        ? "Death is interpreted as transition [pg-10-genesis-520]"
        : "PASS";
    return new Response(
      JSON.stringify({ choices: [{ message: { content: response } }] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    return await callback(calls);
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [key, value] of [
      ["ATLAS_LLM_BASE_URL", previous.base],
      ["ATLAS_LLM_API_KEY", previous.key],
      ["ATLAS_LLM_MODEL", previous.model],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function postLegacyQuery(body: unknown) {
  const request = new NextRequest("http://127.0.0.1:3000/api/query", {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return POST(request, {
    params: Promise.resolve({ path: ["query"] }),
  });
}

test("legacy /api/query never sends Unknown passages to a configured provider", async () => {
  await withConfiguredLegacyProvider(async (calls) => {
    const response = await postLegacyQuery({
      question: "mighty",
      textIds: ["setna-i-magic-book"],
      contentTypes: ["Unknown"],
    });
    assert.equal(response.status, 200);
    const answer = await response.json();
    assert.ok(answer.passages.length > 0);
    assert.ok(
      answer.passages.every(
        (passage: SearchHit) => passage.contentType === "Unknown",
      ),
    );
    assert.equal(answer.synthesis, undefined);
    assert.equal(calls.length, 0);
  });
});

test("legacy provider PASS output cannot bypass the structured audit on /api/query", async () => {
  await withConfiguredLegacyProvider(async (calls) => {
    const response = await postLegacyQuery({
      question: "What happens after death?",
    });
    assert.equal(response.status, 200);
    const answer = await response.json();
    assert.equal(answer.mode, "Local evidence explorer");
    assert.equal(answer.synthesis, undefined);
    assert.equal(calls.length, 0);
  });
});
