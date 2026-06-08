/**
 * koko — Composition examples (real-world patterns)
 *
 * Run:  bun run examples/05-composition.ts
 *
 * Demonstrates combining all modules (color + spinner + progress + CLI)
 * into cohesive, reusable patterns:
 *
 *   1. Deploy pipeline — steps with spinner per stage
 *   2. Batch installer — progress + spinner per item
 *   3. Custom composable — useBuildPipeline() encapsulating state
 */

import {
  color,
  createProgress,
  createSpinner,
  ICON_ERROR,
  ICON_SUCCESS,
  ICON_WARN,
} from "../src/index.ts";

// ── Helpers ─────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ────────────────────────────────────────────────────────────
// Pattern 1: Deploy pipeline
// ────────────────────────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══════════════════════════════════════")));
console.log(color.bold(color.cyan("  Pattern 1: Deploy Pipeline")));
console.log(color.bold(color.cyan("═══════════════════════════════════════\n")));

// Simulated async tasks
async function lint() {
  await delay(400);
  // Simulate lint warnings
  console.log(`  ${color.yellow(ICON_WARN)} ${color.dim("src/app.ts")} unused variable 'x'`);
  console.log(`  ${color.yellow(ICON_WARN)} ${color.dim("src/cli.ts")} missing return type`);
}

async function build() {
  await delay(700);
}

async function runTests() {
  await delay(600);
  // Simulate a test failure
  throw new Error("integration.test.ts:47 — expected 200, got 500");
}

async function deploy() {
  await delay(500);
}

// Pipeline runner
async function runPipeline() {
  const steps = [
    { name: "Lint", task: lint },
    { name: "Build", task: build },
    { name: "Test", task: runTests },
    { name: "Deploy", task: deploy },
  ] as const;

  for (const step of steps) {
    const spin = createSpinner(step.name);
    spin.start();

    try {
      await step.task();
      spin.succeed(color.green(step.name));
    } catch (err) {
      spin.fail(color.red(step.name));
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ${color.dim("└─")} ${color.red(msg)}`);
      console.log(`\n  ${color.bold(color.red(`${ICON_ERROR} Pipeline aborted`))}`);
      return false;
    }
  }

  console.log(`\n  ${color.bold(color.green(`${ICON_SUCCESS} Pipeline completed successfully`))}`);
  return true;
}

await runPipeline();

// ────────────────────────────────────────────────────────────
// Pattern 2: Batch installer
// ────────────────────────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══════════════════════════════════════")));
console.log(color.bold(color.cyan("  Pattern 2: Batch Installer")));
console.log(color.bold(color.cyan("═══════════════════════════════════════\n")));

const packages = [
  { name: "vue", version: "^3.5.0" },
  { name: "vite", version: "^6.0.0" },
  { name: "typescript", version: "^5.7.0" },
  { name: "eslint", version: "^9.0.0" },
  { name: "prettier", version: "^3.4.0" },
  { name: "tailwindcss", version: "^4.0.0" },
  { name: "pinia", version: "^3.0.0" },
  { name: "vitest", version: "^3.0.0" },
];

async function batchInstall() {
  const progress = createProgress({
    total: packages.length,
    width: 25,
    format: "  {bar}  {percentage}%  |  Installing {name} {version}",
  });

  let succeeded = 0;
  let failed = 0;

  for (const pkg of packages) {
    // Show a brief spinner per package
    const spin = createSpinner(`Resolving ${pkg.name}...`);
    spin.start();

    // Simulate network/dependency resolution
    await delay(300 + Math.random() * 400);

    // Random fail for demo (skip first 3, then random 15% chance)
    const willFail = failed === 0 && Math.random() < 0.15 && succeeded >= 3;

    if (willFail) {
      spin.fail(color.red(pkg.name));
      failed++;
      progress.increment(1, {
        name: color.red(pkg.name),
        version: color.dim(pkg.version),
      });
    } else {
      spin.succeed(color.green(pkg.name));
      succeeded++;
      progress.increment(1, {
        name: color.green(pkg.name),
        version: color.dim(pkg.version),
      });
    }
  }

  progress.stop();

  console.log(
    `\n  ${color.bold(`${succeeded} succeeded`)}${failed > 0 ? color.bold(color.red(`, ${failed} failed`)) : ""}`,
  );
}

await batchInstall();

// ────────────────────────────────────────────────────────────
// Pattern 3: Custom composable — useBuildPipeline()
// ────────────────────────────────────────────────────────────

console.log(color.bold(color.cyan("\n═══════════════════════════════════════")));
console.log(color.bold(color.cyan("  Pattern 3: Custom Composable")));
console.log(color.bold(color.cyan("═══════════════════════════════════════\n")));

/**
 * A custom "composable" that encapsulates a build pipeline.
 *
 * Pattern: a factory function that returns { run, report, state }.
 * Internal state (step results, timing) is managed via closure —
 * no class needed.
 */
function useBuildPipeline() {
  const results: Array<{
    name: string;
    duration: number;
    status: "ok" | "fail";
  }> = [];

  let startTime = 0;

  return {
    async run() {
      startTime = Date.now();
      const steps = ["Clean", "Lint", "Compile", "Bundle", "Copy assets"];

      for (const name of steps) {
        const stepStart = Date.now();
        const spin = createSpinner(name);
        spin.start();

        await delay(200 + Math.random() * 400);

        // Simulate a random failure in "Bundle" for demo
        const fail =
          name === "Bundle" &&
          results.filter((r) => r.status === "fail").length === 0 &&
          Math.random() < 0.3;

        if (fail) {
          spin.fail(color.red(name));
          results.push({
            name,
            duration: Date.now() - stepStart,
            status: "fail",
          });
          console.log(`  ${color.dim("└─")} ${color.red("Unexpected token 'export'")}`);
          return { ok: false, results };
        }

        spin.succeed(color.green(name));
        results.push({ name, duration: Date.now() - stepStart, status: "ok" });
      }

      return { ok: true, results };
    },

    get report() {
      const totalTime = Date.now() - startTime;
      const ok = results.filter((r) => r.status === "ok");
      const failed = results.filter((r) => r.status === "fail");

      return {
        ok: failed.length === 0,
        summary: `${ok.length}/${results.length} steps passed`,
        totalTime,
        results,
      };
    },
  };
}

// Usage
const pipeline = useBuildPipeline();
const _outcome = await pipeline.run();
const report = pipeline.report;

console.log(
  `\n  ${report.ok ? color.bold(color.green(`${ICON_SUCCESS} Build succeeded`)) : color.bold(color.red(`${ICON_ERROR} Build failed`))}`,
);
console.log(`  ${color.dim(report.summary)}  ${color.dim(`(${report.totalTime}ms total)`)}`);
console.log();
