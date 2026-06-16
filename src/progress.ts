import cliProgress from "cli-progress";
import { CliToolkitError } from "./errors";
import type { ProgressInstance, ProgressOptions } from "./types";

/**
 * Create a terminal progress bar.
 *
 * ```ts
 * const bar = createProgress({ total: 100 })
 * bar.update(50)
 * // ...
 * bar.stop()
 * ```
 *
 * Returns a {@link ProgressInstance} wrapping cli-progress's `SingleBar`.
 * Throws {@link CliToolkitError} if `total` is missing or <= 0.
 */
export function createProgress(options: ProgressOptions): ProgressInstance {
  if (options.total <= 0) {
    throw new CliToolkitError(`Progress total must be > 0, got ${options.total}`);
  }

  const bar = new cliProgress.SingleBar(
    {
      format: options.format,
      barCompleteChar: options.barCompleteChar,
      barIncompleteChar: options.barIncompleteChar,
      barsize: options.barsize,
      clearOnComplete: options.clearOnComplete,
      stopOnComplete: options.stopOnComplete,
    },
    cliProgress.Presets.rect,
  );

  let started = false;
  let currentValue = options.start ?? 0;
  let pendingPayload: Record<string, unknown> = {};

  function ensureStarted() {
    if (!started) {
      bar.start(options.total, currentValue, pendingPayload);
      started = true;
    }
  }

  return {
    get total() {
      return options.total;
    },
    get value() {
      return currentValue;
    },
    update(current: number, payload?: Record<string, unknown>) {
      currentValue = current;
      if (payload) pendingPayload = payload;
      ensureStarted();
      bar.update(current, payload);
    },
    increment(delta?: number, payload?: Record<string, unknown>) {
      if (payload) pendingPayload = payload;
      ensureStarted();
      currentValue += delta ?? 1;
      bar.update(currentValue, payload);
    },
    stop() {
      if (started) {
        bar.stop();
        started = false;
      }
    },
  };
}
