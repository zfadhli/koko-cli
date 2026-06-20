import type { ColorName, StyleName } from "./color";

// ── Progress ──

export interface ProgressOptions {
  total: number;
  start?: number;
  format?: string;
  barCompleteChar?: string;
  barIncompleteChar?: string;
  barsize?: number;
  clearOnComplete?: boolean;
  stopOnComplete?: boolean;
}

export interface ProgressInstance {
  update(current: number, payload?: Record<string, unknown>): void;
  increment(delta?: number, payload?: Record<string, unknown>): void;
  stop(): void;
  readonly total: number;
  readonly value: number;
}

// ── Spinner ──

export type SpinnerStyle =
  | "dots"
  | "dots2"
  | "line"
  | "arc"
  | "bouncingBar"
  | "clock"
  | "moon"
  | "toggle"
  | "arrow"
  | "shark";

export interface SpinnerOptions {
  text?: string;
  style?: SpinnerStyle;
  color?: ColorName;
  frames?: string[];
  interval?: number;
}

export interface SpinnerInstance {
  start(text?: string): void;
  stop(finalText?: string): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  info(text?: string): void;
  text: string;
  isSpinning: boolean;
}

// ── CLI ──

export type CLIAction<T = Record<string, unknown>> = (
  options: T,
  ctx: CommandContext,
) => void | Promise<void>;

export interface CommandContext {
  spinner(text?: string): SpinnerInstance;
  progress(options: ProgressOptions): ProgressInstance;
  color: { [K in ColorName | StyleName]: (text: string) => string };
}

export interface CommandBuilder {
  option(
    name: string,
    description?: string,
    config?: { default?: unknown; required?: boolean },
  ): CommandBuilder;
  alias(name: string): CommandBuilder;
  action<T>(handler: CLIAction<T>): void;
}

export type CommandSetup = (cmd: CommandBuilder) => void;

// ── CLI ──

export interface CLIBuilder {
  command(name: string, description: string, setup: CommandSetup): CLIBuilder;
  description(text: string): CLIBuilder;
  banner(text?: string | boolean): CLIBuilder;
  parse(argv?: string[]): void;
}
