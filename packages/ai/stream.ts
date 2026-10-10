import type {
  CanonicalResearchSource,
  QuestionStreamEvent,
} from "@/packages/shared/research";
import {
  runStructuredQuestion,
  type RunStructuredQuestionInput,
} from "./provider";
import { assertCanonicalEvidence } from "./claims";

class AsyncEventChannel<T> {
  private values: T[] = [];
  private waiters: {
    resolve: (value: IteratorResult<T>) => void;
    reject: (reason: unknown) => void;
  }[] = [];
  private ended = false;
  private error: unknown;

  push(value: T) {
    if (this.ended) return;
    const waiter = this.waiters.shift();
    if (waiter) waiter.resolve({ done: false, value });
    else this.values.push(value);
  }

  close() {
    this.ended = true;
    for (const waiter of this.waiters.splice(0))
      waiter.resolve({ done: true, value: undefined });
  }

  fail(error: unknown) {
    this.error = error;
    this.ended = true;
    for (const waiter of this.waiters.splice(0)) waiter.reject(error);
  }

  next(): Promise<IteratorResult<T>> {
    const value = this.values.shift();
    if (value !== undefined) return Promise.resolve({ done: false, value });
    if (this.error) return Promise.reject(this.error);
    if (this.ended) return Promise.resolve({ done: true, value: undefined });
    return new Promise((resolve, reject) =>
      this.waiters.push({ resolve, reject }),
    );
  }
}

function verifiedExcerpt(source: CanonicalResearchSource) {
  const text = source.text.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (text.length <= 240) return text;
  const stop = text.lastIndexOf(" ", 240);
  return text.slice(0, stop >= 80 ? stop : 240);
}

/**
 * Emits verified canonical evidence and progress while provider work runs. The
 * only model-authored payload is the complete event, after citation resolution
 * and both neutrality audits have accepted it.
 */
export async function* streamStructuredQuestion(
  input: RunStructuredQuestionInput,
): AsyncGenerator<QuestionStreamEvent> {
  assertCanonicalEvidence(input.evidence);
  const controller = new AbortController();
  const abortFromCaller = () =>
    controller.abort(
      input.signal?.reason ??
        new DOMException("Operation aborted", "AbortError"),
    );
  if (input.signal?.aborted) abortFromCaller();
  else input.signal?.addEventListener("abort", abortFromCaller, { once: true });
  if (controller.signal.aborted)
    throw (
      controller.signal.reason ??
      new DOMException("Operation aborted", "AbortError")
    );

  const channel = new AsyncEventChannel<QuestionStreamEvent>();
  channel.push({
    type: "status",
    stage: "evidence-verified",
    message: `${input.evidence.length} canonical evidence item${input.evidence.length === 1 ? "" : "s"} queued for verification.`,
  });
  for (const source of input.evidence) {
    const { text: _text, ...metadata } = source;
    void _text;
    channel.push({
      type: "evidence",
      source: { ...metadata, excerpt: verifiedExcerpt(source) },
    });
  }

  const work = runStructuredQuestion({
    ...input,
    signal: controller.signal,
    onProgress(progress) {
      input.onProgress?.(progress);
      channel.push({ type: "status", ...progress });
    },
  });
  void work.then(
    (result) => {
      channel.push({ type: "complete", result });
      channel.close();
    },
    (error) => channel.fail(error),
  );

  try {
    while (true) {
      const next = await channel.next();
      if (next.done) break;
      yield next.value;
    }
  } finally {
    if (!controller.signal.aborted)
      controller.abort(
        new DOMException("Stream consumer cancelled", "AbortError"),
      );
    input.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export function createQuestionNdjsonStream(input: RunStructuredQuestionInput) {
  const encoder = new TextEncoder();
  const controller = new AbortController();
  const events = streamStructuredQuestion({
    ...input,
    signal: input.signal
      ? AbortSignal.any([input.signal, controller.signal])
      : controller.signal,
  });
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await events.next();
        if (next.done) controller.close();
        else
          controller.enqueue(encoder.encode(`${JSON.stringify(next.value)}\n`));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      if (!controller.signal.aborted)
        controller.abort(
          reason ?? new DOMException("Stream consumer cancelled", "AbortError"),
        );
      try {
        await events.return(undefined);
      } catch (error) {
        if (!controller.signal.aborted) throw error;
      }
    },
  });
}
