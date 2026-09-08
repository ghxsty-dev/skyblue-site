import type { Metadata } from "next";
import RankGeneratorPage from "@/components/minecraft/RankGeneratorPage";

export const metadata: Metadata = {
  title: "Minecraft ItemsAdder Rank PNG Generator | SkyBlue",
  description:
    "Minecraft ItemsAdder için rank görselleri oluşturun. Pixel font, yazı rengi ve arka plan brush editörü.",
  openGraph: {
    title: "Minecraft ItemsAdder Rank PNG Generator | SkyBlue",
    description: "ItemsAdder uyumlu rank PNG görsellerini pixel grid üzerinde oluşturun.",
    url: "https://skyblue.tr/tools/minecraft-rank",
    siteName: "SkyBlue Tasarım Hizmetleri",
    images: [
      {
        url: "https://skyblue.tr/skyblue-design.webp",
        width: 1200,
        height: 630,
        alt: "Minecraft ItemsAdder Rank PNG Generator",
      },
    ],
  },
  alternates: {
    canonical: "/tools/minecraft-rank",
  },
};

export default function MinecraftRankPage() {
  return <RankGeneratorPage />;
}
