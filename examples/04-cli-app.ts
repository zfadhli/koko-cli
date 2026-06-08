#!/usr/bin/env bun
/**
 * koko — Full CLI app example
 *
 * Run:
 *   bun run examples/04-cli-app.ts --help
 *   bun run examples/04-cli-app.ts build src --out dist --prod
 *   bun run examples/04-cli-app.ts deploy --env production
 *   bun run examples/04-cli-app.ts status
 *   bun run examples/04-cli-app.ts watch src
 *
 * Demonstrates:
 *   - Multiple commands with positional args + options
 *   - ctx.spinner(), ctx.progress(), ctx.color inside actions
 *   - Async action handlers
 *   - Default option values
 *   - Command aliases
 */

import {
  CliToolkitError,
  color,
  createCLI,
  ICON_ERROR,
  ICON_SUCCESS,
  ICON_WARN,
} from "../src/index.ts";

// ── Simulated helpers ───────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildProject(_input: string, _out: string, prod: boolean) {
  await delay(prod ? 2000 : 1000);
  return { files: prod ? 142 : 98, size: prod ? "4.2 MB" : "2.1 MB" };
}

async function deployTo(env: string) {
  await delay(1500);
  const url = env === "production" ? "https://app.example.com" : `https://${env}.app.example.com`;
  return { url, env };
}

// ── CLI definition ──────────────────────────────────────────

const cli = createCLI("deploy-tool", "1.0.0").description(
  "Deployment automation tool with build, deploy, status, and watch commands",
);

// ─── build command ──────────────────────────────────────────

cli.command("build <input>", "Build the project from a source directory", (cmd) => {
  cmd.option("--out <dir>", "Output directory", { default: "dist" });
  cmd.option("--prod", "Run production build (slower, optimized)");
  cmd.option("--verbose", "Print detailed build logs");

  cmd.action(async (options, ctx) => {
    const { input, out, prod, verbose } = options as {
      input: string;
      out: string;
      prod: boolean;
      verbose: boolean;
    };

    // Use ctx.color for headers
    console.log(ctx.color.bold(ctx.color.cyan(`\n Building from "${input}" → "${out}"\n`)));

    if (verbose) {
      console.log(ctx.color.dim(`  mode: ${prod ? "production" : "development"}`));
    }

    // ctx.spinner for build step
    const spin = ctx.spinner("Compiling...");
    spin.start();
    const result = await buildProject(input, out, prod);
    spin.succeed(
      prod
        ? ctx.color.bold(`Production build: ${result.files} files, ${result.size}`)
        : `Dev build: ${result.files} files, ${result.size}`,
    );

    // ctx.progress for post-build analysis
    console.log(ctx.color.dim("\n  Analyzing bundle..."));
    const bar = ctx.progress({ total: 5, barsize: 20 });
    for (let i = 0; i < 5; i++) {
      bar.increment(1);
      await delay(150);
    }
    bar.stop();

    console.log(ctx.color.green(`\n${ICON_SUCCESS} Build complete\n`));
  });
});

// ─── deploy command ─────────────────────────────────────────

cli.command("deploy", "Deploy the built project to an environment", (cmd) => {
  cmd.option("--env <name>", "Target environment", { default: "staging" });
  cmd.alias("d");

  cmd.action(async (options, ctx) => {
    const { env } = options as { env: string };

    console.log(ctx.color.bold(ctx.color.magenta(`\n Deploying to ${env}...\n`)));

    // Simulate deploy steps with spinners
    const steps = ["Uploading assets", "Running migrations", "Warming cache", "Verifying health"];
    for (const step of steps) {
      const spin = ctx.spinner(step);
      spin.start();
      await delay(400 + Math.random() * 300);
      spin.succeed();
    }

    const result = await deployTo(env);
    console.log(
      `\n${ctx.color.green(`${ICON_SUCCESS} Deployed to ${ctx.color.bold(result.url)}\n`)}`,
    );
  });
});

// ─── status command ─────────────────────────────────────────

cli.command("status", "Show current deployment status", (cmd) => {
  cmd.action(async (_options, ctx) => {
    const c = ctx.color;

    console.log(c.bold(c.cyan("\n Deployment status\n")));
    console.log(
      `  ${c.green(ICON_SUCCESS)} Production   ${c.bold("v2.4.1")}   ${c.dim("deployed 2h ago")}`,
    );
    console.log(
      `  ${c.green(ICON_SUCCESS)} Staging      ${c.bold("v2.4.2-rc.1")} ${c.dim("deployed 10m ago")}`,
    );
    console.log(
      `  ${c.yellow(ICON_WARN)} Development ${c.bold("v2.4.0")}   ${c.dim("build pending")}`,
    );
    console.log();
  });
});

// ─── watch command ──────────────────────────────────────────

cli.command("watch <dir>", "Watch a directory for changes", (cmd) => {
  cmd.option("--ext <pattern>", "File extension to watch", {
    default: ".ts",
  });
  cmd.option("--debounce <ms>", "Debounce delay in ms", {
    default: "300",
  });

  cmd.action((options, ctx) => {
    const { dir, ext, debounce } = options as {
      dir: string;
      ext: string;
      debounce: string;
    };

    console.log(
      ctx.color.dim(`\n Watching "${dir}" for *${ext} changes (debounce: ${debounce}ms)...\n`),
    );

    // Show a spinner that stays spinning (simulating a file watcher)
    const spin = ctx.spinner(`Watching ${dir}...`);
    spin.start();

    // In a real app, you'd use fs.watch or chokidar here.
    // For this example, we stop after 2 seconds to let the process exit.
    setTimeout(() => {
      spin.succeed(`Watcher closed after detecting changes in "${dir}"`);
      console.log();
    }, 2000);
  });
});

// ─── Parse ──────────────────────────────────────────────────

try {
  cli.parse();
} catch (err) {
  if (err instanceof CliToolkitError) {
    console.error(`\n  ${color.red(ICON_ERROR)} ${color.bold(color.red(err.message))}\n`);
    process.exit(1);
  }
  throw err;
}
