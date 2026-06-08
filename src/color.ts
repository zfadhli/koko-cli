import pc from "picocolors";

// Color/style names exported by picocolors
export type ColorName =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright";

export type StyleName =
  | "reset"
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "inverse"
  | "hidden"
  | "strikethrough";

// Build the color palette type from all color + style names
type ColorFunctions = {
  [K in ColorName | StyleName]: (text: string) => string;
};

/**
 * Minimal color palette — a plain object wrapping picocolors.
 *
 * Stateless, no factory needed. Import and use:
 *
 * ```ts
 * import { color } from 'koko'
 * color.red('error')
 * color.bold(color.green('success'))
 * ```
 */
export const color: ColorFunctions = {
  reset: pc.reset,
  bold: pc.bold,
  dim: pc.dim,
  italic: pc.italic,
  underline: pc.underline,
  inverse: pc.inverse,
  hidden: pc.hidden,
  strikethrough: pc.strikethrough,
  black: pc.black,
  red: pc.red,
  green: pc.green,
  yellow: pc.yellow,
  blue: pc.blue,
  magenta: pc.magenta,
  cyan: pc.cyan,
  white: pc.white,
  gray: pc.gray,
  blackBright: pc.blackBright,
  redBright: pc.redBright,
  greenBright: pc.greenBright,
  yellowBright: pc.yellowBright,
  blueBright: pc.blueBright,
  magentaBright: pc.magentaBright,
  cyanBright: pc.cyanBright,
  whiteBright: pc.whiteBright,
};
