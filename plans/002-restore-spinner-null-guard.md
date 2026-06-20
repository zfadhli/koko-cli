# Plan 002: Restore spinner null guard for invalid styles

**Commit baseline:** `e1b79c1`

## Why

In `src/spinner.ts`, if an invalid `style` is passed at runtime (e.g. from JS consumers who bypass TypeScript types), `frameSets[style]` returns `undefined` and the code crashes with a raw `TypeError: Cannot read properties of undefined`. Before the ponytail cleanup commit `0f31401`, this was guarded with a `CliToolkitError` with a helpful message listing available styles. The guard should be restored.

## Files in scope

- `src/spinner.ts` — add null check and throw `CliToolkitError`
- `tests/spinner.test.ts` — update expected error type from `TypeError` to `CliToolkitError`

**Explicitly out of scope:** No other files.

## Current code

`src/spinner.ts` lines 44-46:
```ts
const frameSet = frameSets[style as SpinnerStyle];
const frames = customFrames ?? frameSet.frames;
```

## Change

### `src/spinner.ts`

Add a null guard between the two lines:

```ts
const frameSet = frameSets[style as SpinnerStyle];
if (!frameSet && !customFrames) {
  throw new CliToolkitError(
    `Unknown spinner style: "${style}". Available styles: ${Object.keys(frameSets).join(", ")}`,
  );
}
const frames = customFrames ?? frameSet.frames;
```

Also add the `CliToolkitError` import at the top:

```ts
import { CliToolkitError } from "./errors";
```

(It was removed in `0f31401` — check whether it's still there. If not, add it. If it's still there but unused, keep it and it becomes used.)

Currently `src/spinner.ts` does NOT import `CliToolkitError`. Add:

```ts
import { CliToolkitError } from "./errors";
```

After the `import { color } from "./color";` line.

### `tests/spinner.test.ts` line 84

Change:
```ts
expect(() => createSpinner("test", { style: "nonexistent" as never })).toThrow(TypeError);
```
To:
```ts
expect(() => createSpinner("test", { style: "nonexistent" as never })).toThrow(CliToolkitError);
```

Also add the import at the top:
```ts
import { CliToolkitError } from "../src/errors";
```

After the existing `import { ICON_ERROR, ... }` line.

## Verification

```bash
nub run typecheck
nub run test
# Specifically the spinner invalid-style test

# Manual: confirm the error message is helpful
node -e "const { createSpinner } = require('./dist/index.mjs'); createSpinner('test', { style: 'nonexistent' })"
# Expected: CliToolkitError: Unknown spinner style: "nonexistent". Available styles: dots, dots2, line, arc, ...
```
