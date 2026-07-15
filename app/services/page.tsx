"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import { PaletteIcon, MessageIcon, LayersIcon } from "@/lib/icons";
import Reveal from "@/components/Reveal";

const cats = [
  { key: "design", icon: PaletteIcon },
  { key: "discord", icon: MessageIcon },
  { key: "minecraft", icon: LayersIcon },
] as const;

export default function ServicesOverview() {
  const { t, lang } = useApp();

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.servicesTitle}
            </span>
          </h2>
          <p>{t.servicesDesc}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cats.map((cat, i) => {
          const Icon = cat.icon;
          const key = cat.key;
          const catKey = `cat${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof t;
          const descKey = `${catKey}Desc` as keyof typeof t;
          return (
            <Reveal key={key} delay={i * 60}>
              <Link
                href={`/services/${key}`}
                className="card group flex flex-col items-center text-center py-10 px-6 cursor-pointer no-underline"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white mb-5 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={30} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  {t[catKey] as string}
                </h3>
                <p className="text-sm text-[var(--text2)]">
                  {t[descKey] as string}
                </p>
                <span className="mt-4 text-xs font-medium text-[#59abfe] group-hover:underline">
                  {lang === "TR" ? "İncele →" : "Explore →"}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={180}>
        <a
          href="https://discord.gg/DRnxEXCQU"
          target="_blank"
          rel="noopener noreferrer"
          className="card flex items-center justify-between max-w-2xl mx-auto mt-10 px-8 py-5 no-underline hover:border-[#59abfe] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
              <MessageIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                {lang === "TR" ? "Daha fazla bilgi mi almak istiyorsun?" : "Want to learn more?"}
              </p>
              <p className="text-xs text-[var(--text2)]">
                {lang === "TR" ? "Discord sunucumuza katıl!" : "Join our Discord server!"}
              </p>
            </div>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-xs font-medium whitespace-nowrap">
            {lang === "TR" ? "Katıl" : "Join"}
          </span>
        </a>
      </Reveal>
    </div>
  );
}
