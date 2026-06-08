import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { CliToolkitError } from "../src/errors";
import { ICON_ERROR, ICON_INFO, ICON_SUCCESS, ICON_WARN } from "../src/icons";
import { createSpinner } from "../src/spinner";

describe("createSpinner", () => {
  let stdoutWrite: ReturnType<typeof spyOn>;

  beforeEach(() => {
    stdoutWrite = spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWrite.mockRestore();
  });

  test("creates a spinner instance with the correct interface", () => {
    const spin = createSpinner("test");
    expect(spin).toHaveProperty("start");
    expect(spin).toHaveProperty("stop");
    expect(spin).toHaveProperty("succeed");
    expect(spin).toHaveProperty("fail");
    expect(spin).toHaveProperty("warn");
    expect(spin).toHaveProperty("info");
    expect(spin).toHaveProperty("text");
    expect(spin).toHaveProperty("isSpinning");
    expect(typeof spin.start).toBe("function");
    expect(typeof spin.stop).toBe("function");
    expect(typeof spin.succeed).toBe("function");
    expect(typeof spin.fail).toBe("function");
  });

  test("starts and stops", () => {
    const spin = createSpinner("working");
    expect(spin.isSpinning).toBe(false);

    spin.start();
    expect(spin.isSpinning).toBe(true);

    spin.stop();
    expect(spin.isSpinning).toBe(false);
  });

  test("succeed writes green checkmark", () => {
    const spin = createSpinner("task");
    spin.start();
    spin.succeed("done");
    const calls = stdoutWrite.mock.calls.map((c) => String(c[0]));
    const finalCall = calls[calls.length - 1];
    expect(finalCall).toContain(ICON_SUCCESS);
    expect(finalCall).toContain("done");
  });

  test("fail writes red cross", () => {
    const spin = createSpinner("task");
    spin.start();
    spin.fail("failed");
    const calls = stdoutWrite.mock.calls.map((c) => String(c[0]));
    const finalCall = calls[calls.length - 1];
    expect(finalCall).toContain(ICON_ERROR);
    expect(finalCall).toContain("failed");
  });

  test("warn writes yellow warning", () => {
    const spin = createSpinner("task");
    spin.start();
    spin.warn("caution");
    const calls = stdoutWrite.mock.calls.map((c) => String(c[0]));
    const finalCall = calls[calls.length - 1];
    expect(finalCall).toContain(ICON_WARN);
    expect(finalCall).toContain("caution");
  });

  test("info writes blue info", () => {
    const spin = createSpinner("task");
    spin.start();
    spin.info("details");
    const calls = stdoutWrite.mock.calls.map((c) => String(c[0]));
    const finalCall = calls[calls.length - 1];
    expect(finalCall).toContain(ICON_INFO);
    expect(finalCall).toContain("details");
  });

  test("throws on invalid spinner style", () => {
    expect(() => createSpinner("test", { style: "nonexistent" as never })).toThrow(CliToolkitError);
  });

  test("text getter/setter works", () => {
    const spin = createSpinner("initial");
    expect(spin.text).toBe("initial");
    spin.text = "updated";
    expect(spin.text).toBe("updated");
  });
});
