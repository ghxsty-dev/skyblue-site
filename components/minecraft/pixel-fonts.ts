export type Glyph = readonly string[];

export interface PixelFont {
  id: string;
  name: string;
  glyphs: Record<string, Glyph>;
}

const BASE_GLYPHS: Record<string, Glyph> = {
  A: ["01110", "10001", "11111", "10001", "10001"],
  B: ["11110", "10001", "11110", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "11110", "10000", "11111"],
  F: ["11111", "10000", "11110", "10000", "10000"],
  G: ["01111", "10000", "10111", "10001", "01111"],
  H: ["10001", "10001", "11111", "10001", "10001"],
  I: ["111", "010", "010", "010", "111"],
  J: ["00111", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "11100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "11110", "10000", "10000"],
  Q: ["01110", "10001", "10101", "10011", "01111"],
  R: ["11110", "10001", "11110", "10010", "10001"],
  S: ["01111", "10000", "01110", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10101", "11011", "10001"],
  X: ["10001", "01010", "00100", "01010", "10001"],
  Y: ["10001", "01010", "00100", "00100", "00100"],
  Z: ["11111", "00010", "00100", "01000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "01110"],
  "1": ["00100", "01100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00010", "00100", "11111"],
  "3": ["11110", "00001", "00110", "00001", "11110"],
  "4": ["10010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "11110"],
  "6": ["01110", "10000", "11110", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "00100"],
  "8": ["01110", "10001", "01110", "10001", "01110"],
  "9": ["01110", "10001", "01111", "00001", "01110"],
  "?": ["01110", "10001", "00010", "00000", "00010"],
  "!": ["00100", "00100", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00100"],
  ",": ["00000", "00000", "00000", "00100", "01000"],
  ":": ["00000", "00100", "00000", "00100", "00000"],
  "-": ["00000", "00000", "11111", "00000", "00000"],
  "_": ["00000", "00000", "00000", "00000", "11111"],
  "/": ["00001", "00010", "00100", "01000", "10000"],
  " ": ["000", "000", "000", "000", "000"],
};

function compactGlyph(glyph: Glyph): Glyph {
  return glyph.map((row) =>
    [0, 1, 2, 3].map((column) => row[column] === "1" || row[column + 1] === "1" ? "1" : "0").join("")
  );
}

function outlineGlyph(glyph: Glyph): Glyph {
  return glyph.map((row, y) =>
    row.split("").map((cell, x) => {
      if (cell !== "1") return "0";
      const neighbours = [
        glyph[y - 1]?.[x],
        glyph[y + 1]?.[x],
        row[x - 1],
        row[x + 1],
      ];
      return neighbours.every((neighbour) => neighbour === "1") ? "0" : "1";
    }).join("")
  );
}

const COMPACT_GLYPHS = Object.fromEntries(
  Object.entries(BASE_GLYPHS).map(([key, glyph]) => [key, compactGlyph(glyph)])
) as Record<string, Glyph>;

const OUTLINE_GLYPHS = Object.fromEntries(
  Object.entries(BASE_GLYPHS).map(([key, glyph]) => [key, outlineGlyph(glyph)])
) as Record<string, Glyph>;

export const PIXEL_FONTS: readonly PixelFont[] = [
  { id: "block", name: "Block 5", glyphs: BASE_GLYPHS },
  { id: "compact", name: "Compact 5", glyphs: COMPACT_GLYPHS },
  { id: "outline", name: "Outline 5", glyphs: OUTLINE_GLYPHS },
];

export function getPixelFont(id: string): PixelFont {
  return PIXEL_FONTS.find((font) => font.id === id) || PIXEL_FONTS[0];
}

export function normalizeRankText(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[İI]/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[^A-Z0-9?!.,:_/ -]/g, "?")
    .slice(0, 32);
}

export function buildPixelText(font: PixelFont, value: string) {
  const text = normalizeRankText(value) || "VIP";
  const rows = Array.from({ length: 5 }, () => [] as string[]);

  for (const character of text) {
    const glyph = font.glyphs[character] || font.glyphs["?"];
    for (let row = 0; row < 5; row += 1) rows[row].push(glyph[row]);
    for (let row = 0; row < 5; row += 1) rows[row].push("0");
  }

  return {
    text,
    rows: rows.map((row) => row.slice(0, -1).join("")),
    width: rows[0].join("").length - 1,
  };
}
