# @zfadhli/koko-cli

Composition-based CLI toolkit wrapping cac, picocolors, cli-progress, cli-spinners into a function-based API (Vue 3 Composition-inspired).

## Project

- **Stack:** TypeScript (ESNext, strict, `verbatimModuleSyntax`), Bun runtime, tsdown (build), Biome (lint/format)
- **Entry:** `src/index.ts` — re-exports all public API
- **Package:** `@zfadhli/koko-cli`, ESM only (`"type": "module"`), Node >=18

## Commands

| Command | What it does |
|---|---|
| `bun run build` | Build ESM + `.d.mts` to `dist/` via tsdown |
| `bun test` | Run all tests (bun:test) |
| `bun run lint` | Biome check on `src` + `tests` |
| `bun run format` | Biome format --write on `src` + `tests` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run examples` | Run all examples sequentially |

## Architecture

8 source modules in `src/`:

| Module | Role |
|---|---|
| `index.ts` | Barrel — re-exports everything public |
| `color.ts` | `color` object — 24 picocolors functions as a plain object; stateless |
| `spinner.ts` | `createSpinner()` — factory for terminal spinners; 10 styles, start/stop/succeed/fail/warn/info lifecycle |
| `progress.ts` | `createProgress()` — factory wrapping cli-progress; lazy start, format strings, payload interpolation |
| `cli.ts` | `createCLI()` — opinionated CLI builder wrapping cac; injects `ctx.spinner()/.progress()/.color` into action handlers |
| `errors.ts` | `CliToolkitError` — unified error class for all validation |
| `icons.ts` | `ICON_SUCCESS` / `ICON_ERROR` / `ICON_WARN` / `ICON_INFO` — single source of truth for Unicode icons |
| `types.ts` | All TypeScript interfaces/types (`ProgressOptions`, `SpinnerInstance`, `CLIBuilder`, `CommandContext`, etc.) |

## Conventions

- **Composition over classes** — stateless utilities are plain objects; stateful widgets are factory functions (closures), never classes
- **Named exports only** — no default exports anywhere
- **ESM only** — `import`/`export` syntax, `"type": "module"` in package.json
- **TypeScript strict** — `strict: true`, `verbatimModuleSyntax`, `isolatedModules`; use `import type` for type-only imports
- **JSDoc on public APIs** — include a usage example in the doc comment
- **Formatting** — Biome: spaces, 2-width indent, 100 char line width
- **Test file mirroring** — `tests/` mirrors `src/` (e.g. `spinner.test.ts` tests `spinner.ts`); uses `bun:test` (`describe`/`test`/`expect`/`spyOn`)
- **icons** — prefer importing `ICON_*` constants over hardcoding Unicode characters
- **Error handling** — throw `CliToolkitError` for validation errors; wrap third-party errors cleanly

## Notes

- **Ponytail** (`/ponytail` [lite|full|ultra]) is installed globally in Reasonix — lazy-senior-dev mode. Also available: `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`, and `/caveman`.
