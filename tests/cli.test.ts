import { describe, expect, mock, test } from "bun:test";
import { createCLI } from "../src/cli";

describe("createCLI", () => {
  test("creates a CLI builder with the correct interface", () => {
    const cli = createCLI("test-app", "1.0.0");
    expect(cli).toHaveProperty("description");
    expect(cli).toHaveProperty("command");
    expect(cli).toHaveProperty("parse");
    expect(typeof cli.description).toBe("function");
    expect(typeof cli.command).toBe("function");
    expect(typeof cli.parse).toBe("function");
  });

  test("description returns the builder for chaining", () => {
    const cli = createCLI("test");
    const result = cli.description("My app");
    expect(result).toBe(cli);
  });

  test("command returns the builder for chaining", () => {
    const cli = createCLI("test");
    const result = cli.command("hello", "Say hello", () => {});
    expect(result).toBe(cli);
  });

  test("command action receives merged options and ctx", () => {
    const cli = createCLI("test");
    const handler = mock();

    cli.command("greet <name>", "Greet someone", (cmd) => {
      cmd.option("--greeting <text>", "Greeting");
      cmd.action(handler);
    });

    cli.parse(["node", "test", "greet", "World", "--greeting", "Hi"]);

    expect(handler).toHaveBeenCalledTimes(1);
    const [options, ctx] = handler.mock.calls[0];
    expect(options).toMatchObject({
      name: "World",
      greeting: "Hi",
    });
    // ctx should have the helpers
    expect(ctx).toHaveProperty("color");
    expect(ctx).toHaveProperty("spinner");
    expect(ctx).toHaveProperty("progress");
    expect(typeof ctx.color.red).toBe("function");
    expect(typeof ctx.spinner).toBe("function");
    expect(typeof ctx.progress).toBe("function");
  });

  test("command without positional args still works", () => {
    const cli = createCLI("test");
    const handler = mock();

    cli.command("status", "Show status", (cmd) => {
      cmd.option("--verbose", "Verbose output");
      cmd.action(handler);
    });

    cli.parse(["node", "test", "status", "--verbose"]);

    expect(handler).toHaveBeenCalledTimes(1);
    const [options, ctx] = handler.mock.calls[0];
    expect(options).toMatchObject({ verbose: true });
    expect(ctx).toBeTruthy();
  });

  test("multiple positional args are merged correctly", () => {
    const cli = createCLI("test");
    const handler = mock();

    cli.command("copy <src> <dest>", "Copy file", (cmd) => {
      cmd.action(handler);
    });

    cli.parse(["node", "test", "copy", "a.txt", "b.txt"]);

    const [options] = handler.mock.calls[0];
    expect(options).toMatchObject({
      src: "a.txt",
      dest: "b.txt",
    });
  });

  test("action with async handler does not throw", async () => {
    const cli = createCLI("test");
    let resolved = false;

    cli.command("build", "Build", (cmd) => {
      cmd.action(async (_options, ctx) => {
        const spin = ctx.spinner("building...");
        spin.start();
        await Promise.resolve();
        spin.succeed("done");
        resolved = true;
      });
    });

    cli.parse(["node", "test", "build"]);
    // Wait a tick for the async handler
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  test("ctx.spinner creates a working spinner", () => {
    const cli = createCLI("test");
    const handler = mock();

    cli.command("task", "Run task", (cmd) => {
      cmd.action((_options, ctx) => {
        const spin = ctx.spinner("working");
        spin.start();
        spin.stop("done");
        handler();
      });
    });

    cli.parse(["node", "test", "task"]);
    expect(handler).toHaveBeenCalled();
  });

  test("ctx.progress creates a working progress bar", () => {
    const cli = createCLI("test");
    const handler = mock();

    cli.command("build", "Build", (cmd) => {
      cmd.action((_options, ctx) => {
        const bar = ctx.progress({ total: 10 });
        bar.increment(5);
        bar.stop();
        handler();
      });
    });

    cli.parse(["node", "test", "build"]);
    expect(handler).toHaveBeenCalled();
  });
});
