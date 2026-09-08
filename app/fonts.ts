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

const minicomputer = localFont({
  src: "../public/fonts/Minicomputer.otf",
  variable: "--font-minicomputer",
  display: "swap",
});

const pirataOne = localFont({
  src: "../public/fonts/PirataOne.ttf",
  variable: "--font-pirata",
  display: "swap",
});

const penmanship = localFont({
  src: "../public/fonts/KGPerfectPenmanship.ttf",
  variable: "--font-penmanship",
  display: "swap",
});

const typewriter = localFont({
  src: "../public/fonts/MonospaceTypewriter.ttf",
  variable: "--font-typewriter",
  display: "swap",
});

export {
  pressStart2P,
  vt323,
  silkscreen,
  pixelifySans,
  monocraft,
  minicomputer,
  pirataOne,
  penmanship,
  typewriter,
};
