# Plan 005: Add tests for `errors.ts` and `icons.ts`

**Commit baseline:** `e1b79c1`

## Why

`src/errors.ts` (6 lines) and `src/icons.ts` (23 lines) are part of the public API surface but have zero dedicated test files. While they're tiny and unlikely to break, having tests means:

1. Refactoring them has a safety net.
2. The test coverage baseline is complete.
3. New contributors can see the testing patterns applied uniformly.

## Files in scope

- Create `tests/errors.test.ts`
- Create `tests/icons.test.ts`

**Explicitly out of scope:** No changes to source files or other test files.

## Changes

### 1. Create `tests/errors.test.ts`

```ts
import { describe, expect, test } from "vitest";
import { CliToolkitError } from "../src/errors";

describe("CliToolkitError", () => {
  test("is an instance of Error", () => {
    const err = new CliToolkitError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CliToolkitError);
  });

  test("has the correct name", () => {
    const err = new CliToolkitError("test");
    expect(err.name).toBe("CliToolkitError");
  });

  test("preserves the message", () => {
    const err = new CliToolkitError("something went wrong");
    expect(err.message).toBe("something went wrong");
  });

  test("throws and is catchable", () => {
    expect(() => {
      throw new CliToolkitError("oops");
    }).toThrow(CliToolkitError);
  });
});
```

### 2. Create `tests/icons.test.ts`

```ts
import { describe, expect, test } from "vitest";
import { ICON_ERROR, ICON_INFO, ICON_SUCCESS, ICON_WARN } from "../src/icons";

describe("icons", () => {
  test("ICON_SUCCESS is a non-empty string", () => {
    expect(ICON_SUCCESS).toBeTypeOf("string");
    expect(ICON_SUCCESS.length).toBeGreaterThan(0);
  });

  test("ICON_ERROR is a non-empty string", () => {
    expect(ICON_ERROR).toBeTypeOf("string");
    expect(ICON_ERROR.length).toBeGreaterThan(0);
  });

  test("ICON_WARN is a non-empty string", () => {
    expect(ICON_WARN).toBeTypeOf("string");
    expect(ICON_WARN.length).toBeGreaterThan(0);
  });

  test("ICON_INFO is a non-empty string", () => {
    expect(ICON_INFO).toBeTypeOf("string");
    expect(ICON_INFO.length).toBeGreaterThan(0);
  });

  test("all icons are unique", () => {
    const icons = [ICON_SUCCESS, ICON_ERROR, ICON_WARN, ICON_INFO];
    expect(new Set(icons).size).toBe(icons.length);
  });
});
```

## Verification

```bash
nub run test
# Expected: 42 tests pass (was 34) — 4 new from errors, 5 new from icons

nub run typecheck
nub run lint
```

## Test pattern

These tests follow the existing conventions in the project:
- Named imports from `vitest` (no globals)
- `describe`/`test`/`expect` structure
- File mirrors source: `tests/errors.test.ts` tests `src/errors.ts`
- No default exports

## Maintenance

- If a new error class or icon constant is added, extend the corresponding test file.
- If `CliToolkitError` gains a `cause` or `code` property, add tests for those.
