import cac from "cac";
import { color } from "./color";
import { CliToolkitError } from "./errors";
import { createProgress } from "./progress";
import { createSpinner } from "./spinner";
import type {
  CLIAction,
  CLIBuilder,
  CommandBuilder,
  CommandSetup,
  ProgressOptions,
  SpinnerInstance,
} from "./types";

export function createCLI(
  name: string,
  version?: string,
  options?: { banner?: string | boolean },
): CLIBuilder {
  const cli = cac(name);

  if (version) {
    cli.version(version);
  }
  cli.help();

  // Banner config: defaults to true when version is provided
  let bannerConfig: string | boolean | undefined = options?.banner ?? (version ? true : undefined);

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

    banner(text?: string | boolean) {
      bannerConfig = text ?? true;
      return builder;
    },

    command(rawName: string, description: string, setup: CommandSetup) {
      // Parse positional argument names from pattern like 'build <input> [output]'
      const positionalNames: string[] = [];
      const re = /[<[](\w+)[>\]]/g;
      for (let match = re.exec(rawName); match; match = re.exec(rawName)) {
        positionalNames.push(match[1]);
      }
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
            // Resolve and print banner before action
            const cfg = bannerConfig;
            let bannerText: string | null = null;
            if (cfg === true) {
              if (version) {
                bannerText = `${color.bold(color.cyan(name))} ${color.yellow(`v${version}`)}`;
              }
            } else if (typeof cfg === "string" && cfg) {
              bannerText = cfg.replace(/\{name\}/g, name).replace(/\{version\}/g, version ?? "");
            }
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
