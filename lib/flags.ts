/**
 * Flags. Windows cannot draw flag emoji (it shows letters like "US"), so we ship real flag images in /public/flags
 * and derive the right one from the emoji (🇺🇸 -> us). A flag image uploaded in the dashboard always wins.
 * Client-safe: no Node APIs.
 */
export const BUILTIN_FLAGS = ["ae","sa","qa","kw","bh","om","jo","eg","tr","in","pk","bd","lk","ph","id","my","sg","th","cn","jp","kr","au","nz","ca","us","gb","ie","de","fr","it","es","nl","ch","se","no","dk","ru","za","ng","ke","br","mx","ar"];

/** "🇺🇸" -> "us" (empty string when it is not a flag emoji) */
export function emojiToCode(emoji?: string): string {
  const pts = [...(emoji ?? "")].map((c) => c.codePointAt(0) ?? 0).filter((p) => p >= 0x1f1e6 && p <= 0x1f1ff);
  return pts.length === 2 ? pts.map((p) => String.fromCharCode(p - 0x1f1e6 + 97)).join("") : "";
}

export function builtinFlag(code?: string): string | undefined {
  const c = (code ?? "").toLowerCase();
  return BUILTIN_FLAGS.includes(c) ? `/flags/${c}.svg` : undefined;
}

/** Best image for a country: uploaded flag > built-in flag from emoji > none */
export function flagSrc(c: { flagImage?: string; flag?: string }): string | undefined {
  return c.flagImage || builtinFlag(emojiToCode(c.flag));
}
