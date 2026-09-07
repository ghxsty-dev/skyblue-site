import type { Metadata } from "next";
import RankGenerator from "@/components/minecraft/RankGenerator";

export const metadata: Metadata = {
  title: "Minecraft ItemsAdder Rank PNG Generator | SkyBlue",
  description:
    "Minecraft ItemsAdder için 9px yüksekliğinde özel rank PNG görselleri oluşturun. Pixel font, yazı rengi ve arka plan brush editörü.",
  openGraph: {
    title: "Minecraft ItemsAdder Rank PNG Generator | SkyBlue",
    description: "ItemsAdder uyumlu 9px rank PNG görsellerini pixel grid üzerinde oluşturun.",
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
  return (
    <div className="page-inner">
      <section className="section-header">
        <h1
          style={{
            fontFamily: "var(--font-monocraft), monospace",
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            background: "linear-gradient(135deg, var(--c1), var(--c2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Minecraft ItemsAdder Rank Generator
        </h1>
        <p>
          ItemsAdder için 9px yüksekliğinde rank görselleri oluşturun. Pixel
          fontunuzu seçin, arka planı brush ile boyayın ve PNG olarak indirin.
        </p>
      </section>

      <RankGenerator />

      <article className="rank-info">
        <h2>Nasıl Kullanılır?</h2>
        <ol>
          <li>
            <strong>Rank adını yazın</strong> — VIP, Admin veya kendi rank
            adınızı girin.
          </li>
          <li>
            <strong>5px font seçin</strong> — Hazır bitmap fontlardan birini
            kullanın.
          </li>
          <li>
            <strong>Arka planı boyayın</strong> — 9px grid üzerinde fırça veya
            silgi ile pixel pixel düzenleyin.
          </li>
          <li>
            <strong>PNG indirin</strong> — Yazı 5px, üst ve alt boşluklar 2px
            olacak şekilde ItemsAdder için PNG alın.
          </li>
        </ol>

        <h2>Özellikler</h2>
        <ul>
          <li>Sabit 9px yükseklik ve metne göre değişen genişlik</li>
          <li>5px yüksekliğinde hazır bitmap fontlar</li>
          <li>Varsayılan SkyBlue mavi arka plan</li>
          <li>1px, 2px ve 3px brush boyutları</li>
          <li>Silgi ile şeffaf arka plan pixel’leri</li>
          <li>Undo, redo, tümünü boya ve arka planı sıfırla</li>
          <li>Native ölçülerde PNG çıktısı</li>
        </ul>
      </article>
    </div>
  );
}
