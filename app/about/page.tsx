"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";
import contactData from "@/data/contact.json";

const TR = {
  title: "Hakkımızda",
  sections: [
    {
      h: "1. Biz Kimiz?",
      p: "SkyBlue, 2023 yılında Hellex ve Ghxsty tarafından kurulan, dijital dünyada markaların ihtiyaç duyduğu profesyonel tasarım hizmetlerini sunan genç ve dinamik bir ekiptir. Logo tasarımı, kurumsal kimlik, Discord bot geliştirme, Minecraft sunucu tasarımları ve daha birçok alanda müşterilerimize yaratıcı ve işlevsel çözümler üretiyoruz.",
    },
    {
      h: "2. Amacımız",
      p: "Her projede estetik ve kaliteyi bir arada sunarak müşterilerimizin dijital dünyada fark edilmesini sağlamaktır. Müşterilerimize özel çözümler üreterek markalarını bir adım öteye taşımayı hedefliyoruz.",
    },
    {
      h: "3. Ekibimiz",
      p: "SkyBlue ekibi, tasarım ve teknoloji alanlarında uzman profesyonellerden oluşmaktadır. Her bir projede titizlikle çalışan ekibimiz, müşteri memnuniyetini ön planda tutarak en iyi sonuçları elde etmeye odaklanmaktadır.",
    },
    {
      h: "4. Değerlerimiz",
      p: "Kalite, yaratıcılık, şeffaflık ve müşteri memnuniyeti. Her projede bu değerleri temel alarak hareket ediyoruz. Sürekli öğrenme ve gelişim felsefesiyle, sektöre yön vermeye devam etmeyi hedefliyoruz.",
    },
  ],
};

const EN = {
  title: "About Us",
  sections: [
    {
      h: "1. Who Are We?",
      p: "SkyBlue is a young and dynamic team founded in 2023 by Hellex and Ghxsty, providing professional design services that brands need in the digital world. We produce creative and functional solutions for our customers in areas such as logo design, corporate identity, Discord bot development, Minecraft server design, and more.",
    },
    {
      h: "2. Our Mission",
      p: "To ensure that our customers stand out in the digital world by presenting aesthetics and quality together in every project. We aim to take their brands to the next level with custom solutions.",
    },
    {
      h: "3. Our Team",
      p: "The SkyBlue team consists of professionals specialized in design and technology. Working meticulously on every project, our team focuses on achieving the best results by prioritizing customer satisfaction.",
    },
    {
      h: "4. Our Values",
      p: "Quality, creativity, transparency and customer satisfaction. We act based on these values in every project. With our philosophy of continuous learning and development, we aim to continue leading the sector.",
    },
  ],
};

export default function AboutPage() {
  const { lang } = useApp();
  const data = lang === "TR" ? TR : EN;
  const info = contactData[lang as "EN" | "TR"];

  const socials = [
    { label: "Discord", url: info.discordUrl },
    { label: "Instagram", url: info.instagramUrl },
    { label: "TikTok", url: info.tiktokUrl },
    { label: "YouTube", url: info.youtubeUrl },
  ];

  return (
    <div className="page-inner max-w-3xl mx-auto">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {data.title}
            </span>
          </h2>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="py-2">
          {data.sections.map((s, i) => (
            <div key={i} className="mb-8">
              <h3 className="text-base font-bold text-[var(--text)] mb-3 pb-2 border-b border-[var(--border)]">
                {s.h}
              </h3>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{s.p}</p>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text)] mb-4">
              {lang === "TR" ? "Bizi Takip Edin" : "Follow Us"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[var(--bg2)] border border-[var(--border)] text-sm text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all no-underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
