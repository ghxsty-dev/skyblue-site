"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import { PaletteIcon, MessageIcon, LayersIcon } from "@/lib/icons";
import Reveal from "@/components/Reveal";

const cats = [
  { key: "design", icon: PaletteIcon, color: "from-purple-400 to-blue-500" },
  { key: "discord", icon: MessageIcon, color: "from-indigo-400 to-blue-500" },
  { key: "minecraft", icon: LayersIcon, color: "from-green-400 to-blue-500" },
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
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${cat.color} flex items-center justify-center text-white mb-5 transition-transform duration-300 group-hover:scale-110`}>
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
    </div>
  );
}
