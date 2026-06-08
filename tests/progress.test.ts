import { describe, expect, test } from "bun:test";
import { CliToolkitError } from "../src/errors";
import { createProgress } from "../src/progress";

describe("createProgress", () => {
  test("creates a progress instance with the correct interface", () => {
    const bar = createProgress({ total: 100 });
    expect(bar).toHaveProperty("update");
    expect(bar).toHaveProperty("increment");
    expect(bar).toHaveProperty("stop");
    expect(bar).toHaveProperty("total");
    expect(bar).toHaveProperty("value");
    expect(typeof bar.update).toBe("function");
    expect(typeof bar.increment).toBe("function");
    expect(typeof bar.stop).toBe("function");
  });

  test("throws when total is zero", () => {
    expect(() => createProgress({ total: 0 })).toThrow(CliToolkitError);
    expect(() => createProgress({ total: 0 })).toThrow("total must be > 0, got 0");
  });

  test("throws when total is negative", () => {
    expect(() => createProgress({ total: -1 })).toThrow(CliToolkitError);
  });

  test("update and increment work without error", () => {
    const bar = createProgress({ total: 10 });
    expect(bar.total).toBe(10);
    expect(bar.value).toBe(0);
    bar.increment(1);
    expect(bar.value).toBe(1);
    bar.update(5);
    expect(bar.value).toBe(5);
    bar.stop();
  });

  test("stop is idempotent", () => {
    const bar = createProgress({ total: 10 });
    bar.increment(1);
    bar.stop();
    bar.stop(); // should not throw
  });

  test("supports custom format", () => {
    const bar = createProgress({
      total: 5,
      format: "{bar} {percentage}% | {value}/{total}",
    });
    bar.increment(1);
    bar.stop();
  });
});
