import type { Glyph } from "./pixel-fonts";

export interface RankIcon {
  id: string;
  nameTr: string;
  nameEn: string;
  /** 5px fontlar için 5x5 */
  rows5: Glyph;
  /** 7px fontlar için 7x7 */
  rows7: Glyph;
}

export const RANK_ICONS: readonly RankIcon[] = [
  {
    id: "star",
    nameTr: "Yıldız",
    nameEn: "Star",
    rows5: ["00100", "01110", "11111", "01110", "10101"],
    rows7: ["0001000", "0001000", "0111110", "1111111", "0111110", "0110110", "0100010"],
  },
  {
    id: "heart",
    nameTr: "Kalp",
    nameEn: "Heart",
    rows5: ["11011", "11111", "11111", "01110", "00100"],
    rows7: ["0110110", "1111111", "1111111", "1111111", "0111110", "0011100", "0001000"],
  },
  {
    id: "crown",
    nameTr: "Taç",
    nameEn: "Crown",
    rows5: ["10101", "11111", "01110", "01110", "11111"],
    rows7: ["1010101", "1111111", "0111110", "0111110", "0111110", "0111110", "1111111"],
  },
  {
    id: "diamond",
    nameTr: "Elmas",
    nameEn: "Diamond",
    rows5: ["00100", "01110", "11111", "01110", "00100"],
    rows7: ["0001000", "0011100", "0111110", "1111111", "0111110", "0011100", "0001000"],
  },
  {
    id: "bolt",
    nameTr: "Şimşek",
    nameEn: "Bolt",
    rows5: ["00111", "00110", "01110", "00110", "01100"],
    rows7: ["0001111", "0001110", "0001100", "0011100", "0011000", "0111000", "0110000"],
  },
];

export const SLOT_NONE = "none";
export const SLOT_SPACE = "space";
export const SLOT_CUSTOM = "custom";

export function isKnownSlot(value: string): boolean {
  return value === SLOT_NONE || value === SLOT_SPACE || value === SLOT_CUSTOM || RANK_ICONS.some((icon) => icon.id === value);
}

export interface ResolvedSlot {
  width: number;
  /** null = sadece boşluk (zemin uzar, simge çizilmez) */
  rows: Glyph | null;
}

/**
 * Slot değerini font yüksekliğine uygun kare alana çözer.
 * Bilinmeyen değerler "yok" sayılır (kilitlenme yok).
 */
export function resolveSlot(value: string | null | undefined, fontHeight: number): ResolvedSlot | null {
  if (!value || value === SLOT_NONE) return null;
  const size = fontHeight <= 5 ? 5 : 7;
  if (value === SLOT_SPACE) return { width: size, rows: null };
  const icon = RANK_ICONS.find((item) => item.id === value);
  if (!icon) return null;
  const rows = size === 5 ? icon.rows5 : icon.rows7;
  return { width: rows[0].length, rows };
}
