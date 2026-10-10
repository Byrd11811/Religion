export function abortReason(signal: AbortSignal) {
  return signal.reason ?? new DOMException("Operation aborted", "AbortError");
}

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw abortReason(signal);
}

/** Stop awaiting cancellable request work even when a database adapter cannot
 * interrupt its underlying operation. The underlying promise remains observed,
 * so a later rejection cannot become unhandled. */
export async function abortable<T>(promise: Promise<T>, signal?: AbortSignal) {
  if (!signal) return promise;
  throwIfAborted(signal);
  let onAbort!: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(abortReason(signal));
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    return await Promise.race([promise, aborted]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
