# Plan 003: Add test for CAC error wrapping and fix fragile `process.exit` mock

**Commit baseline:** `e1b79c1`

## Why

Two test gaps in `tests/cli.test.ts`:

1. **CAC error wrapping untested** (`src/cli.ts:112-118`) — The `parse()` method wraps CAC errors (missing required args, unknown options) into `CliToolkitError`. This path has zero test coverage.

2. **Fragile `process.exit` mock** — The `--help` and `--version` banner tests (lines 235-277) mock `process.exit` but don't use try/finally. If an assertion throws before restoration, `process.exit` stays mocked, causing cascading test failures.

## Files in scope

- `tests/cli.test.ts` — add one test case, fix two existing tests
- `tests/progress.test.ts` — add import for CliToolkitError if needed (check current state)
- ~~`tests/spinner.test.ts`~~ — not in scope

**Explicitly out of scope:** No source files.

## Changes

### 1. Add CAC error wrapping test

Add the following test to `tests/cli.test.ts` inside the `describe("createCLI", () => {` block (after the "ctx.progress creates a working progress bar" test, before the banner section):

```ts
test("parse wraps CAC errors into CliToolkitError", () => {
  const cli = createCLI("test");
  cli.command("greet <name>", "Greet someone", (cmd) => {
    cmd.action(() => {});
  });
  expect(() => cli.parse(["node", "test", "greet"])).toThrow(CliToolkitError);
});
```

This triggers CAC's missing-required-arg error, which should be wrapped.

Add the import at the top of the file:

```ts
import { CliToolkitError } from "../src/errors";
```

### 2. Fix fragile `process.exit` mock

In both the `--help` and `--version` banner tests (lines 235-277), wrap the crucial section in try/finally to ensure `process.exit` is always restored.

**Before** (both tests follow this pattern):
```ts
test("not printed for --help flag", () => {
  const cli = createCLI("test-app", "1.0.0");
  const handler = vi.fn();
  const stderr = vi.fn();
  const exit = vi.fn();
  const origError = console.error;
  const origExit = process.exit;
  console.error = stderr;
  process.exit = exit as unknown as (code?: number) => never;

  cli.command("hello", "Say hello", (cmd) => {
    cmd.action(handler);
  });

  cli.parse(["node", "test", "--help"]);

  expect(stderr).toHaveBeenCalledTimes(0);
  expect(handler).toHaveBeenCalledTimes(0);
  console.error = origError;
  process.exit = origExit;
});
```

**After:**
```ts
test("not printed for --help flag", () => {
  const cli = createCLI("test-app", "1.0.0");
  const handler = vi.fn();
  const stderr = vi.fn();
  const exit = vi.fn();
  const origError = console.error;
  const origExit = process.exit;
  console.error = stderr;
  process.exit = exit as unknown as (code?: number) => never;

  try {
    cli.command("hello", "Say hello", (cmd) => {
      cmd.action(handler);
    });

    cli.parse(["node", "test", "--help"]);

    expect(stderr).toHaveBeenCalledTimes(0);
    expect(handler).toHaveBeenCalledTimes(0);
  } finally {
    console.error = origError;
    process.exit = origExit;
  }
});
```

Apply the same try/finally pattern to the `--version` test (lines 257-277).

## Verification

```bash
nub run test
# Expected: 35 tests pass (was 34)
# The new CAC error test appears, plus the two fixed tests still pass

nub run typecheck
nub run lint
```

## Maintenance

When adding new tests that mock globals like `console.error` or `process.exit`, always wrap in try/finally. Future contributors should follow the pattern established here.
