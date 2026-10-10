import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET, POST } from "../app/api/[...path]/route";
import { filterLegacyComparisonPassages } from "../packages/research/legacy-comparison";
import { allPassages } from "../packages/search";
import { editions } from "../packages/shared/catalog";
import type { SearchHit } from "../packages/shared/types";

async function postRoute(route: string, body: unknown) {
  const request = new NextRequest(`http://127.0.0.1:3000/api/${route}`, {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return POST(request, {
    params: Promise.resolve({ path: route.split("/") }),
  });
}

async function postCompare(body: unknown) {
  const response = await postRoute("compare", body);
  assert.equal(response.status, 200);
  return response.json();
}

function comparisonItems(response: {
  engineAnalysis: {
    cases: {
      sections: { items: { sourceIds: string[]; textIds?: string[] }[] }[];
    }[];
  };
}) {
  return response.engineAnalysis.cases.flatMap((item) =>
    item.sections.flatMap((section) => section.items),
  );
}

test("compare API applies source scope to every section before limits", async () => {
  const response = await postCompare({
    textIds: [
      "bhagavad-gita",
      "ecclesiastes",
      "gospel-of-john",
      "lucretius-de-rerum-natura",
    ],
    theme: "soul",
    mode: "contradictions",
    limitPerSection: 1,
    scope: { sourceIds: ["src-gutenberg-bible"] },
  });

  const allowedTexts = new Set(["ecclesiastes", "gospel-of-john"]);
  assert.deepEqual(
    response.texts.map(({ id }: { id: string }) => id).sort(),
    [...allowedTexts].sort(),
  );
  assert.ok(
    response.passages.every(
      (row: { textId: string; passages: SearchHit[] }) =>
        allowedTexts.has(row.textId) &&
        row.passages.every(
          (passage) =>
            allowedTexts.has(passage.textId) &&
            passage.sourceUrl === "https://www.gutenberg.org/ebooks/10",
        ),
    ),
  );
  assert.ok(
    response.cases.every((item: { passages: SearchHit[] }) =>
      item.passages.every(
        (passage) =>
          allowedTexts.has(passage.textId) &&
          passage.sourceUrl === "https://www.gutenberg.org/ebooks/10",
      ),
    ),
  );
  assert.ok(
    response.relationships.every(
      (item: { source: string; target: string; sourceUrl: string }) =>
        allowedTexts.has(item.source) &&
        allowedTexts.has(item.target) &&
        item.sourceUrl === "https://www.gutenberg.org/ebooks/10",
    ),
  );
  const items = comparisonItems(response);
  assert.ok(items.length > 0);
  assert.ok(
    items.every(
      (item) =>
        item.sourceIds.every(
          (sourceId: string) => sourceId === "src-gutenberg-bible",
        ) &&
        (item.textIds ?? []).every((textId: string) =>
          allowedTexts.has(textId),
        ),
    ),
  );
  assert.equal(
    response.engineAnalysis.cases[0].sections.find(
      ({ kind }: { kind: string }) => kind === "contradictions",
    ).items[0].id,
    "con-death-ecclesiastes-john",
  );
  assert.deepEqual(
    response.researchSources.map(({ id }: { id: string }) => id),
    ["src-gutenberg-bible"],
  );
});

test("compare API fails closed across tradition, region, date, and content scopes", async () => {
  const response = await postCompare({
    textIds: [
      "gospel-of-matthew",
      "gospel-of-john",
      "dhammapada",
      "tao-te-ching",
    ],
    theme: "love",
    mode: "similarities",
    scope: {
      traditionIds: ["christianity"],
      regions: ["eastern-mediterranean"],
      afterYear: 50,
      beforeYear: 110,
      contentTypes: ["Primary text"],
    },
  });

  assert.deepEqual(response.texts.map(({ id }: { id: string }) => id).sort(), [
    "gospel-of-john",
    "gospel-of-matthew",
  ]);
  assert.ok(
    response.texts.every(
      (item: {
        traditionId: string;
        region: string;
        startDate: number;
        endDate: number;
      }) =>
        item.traditionId === "christianity" &&
        item.region === "Eastern Mediterranean" &&
        item.startDate <= 110 &&
        item.endDate >= 50,
    ),
  );
  assert.ok(
    response.passages.every(
      (row: { textId: string; passages: SearchHit[] }) =>
        ["gospel-of-john", "gospel-of-matthew"].includes(row.textId) &&
        row.passages.every((passage) => passage.contentType === "Primary text"),
    ),
  );
  assert.deepEqual(response.cases, []);
  assert.deepEqual(response.relationships, []);
  assert.deepEqual(response.engineAnalysis.cases, []);
  assert.deepEqual(response.researchSources, []);
});

test("legacy passage source filtering happens before the response limit", () => {
  const hit = (id: string, sourceUrl: string): SearchHit => ({
    id,
    textId: "ecclesiastes",
    editionId: "pg-10-ecclesiastes",
    sequence: 1,
    reference: id,
    content: "A sufficiently long synthetic comparison passage.",
    sourceUrl,
    themes: ["soul"],
    contentType: "Primary text",
    score: 1,
    textTitle: "Ecclesiastes",
    tradition: "Hebrew / Jewish Tradition",
    translator: "Fixture translator",
  });
  const distractorUrl = "https://example.invalid/out-of-scope";
  const allowedUrl = "https://www.gutenberg.org/ebooks/10";
  const ranked = [
    hit("distractor-1", distractorUrl),
    hit("distractor-2", distractorUrl),
    hit("distractor-3", distractorUrl),
    hit("allowed-1", allowedUrl),
    hit("allowed-2", allowedUrl),
    hit("allowed-3", allowedUrl),
  ];
  assert.deepEqual(
    filterLegacyComparisonPassages(
      ranked,
      {
        textIds: ["ecclesiastes"],
        sourceIds: ["src-gutenberg-bible"],
      },
      2,
    ).map(({ id }) => id),
    ["allowed-1", "allowed-2"],
  );
});

test("compare API omits culturally restricted work metadata and content", async () => {
  const response = await postCompare({
    textIds: ["popol-vuh", "genesis"],
    theme: "creation",
    mode: "synthesize",
  });

  assert.deepEqual(
    response.texts.map(({ id }: { id: string }) => id),
    ["genesis"],
  );
  assert.doesNotMatch(JSON.stringify(response), /popol[- ]vuh/iu);
});

test("compare API rejects duplicate selections and intersects explicit text scope", async () => {
  const duplicate = await postRoute("compare", {
    textIds: ["analects", "analects"],
    theme: "death",
    mode: "synthesize",
  });
  assert.equal(duplicate.status, 400);

  const response = await postCompare({
    textIds: ["analects", "dhammapada", "gospel-of-matthew"],
    theme: "death",
    mode: "synthesize",
    scope: { textIds: ["analects", "dhammapada"] },
  });
  assert.deepEqual(
    response.texts.map(({ id }: { id: string }) => id).sort(),
    ["analects", "dhammapada"],
  );
  assert.doesNotMatch(JSON.stringify(response), /gospel-of-matthew/iu);
});

test("opposition and conduct APIs honor canonical text scopes", async () => {
  const opposition = await postRoute("opposition", {
    propositionId: "prop-enemy-love",
    scope: { textIds: ["dhammapada"] },
  });
  assert.equal(opposition.status, 200);
  const oppositionBody = await opposition.json();
  assert.equal(oppositionBody.matches.length, 1);
  assert.deepEqual(oppositionBody.matches[0].proposition.sourceIds, [
    "src-gutenberg-dhammapada",
  ]);
  assert.deepEqual(
    oppositionBody.matches[0].stances.map(({ id }: { id: string }) => id),
    ["stance-dhammapada-hatred"],
  );

  const conduct = await postRoute("teaching-conduct", {
    scope: { textIds: ["dhammapada"] },
  });
  assert.equal(conduct.status, 200);
  const conductBody = await conduct.json();
  assert.deepEqual(
    conductBody.cases.map(({ id }: { id: string }) => id),
    ["tc-soto-imperial-war"],
  );

  const unmatched = await postRoute("teaching-conduct", {
    scope: { textIds: ["genesis"] },
  });
  assert.equal(unmatched.status, 200);
  assert.deepEqual((await unmatched.json()).cases, []);
});

test("search API validates and applies region, chronology, and result limits", async () => {
  async function get(url: string) {
    return GET(new NextRequest(url), {
      params: Promise.resolve({ path: ["search"] }),
    });
  }

  const invalidLimit = await get("http://127.0.0.1:3000/api/search?q=God&limit=0");
  assert.equal(invalidLimit.status, 400);

  const region = await get(
    "http://127.0.0.1:3000/api/search?q=God&region=Definitely-No-Such-Region",
  );
  assert.equal(region.status, 200);
  assert.deepEqual(await region.json(), []);

  const chronology = await get(
    "http://127.0.0.1:3000/api/search?q=God&after=2500&before=2600",
  );
  assert.equal(chronology.status, 200);
  assert.deepEqual(await chronology.json(), []);
});

test("direct passage endpoints fail closed when edition rights are revoked", async () => {
  const passage = allPassages().find(
    (item) => item.textId === "genesis" && item.editionId,
  );
  assert.ok(passage);
  const edition = editions.find((item) => item.id === passage.editionId);
  assert.ok(edition);
  const originalLicense = edition.license;
  edition.license = "Copyrighted; no AI reuse permission";
  try {
    const direct = await GET(
      new NextRequest(`http://127.0.0.1:3000/api/passages/${passage.id}`),
      { params: Promise.resolve({ path: ["passages", passage.id] }) },
    );
    assert.equal(direct.status, 404);

    const paged = await GET(
      new NextRequest(
        `http://127.0.0.1:3000/api/passages?edition=${passage.editionId}`,
      ),
      { params: Promise.resolve({ path: ["passages"] }) },
    );
    assert.equal(paged.status, 200);
    assert.equal((await paged.json()).total, 0);
  } finally {
    edition.license = originalLicense;
  }
});

test("direct passage endpoints fail closed for culturally restricted works", async () => {
  const passages = allPassages();
  const fixture = {
    id: "protocol-direct-popol-vuh",
    textId: "popol-vuh",
    editionId: "protocol-direct-edition",
    sequence: 1,
    reference: "Restricted fixture",
    content: "Restricted fixture content must never leave the passage API.",
    sourceUrl: "https://example.org/restricted",
    themes: ["creation"],
    contentType: "Primary text" as const,
  };
  passages.push(fixture);
  try {
    const direct = await GET(
      new NextRequest(`http://127.0.0.1:3000/api/passages/${fixture.id}`),
      { params: Promise.resolve({ path: ["passages", fixture.id] }) },
    );
    assert.equal(direct.status, 404);

    const paged = await GET(
      new NextRequest(
        `http://127.0.0.1:3000/api/passages?edition=${fixture.editionId}`,
      ),
      { params: Promise.resolve({ path: ["passages"] }) },
    );
    assert.equal(paged.status, 200);
    assert.deepEqual(await paged.json(), { total: 0, passages: [] });
  } finally {
    passages.splice(passages.indexOf(fixture), 1);
  }
});
