# Session Handoff — 2025-06-09 06:50

## Goal

Build a production-ready CLI toolkit library (`@zfadhli/koko-cli`) wrapping `cac`, `picocolors`, `cli-progress`, and `cli-spinners` with a function-based Composition API (Evan You style). Publish to npm.

## Files Modified/Created

### Source (7 files)

- `src/index.ts` — barrel re-exports of all public API and types
- `src/cli.ts` — `createCLI(name, version?)`: opinionated cac wrapper with `ctx.spinner()`, `ctx.progress()`, `ctx.color` in action handlers; auto-attaches `--help`/`--version`; wraps CAC errors as `CliToolkitError`
- `src/color.ts` — `color` plain object: all 24 picocolors functions (colors + styles)
- `src/spinner.ts` — `createSpinner(text?, options?)`: terminal spinner with `start/stop/succeed/fail/warn/info`, 10 built-in styles, custom colors, dynamic text updates
- `src/progress.ts` — `createProgress(options)`: terminal progress bar wrapping cli-progress `SingleBar`; lazy start; `rect` preset; tracks value locally (fixes cli-progress not exposing live `.value`/`.total`)
- `src/icons.ts` — `ICON_SUCCESS`/`ICON_ERROR`/`ICON_WARN`/`ICON_INFO` constants (single source of truth, eliminates hardcoded Unicode drift)
- `src/errors.ts` — `CliToolkitError` class

### Types (1 file)

- `src/types.ts` — `ProgressOptions`, `ProgressInstance`, `SpinnerOptions`, `SpinnerInstance`, `SpinnerStyle`, `CLIAction`, `CommandContext`, `CommandBuilder`, `CLIBuilder`, `OptionConfig`

### Tests (4 files, 27 tests, all passing)

- `tests/color.test.ts`, `tests/spinner.test.ts`, `tests/progress.test.ts`, `tests/cli.test.ts`

### Examples (5 files)

- `examples/01-color.ts` — all colors, nesting, status badges, section headers, diff output
- `examples/02-spinner.ts` — lifecycle, custom styles/colors, `withSpinner()` helper, dynamic text
- `examples/03-progress.ts` — basic, custom formats, payloads, `mapProgress()` helper
- `examples/04-cli-app.ts` — full CLI app: 4 commands, positional args, options, `ctx.spinner/progress/color`
- `examples/05-composition.ts` — deploy pipeline, batch installer, `useBuildPipeline()` composable

### Config & CI (6 files)

- `package.json` — scoped name `@zfadhli/koko-cli`, ESM, tsdown build, scripts for test/lint/typecheck/examples
- `tsconfig.json` — TypeScript 6 strict, `@types/bun`, `bundler` moduleResolution
- `tsdown.config.ts` — ESM + .d.ts output
- `biome.json` — lint + format config (migrated to 2.4.16 schema)
- `.github/workflows/ci.yml` — build + test on push/PR to master
- `.github/workflows/publish.yml` — `npm publish --provenance --access public` on `v*` tag

### Docs (3 files)

- `README.md` — API reference, quick start, examples, icon/error docs
- `CHANGELOG.md` — Keep a Changelog format, versions 0.1.0 and 0.1.1
- `LICENSE` — MIT

## Key Decisions

1. **Function-based Composition API over classes** — `createSpinner()`, `createProgress()`, `createCLI()` are factory functions returning closure-based instances. No `new`, no `this`, tree-shakeable. Plain `color` object for stateless utilities.
2. **Opinionated CLI wrapper** — `createCLI` auto-attaches `--help`/`--version`, injects `ctx` with `spinner()`/`progress()`/`color` helpers. Positional args merged into options object. CAC errors wrapped as `CliToolkitError`.
3. **Scoped npm package** — `@zfadhli/koko-cli` because `koko` and `koko-cli` were already taken on npm.
4. **`rect` progress preset** — Uses `■`/space instead of `█`/`░` for cleaner terminal output.
5. **`barsize` not `width`** — cli-progress Options uses `barsize`, not `width`. Fixed in `ProgressOptions` interface.
6. **Single error class** — `CliToolkitError` covers all validation. No hierarchy explosion.

## Current State

### What's working

- **Build**: `bun run build` → 8.13 kB `.mjs` + 5.25 kB `.d.mts` via tsdown
- **Tests**: 27/27 pass (`bun test`)
- **TypeScript**: `tsc --noEmit` — 0 errors (strict mode)
- **Lint**: `biome check` — 0 issues
- **Examples**: All 5 runnable via `bun run examples/`
- **Published versions**: `0.1.0` and `0.1.1` released on GitHub + npm
- **CI/CD**: GitHub Actions workflows configured (CI on push/PR, publish on `v*` tag)
- **NPM package**: `@zfadhli/koko-cli@0.1.1` published

### Bugs fixed during development

- Progress off-by-one: `increment()` called `ensureStarted()` after mutating `currentValue` → bar started at 1 instead of 0
- CLI parse double-slicing: `parse()` sliced `process.argv` before passing to cac, which also slices → args silently lost
- `width → barsize`: cli-progress doesn't have a `width` option, uses `barsize` instead

## Next Steps / Pending

- [ ] **npm publish with OTP** — `0.1.1` is published but initial publish required OTP. Future `v*` tag pushes will auto-publish via the GitHub Actions workflow (uses `NPM_TOKEN` secret with `--provenance`).
- [ ] **Set `NPM_TOKEN` secret in GitHub repo** — the `publish.yml` workflow needs `secrets.NPM_TOKEN` configured in the repo settings for automated publishing.
- [ ] **Add `--provenance` support** — the publish workflow uses `--provenance`, which requires the `id-token: write` permission (already set) and an OIDC-compatible npm token. Verify this works with the configured token.
- [ ] **Consider adding CJS output** — Currently ESM-only (`format: ['esm']` in tsdown.config). Add `'cjs'` if CommonJS consumers are needed.

## Important Context

- **GitHub**: `github.com/zfadhli/koko-cli` — default branch is `master`
- **npm**: `@zfadhli/koko-cli` — scoped, public access
- **Runtime**: Bun 1.3.14, Node >=18
- **Build tool**: tsdown (rolldown-based) — outputs `.mjs` + `.d.mts`
- **TypeScript**: 6.0.3, strict mode, `verbatimModuleSyntax`
- **Linting**: Biome 2.4.16 (no ESLint/Prettier)
- **Testing**: Bun test runner (no Jest/Vitest)

### Key package.json scripts

```bash
bun run build       # tsdown → dist/index.mjs + dist/index.d.mts
bun test            # bun test (27 tests)
bun run lint        # biome check src tests
bun run typecheck   # tsc --noEmit
bun run examples    # run all 5 examples
```

### Architecture notes

- `createCLI` wraps `cac` internally. The `parse()` method passes `process.argv` directly to cac (cac does `argv.slice(2)` internally). User-provided argv passes through unchanged.
- `createProgress` lazily starts the cli-progress `SingleBar` on first `update()`/`increment()` call. Tracks `currentValue` locally via closure — cli-progress's `.value` property is not reliable.
- `createSpinner` manages its own `setInterval` animation loop. Uses `\r` + clear for terminal writing. Custom frames fully override the named style's frames.
- `ICON_*` constants use Unicode escape sequences (`\u2714`, `\u2718`, etc.) for reliability across environments.

### Gotchas

- `bun run <file>` sets `process.argv` differently than Node — `argv[1]` is the script path, `argv[2]` is the first user arg. cac's default `parse()` handles `process.argv.slice(2)` correctly in both runtimes.
- The `publish.yml` workflow uses `npm config set` for auth (not `.npmrc` file). The `NPM_TOKEN` secret must be a valid npm automation token with publish permissions.
- tsdown outputs `.mjs`/`.d.mts` regardless of `"type": "module"` in package.json. The `exports`/`main`/`types` fields must use `.mjs`/`.d.mts` extensions.
