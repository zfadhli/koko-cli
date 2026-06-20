/**
 * koko — Progress bar examples
 *
 * Run:  nub examples/03-progress.ts
 *
 * Demonstrates:
 *   - Basic update / increment / stop
 *   - Custom formats with payloads
 *   - Composability: mapProgress() helper
 *   - Realistic batch processing simulation
 */

import { color, createProgress } from "../src/index.ts";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Basic usage ────────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Basic progress bar ═══\n")));

const bar = createProgress({ total: 100, barsize: 30 });
for (let i = 0; i <= 100; i += 10) {
  bar.update(i);
  await delay(80);
}
bar.stop();

// ─── Default increment ──────────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Increment by 1 (default) ═══\n")));

const bar2 = createProgress({ total: 10, barsize: 20 });
for (let i = 0; i < 10; i++) {
  bar2.increment();
  await delay(60);
}
bar2.stop();

// ─── Custom format ──────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══ Custom format ═══\n")));

const bar3 = createProgress({
  total: 8,
  barsize: 20,
  format: "  {bar}  {percentage}%  |  {value}/{total} files",
});
for (let i = 1; i <= 8; i++) {
  bar3.update(i);
  await delay(100);
}
bar3.stop();

// ─── Payloads (contextual data) ─────────────────────────────

console.log(color.bold(color.cyan("\n═══ Payloads (contextual labels) ═══\n")));

const packages = [
  "@biomejs/biome",
  "cac",
  "cli-progress",
  "cli-spinners",
  "picocolors",
  "tsdown",
  "typescript",
];

const bar4 = createProgress({
  total: packages.length,
  barsize: 25,
  format: "  {bar}  {percentage}%  |  Installing {package}",
});

for (const pkg of packages) {
  bar4.increment(1, { package: pkg });
  await delay(200 + Math.random() * 200);
}
bar4.stop();

// ─── Composition: mapProgress() helper ──────────────────────

console.log(color.bold(color.cyan("\n═══ Composable mapProgress() helper ═══\n")));

/**
 * Iterate over an array with a progress bar.
 * Calls `fn(item, index)` for each element, updating the bar.
 */
async function mapProgress<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  label?: string,
): Promise<R[]> {
  const bar = createProgress({
    total: items.length,
    barsize: 25,
    format: label
      ? `  {bar}  {percentage}%  |  ${label} {value}/{total}`
      : "  {bar}  {percentage}%",
  });

  const results: R[] = [];
  for (let i = 0; i < items.length; i++) {
    const result = await fn(items[i], i);
    results.push(result);
    bar.increment(1);
  }
  bar.stop();
  return results;
}

// Usage
const sizes = await mapProgress(
  ["src/color.ts", "src/spinner.ts", "src/progress.ts", "src/cli.ts"],
  async (file) => {
    // Simulate reading file size
    await delay(200 + Math.random() * 200);
    return { file, size: Math.floor(Math.random() * 100) + 10 };
  },
  "Processing",
);

for (const { file, size } of sizes) {
  console.log(`  ${color.dim("→")} ${file}  ${color.bold(`${size}KB`)}`);
}
