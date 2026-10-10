import { expect, test } from "@playwright/test";

test("question streaming exposes verified evidence before an explicit evidence-only answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/questions?text=gospel-of-matthew");
  await page
    .getByLabel("Your research question")
    .fill("What is said about an enemy?");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".answer-overview")).toContainText(
    "Evidence-only mode is active",
    { timeout: 90_000 },
  );
  await expect(page.locator(".stream-status")).toContainText(
    "Applying source scope and retrieving canonical evidence",
  );
  await expect(
    page.getByRole("heading", { name: "Short answer", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Primary evidence", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#answer-primaryEvidence .research-claim").first(),
  ).toContainText("Gospel of Matthew");
  await expect(
    page.getByRole("heading", { name: "Images and artifacts", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".neutrality-audit")).toContainText(
    "Neutrality audit details",
  );
});

test("question retrieval streams status immediately and remains cancellable", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const state = window as typeof window & {
      __atlasTestStreamCancelled?: boolean;
    };
    state.__atlasTestStreamCancelled = false;
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (!url.endsWith("/api/query/stream")) return nativeFetch(input, init);
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  type: "status",
                  stage: "retrieval-started",
                  message:
                    "Applying source scope and retrieving canonical evidence before synthesis.",
                })}\n`,
              ),
            );
          },
          cancel() {
            state.__atlasTestStreamCancelled = true;
          },
        }),
        {
          headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
          },
        },
      );
    };
  });
  await page.goto("/questions?text=dhammapada");
  await page
    .getByLabel("Your research question")
    .fill("What does this source say about careful attention?");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".stream-status")).toContainText(
    "Applying source scope and retrieving canonical evidence",
    { timeout: 10_000 },
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Research cancelled");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __atlasTestStreamCancelled?: boolean;
            }
          ).__atlasTestStreamCancelled,
      ),
    )
    .toBe(true);
});

test("changing a question scope cancels the active stream and clears stale state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as typeof window & {
      __atlasScopeStreamCancelled?: boolean;
    };
    state.__atlasScopeStreamCancelled = false;
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (!url.endsWith("/api/query/stream")) return nativeFetch(input, init);
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  type: "status",
                  stage: "retrieval-started",
                  message: "Scoped request is active.",
                })}\n`,
              ),
            );
          },
          cancel() {
            state.__atlasScopeStreamCancelled = true;
          },
        }),
        { headers: { "Content-Type": "application/x-ndjson" } },
      );
    };
  });

  await page.goto("/questions?text=dhammapada");
  await page
    .getByLabel("Your research question")
    .fill("What does this source say about attention?");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".stream-status")).toContainText(
    "Scoped request is active.",
  );
  await page.getByText("Refine source scope").click();
  await page.getByLabel("Region").selectOption({ index: 1 });

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __atlasScopeStreamCancelled?: boolean;
            }
          ).__atlasScopeStreamCancelled,
      ),
    )
    .toBe(true);
  await expect(page.locator(".stream-status")).toHaveCount(0);
  await expect(page.locator(".answer-overview")).toHaveCount(0);
  await expect(page.getByText("Research cancelled.")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Explore", exact: true }),
  ).toBeVisible();
});

test("a superseded question stream cannot publish buffered events or finish the newer request", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch.bind(window);
    let requestNumber = 0;
    const encoder = new TextEncoder();
    const status = (message: string) =>
      encoder.encode(
        `${JSON.stringify({
          type: "status",
          stage: "retrieval-started",
          message,
        })}\n`,
      );

    window.fetch = (async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (!url.endsWith("/api/query/stream")) return nativeFetch(input, init);

      requestNumber += 1;
      const currentRequest = requestNumber;
      let reads = 0;
      const reader = {
        async read(): Promise<ReadableStreamReadResult<Uint8Array>> {
          reads += 1;
          if (currentRequest === 1) {
            if (reads === 1)
              return {
                done: false,
                value: status("Old request started."),
              };
            if (reads === 2) {
              await new Promise((resolve) => setTimeout(resolve, 300));
              return {
                done: false,
                value: status("Old buffered event must be ignored."),
              };
            }
            throw new DOMException("Old stream failed late", "AbortError");
          }
          if (reads === 1)
            return {
              done: false,
              value: status("New request is active."),
            };
          return new Promise(() => {});
        },
        async cancel() {
          // Deliberately leave an already-buffered read alive. This models a
          // transport that resolves a pending read after cancellation.
        },
      } as unknown as ReadableStreamDefaultReader<Uint8Array>;

      return {
        ok: true,
        body: { getReader: () => reader },
        json: async () => ({}),
      } as unknown as Response;
    }) as typeof window.fetch;
  });

  await page.goto("/questions?text=dhammapada");
  const input = page.getByLabel("Your research question");
  await input.fill("First scoped question");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".stream-status")).toContainText(
    "Old request started.",
  );

  await input.fill("Second scoped question");
  await page
    .locator("form.question-form")
    .evaluate((form) => (form as HTMLFormElement).requestSubmit());
  await expect(page.locator(".stream-status")).toContainText(
    "New request is active.",
  );
  await page.waitForTimeout(450);

  await expect(page.locator(".stream-status")).not.toContainText(
    "Old buffered event must be ignored.",
  );
  await expect(page.locator(".answer-overview")).toHaveCount(0);
  await expect(page.getByText("Research cancelled.")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeVisible();
});

test("opposition uses reviewed propositions and attributed stances", async ({
  page,
}) => {
  await page.goto("/opposition");
  await page.getByRole("button", { name: "Response to enemies" }).click();
  await expect(
    page.getByRole("heading", { name: "Response to enemies", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stance-grid .research-claim")).toHaveCount(6);
  await expect(page.locator(".stance-grid")).toContainText(
    "adversarial reinterpretation",
  );
  await expect(page.locator(".stance-grid")).toContainText(
    "Church of Satan / Anton LaVey",
  );
  await expect(page.locator(".stance-grid")).toContainText(
    "This is one organization and one Satanic current",
  );

  await page
    .getByLabel("Scope to an attributed tradition or position")
    .selectOption("laveyan-satanism");
  await expect(page.locator(".stance-grid .research-claim")).toHaveCount(0);
  await page.getByRole("button", { name: "Find positions", exact: false }).click();
  await expect(page.locator(".stance-grid .research-claim")).toHaveCount(1);
  await expect(page.locator(".stance-grid")).toContainText(
    "Church of Satan / Anton LaVey",
  );
});

test("Teaching vs Historical Conduct renders every reviewed lane and labels evidence gaps", async ({
  page,
}) => {
  await page.goto("/teaching-conduct");
  await expect(
    page.getByRole("heading", { name: "Teaching vs Historical Conduct" }),
  ).toBeVisible();
  await expect(page.locator(".conduct-case")).toHaveCount(4);
  const first = page.locator(".conduct-case").first();
  await expect(
    first.getByRole("heading", { name: "Teaching evidence" }),
  ).toBeVisible();
  await expect(
    first.getByRole("heading", { name: "Historical conduct evidence" }),
  ).toBeVisible();
  await expect(
    first.getByRole("heading", { name: "Contemporary justifications" }),
  ).toBeVisible();
  await expect(
    first.getByRole("heading", { name: "Opposing religious voices" }),
  ).toBeVisible();
  await expect(
    first.getByRole("heading", { name: "Nonreligious motives" }),
  ).toBeVisible();
  await expect(first).toContainText("Conduct by adherents");
  await expect(page.locator('[data-record-kind="documented-gap"]')).toHaveCount(5);
  await expect(page.getByText("Documented evidence gap")).toHaveCount(5);
  await expect(page.locator('[data-record-kind="evidence"]')).toHaveCount(35);

  const filters: [string, string][] = [
    ["christianity", "SPG plantation ownership"],
    ["buddhism", "Japanese Zen wartime support"],
    ["islam", "Ottoman devshirme"],
    ["hindu", "Vaikom road exclusion"],
  ];
  for (const [tradition, title] of filters) {
    await page
      .getByLabel("Tradition represented in reviewed dossiers")
      .selectOption(tradition);
    await expect(page.locator(".conduct-case")).toHaveCount(1);
    await expect(page.locator(".conduct-case")).toContainText(title);
    await expect(
      page.locator(".conduct-case .conduct-lanes > section"),
    ).toHaveCount(9);
  }
});

test("all six compare controls invoke their distinct backend modes", async ({
  page,
}) => {
  await page.goto("/compare");
  await page
    .getByRole("button", { name: "Compare passages", exact: true })
    .click();
  await expect(page.locator('[data-engine-mode="synthesize"]')).toBeVisible({
    timeout: 60_000,
  });
  const controls: [string, string][] = [
    ["Show Contradictions", "contradictions"],
    ["Show Similarities", "similarities"],
    ["Show Earlier Parallels", "earlier-parallels"],
    ["Show Later Echoes", "later-echoes"],
    ["Show Alternative Interpretations", "alternative-interpretations"],
    ["Synthesize", "synthesize"],
  ];
  for (const [label, mode] of controls) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator(`[data-engine-mode="${mode}"]`)).toBeVisible();
  }
});

test("research APIs enforce source scopes before returning evidence", async ({
  request,
}) => {
  const opposition = await request.post("/api/opposition", {
    data: {
      propositionId: "prop-enemy-love",
      scope: { traditionIds: ["laveyan-satanism"] },
      limit: 1,
    },
  });
  expect(opposition.status()).toBe(200);
  const result = await opposition.json();
  expect(result.matches).toHaveLength(1);
  expect(result.matches[0].stances).toHaveLength(1);
  expect(result.matches[0].stances[0].id).toBe("stance-satanic-vengeance");

  const invalidMode = await request.post("/api/compare", {
    data: {
      textIds: ["dhammapada", "bhagavad-gita"],
      theme: "soul",
      mode: "same-result-for-every-button",
    },
  });
  expect(invalidMode.status()).toBe(400);
});

test("comparison API never leaks reviewed claims from unselected texts or themes", async ({
  request,
}) => {
  const scoped = await request.post("/api/compare", {
    data: {
      textIds: ["tao-te-ching", "analects"],
      theme: "injury",
      mode: "contradictions",
    },
  });
  expect(scoped.status()).toBe(200);
  const body = await scoped.json();
  expect(
    body.engineAnalysis.cases.map((item: { caseId: string }) => item.caseId),
  ).toEqual(["cmp-response-to-injury"]);
  const evidence = body.engineAnalysis.cases[0].sections.flatMap(
    (section: { items: { id: string; textIds: string[] }[] }) => section.items,
  );
  expect(evidence.map((item: { id: string }) => item.id).sort()).toEqual([
    "claim-analects-justice",
    "claim-tao-kindness",
    "con-injury-kindness-justice",
  ]);
  expect(
    evidence.every((item: { textIds: string[] }) =>
      item.textIds.every((textId) =>
        ["tao-te-ching", "analects"].includes(textId),
      ),
    ),
  ).toBe(true);
  expect(JSON.stringify(body.engineAnalysis)).toContain("Tao Te Ching");
  expect(JSON.stringify(body.engineAnalysis)).not.toContain("Church of Satan");
  expect(JSON.stringify(body.engineAnalysis)).not.toContain("Matthew commands");

  const themeMismatch = await request.post("/api/compare", {
    data: {
      textIds: ["tao-te-ching", "analects"],
      theme: "flood",
      mode: "contradictions",
    },
  });
  expect(themeMismatch.status()).toBe(200);
  const mismatchBody = await themeMismatch.json();
  expect(mismatchBody.engineAnalysis.cases).toEqual([]);
  expect(mismatchBody.engineAnalysis.noApplicableAnalysis).toContain(
    "selected texts and the requested theme",
  );
});

test("every tradition filter returns a complete independently attributed conduct dossier", async ({
  request,
}) => {
  const lanes = [
    "teachingEvidence",
    "conductEvidence",
    "justificationsAtTheTime",
    "textsUsedToJustify",
    "supportingReligiousVoices",
    "opposingReligiousVoices",
    "nonreligiousMotives",
    "laterTheologicalInterpretations",
    "modernScholarlyInterpretations",
  ];
  for (const traditionId of ["christianity", "buddhism", "islam", "hindu"]) {
    const response = await request.post("/api/teaching-conduct", {
      data: { scope: { traditionIds: [traditionId] } },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.cases).toHaveLength(1);
    expect(body.cases[0].traditionId).toBe(traditionId);
    for (const lane of lanes)
      expect(body.cases[0][lane].length).toBeGreaterThan(0);
  }
});

test("a slower conduct request cannot overwrite the latest tradition selection", async ({
  page,
  request,
}) => {
  const [christianResponse, buddhistResponse] = await Promise.all([
    request.post("/api/teaching-conduct", {
      data: { scope: { traditionIds: ["christianity"] } },
    }),
    request.post("/api/teaching-conduct", {
      data: { scope: { traditionIds: ["buddhism"] } },
    }),
  ]);
  const christian = await christianResponse.json();
  const buddhist = await buddhistResponse.json();

  await page.goto("/teaching-conduct");
  await expect(page.locator(".conduct-case")).toHaveCount(4);
  await page.route("**/api/teaching-conduct", async (route) => {
    const traditionId = route.request().postDataJSON()?.scope
      ?.traditionIds?.[0];
    if (traditionId === "christianity")
      await new Promise((resolve) => setTimeout(resolve, 500));
    const body = traditionId === "christianity" ? christian : buddhist;
    try {
      await route.fulfill({ json: body });
    } catch {
      // The first request is expected to be aborted by the newer selection.
    }
  });

  const select = page.getByLabel("Tradition represented in reviewed dossiers");
  await select.selectOption("christianity");
  await select.selectOption("buddhism");
  await expect(page.locator(".conduct-case")).toContainText(
    "Japanese Zen wartime support",
  );
  await page.waitForTimeout(650);
  await expect(page.locator(".conduct-case")).toContainText(
    "Japanese Zen wartime support",
  );
  await expect(page.locator(".conduct-case")).not.toContainText(
    "SPG plantation ownership",
  );
});
