import type { CSSProperties } from "react";

export interface NameFontOption {
  id: string;
  label: string;
  /** null = site varsayılan fontu */
  css: string | null;
}

export const NAME_FONTS: readonly NameFontOption[] = [
  { id: "default", label: "Varsayılan", css: null },
  { id: "minicomputer", label: "Minicomputer", css: "var(--font-minicomputer), monospace" },
  { id: "pirata", label: "Pirata One", css: "var(--font-pirata), serif" },
  { id: "penmanship", label: "Penmanship", css: "var(--font-penmanship), cursive" },
  { id: "typewriter", label: "Typewriter", css: "var(--font-typewriter), monospace" },
];

export interface NameStyle {
  font: string;
  from: string;
  to: string | null;
}

export const DEFAULT_NAME_STYLE: NameStyle = { font: "default", from: "#ffffff", to: null };

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function normalizeNameStyle(input: { font?: unknown; from?: unknown; to?: unknown }): NameStyle | null {
  const font = typeof input.font === "string" ? input.font : "default";
  if (!NAME_FONTS.some((f) => f.id === font)) return null;
  const from = typeof input.from === "string" ? input.from.toLowerCase() : "";
  if (!HEX_RE.test(from)) return null;
  const rawTo = typeof input.to === "string" && input.to.trim() !== "" ? input.to.toLowerCase() : null;
  if (rawTo !== null && !HEX_RE.test(rawTo)) return null;
  return { font, from, to: rawTo };
}

/** Premium isim stilini satır içi stile çevirir. Varsayılan stilde undefined döner. */
export function nameTextStyle(style: NameStyle): CSSProperties | undefined {
  const css = NAME_FONTS.find((f) => f.id === style.font)?.css || undefined;
  const isDefault = style.font === "default" && style.from.toLowerCase() === "#ffffff" && !style.to;
  if (isDefault) return undefined;
  if (style.to) {
    return {
      fontFamily: css,
      backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  return { fontFamily: css, color: style.from };
}
