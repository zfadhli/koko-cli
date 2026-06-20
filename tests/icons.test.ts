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
