import cac from "cac";
import { color } from "./color";
import { CliToolkitError } from "./errors";
import { createProgress } from "./progress";
import { createSpinner } from "./spinner";
import type {
  BannerOption,
  CLIAction,
  CLIBuilder,
  CLIOptions,
  CommandBuilder,
  CommandSetup,
  ProgressOptions,
  SpinnerInstance,
} from "./types";

/**
 * Parse positional argument names from a CAC command pattern.
 *
 * `'build <input> [output]'` → `['input', 'output']`
 */
function parsePositionalNames(rawName: string): string[] {
  const names: string[] = [];
  const re = /[<[](\w+)[>\]]/g;
  for (let match = re.exec(rawName); match; match = re.exec(rawName)) {
    names.push(match[1]);
  }
  return names;
}

/**
 * Resolve the banner text to display before a command action runs.
 *
 * Returns `null` when the banner should be suppressed.
 */
function resolveBanner(
  config: BannerOption | undefined,
  name: string,
  version?: string,
): string | null {
  if (config === false || config === undefined) {
    return null;
  }
  if (typeof config === "string") {
    if (!config) return null; // empty string → suppress
    return config.replace(/\{name\}/g, name).replace(/\{version\}/g, version ?? "");
  }
  // config === true: show default "name v{version}" only when version is set
  if (!version) return null;
  return `${color.bold(color.cyan(name))} ${color.yellow(`v${version}`)}`;
}

/**
 * Create a CLI application with an opinionated builder API.
 *
 * Auto-attaches `--help` and `--version`. Each command's action handler
 * receives a typed options object and a `ctx` with built-in access to
 * spinner, progress bar, and colors.
 *
 * When a `version` is provided, a styled banner (`name v{version}`) is
 * automatically printed to stderr before every command action. Use
 * `.banner(false)` to disable or `.banner("Custom {name} {version}")`
 * to customize.
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
export function createCLI(name: string, version?: string, options?: CLIOptions): CLIBuilder {
  const cli = cac(name);

  if (version) {
    cli.version(version);
  }
  cli.help();

  // Banner config: defaults to true when version is provided
  let bannerConfig: BannerOption | undefined = options?.banner ?? (version ? true : undefined);

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

    banner(text?: BannerOption) {
      bannerConfig = text ?? true;
      return builder;
    },

    command(rawName: string, description: string, setup: CommandSetup) {
      const positionalNames = parsePositionalNames(rawName);
      const rawCmd = cli.command(rawName, description);

      const cmdBuilder: CommandBuilder = {
        option(name, desc, config) {
          rawCmd.option(name, desc ?? "", config);
          return cmdBuilder;
        },
        alias(name) {
          rawCmd.alias(name);
          return cmdBuilder;
        },
        action<T>(handler: CLIAction<T>) {
          rawCmd.action((...args: unknown[]) => {
            // Print banner before action (once per parse call)
            const bannerText = resolveBanner(bannerConfig, name, version);
            if (bannerText) {
              console.error(bannerText);
            }

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
      try {
        if (argv) {
          // Direct argv (tests use format: ['node', 'test', 'status'])
          cli.parse(argv);
        } else {
          // Pass full process.argv — CAC internally does argv.slice(2)
          cli.parse(process.argv);
        }
      } catch (err) {
        // Wrap CAC errors (not exported, match by name) into CliToolkitError
        if (err instanceof Error && err.name === "CACError") {
          throw new CliToolkitError(err.message);
        }
        throw err;
      }
    },
  };

  return builder;
}
