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

export const MINECRAFT_FONTS = [
  { id: "press-start", name: "Press Start 2P", cssVar: "var(--font-pixel-heading)", style: "8-bit arcade" },
  { id: "vt323", name: "VT323", cssVar: "var(--font-pixel-body)", style: "CRT terminal" },
  { id: "silkscreen", name: "Silkscreen", cssVar: "var(--font-pixel-ui)", style: "compact pixel" },
  { id: "pixelify", name: "Pixelify Sans", cssVar: "var(--font-pixelify)", style: "modern pixel" },
  { id: "monocraft", name: "Monocraft", cssVar: "var(--font-monocraft)", style: "Minecraft native" },
] as const;
