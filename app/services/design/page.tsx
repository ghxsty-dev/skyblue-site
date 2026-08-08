"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
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

const categoryKeys = ["logo", "social", "gaming", "discord", "creator"] as const;

export default function DesignPage() {
  const { t, lang } = useApp();
  const d = data[lang as "EN" | "TR"];
  const [selectedCategory, setSelectedCategory] = useState<string>("logo");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string, itemTitle: string) => {
    const itemKey = `${key}-${itemTitle}`;
    setSelectedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [key, val] of Object.entries(selectedItems)) {
      if (!val) continue;
      const [catKey, ...rest] = key.split("-");
      const itemTitle = rest.join("-");
      const cat = (d.design as any)[catKey];
      if (cat) {
        const item = cat.items.find((i: any) => i.title === itemTitle);
        if (item) total += item.price;
      }
    }
    return total;
  }, [selectedItems, d]);

  const buildSelectionText = () => {
    const lines: string[] = [];
    for (const key of categoryKeys) {
      const cat = (d.design as any)[key];
      if (!cat) continue;
      const selected = cat.items.filter((item: any) => selectedItems[`${key}-${item.title}`]);
      if (selected.length > 0) {
        lines.push(`**${cat.name}:**`);
        selected.forEach((item: any) => lines.push(`- ${item.title} (${item.price} TL)`));
      }
    }
    if (lines.length > 0) {
      lines.push("");
      lines.push(`**Toplam: ${totalPrice} TL**`);
    }
    return lines.join("\n");
  };

  const sendToDiscord = () => {
    const text = buildSelectionText();
    if (!text) return;
    const message = encodeURIComponent(`Yeni bir özel paket siparişi!\n\n${text}`);
    window.open(`https://discord.gg/DRnxEXCQU?message=${message}`, "_blank");
  };

  const currentCat = (d.design as any)[selectedCategory];

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.catDesign}
            </span>
          </h2>
          <p>{t.wantPackageDesc}</p>
        </div>
      </Reveal>

      {/* Section 1: Packages */}
      <Reveal delay={40}>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <StarIcon size={22} />
            <h3 className="text-lg font-bold text-[var(--text)]">
              {t.wantPackage}
            </h3>
          </div>
          <p className="text-sm text-[var(--text2)] mb-5">{t.packagesDesc}</p>
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
                    <span className="text-[10px] text-[var(--text2)] text-center w-full">{lang === "TR" ? "Başlangıç" : "Basic"}</span>
                    <span className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center w-full">{pkg.basic} TL</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 rounded-lg bg-[var(--bg2)] py-2">
                    <span className="text-[10px] text-[var(--text2)] text-center w-full">{lang === "TR" ? "Tam" : "Pro"}</span>
                    <span className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center w-full">{pkg.pro} TL</span>
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

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-[var(--border)]"></div>
        <span className="text-xs text-[var(--text2)] font-medium">{lang === "TR" ? "VEYA" : "OR"}</span>
        <div className="flex-1 h-px bg-[var(--border)]"></div>
      </div>

      {/* Section 2: Custom Package Builder */}
      <Reveal delay={80}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white">
              <LayersIcon size={16} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)]">
              {t.createOwn}
            </h3>
          </div>
          <p className="text-sm text-[var(--text2)] mb-5">{t.createOwnDesc}</p>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {categoryKeys.map((key) => {
              const cat = (d.design as any)[key];
              if (!cat) return null;
              const Icon = subIcons[categoryKeys.indexOf(key)] || subIcons[0];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === key
                      ? "bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white"
                      : "bg-[var(--bg2)] text-[var(--text2)] hover:text-[var(--text)] border border-[var(--border)]"
                  }`}
                >
                  <Icon size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          {currentCat && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
              {currentCat.items.map((item: any, ii: number) => {
                const itemKey = `${selectedCategory}-${item.title}`;
                const isSelected = selectedItems[itemKey] || false;
                return (
                  <button
                    key={ii}
                    onClick={() => toggleItem(selectedCategory, item.title)}
                    className={`rounded-xl border p-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#59abfe] bg-[#59abfe]/10"
                        : "border-[var(--border)] hover:border-[#59abfe]"
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--text)]">{item.title}</span>
                    <div className="flex flex-col items-center mt-1">
                      <span className="text-xs font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{item.price} TL</span>
                      {item.unit && (
                        <span className="text-[9px] text-[var(--text2)]">/ {item.unit}</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-[#59abfe] mt-1">✓ Seçildi</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Summary & Total */}
          {selectedCount > 0 && (
            <Reveal>
              <div className="card p-5 border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {selectedCount} {t.itemSelected}
                    </p>
                    <p className="text-xs text-[var(--text2)]">
                      {lang === "TR" ? "Discord'a göndermek için hazır" : "Ready to send to Discord"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--text2)]">{t.totalPrice}</p>
                    <p className="text-xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                      {totalPrice} TL
                    </p>
                  </div>
                </div>
                <button
                  onClick={sendToDiscord}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {t.sendToDiscord}
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </Reveal>

      {/* Sub-categories for browsing */}
      <Reveal delay={120}>
        <div className="mb-8">
          <h3 className="text-base font-bold text-[var(--text)] mb-4">{lang === "TR" ? "Tüm Hizmetlerimiz" : "All Our Services"}</h3>
        </div>
      </Reveal>

      {Object.entries(subSlugs).map(([key, slug], si) => {
        const sub = (d.design as any)[key];
        if (!sub) return null;
        const Icon = subIcons[si] || subIcons[0];
        return (
          <div key={key} className="mb-10">
            <Reveal delay={140 + si * 30}>
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
                    <div className="flex flex-col items-center mt-1">
                      <span className="text-xs font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{item.price} TL</span>
                      {item.unit && (
                        <span className="text-[9px] text-[var(--text2)]">/ {item.unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {sub.items.length > 4 && (
                <Link href={`/services/design/${slug}`} className="text-[11px] text-[var(--text2)] mt-2 text-center no-underline block hover:text-[#59abfe] transition-colors">
                  {lang === "TR" ? `+${sub.items.length - 4} daha fazla hizmet` : `+${sub.items.length - 4} more services`}
                  <span className="text-[#59abfe] ml-1">
                    {lang === "TR" ? "Tümünü gör →" : "View all →"}
                  </span>
                </Link>
              )}
            </Reveal>
          </div>
        );
      })}

      <Reveal delay={280}>
        <div className="text-center mt-4">
          <p className="text-xs text-[var(--text2)] mb-3">
            {lang === "TR" ? "Satın almak için Discord sunucumuza katılın." : "Join our Discord to purchase."}
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
