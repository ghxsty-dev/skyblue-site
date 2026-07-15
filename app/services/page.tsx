"use client";

import { useApp } from "@/lib/context";
import { PaletteIcon, PenToolIcon, GlobeIcon, BrushIcon, LayersIcon, StarIcon, CameraIcon, MonitorIcon, MessageIcon, MegaphoneIcon, SparklesIcon } from "@/lib/icons";
import data from "@/data/services.json";
import Reveal from "@/components/Reveal";

const iconMap: Record<string, typeof PaletteIcon[]> = {
  design: [PaletteIcon, CameraIcon, PenToolIcon, GlobeIcon, MonitorIcon, StarIcon, SparklesIcon],
  discord: [MessageIcon, MegaphoneIcon, BrushIcon],
  minecraft: [LayersIcon, CameraIcon, PenToolIcon],
};

const cats = ["design", "discord", "minecraft"] as const;

export default function ServicesPage() {
  const { t, lang } = useApp();
  const items = data[lang as "EN" | "TR"];

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

      {cats.map((cat) => {
        const catItems = items[cat];
        const icons = iconMap[cat] || iconMap.design;
        return (
          <div key={cat} className="mb-12">
            <Reveal>
              <h3 className="text-lg font-bold mb-1 text-[var(--text)]">
                {t[`cat${cat.charAt(0).toUpperCase()}${cat.slice(1)}` as keyof typeof t] as string}
              </h3>
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#97cdf2] to-[#59abfe] rounded-full mb-6" />
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catItems.map((item, i) => {
                const Icon = icons[i] || icons[0];
                return (
                  <Reveal key={i} delay={i * 40}>
                    <div className="card">
                      <div className="w-13 h-13 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white mb-4" style={{ width: 52, height: 52 }}>
                        <Icon size={24} />
                      </div>
                      <h4 className="font-bold text-base mb-2">{item.title}</h4>
                      <p className="text-sm text-[var(--text2)]">{item.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
