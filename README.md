# koko

**Composition-based CLI toolkit** — wraps [cac](https://github.com/egoist/cac), [picocolors](https://github.com/alexeyraspopov/picocolors), [cli-progress](https://github.com/nicejade/cli-progress), and [cli-spinners](https://github.com/sindresorhus/cli-spinners) into a cohesive, function-based API.

## Design

koko follows a **function-based Composition API** (inspired by Vue 3):

- **Stateless utilities** (colors, CLI builder) are plain objects — no factory needed
- **Stateful widgets** (spinner, progress) are factory functions — closures, not classes
- **Progressive complexity** — `ctx.spinner()` is a one-liner; `import { createSpinner }` for standalone use
- **Minimal API surface** — 4 imports cover everything

## Install

```bash
npm install @zfadhli/koko-cli
```

## Quick start

```ts
import { color, createSpinner, createProgress, createCLI } from "@zfadhli/koko-cli";

// Colors
console.log(color.red("error"));
console.log(color.bold(color.green("success")));

// Spinner
const spin = createSpinner("Loading...");
spin.start();
await someWork();
spin.succeed("Done!");

// Progress bar
const bar = createProgress({ total: 100 });
bar.update(50);
bar.stop();

// CLI app
const cli = createCLI("my-app", "1.0.0").description("My CLI");
cli.command("build <input>", "Build project", (cmd) => {
  cmd.option("--out <dir>", "Output dir", { default: "dist" });
  cmd.action(async (options, ctx) => {
    const spin = ctx.spinner("Building...");
    spin.start();
    // ...
    spin.succeed("Built!");
  });
});
cli.parse();
```

## API

### `color`

A plain object with all picocolors functions:

```ts
color.red("text")         // red text
color.green("text")       // green text
color.bold("text")        // bold text
color.dim("text")         // dim text
color.italic("text")      // italic
color.underline("text")   // underline
// ... and 18 more (all bright variants, bg variants omitted for brevity)

// Nesting
color.bold(color.red("bold red text"))
```

### `createSpinner(text?, options?)`

Creates a terminal spinner with start/stop lifecycle.

```ts
const spin = createSpinner("Installing...");
spin.start();
// ... async work
spin.succeed("Installed!");   // ✔ Installed!
spin.fail("Failed!");         // ✘ Failed!
spin.warn("Caution!");        // ⚠ Caution!
spin.info("Note!");           // ℹ Note!

// Custom style
createSpinner("Loading", { style: "arc", color: "cyan" });
```

**Options:**

| Option | Type | Default |
|--------|------|---------|
| `text` | `string` | `""` |
| `style` | `SpinnerStyle` | `"dots"` |
| `color` | `ColorName` | — (no color) |
| `frames` | `string[]` | from style |
| `interval` | `number` | from style |

### `createProgress(options)`

Creates a terminal progress bar.

```ts
const bar = createProgress({ total: 100 });
bar.update(50);          // set exact value
bar.increment(10);       // increment by delta
bar.stop();

// With custom format and payload
const bar = createProgress({
  total: 10,
  format: "  {bar}  {percentage}%  |  Installing {package}",
});
bar.increment(1, { package: "koko" });
```

**Options:**

| Option | Type | Default |
|--------|------|---------|
| `total` | `number` | **(required)** |
| `start` | `number` | `0` |
| `format` | `string` | rect preset |
| `barsize` | `number` | terminal width |
| `barCompleteChar` | `string` | `■` |
| `barIncompleteChar` | `string` | ` ` (space) |
| `clearOnComplete` | `boolean` | `false` |
| `stopOnComplete` | `boolean` | `false` |

### `createCLI(name, version?, options?)`

Creates an opinionated CLI application builder (wraps cac).

- Auto-attaches `--help` and `--version`
- Action handlers receive `(options, ctx)` with typed options
- `ctx` provides `.spinner()`, `.progress()`, `.color`

**Banner** — When a `version` is provided, a styled banner (`name v{version}`) is
automatically printed to stderr before each command action. Customize or disable
it with `.banner()`.

```ts
const cli = createCLI("deploy", "1.0.0")
  .description("Deployment tool");

cli.command("build <input>", "Build project", (cmd) => {
  cmd.option("--out <dir>", "Output dir", { default: "dist" });
  cmd.option("--prod", "Production mode");
  cmd.action(async (options, ctx) => {
    // options: { input: string; out: string; prod: boolean }
    // ctx:     { spinner, progress, color }
    const spin = ctx.spinner("Compiling...");
    spin.start();
    await build(options.input);
    spin.succeed("Built!");
  });
});

cli.parse();
```

#### `.banner(text?)`

Controls the startup banner shown before command actions.

| Argument | Behavior |
|----------|----------|
| _(none)_ or `true` | Default `name v{version}` (bold cyan + yellow) |
| `false` | Disable banner entirely |
| `"Custom {name} {version}"` | Custom text; `{name}` and `{version}` are substituted |

```ts
// Disable the banner
cli.banner(false)

// Custom banner text
cli.banner("=== {name} v{version} ===")
```

The banner can also be controlled via the third argument to `createCLI`:

```ts
createCLI("myapp", "1.0.0", { banner: false })
```

### Icons

Standardized icon constants:

```ts
import { ICON_SUCCESS, ICON_ERROR, ICON_WARN, ICON_INFO } from "@zfadhli/koko-cli";
```

| Constant | Character | Description |
|----------|-----------|-------------|
| `ICON_SUCCESS` | `✔` | Success / complete |
| `ICON_ERROR` | `✘` | Error / failure |
| `ICON_WARN` | `⚠` | Warning |
| `ICON_INFO` | `ℹ` | Info |

### Errors

```ts
import { CliToolkitError } from "@zfadhli/koko-cli";

try {
  createProgress({ total: 0 });
} catch (err) {
  if (err instanceof CliToolkitError) {
    console.error(err.message); // "total must be > 0, got 0"
  }
}
```

## Examples

```bash
# Run any example
nub examples/01-color.ts         # all color functions
nub examples/02-spinner.ts       # spinner lifecycle + styles
nub examples/03-progress.ts      # progress bars + payloads
nub examples/04-cli-app.ts       # full CLI app with ctx
nub examples/05-composition.ts   # real-world patterns

# All at once
nub run examples
```

## License

MIT
