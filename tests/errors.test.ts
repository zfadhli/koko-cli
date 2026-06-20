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
