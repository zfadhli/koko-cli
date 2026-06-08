import process from "node:process";
import spinners from "cli-spinners";
import { color } from "./color";
import { CliToolkitError } from "./errors";
import { ICON_ERROR, ICON_INFO, ICON_SUCCESS, ICON_WARN } from "./icons";
import type { SpinnerInstance, SpinnerOptions, SpinnerStyle } from "./types";

const frameSets: Record<SpinnerStyle, { interval: number; frames: string[] }> = {
  dots: spinners.dots,
  dots2: spinners.dots2,
  line: spinners.line,
  arc: spinners.arc,
  bouncingBar: spinners.bouncingBar,
  clock: spinners.clock,
  moon: spinners.moon,
  toggle: spinners.toggle12,
  arrow: spinners.arrow3,
  shark: spinners.shark,
} as const;

const defaultStyle: SpinnerStyle = "dots";

/**
 * Create a terminal spinner.
 *
 * ```ts
 * const spin = createSpinner('Installing...')
 * spin.start()
 * // ... async work
 * spin.succeed('Installed!')
 * ```
 *
 * Returns a {@link SpinnerInstance} with start/stop lifecycle
 * and convenience methods (succeed, fail, warn, info).
 */
export function createSpinner(text?: string, options?: SpinnerOptions): SpinnerInstance {
  const {
    text: initialText = text ?? "",
    style = defaultStyle,
    color: spinnerColor,
    frames: customFrames,
    interval: customInterval,
  } = options ?? {};

  const frameSet = frameSets[style as SpinnerStyle];
  if (!frameSet && !customFrames) {
    throw new CliToolkitError(
      `Unknown spinner style: "${style}". Available styles: ${Object.keys(frameSets).join(", ")}`,
    );
  }

  const frames = customFrames ?? frameSet.frames;
  const interval = customInterval ?? frameSet.interval;

  let timer: ReturnType<typeof setInterval> | null = null;
  let index = 0;
  let currentText = initialText;
  let spinning = false;

  function write(frame: string) {
    const coloredFrame = spinnerColor ? color[spinnerColor](frame) : frame;
    const line = currentText ? `${coloredFrame} ${currentText}` : coloredFrame;
    process.stdout.write(`\r${line}\x1b[K`);
  }

  function clear() {
    process.stdout.write("\r\x1b[K");
  }

  function start(newText?: string) {
    if (spinning) return;
    if (newText !== undefined) currentText = newText;
    spinning = true;
    index = 0;

    // Clear any leftover text before starting fresh
    clear();
    write(frames[0]);

    timer = setInterval(() => {
      index = (index + 1) % frames.length;
      write(frames[index]);
    }, interval);
  }

  function stop(finalText?: string) {
    if (!spinning) return;
    spinning = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (finalText !== undefined) {
      clear();
      process.stdout.write(`${finalText}\n`);
    } else {
      clear();
    }
  }

  function succeed(text?: string) {
    const t = text ?? currentText;
    const prefix = color.green(ICON_SUCCESS);
    stop(`${prefix} ${t}`);
  }

  function fail(text?: string) {
    const t = text ?? currentText;
    const prefix = color.red(ICON_ERROR);
    stop(`${prefix} ${t}`);
  }

  function warn(text?: string) {
    const t = text ?? currentText;
    const prefix = color.yellow(ICON_WARN);
    stop(`${prefix} ${t}`);
  }

  function info(text?: string) {
    const t = text ?? currentText;
    const prefix = color.blue(ICON_INFO);
    stop(`${prefix} ${t}`);
  }

  return {
    get text() {
      return currentText;
    },
    set text(val: string) {
      currentText = val;
    },
    get isSpinning() {
      return spinning;
    },
    start,
    stop,
    succeed,
    fail,
    warn,
    info,
  };
}
