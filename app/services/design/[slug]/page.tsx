"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PaletteIcon, SmartphoneIcon, LayersIcon, MessageIcon, CameraIcon } from "@/lib/icons";
import { useApp } from "@/lib/context";
import data from "@/data/services.json";
import Reveal from "@/components/Reveal";

const DISCORD_URL = "https://discord.gg/DRnxEXCQU";

const subMeta: Record<string, { icon: any; keys: string[] }> = {
  logo: { icon: PaletteIcon, keys: ["logo"] },
  "sosyal-medya": { icon: SmartphoneIcon, keys: ["social"] },
  oyun: { icon: LayersIcon, keys: ["gaming"] },
  discord: { icon: MessageIcon, keys: ["discord"] },
  "icerik-uretici": { icon: CameraIcon, keys: ["creator"] },
};

export default function SubCategoryDetail() {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const meta = subMeta[slug];
  const design = data[lang as "EN" | "TR"].design as any;

  if (!meta) {
    return (
      <div className="page-inner text-center py-20">
        <p className="text-[var(--text2)]">{lang === "TR" ? "Sayfa bulunamadı." : "Page not found."}</p>
        <Link href="/services/design" className="text-[#59abfe] text-sm mt-4 inline-block">
          ← {lang === "TR" ? "Geri dön" : "Go back"}
        </Link>
      </div>
    );
  }

  const sub = design[meta.keys[0]];
  if (!sub) {
    return (
      <div className="page-inner text-center py-20">
        <p className="text-[var(--text2)]">{lang === "TR" ? "Kategori bulunamadı." : "Category not found."}</p>
        <Link href="/services/design" className="text-[#59abfe] text-sm mt-4 inline-block">
          ← {lang === "TR" ? "Geri dön" : "Go back"}
        </Link>
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="page-inner max-w-3xl mx-auto">
      <Reveal>
        <Link href="/services/design" className="text-xs text-[var(--text2)] hover:text-[#59abfe] no-underline mb-4 inline-block">
          ← {lang === "TR" ? "Tasarımlara geri dön" : "Back to designs"}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white">
            <Icon size={22} />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--text)]">{sub.name}</h2>
        </div>

        <p className="text-xs text-[var(--text2)] mb-1">
          {lang === "TR" ? "Tüm tasarımlar 50 TL, sınırsız revize." : "All designs 50 TL, unlimited revisions."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {sub.items.map((item: any, i: number) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4 text-center hover:border-[#59abfe] transition-all">
              <p className="font-medium text-sm text-[var(--text)] mb-2">{item.title}</p>
              <p className="text-lg font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">50 TL</p>
              <p className="text-[10px] text-[var(--text2)] mt-1">
                {lang === "TR" ? "Sınırsız Revize" : "Unlimited Revisions"}
              </p>
            </div>
          ))}
        </div>

        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity no-underline"
          style={{ color: "#fff" }}
        >
          {lang === "TR" ? "Satın Almak İçin Discord'a Katıl" : "Join Discord to Buy"}
        </a>
      </Reveal>
    </div>
  );
}
