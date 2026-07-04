import { describe, expect, test } from "vitest";
import { color } from "../src/color";

describe("color", () => {
  test("returns colored strings", () => {
    const output = color.red("hello");
    expect(output).toBeTruthy();
    expect(typeof output).toBe("string");
    // picocolors wraps with ANSI escape codes
    expect(output).toContain("hello");
  });

  test("supports multiple colors and styles", () => {
    expect(color.green("ok")).toBeTruthy();
    expect(color.bold("bold")).toBeTruthy();
    expect(color.dim("dim")).toBeTruthy();
    expect(color.blue("blue")).toBeTruthy();
    expect(color.yellow("warn")).toBeTruthy();
    expect(color.cyan("info")).toBeTruthy();
  });

  test("nesting works", () => {
    const nested = color.bold(color.red("error"));
    expect(nested).toBeTruthy();
    expect(nested).toContain("error");
  });

  test("empty string returns empty string", () => {
    const output = color.red("");
    expect(output).toBe("");
  });
});
