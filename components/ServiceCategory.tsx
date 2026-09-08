"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { PaletteIcon, PenToolIcon, GlobeIcon, BrushIcon, LayersIcon, StarIcon, CameraIcon, MonitorIcon, MessageIcon, MegaphoneIcon, SparklesIcon, SmartphoneIcon, CheckIcon, MailIcon } from "@/lib/icons";
import fallbackData from "@/data/services.json";
import Reveal from "@/components/Reveal";
import { formatPrice, getDiscountedPrice } from "@/lib/pricing";

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

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  price?: number;
  basePrice?: number;
}

interface DiscountState {
  percent: number;
  labelEn: string | null;
  labelTr: string | null;
}

const EMPTY_DISCOUNT: DiscountState = { percent: 0, labelEn: null, labelTr: null };

function getStr(data: Record<string, unknown>, lang: string, key: string): string {
  const section = (data[lang] || data[lang.toLowerCase()]) as Record<string, unknown> | undefined;
  return String(section?.[key] ?? "");
}

function getNum(data: Record<string, unknown>, lang: string, key: string): number {
  const section = (data[lang] || data[lang.toLowerCase()]) as Record<string, unknown> | undefined;
  return Number(section?.[key] ?? 0);
}

function getFallbackItems(cat: "discord" | "minecraft", lang: string): ServiceItem[] {
  const source = fallbackData[lang as "EN" | "TR"][cat] as Array<Record<string, unknown>>;
  return source.map((item, index) => {
    const basePrice = Number(item.price || 0);
    return {
      id: `fallback-${cat}-${index}`,
      title: String(item.title || ""),
      desc: String(item.desc || ""),
      price: basePrice > 0 ? basePrice : undefined,
      basePrice: basePrice > 0 ? basePrice : undefined,
    };
  });
}

interface Props {
  cat: "discord" | "minecraft";
  desc?: string;
}

export default function ServiceCategory({ cat, desc }: Props) {
  const { t, lang } = useApp();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [discount, setDiscount] = useState<DiscountState>(EMPTY_DISCOUNT);
  const icons = iconMap[cat] || iconMap.design;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [productsResponse, discountsResponse] = await Promise.all([
          fetch("/api/design-products", { cache: "no-store" }),
          fetch("/api/discounts", { cache: "no-store" }),
        ]);
        if (!productsResponse.ok) throw new Error("PRODUCTS_FAILED");

        const result = await productsResponse.json();
        const products: ApiProduct[] = result.products || [];
        const catItems = products.filter((p) => p.category === cat);
        const nextItems = catItems.map((p) => {
          const basePrice = getNum(p.data, lang, "price");
          return {
            id: p.id,
            title: getStr(p.data, lang, "title"),
            desc: getStr(p.data, lang, "desc"),
            price: basePrice > 0 ? basePrice : undefined,
            basePrice: basePrice > 0 ? basePrice : undefined,
          };
        });

        let nextDiscount = EMPTY_DISCOUNT;
        if (discountsResponse.ok) {
          const discountResult = await discountsResponse.json();
          const activeDiscount = (discountResult.discounts || []).find((item: { category: string }) => item.category === cat);
          if (activeDiscount) {
            nextDiscount = {
              percent: Number(activeDiscount.percent) || 0,
              labelEn: activeDiscount.label_en || null,
              labelTr: activeDiscount.label_tr || null,
            };
          }
        }

        if (!cancelled) {
          setItems(nextItems);
          setDiscount(nextDiscount);
        }
      } catch {
        if (!cancelled) {
          setItems(getFallbackItems(cat, lang));
          setDiscount(EMPTY_DISCOUNT);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [cat, lang]);

  const hasDiscount = discount.percent > 0;
  const discountLabel = lang === "TR" ? discount.labelTr : discount.labelEn;

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
              {discountLabel || `%${discount.percent} ${lang === "TR" ? "İndirim" : "Off"}`}
            </span>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const Icon = icons[i] || icons[0];
          const finalPrice = item.price == null ? undefined : getDiscountedPrice(item.price, discount.percent);
          return (
            <Reveal key={item.id} delay={i * 40}>
              <div className="card flex flex-col">
                <div className="mb-4 text-white">
                  <Icon size={32} />
                </div>
                <h4 className="font-bold text-base mb-2">{item.title}</h4>
                <p className="text-sm text-[var(--text2)] flex-1">{item.desc}</p>
                {finalPrice != null && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                        {formatPrice(finalPrice)} TL
                      </span>
                      {hasDiscount && item.basePrice != null && (
                        <span className="text-xs text-[var(--text2)] line-through">{formatPrice(item.basePrice)} TL</span>
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
