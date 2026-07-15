"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import { PaletteIcon, SmartphoneIcon, LayersIcon, MessageIcon, CameraIcon, StarIcon } from "@/lib/icons";
import data from "@/data/services.json";
import Reveal from "@/components/Reveal";

const DISCORD_URL = "https://discord.gg/DRnxEXCQU";
const subIcons = [PaletteIcon, SmartphoneIcon, LayersIcon, MessageIcon, CameraIcon];

const subSlugs: Record<string, string> = {
  logo: "logo",
  social: "sosyal-medya",
  gaming: "oyun",
  discord: "discord",
  creator: "icerik-uretici",
};

export default function DesignPage() {
  const { t, lang } = useApp();
  const d = data[lang as "EN" | "TR"];

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.catDesign}
            </span>
          </h2>
          <p>{t.servicesDesc}</p>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="card p-6 mb-10 border-[var(--border)]">
          <div className="flex items-center gap-3 mb-5">
            <StarIcon size={22} />
            <h3 className="text-lg font-bold text-[var(--text)]">
              {lang === "TR" ? "Paketler" : "Packages"}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.packages.map((pkg: any, i: number) => (
              <Link
                key={i}
                href={`/services/design/packages/${pkg.slug}`}
                className="rounded-xl border border-[var(--border)] p-4 flex flex-col hover:border-[#59abfe] transition-all no-underline cursor-pointer"
              >
                <h4 className="font-bold text-sm text-[var(--text)] mb-1">{pkg.title}</h4>
                <p className="text-[11px] text-[var(--text2)] mb-3 flex-1">{pkg.desc}</p>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex flex-col items-center flex-1 rounded-lg bg-[var(--bg2)] py-2">
                    <span className="text-[10px] text-[var(--text2)]">{lang === "TR" ? "Başlangıç" : "Basic"}</span>
                    <span className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{pkg.basic} TL</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 rounded-lg bg-[var(--bg2)] py-2">
                    <span className="text-[10px] text-[var(--text2)]">{lang === "TR" ? "Tam" : "Pro"}</span>
                    <span className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{pkg.pro} TL</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text2)] text-center mt-2">
                  {lang === "TR" ? "Sınırsız Revize" : "Unlimited Revisions"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {Object.entries(subSlugs).map(([key, slug], si) => {
        const sub = (d.design as any)[key];
        if (!sub) return null;
        const Icon = subIcons[si] || subIcons[0];
        return (
          <div key={key} className="mb-10">
            <Reveal delay={60 + si * 30}>
              <Link href={`/services/design/${slug}`} className="flex items-center gap-2 mb-4 no-underline group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
                  <Icon size={16} />
                </div>
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[#59abfe] transition-colors">{sub.name}</h3>
                <span className="text-xs text-[#59abfe] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {sub.items.slice(0, 4).map((item: any, ii: number) => (
                  <div key={ii} className="rounded-xl border border-[var(--border)] p-3 flex flex-col items-center text-center hover:border-[#59abfe] transition-all">
                    <span className="text-sm font-medium text-[var(--text)]">{item.title}</span>
                    <span className="text-xs font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent mt-1">50 TL</span>
                  </div>
                ))}
              </div>
              {sub.items.length > 4 && (
                <p className="text-[11px] text-[var(--text2)] mt-2 text-center">
                  {lang === "TR" ? `+${sub.items.length - 4} daha fazla hizmet` : `+${sub.items.length - 4} more services`}
                  <span className="text-[#59abfe] ml-1">
                    {lang === "TR" ? "Tümünü gör →" : "View all →"}
                  </span>
                </p>
              )}
            </Reveal>
          </div>
        );
      })}

      <Reveal delay={180}>
        <div className="text-center mt-4">
          <p className="text-xs text-[var(--text2)] mb-3">
            {lang === "TR" ? "Tüm tasarımlar 50 TL. Satın almak için Discord sunucumuza katılın." : "All designs 50 TL. Join our Discord to purchase."}
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity no-underline"
            style={{ color: "#fff" }}
          >
            {lang === "TR" ? "Discord Sunucumuza Katıl" : "Join Our Discord"}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
