"use client";

import { useApp } from "@/lib/context";
import { SparklesIcon, LayersIcon, PaletteIcon, PenToolIcon, GlobeIcon, StarIcon } from "@/lib/icons";
import data from "@/data/services.json";

const serviceIcons = [SparklesIcon, LayersIcon, PaletteIcon, PenToolIcon, GlobeIcon, StarIcon];

export default function ServicesPage() {
  const { t, lang } = useApp();
  const items = data[lang];

  return (
    <div className="page-inner">
      <div className="section-header">
        <h2>
          <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
            {t.servicesTitle}
          </span>
        </h2>
        <p>{t.servicesDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const Icon = serviceIcons[i] || serviceIcons[0];
          return (
            <div key={i} className="card">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white mb-4" style={{ width: 52, height: 52 }}>
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text2)]">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
