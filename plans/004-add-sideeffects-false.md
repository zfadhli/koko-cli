# Plan 004: Add `sideEffects: false` to package.json

**Commit baseline:** `e1b79c1`

## Why

Bundlers like Rollup, webpack, and esbuild use the `sideEffects` field in `package.json` to determine which modules can be safely tree-shaken. Without this field, bundlers conservatively assume every module has side effects and may include code that the consumer doesn't use.

koko-cli has zero side effects — no top-level I/O, no self-executing code, no CSS imports, no polyfill registration. All modules are pure declarations (type exports + function/object definitions). Setting `"sideEffects": false` unlocks tree-shaking for consumers.

## File in scope

- `package.json` — add one field

## Current state

`package.json` has no `sideEffects` field.

## Change

Add `"sideEffects": false` at the top level of `package.json`, between `"type": "module"` and `"version"` (or alongside other metadata fields like `license`/`author`).

The relevant section should look like:
```json
{
  "name": "@zfadhli/koko-cli",
  "type": "module",
  "sideEffects": false,
  "version": "0.2.1",
  ...
}
```

## Verification

```bash
# JSON validity
nubx biome check package.json

# No behavioral change:
nub run build
nub run test

# TypeScript does not read sideEffects, but confirm tsc isn't affected:
nub run typecheck
```

## Maintenance

If a future change adds a module with top-level side effects (e.g. registering a global polyfill, appending to a DOM shim), this flag must be set to `true` or the specific files that have side effects must be listed as an array like `["side-effect-file.js"]`. Currently no such code exists.
