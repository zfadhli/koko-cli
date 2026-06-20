import { describe, expect, test, vi } from "vitest";
import { createCLI } from "../src/cli";
import { CliToolkitError } from "../src/errors";

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
    const handler = vi.fn();

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
    const handler = vi.fn();

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
    const handler = vi.fn();

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
    const handler = vi.fn();

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
    const handler = vi.fn();

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

  test("parse wraps CAC errors into CliToolkitError", () => {
    const cli = createCLI("test");
    cli.command("greet <name>", "Greet someone", (cmd) => {
      cmd.action(() => {});
    });
    expect(() => cli.parse(["node", "test", "greet"])).toThrow(CliToolkitError);
  });

  // ─── Banner tests ──────────────────────────────────────────

  describe("banner", () => {
    test("prints name and version before action when version is set", () => {
      const cli = createCLI("test-app", "1.0.0");
      const handler = vi.fn();
      const stderr = vi.fn();
      const origError = console.error;
      console.error = stderr;

      cli.command("hello", "Say hello", (cmd) => {
        cmd.action(handler);
      });

      cli.parse(["node", "test", "hello"]);

      expect(stderr).toHaveBeenCalledTimes(1);
      expect(stderr.mock.calls[0][0]).toContain("test-app");
      expect(stderr.mock.calls[0][0]).toContain("v1.0.0");
      expect(handler).toHaveBeenCalledTimes(1);
      console.error = origError;
    });

    test("suppressed with .banner(false)", () => {
      const cli = createCLI("test-app", "1.0.0");
      const handler = vi.fn();
      const stderr = vi.fn();
      const origError = console.error;
      console.error = stderr;

      cli.banner(false);
      cli.command("hello", "Say hello", (cmd) => {
        cmd.action(handler);
      });

      cli.parse(["node", "test", "hello"]);

      expect(stderr).toHaveBeenCalledTimes(0);
      console.error = origError;
    });

    test("not printed when version is not set", () => {
      const cli = createCLI("test-app");
      const handler = vi.fn();
      const stderr = vi.fn();
      const origError = console.error;
      console.error = stderr;

      cli.command("hello", "Say hello", (cmd) => {
        cmd.action(handler);
      });

      cli.parse(["node", "test", "hello"]);

      expect(stderr).toHaveBeenCalledTimes(0);
      console.error = origError;
    });

    test("custom text with {name} and {version} substitution", () => {
      const cli = createCLI("test-app", "2.0.0");
      const handler = vi.fn();
      const stderr = vi.fn();
      const origError = console.error;
      console.error = stderr;

      cli.banner("=== {name} v{version} ===");
      cli.command("hello", "Say hello", (cmd) => {
        cmd.action(handler);
      });

      cli.parse(["node", "test", "hello"]);

      expect(stderr).toHaveBeenCalledTimes(1);
      expect(stderr.mock.calls[0][0]).toBe("=== test-app v2.0.0 ===");
      console.error = origError;
    });

    test("suppressed via createCLI third argument", () => {
      const cli = createCLI("test-app", "1.0.0", { banner: false });
      const handler = vi.fn();
      const stderr = vi.fn();
      const origError = console.error;
      console.error = stderr;

      cli.command("hello", "Say hello", (cmd) => {
        cmd.action(handler);
      });

      cli.parse(["node", "test", "hello"]);

      expect(stderr).toHaveBeenCalledTimes(0);
      console.error = origError;
    });

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

    test("not printed for --version flag", () => {
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

        cli.parse(["node", "test", "--version"]);

        expect(stderr).toHaveBeenCalledTimes(0);
        expect(handler).toHaveBeenCalledTimes(0);
      } finally {
        console.error = origError;
        process.exit = origExit;
      }
    });
  });
});
