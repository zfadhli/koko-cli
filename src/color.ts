import { styleText } from "node:util";

/**
 * Valid format names for `node:util.styleText`.
 * Covers all runtime-supported names including extras beyond the `@types/node` `InspectColor` type.
 */
export type Format =
  | "reset"
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "inverse"
  | "hidden"
  | "strikethrough"
  | "blink"
  | "doubleunderline"
  | "framed"
  | "overlined"
  | "faint"
  | "conceal"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright"
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite"
  | "bgGray"
  | "bgGrey"
  | "bgBlackBright"
  | "bgRedBright"
  | "bgGreenBright"
  | "bgYellowBright"
  | "bgBlueBright"
  | "bgMagentaBright"
  | "bgCyanBright"
  | "bgWhiteBright";

/**
 * Chainable color object.
 *
 * ```ts
 * import { color } from 'koko'
 * color.red('error')
 * color.bold.green('success')
 * color.red.bold.underline('urgent')
 * ```
 */
export type kaler = ((text: string) => string) & {
  [K in Format]: kaler;
};

function create(format: Format[]): kaler {
  return new Proxy((text: string) => text, {
    get: (_, prop) => create([...format, prop as Format]),
    // styleText types don't cover all runtime format names; cast is safe
    apply: (_, __, [text]: [string]) => styleText(format as Parameters<typeof styleText>[0], text),
  }) as kaler;
}

/**
 * Color API built on `node:util.styleText`.
 * Zero dependencies — uses Node.js built-in.
 */
export const color = create([]);
