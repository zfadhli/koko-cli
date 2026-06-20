# Plan 001: Fix stale `bun` references across docs

**Commit baseline:** `e1b79c1`

## Why

After the nub.js migration, 12+ references to `bun` commands remain in docs and comments. These confuse new contributors and make the repo look unmaintained.

## Files in scope

- `AGENTS.md`
- `README.md`
- `examples/01-color.ts`
- `examples/02-spinner.ts`
- `examples/03-progress.ts`
- `examples/04-cli-app.ts`
- `examples/05-composition.ts`

**Explicitly out of scope:** No source code, config, or workflow files.

## Changes

### 1. `AGENTS.md`

Replace the entire "Commands" table and "Stack" line:

| Current | Replace with |
|---------|-------------|
| `Bun runtime, nub` | `nub runtime` |
| `bun run build` | `nub run build` |
| `bun test` | `nub run test` |
| `bun run lint` | `nub run lint` |
| `bun run format` | `nub run format` |
| `bun run typecheck` | `nub run typecheck` |
| `bun run examples` | `nub run examples` |

Also remove the "Bun runtime" reference in the Stack line.

### 2. `README.md`

Replace these occurrences:

**Lines ~222-230 (Examples section):**
```
bun run examples/01-color.ts  →  nub examples/01-color.ts
bun run examples/02-spinner.ts  →  nub examples/02-spinner.ts
...
bun run examples  →  nub run examples
```

### 3. All 5 example files

Each file has a JSDoc header line like:
```
 * Run:  bun run examples/01-color.ts
```
Replace with:
```
 * Run:  nub examples/01-color.ts
```

### 4. `examples/04-cli-app.ts` line 1

Replace shebang:
```
#!/usr/bin/env bun  →  #!/usr/bin/env node
```

## Verification

```bash
# Ensure no remaining "bun run" references in these files:
grep -n "bun run" AGENTS.md README.md examples/*.ts
# Expected: 0 matches

# Ensure examples still work:
nub examples/01-color.ts
nub examples/04-cli-app.ts --help

# Standard verification:
nubx biome check src tests
nub run typecheck
nub run test
```

## Maintenance

If a new example file is added, its header should follow the `nub examples/` pattern. If the CI commands change, `AGENTS.md` must stay in sync.
