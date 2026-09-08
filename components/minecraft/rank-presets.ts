export type GradientDirection = "vertical" | "horizontal";

export interface GradientPreset {
  id: string;
  nameTr: string;
  nameEn: string;
  from: string;
  to: string;
  text: string;
}

/**
 * Örnek VIP görselindeki gibi: açık → doygun yumuşak dikey geçişler.
 * Her preset herhangi bir metinle tek tıkla kullanılabilir.
 */
export const GRADIENT_PRESETS: readonly GradientPreset[] = [
  { id: "sunny", nameTr: "VIP Sarısı", nameEn: "Sunny VIP", from: "#fff6a5", to: "#ffaa00", text: "#ffffff" },
  { id: "lava", nameTr: "Lav Turuncu", nameEn: "Lava Orange", from: "#ffd8a8", to: "#f97316", text: "#ffffff" },
  { id: "sky", nameTr: "Gökyüzü Mavi", nameEn: "Sky Blue", from: "#bde0fe", to: "#2f80ed", text: "#ffffff" },
  { id: "mint", nameTr: "Zümrüt Yeşil", nameEn: "Emerald", from: "#b9f6ca", to: "#00a86b", text: "#ffffff" },
  { id: "grape", nameTr: "Kral Moru", nameEn: "Royal Purple", from: "#e0c3fc", to: "#7b2cbf", text: "#ffffff" },
  { id: "candy", nameTr: "Şeker Pembe", nameEn: "Candy Pink", from: "#ffc2d1", to: "#ff4d6d", text: "#ffffff" },
  { id: "crimson", nameTr: "Kırmızı", nameEn: "Crimson", from: "#ff8fa3", to: "#c1121f", text: "#ffffff" },
  { id: "midnight", nameTr: "Gece", nameEn: "Midnight", from: "#4a5568", to: "#0b0d10", text: "#ffffff" },
  { id: "snow", nameTr: "Kar Beyazı", nameEn: "Snow", from: "#ffffff", to: "#b8c4d4", text: "#0b0d10" },
];

export const MAX_RANK_LENGTH = 24;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return [
    Number.parseInt(full.slice(0, 2), 16) || 0,
    Number.parseInt(full.slice(2, 4), 16) || 0,
    Number.parseInt(full.slice(4, 6), 16) || 0,
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHex(from: string, to: string, t: number): string {
  const amount = clamp01(t);
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * amount, g1 + (g2 - g1) * amount, b1 + (b2 - b1) * amount);
}

/**
 * Profesyonel rank hissi için: dikey geçiş + üstte hafif parlama, altta hafif gölge.
 * Yatay modda soldan sağa yumuşak geçiş.
 */
export function buildGradientGrid(
  width: number,
  height: number,
  from: string,
  to: string,
  direction: GradientDirection = "vertical",
): (string | null)[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const t = direction === "vertical" ? (height <= 1 ? 0 : y / (height - 1)) : width <= 1 ? 0 : x / (width - 1);
      // Üstte daha açık başla, alta doğru doygunlaş (örnek VIP stili)
      const eased = t * t * 0.25 + t * 0.75;
      let color = mixHex(from, to, eased);
      if (direction === "vertical") {
        if (y === 0) color = mixHex(color, "#ffffff", 0.22);
        else if (y === height - 1) color = mixHex(color, "#000000", 0.12);
      } else {
        if (x === 0) color = mixHex(color, "#ffffff", 0.14);
        else if (x === width - 1) color = mixHex(color, "#000000", 0.1);
      }
      return color;
    }),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  try {
    const l1 = luminance(a);
    const l2 = luminance(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  } catch {
    return 1;
  }
}

/** Renk seçimini kolaylaştıran aile sistemi: her ailenin Açık / Normal / Koyu tonu. */
export interface ColorShade {
  labelTr: string;
  labelEn: string;
  value: string;
}

export interface ColorFamily {
  id: string;
  nameTr: string;
  nameEn: string;
  shades: ColorShade[];
}

const LIGHT = { labelTr: "Açık", labelEn: "Light" };
const REGULAR = { labelTr: "Normal", labelEn: "Regular" };
const DARK = { labelTr: "Koyu", labelEn: "Dark" };

export const COLOR_FAMILIES: readonly ColorFamily[] = [
  {
    id: "neutral",
    nameTr: "Beyaz / Siyah",
    nameEn: "White / Black",
    shades: [
      { labelTr: "Beyaz", labelEn: "White", value: "#ffffff" },
      { labelTr: "Gri", labelEn: "Gray", value: "#94a3b8" },
      { labelTr: "Koyu Gri", labelEn: "Dark Gray", value: "#334155" },
      { labelTr: "Siyah", labelEn: "Black", value: "#0b0d10" },
    ],
  },
  {
    id: "yellow",
    nameTr: "Sarı",
    nameEn: "Yellow",
    shades: [
      { ...LIGHT, value: "#fef08a" },
      { ...REGULAR, value: "#eab308" },
      { ...DARK, value: "#a16207" },
    ],
  },
  {
    id: "orange",
    nameTr: "Turuncu",
    nameEn: "Orange",
    shades: [
      { ...LIGHT, value: "#fed7aa" },
      { ...REGULAR, value: "#f97316" },
      { ...DARK, value: "#c2410c" },
    ],
  },
  {
    id: "red",
    nameTr: "Kırmızı",
    nameEn: "Red",
    shades: [
      { ...LIGHT, value: "#fecaca" },
      { ...REGULAR, value: "#ef4444" },
      { ...DARK, value: "#991b1b" },
    ],
  },
  {
    id: "pink",
    nameTr: "Pembe",
    nameEn: "Pink",
    shades: [
      { ...LIGHT, value: "#f9a8d4" },
      { ...REGULAR, value: "#ec4899" },
      { ...DARK, value: "#9d174d" },
    ],
  },
  {
    id: "purple",
    nameTr: "Mor",
    nameEn: "Purple",
    shades: [
      { ...LIGHT, value: "#c4b5fd" },
      { ...REGULAR, value: "#8b5cf6" },
      { ...DARK, value: "#5b21b6" },
    ],
  },
  {
    id: "blue",
    nameTr: "Mavi",
    nameEn: "Blue",
    shades: [
      { ...LIGHT, value: "#93c5fd" },
      { labelTr: "Sky", labelEn: "Sky", value: "#59abfe" },
      { ...REGULAR, value: "#3b82f6" },
      { ...DARK, value: "#1e40af" },
    ],
  },
  {
    id: "green",
    nameTr: "Yeşil",
    nameEn: "Green",
    shades: [
      { ...LIGHT, value: "#86efac" },
      { ...REGULAR, value: "#22c55e" },
      { ...DARK, value: "#166534" },
    ],
  },
  {
    id: "teal",
    nameTr: "Turkuaz",
    nameEn: "Teal",
    shades: [
      { ...LIGHT, value: "#5eead4" },
      { ...REGULAR, value: "#14b8a6" },
      { ...DARK, value: "#115e59" },
    ],
  },
];

/** Verilen zeminde okunacak yazı rengi (beyaz/siyah). */
export function readableOn(hex: string): string {
  try {
    return luminance(hex) > 0.35 ? "#0b0d10" : "#ffffff";
  } catch {
    return "#ffffff";
  }
}
