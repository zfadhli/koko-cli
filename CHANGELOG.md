# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-06-20

### Changed

- **Migrated dev toolchain from Bun to nub.js** — switched to nub runtime for running scripts, vitest replaces `bun:test` for testing. `lock.yaml` replaces `bun.lock`. CI updated to `nubjs/setup-nub`.
- **Simplified CLI API surface** — removed `BannerOption`, `CLIOptions`, and `OptionConfig` types (inlined into their usage sites). Consumers using these types for annotations should switch to inline types or `string | boolean`.
- **Added `sideEffects: false`** to `package.json` — enables tree-shaking for bundler consumers.
- **Added lefthook pre-commit hooks** — Biome lint + `tsc --noEmit` run before every commit.

### Fixed

- **Spinner invalid-style error** — `createSpinner()` now throws `CliToolkitError` with a descriptive message listing available styles, instead of a raw `TypeError`.

### Added

- **Test coverage for CAC error wrapping** — `createCLI.parse()` error handling path now tested.
- **Test coverage for `CliToolkitError` and icon constants** — two new test files covering public API basics.
- **`process.exit` mock hygiene** — banner tests wrap mocked globals in try/finally to prevent cascading failures.

[0.3.0]: https://github.com/zfadhli/koko-cli/releases/tag/0.3.0

## [0.2.1] — 2026-06-15

### Fixed

- **Progress bar first render with payload** — `createProgress()` now passes the initial payload through `bar.start()`, fixing the first render showing no payload data when `update()` is called with a payload before any prior update.

[0.2.1]: https://github.com/zfadhli/koko-cli/releases/tag/0.2.1

## [0.2.0] — 2026-06-15

### Added

- **Auto banner** — `createCLI(name, version?)` now prints a styled `name v{version}` banner (bold cyan + yellow) to stderr before every command action. Customize with `.banner("Custom {name} {version}")` or disable with `.banner(false)` / `{ banner: false }` option.
- **`.banner()` method** on `CLIBuilder` — configure or suppress the startup banner
- **`BannerOption` / `CLIOptions` types** — exported for TypeScript consumers

[0.2.0]: https://github.com/zfadhli/koko-cli/releases/tag/0.2.0

## [0.1.1] — 2025-06-09

### Changed

- Package renamed from `koko` to `@zfadhli/koko-cli` (names `koko` and `koko-cli` already taken on npm)
- `.github/workflows/publish.yml` simplified: uses `npm config set` for auth token, `--access public` flag, removed test step
- README updated: install command and imports now use `@zfadhli/koko-cli`

[0.1.1]: https://github.com/zfadhli/koko-cli/releases/tag/0.1.1

## [0.1.0] — 2025-06-09

### Added

- **`createCLI(name, version?)`** — opinionated CLI builder wrapping cac with auto-attached `--help`/`--version`, strict option typing, and `ctx.spinner()`/`ctx.progress()`/`ctx.color` inside action handlers
- **`color`** — plain object with all 24 picocolors functions (colors + styles), nests via `color.bold(color.red(...))`
- **`createSpinner(text?, options?)`** — terminal spinner with `start/stop/succeed/fail/warn/info` lifecycle and 10 built-in styles
- **`createProgress(options)`** — terminal progress bar with lazy start, custom format strings, and payload interpolation
- **`ICON_SUCCESS` / `ICON_ERROR` / `ICON_WARN` / `ICON_INFO`** — standardized Unicode icon constants
- **`CliToolkitError`** — unified error class for all koko validation errors
- **Examples** — 5 comprehensive example files under `examples/` covering every module and real-world composition patterns

### Fixed

- Progress bar off-by-one: `increment()` called `ensureStarted()` after mutating `currentValue`, causing the bar to start at 1 instead of 0 and drift by 1 throughout
- CLI parse double-slicing: `createCLI.parse()` was slicing `process.argv` before passing to cac, which also slices internally — arguments were silently lost
- CAC validation errors (missing args, unknown options) now wrapped as `CliToolkitError` with clean output instead of raw stack traces
- `ProgressOptions.width` → `barsize` to match cli-progress's `Options` type
- TypeScript strict errors: missing `@types/bun`, optional `desc` parameter type mismatch, implicit `any` in test callbacks
- Biome config schema migrated from 1.9.4 to 2.4.16

### Changed

- `cli-progress` default preset switched from `shades_classic` (█/░) to `rect` (■/space) for a cleaner look
- All hardcoded icons (`✔`/`✘`/`⚠`/`ℹ`) consolidated into a single source of truth in `src/icons.ts`

[0.1.0]: https://github.com/zfadhli/koko-cli/releases/tag/0.1.0
