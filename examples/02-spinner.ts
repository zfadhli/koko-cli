/**
 * koko — Spinner examples
 *
 * Run:  bun run examples/02-spinner.ts
 *
 * Demonstrates:
 *   - Basic start / succeed / fail / warn / info lifecycle
 *   - Custom spinner styles and colors
 *   - Composing a reusable withSpinner() helper
 *   - Updating spinner text mid-flight
 */

import { color, createSpinner, ICON_SUCCESS } from "../src/index.ts";

// Helper: simulate async work
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Basic lifecycle ────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Basic lifecycle ═══\n")));

// succeed
const s1 = createSpinner("Installing dependencies...");
s1.start();
await delay(800);
s1.succeed("Installed 57 packages");

// fail
const s2 = createSpinner("Running tests...");
s2.start();
await delay(600);
s2.fail("3 tests failed");

// warn
const s3 = createSpinner("Auditing packages...");
s3.start();
await delay(500);
s3.warn("2 moderate vulnerabilities");

// info
const s4 = createSpinner("Checking for updates...");
s4.start();
await delay(400);
s4.info("3 outdated packages found");

// ─── Custom spinner styles ──────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Custom styles ═══\n")));

const styles = ["bouncingBar", "arc", "clock", "moon", "shark", "arrow"] as const;
for (const style of styles) {
  const spin = createSpinner(`${style} spinner`, { style });
  spin.start();
  await delay(400);
  spin.succeed();
}

// ─── Custom spinner color ───────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Custom spinner colors ═══\n")));

const colors = ["red", "green", "yellow", "blue", "magenta", "cyan"] as const;
for (const c of colors) {
  const spin = createSpinner(`${c} colored spinner`, { color: c });
  spin.start();
  await delay(300);
  spin.succeed();
}

// ─── Updating text while spinning ───────────────────────────

console.log(color.bold(color.cyan("\n═══ Dynamic text updates ═══\n")));

const spin = createSpinner("Step 1/3: linting...");
spin.start();
await delay(600);

spin.text = "Step 2/3: building...";
await delay(600);

spin.text = "Step 3/3: testing...";
await delay(600);

spin.succeed("All 3 steps completed");

// ─── Composition: withSpinner helper ────────────────────────

console.log(color.bold(color.cyan("\n═══ Composable withSpinner() helper ═══\n")));

/**
 * Wraps an async function with a spinner.
 * Auto-stops with succeed on success, fail on error.
 */
async function withSpinner<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const spin = createSpinner(label);
  spin.start();
  try {
    const result = await fn();
    spin.succeed(`${label} ${color.dim("— done")}`);
    return result;
  } catch (err) {
    spin.fail(`${label} ${color.dim(`— ${err instanceof Error ? err.message : "failed"}`)}`);
    throw err;
  }
}

// Usage
const _data = await withSpinner("Fetching data...", async () => {
  await delay(500);
  return { user: "koko", version: "1.0.0" };
});

// With a failure scenario
try {
  await withSpinner("Risky operation...", async () => {
    await delay(400);
    throw new Error("something went wrong");
  });
} catch {
  // expected
}

// ─── Composition: sequential spinners ───────────────────────

console.log(color.bold(color.cyan("\n═══ Sequential steps with spinners ═══\n")));

const tasks = [
  { label: "Lint", time: 500 },
  { label: "Build", time: 800 },
  { label: "Test", time: 600 },
];

for (const task of tasks) {
  await withSpinner(task.label, async () => {
    await delay(task.time);
  });
}

console.log(color.dim(`\n${ICON_SUCCESS} All ${tasks.length} tasks completed`));
