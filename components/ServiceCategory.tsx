"use client";

import { useApp } from "@/lib/context";
import { PaletteIcon, PenToolIcon, GlobeIcon, BrushIcon, LayersIcon, StarIcon, CameraIcon, MonitorIcon, MessageIcon, MegaphoneIcon, SparklesIcon, SmartphoneIcon, CheckIcon, MailIcon } from "@/lib/icons";
import data from "@/data/services.json";
import Reveal from "@/components/Reveal";

const iconMap: Record<string, typeof PaletteIcon[]> = {
  design: [PaletteIcon, CameraIcon, PenToolIcon, MessageIcon, MegaphoneIcon, BrushIcon, GlobeIcon, MonitorIcon, StarIcon, SparklesIcon],
  discord: [CheckIcon, SmartphoneIcon, MailIcon, SparklesIcon],
  minecraft: [LayersIcon, CameraIcon, PenToolIcon],
};

const DISCORD_URL = "https://discord.gg/DRnxEXCQU";

interface Props {
  cat: "discord" | "minecraft";
}

export default function ServiceCategory({ cat }: Props) {
  const { t, lang } = useApp();
  const items = data[lang as "EN" | "TR"][cat] as any[];
  const icons = iconMap[cat] || iconMap.design;

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t[`cat${cat.charAt(0).toUpperCase()}${cat.slice(1)}` as keyof typeof t] as string}
            </span>
          </h2>
          <p>{t.servicesDesc}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any, i: number) => {
          const Icon = icons[i] || icons[0];
          return (
            <Reveal key={i} delay={i * 40}>
              <div className="card flex flex-col">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white mb-4" style={{ width: 52, height: 52 }}>
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-base mb-2">{item.title}</h4>
                <p className="text-sm text-[var(--text2)] flex-1">{item.desc}</p>
                {item.price && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                      {item.price} TL
                    </span>
                    <a
                      href={DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-xs font-medium hover:opacity-80 transition-opacity no-underline" style={{ color: "#fff" }}
                    >
                      {lang === "TR" ? "Satın Al" : "Buy"}
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
