/**
 * Standardized terminal icons.
 *
 * Single source of truth for all status symbols used across koko.
 * Import these instead of hardcoding Unicode characters.
 *
 * ```ts
 * import { ICON_SUCCESS, ICON_ERROR } from "koko"
 * console.log(`${ICON_SUCCESS} Build complete`)
 * ```
 */

/** ✔ — success / complete */
export const ICON_SUCCESS = "\u2714 ";

/** ✘ — error / failure */
export const ICON_ERROR = "\u2718 ";

/** ⚠ — warning */
export const ICON_WARN = "\u26A0 ";

/** ℹ — info */
export const ICON_INFO = "\u2139 ";
