import type { Metadata } from "next";
import RankGenerator from "@/components/minecraft/RankGenerator";

export const metadata: Metadata = {
  title: "Minecraft Rank Image Generator | Ücretsiz Rank Resmi Oluştur",
  description:
    "Minecraft sunucunuz için özel rank görselleri oluşturun. 5 farklı font, renk ve şekil seçeneği. Ücretsiz, anında PNG indirin.",
  openGraph: {
    title: "Minecraft Rank Image Generator | SkyBlue",
    description:
      "Minecraft sunucunuz için özel rank görselleri oluşturun. Ücretsiz, anında indirin.",
    url: "https://skyblue.tr/tools/minecraft-rank",
    siteName: "SkyBlue Tasarım Hizmetleri",
    images: [
      {
        url: "https://skyblue.tr/skyblue-design.webp",
        width: 1200,
        height: 630,
        alt: "Minecraft Rank Generator",
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
            fontFamily: "var(--font-pixel-heading), monospace",
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            background: "linear-gradient(135deg, var(--c1), var(--c2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Minecraft Rank Generator
        </h1>
        <p>
          Sunucunuz için özel rank görselleri oluşturun. 5 farklı pixel font,
          renk ve şekil seçeneği ile anında PNG olarak indirin.
        </p>
      </section>

      <RankGenerator />

      <article className="rank-info">
        <h2>Nasıl Kullanılır?</h2>
        <ol>
          <li>
            <strong>Rank Adı Yazın</strong> — VIP, Admin, Owner veya kendi
            rank adınızı yazın.
          </li>
          <li>
            <strong>Font Seçin</strong> — 5 farklı pixel fonttan birini seçin.
            Monocraft orijinal Minecraft fontudur.
          </li>
          <li>
            <strong>Renk Belirleyin</strong> — Metin ve arka plan rengini
            paletten seçin veya özel renk girin.
          </li>
          <li>
            <strong>Şekil Seçin</strong> — Dikdörtgen, kalkan, yuvarlak veya
            hexagon şekillerinden birini tercih edin.
          </li>
          <li>
            <strong>İndirin</strong> — PNG butonuna tıklayarak görseli
            indirin.
          </li>
        </ol>

        <h2>Özellikler</h2>
        <ul>
          <li>5 pixel font: Press Start 2P, VT323, Silkscreen, Pixelify Sans, Monocraft</li>
          <li>8 hazır metin rengi + özel renk desteği</li>
          <li>8 hazır arka plan rengi + özel renk desteği</li>
          <li>4 farklı şekil: Dikdörtgen, Kalkan, Yuvarlak, Hexagon</li>
          <li>Kenarlık ve neon glow efekti</li>
          <li>Otomatik boyutlandırma — uzun metinlerde font küçülür</li>
          <li>Tamamen ücretsiz — kayıt gerektirmez</li>
        </ul>
      </article>
    </div>
  );
}
