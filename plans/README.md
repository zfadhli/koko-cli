# Improvement Plans — @zfadhli/koko-cli

Written against commit `e1b79c1`. All plans are independent — they can be executed in any order.

| # | Plan | Status | Notes |
|---|------|--------|-------|
| 001 | Fix stale `bun` references across docs | ⏳ Ready | Pure find-and-replace, no behavioral change |
| 002 | Restore spinner null guard for invalid styles | ⏳ Ready | Regression from ponytail cleanup |
| 003 | Add test for CAC error wrapping in `parse()` | ⏳ Ready | Also fixes fragile `process.exit` mock (Finding 5, folded in) |
| 004 | Add `sideEffects: false` to package.json | ⏳ Ready | One-line change for tree-shaking |
| 005 | Add tests for `errors.ts` and `icons.ts` | ⏳ Ready | Two tiny test files for public API modules |

## Verification gate for all plans

```bash
nubx biome check src tests  # lint
nub run typecheck            # tsc --noEmit
nub run test                 # vitest — 34+ tests pass
```

## Maintenance

- `003` folds Finding 5 (process.exit try/finally) because both touch `tests/cli.test.ts`.
- After `001`, update CI docs or README if they reference Bun commands.
- If a future plan touches `src/spinner.ts`, re-verify the null guard in Finding 2 hasn't regressed.
