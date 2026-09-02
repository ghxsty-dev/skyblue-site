import { Press_Start_2P, VT323, Silkscreen, Pixelify_Sans } from "next/font/google";
import localFont from "next/font/local";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-heading",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
  display: "swap",
});

const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-ui",
  display: "swap",
});

const pixelifySans = Pixelify_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-pixelify",
  display: "swap",
});

const monocraft = localFont({
  src: "../public/fonts/Monocraft.ttf",
  variable: "--font-monocraft",
  display: "swap",
});

export {
  pressStart2P,
  vt323,
  silkscreen,
  pixelifySans,
  monocraft,
};

// Canvas font family names (must match what document.fonts.load() uses)
export const MINECRAFT_FONTS = [
  { id: "monocraft", name: "Monocraft", fontFamily: "Monocraft", cssVar: "var(--font-monocraft)" },
  { id: "press-start", name: "Press Start 2P", fontFamily: "Press Start 2P", cssVar: "var(--font-pixel-heading)" },
  { id: "vt323", name: "VT323", fontFamily: "VT323", cssVar: "var(--font-pixel-body)" },
  { id: "silkscreen", name: "Silkscreen", fontFamily: "Silkscreen", cssVar: "var(--font-pixel-ui)" },
  { id: "pixelify", name: "Pixelify Sans", fontFamily: "Pixelify Sans", cssVar: "var(--font-pixelify)" },
] as const;

export type MinecraftFontId = (typeof MINECRAFT_FONTS)[number]["id"];
