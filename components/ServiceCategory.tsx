"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { PaletteIcon, PenToolIcon, GlobeIcon, BrushIcon, LayersIcon, StarIcon, CameraIcon, MonitorIcon, MessageIcon, MegaphoneIcon, SparklesIcon, SmartphoneIcon, CheckIcon, MailIcon } from "@/lib/icons";
import Reveal from "@/components/Reveal";

const iconMap: Record<string, typeof PaletteIcon[]> = {
  design: [PaletteIcon, CameraIcon, PenToolIcon, MessageIcon, MegaphoneIcon, BrushIcon, GlobeIcon, MonitorIcon, StarIcon, SparklesIcon],
  discord: [CheckIcon, SmartphoneIcon, MailIcon, SparklesIcon],
  minecraft: [LayersIcon, CameraIcon, PenToolIcon],
};

const DISCORD_URL = "https://discord.gg/F3uQ2fU8RV";

interface ApiProduct {
  id: string;
  category: string;
  slug: string | null;
  data: Record<string, unknown>;
  sort_order: number;
}

function getStr(data: Record<string, unknown>, lang: string, key: string): string {
  const section = data[lang] as Record<string, unknown> | undefined;
  return String(section?.[key] ?? "");
}

function getNum(data: Record<string, unknown>, lang: string, key: string): number {
  const section = data[lang] as Record<string, unknown> | undefined;
  return Number(section?.[key] ?? 0);
}

interface Props {
  cat: "discord" | "minecraft";
  desc?: string;
}

export default function ServiceCategory({ cat, desc }: Props) {
  const { t, lang } = useApp();
  const [items, setItems] = useState<Array<{ title: string; desc: string; price?: number; basePrice?: number }>>([]);
  const [discount, setDiscount] = useState<{ percent: number; label: string | null }>({ percent: 0, label: null });
  const icons = iconMap[cat] || iconMap.design;

  useEffect(() => {
    fetch("/api/design-products", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        const products: ApiProduct[] = result.products || [];
        const catItems = products.filter((p) => p.category === cat);
        setItems(catItems.map((p) => {
          const basePrice = getNum(p.data, lang, "price");
          return {
            title: getStr(p.data, lang, "title"),
            desc: getStr(p.data, lang, "desc"),
            price: basePrice,
            basePrice,
          };
        }));
      })
      .catch(() => setItems([]));
    fetch("/api/discounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        const d = (result.discounts || []).find((x: { category: string }) => x.category === cat);
        if (d) setDiscount({ percent: d.percent, label: lang === "TR" ? d.label_tr : d.label_en });
      })
      .catch(() => {});
  }, [cat, lang]);

  const hasDiscount = discount.percent > 0;

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t[`cat${cat.charAt(0).toUpperCase()}${cat.slice(1)}` as keyof typeof t] as string}
            </span>
          </h2>
          <p>{desc || t.servicesDesc}</p>
          {hasDiscount && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(46, 160, 67, 0.15)", color: "#2ea043", border: "1px solid rgba(46, 160, 67, 0.3)" }}>
              %{discount.percent} {discount.label || (lang === "TR" ? "İndirim" : "Off")}
            </span>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const Icon = icons[i] || icons[0];
          const finalPrice = hasDiscount && item.price ? Math.round(item.price * (1 - discount.percent / 100)) : item.price;
          return (
            <Reveal key={i} delay={i * 40}>
              <div className="card flex flex-col">
                <div className="mb-4 text-white">
                  <Icon size={32} />
                </div>
                <h4 className="font-bold text-base mb-2">{item.title}</h4>
                <p className="text-sm text-[var(--text2)] flex-1">{item.desc}</p>
                {finalPrice != null && finalPrice > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                        {finalPrice} TL
                      </span>
                      {hasDiscount && item.basePrice && (
                        <span className="text-xs text-[var(--text2)] line-through">{item.basePrice} TL</span>
                      )}
                    </div>
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
