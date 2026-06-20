/**
 * koko — Color examples
 *
 * Run:  nub examples/01-color.ts
 *
 * Demonstrates:
 *   - All 24 color/style functions
 *   - Nesting (composing color + style)
 *   - Real-world patterns: status badges, headers, dim hints, diffs
 */

import { color, ICON_ERROR, ICON_INFO, ICON_SUCCESS, ICON_WARN } from "../src/index.ts";

function separator(title: string) {
  console.log(`\n${color.bold(color.cyan(`═══ ${title} ═══`))}\n`);
}

// ─── Basic colors ───────────────────────────────────────────

separator("Basic colors");

console.log(`${color.red("red")}        ${color.green("green")}      ${color.yellow("yellow")}`);
console.log(`${color.blue("blue")}       ${color.magenta("magenta")}    ${color.cyan("cyan")}`);
console.log(`${color.white("white")}      ${color.gray("gray")}       ${color.black("black")}`);

// ─── Bright colors ──────────────────────────────────────────

separator("Bright colors");

console.log(
  `${color.redBright("redBright")}  ${color.greenBright("greenBright")}  ${color.yellowBright("yellowBright")}`,
);
console.log(
  `${color.blueBright("blueBright")} ${color.magentaBright("magentaBright")} ${color.cyanBright("cyanBright")}`,
);
console.log(
  `${color.whiteBright("whiteBright")} ${color.blackBright("blackBright")}  ${color.gray("gray")}`,
);

// ─── Text styles ────────────────────────────────────────────

separator("Text styles");

console.log(
  `${color.reset("reset")}  ${color.bold("bold")}  ${color.dim("dim")}  ${color.italic("italic")}`,
);
console.log(
  `${color.underline("underline")}  ${color.inverse("inverse")}  ${color.hidden("hidden")}  ${color.strikethrough("strikethrough")}`,
);

// ─── Nesting (composing styles) ─────────────────────────────

separator("Nesting (composed styles)");

console.log(color.bold(color.red("bold + red")));
console.log(color.dim(color.green("dim + green")));
console.log(color.underline(color.yellow("underline + yellow")));
console.log(color.bold(color.italic(color.cyan("bold + italic + cyan"))));
console.log(color.bold(color.dim(color.magenta("bold + dim + magenta"))));

// ─── Real-world: status badges ──────────────────────────────

separator("Status badges");

const ok = color.bold(color.green(` ${ICON_SUCCESS} `));
const fail = color.bold(color.red(` ${ICON_ERROR} `));
const warn = color.bold(color.yellow(` ${ICON_WARN} `));
const info = color.bold(color.blue(` ${ICON_INFO} `));

console.log(`${ok} Build completed in 2.3s`);
console.log(`${fail} Tests failed: 1 error, 2 warnings`);
console.log(`${warn} Deprecated API used in src/app.ts`);
console.log(`${info} 3 new vulnerabilities found`);

// ─── Real-world: colored headers ────────────────────────────

separator("Section headers");

function printHeader(title: string) {
  const line = "─".repeat(title.length + 4);
  console.log(color.bold(color.cyan(`┌${line}┐`)));
  console.log(color.bold(color.cyan(`│  ${title}  │`)));
  console.log(color.bold(color.cyan(`└${line}┘`)));
}

printHeader(" INSTALLATION REPORT ");
console.log(`  ${color.green(ICON_SUCCESS)} koko     ${color.dim("1.2.3")}`);
console.log(`  ${color.green(ICON_SUCCESS)} cac      ${color.dim("7.0.0")}`);
console.log(`  ${color.red(ICON_ERROR)} unknown  ${color.dim("— version conflict")}`);

// ─── Real-world: diff-style output ──────────────────────────

separator("Diff-style output");

console.log(
  `  ${color.green("+")} ${color.greenBright("src/index.ts")}          ${color.dim("added 42 lines")}`,
);
console.log(
  `  ${color.red("-")} ${color.redBright("src/old.ts")}           ${color.dim("removed 10 lines")}`,
);
console.log(
  `  ${color.yellow("~")} ${color.yellowBright("src/app.ts")}          ${color.dim("modified 7 lines")}`,
);

// ─── Real-world: dim prose with highlighted keywords ────────

separator("Dim prose with highlights");

console.log(`${color.dim("info")} ${color.dim("→ resolving dependencies...")}`);
console.log(
  `${color.dim("info")} ${color.dim("found")} ${color.bold(color.cyan("57"))} ${color.dim("packages")}`,
);
console.log(
  `${color.dim("info")} ${color.dim("packed")} ${color.bold(color.green("14"))} ${color.dim("files in")} ${color.bold(color.magenta("482ms"))}`,
);
