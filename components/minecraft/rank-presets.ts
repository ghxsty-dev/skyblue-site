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
 * Seçilen renklerin birebir göründüğü temiz geçiş: soldan sağa / yukarıdan
 * aşağıya doğrusal interpolasyon, ekstra parlama yok.
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
      return mixHex(from, to, t);
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

/** Kompakt hazır renk listesi + kullanıcının ekleyip sakladığı renkler. */
export interface QuickColor {
  labelTr: string;
  labelEn: string;
  value: string;
}

export const QUICK_COLORS: readonly QuickColor[] = [
  { labelTr: "Beyaz", labelEn: "White", value: "#ffffff" },
  { labelTr: "Gri", labelEn: "Gray", value: "#94a3b8" },
  { labelTr: "Koyu Gri", labelEn: "Dark Gray", value: "#334155" },
  { labelTr: "Siyah", labelEn: "Black", value: "#0b0d10" },
  { labelTr: "Sarı", labelEn: "Yellow", value: "#eab308" },
  { labelTr: "Koyu Sarı", labelEn: "Dark Yellow", value: "#a16207" },
  { labelTr: "Turuncu", labelEn: "Orange", value: "#f97316" },
  { labelTr: "Koyu Turuncu", labelEn: "Dark Orange", value: "#c2410c" },
  { labelTr: "Kırmızı", labelEn: "Red", value: "#ef4444" },
  { labelTr: "Koyu Kırmızı", labelEn: "Dark Red", value: "#991b1b" },
  { labelTr: "Pembe", labelEn: "Pink", value: "#ec4899" },
  { labelTr: "Koyu Pembe", labelEn: "Dark Pink", value: "#9d174d" },
  { labelTr: "Mor", labelEn: "Purple", value: "#8b5cf6" },
  { labelTr: "Koyu Mor", labelEn: "Dark Purple", value: "#5b21b6" },
  { labelTr: "Açık Mavi", labelEn: "Light Blue", value: "#59abfe" },
  { labelTr: "Koyu Mavi", labelEn: "Dark Blue", value: "#1e40af" },
  { labelTr: "Yeşil", labelEn: "Green", value: "#22c55e" },
  { labelTr: "Koyu Yeşil", labelEn: "Dark Green", value: "#166534" },
  { labelTr: "Turkuaz", labelEn: "Teal", value: "#14b8a6" },
  { labelTr: "Koyu Turkuaz", labelEn: "Dark Teal", value: "#115e59" },
];

export const CUSTOM_COLORS_KEY = "rank-custom-colors";
export const MAX_CUSTOM_COLORS = 12;

export function parseCustomColors(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is string => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c))
      .map((c) => c.toLowerCase())
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .slice(0, MAX_CUSTOM_COLORS);
  } catch {
    return [];
  }
}
