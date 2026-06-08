import cac from "cac";
import { color } from "./color";
import { createProgress } from "./progress";
import { createSpinner } from "./spinner";
import type { CLIAction, CLIBuilder, CommandBuilder, CommandSetup, ProgressOptions, SpinnerInstance } from "./types";

/**
 * Parse positional argument names from a CAC command pattern.
 *
 * `'build <input> [output]'` → `['input', 'output']`
 */
function parsePositionalNames(rawName: string): string[] {
  const names: string[] = [];
  const re = /[<[](\w+)[>\]]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawName)) !== null) {
    names.push(match[1]);
  }
  return names;
}

/**
 * Create a CLI application with an opinionated builder API.
 *
 * Auto-attaches `--help` and `--version`. Each command's action handler
 * receives a typed options object and a `ctx` with built-in access to
 * spinner, progress bar, and colors.
 *
 * ```ts
 * const cli = createCLI('my-app', '1.0.0').description('My CLI')
 *
 * cli.command('build <input>', 'Build the project', (cmd) => {
 *   cmd.option('--out <dir>', 'Output dir', { default: 'dist' })
 *   cmd.option('--prod', 'Production mode')
 *   cmd.action(async (options, ctx) => {
 *     const spin = ctx.spinner('Building...')
 *     spin.start()
 *     // ...
 *     spin.succeed('Built!')
 *   })
 * })
 *
 * cli.parse()
 * ```
 */
export function createCLI(name: string, version?: string): CLIBuilder {
  const cli = cac(name);

  if (version) {
    cli.version(version);
  }
  cli.help();

  function createContext() {
    return {
      color,
      spinner(text?: string): SpinnerInstance {
        return createSpinner(text);
      },
      progress(options: ProgressOptions) {
        return createProgress(options);
      },
    };
  }

  const builder: CLIBuilder = {
    description(text: string) {
      cli.usage(text);
      return builder;
    },

    command(rawName: string, description: string, setup: CommandSetup) {
      const positionalNames = parsePositionalNames(rawName);
      const rawCmd = cli.command(rawName, description);

      const cmdBuilder: CommandBuilder = {
        option(name, desc, config) {
          rawCmd.option(name, desc, config);
          return cmdBuilder;
        },
        alias(name) {
          rawCmd.alias(name);
          return cmdBuilder;
        },
        action<T>(handler: CLIAction<T>) {
          rawCmd.action((...args: unknown[]) => {
            // CAC passes positional args first, options object last
            const options = args[args.length - 1] as Record<string, unknown>;
            // Merge positional args into options using their declared names
            for (let i = 0; i < positionalNames.length; i++) {
              options[positionalNames[i]] = args[i];
            }
            const ctx = createContext();
            return handler(options as T, ctx);
          });
        },
      };

      setup(cmdBuilder);
      return builder;
    },

    parse(argv?: string[]) {
      cli.parse(argv ?? process.argv.slice(2));
    },
  };

  return builder;
}
