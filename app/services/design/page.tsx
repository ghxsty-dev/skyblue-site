"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/context";
import { StarIcon, LayersIcon } from "@/lib/icons";
import fallbackData from "@/data/services.json";
import Reveal from "@/components/Reveal";
import Invoice from "@/components/Invoice";

const DISCORD_URL = "https://discord.gg/F3uQ2fU8RV";

interface ApiProduct {
  id: string;
  category: string;
  slug: string | null;
  data: Record<string, unknown>;
  sort_order: number;
}

function getVal(data: Record<string, unknown>, lang: string, key: string): unknown {
  const section = data[lang] as Record<string, unknown> | undefined;
  return section?.[key];
}

function getStr(data: Record<string, unknown>, lang: string, key: string): string {
  return String(getVal(data, lang, key) ?? "");
}

function getNum(data: Record<string, unknown>, lang: string, key: string): number {
  return Number(getVal(data, lang, key) ?? 0);
}

function getArr(data: Record<string, unknown>, lang: string, key: string): string[] {
  const v = getVal(data, lang, key);
  return Array.isArray(v) ? v : [];
}

export default function DesignPage() {
  const { t, lang } = useApp();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [showInvoice, setShowInvoice] = useState(false);

  const [apiPackages, setApiPackages] = useState<ApiProduct[]>([]);
  const [apiDesignItems, setApiDesignItems] = useState<ApiProduct[]>([]);
  const [designDiscount, setDesignDiscount] = useState<{ percent: number; label: string | null }>({ percent: 0, label: null });

  useEffect(() => {
    fetch("/api/design-products", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        const products: ApiProduct[] = result.products || [];
        setApiPackages(products.filter((p) => p.category === "package"));
        setApiDesignItems(products.filter((p) => p.category === "design"));
      })
      .catch(() => {});
    fetch("/api/discounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        const d = (result.discounts || []).find((x: { category: string }) => x.category === "design");
        if (d) setDesignDiscount({ percent: d.percent, label: lang === "TR" ? d.label_tr : d.label_en });
      })
      .catch(() => {});
  }, [lang]);

  const d = fallbackData[lang as "EN" | "TR"];
  const packages = apiPackages.length > 0
    ? apiPackages.map((p) => ({
        title: getStr(p.data, lang, "title"),
        desc: getStr(p.data, lang, "desc"),
        slug: String((p.data as Record<string, unknown>).slug || p.slug || ""),
        basic: getNum(p.data, lang, "basic"),
        pro: getNum(p.data, lang, "pro"),
      }))
    : d.packages;

  const allItems = apiDesignItems.length > 0
    ? apiDesignItems.map((p) => {
        const basePrice = getNum(p.data, lang, "price");
        const discounted = designDiscount.percent > 0 ? Math.round(basePrice * (1 - designDiscount.percent / 100)) : basePrice;
        return {
          title: getStr(p.data, lang, "title"),
          price: discounted,
          basePrice,
          unit: getStr(p.data, lang, "unit") || undefined,
        };
      })
    : (d.design as Record<string, unknown>).all
      ? ((d.design as Record<string, Record<string, unknown>>).all.items as Array<Record<string, unknown>>)
      : [];

  const toggleItem = (itemTitle: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemTitle]: prev[itemTitle] ? 0 : 1,
    }));
  };

  const updateQuantity = (itemTitle: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems((prev) => {
        const next = { ...prev };
        delete next[itemTitle];
        return next;
      });
    } else {
      setSelectedItems((prev) => ({ ...prev, [itemTitle]: qty }));
    }
  };

  const selectedEntries = Object.entries(selectedItems).filter(([, qty]) => qty > 0);
  const selectedCount = selectedEntries.length;

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [itemTitle, qty] of selectedEntries) {
      const item = allItems.find((i: Record<string, unknown>) => String(i.title) === itemTitle);
      if (item) total += Number(item.price || 0) * qty;
    }
    return total;
  }, [selectedEntries, allItems]);

  const getInvoiceItems = () => {
    const items: { title: string; qty: number; price: number }[] = [];
    for (const [itemTitle, qty] of selectedEntries) {
      const item = allItems.find((i: Record<string, unknown>) => String(i.title) === itemTitle);
      if (item) items.push({ title: itemTitle, qty, price: Number(item.price || 0) });
    }
    return items;
  };

  const getSelectedItemInfo = (itemKey: string) => {
    return allItems.find((i: Record<string, unknown>) => String(i.title) === itemKey) || null;
  };

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
            <div className="text-white">
              <StarIcon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[var(--text)]">
                {t.wantPackage}
              </h3>
              <p className="text-xs text-[var(--text2)]">{t.packagesDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {packages.map((pkg: Record<string, unknown>, i: number) => (
              <Link
                key={i}
                href={`/services/design/packages/${pkg.slug}`}
                className="group relative rounded-2xl border border-[var(--border)] p-5 flex flex-col hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#97cdf2]/5 to-[#59abfe]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-white">
                      <StarIcon size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[#59abfe] transition-colors">{String(pkg.title)}</h4>
                  </div>
                  <p className="text-[11px] text-[var(--text2)] mb-4 leading-relaxed">{String(pkg.desc)}</p>
                  <div className="flex items-center gap-2 text-xs mb-3">
                    <div className="flex-1 rounded-xl bg-[var(--bg2)] py-3 px-2">
                      <p className="text-[9px] text-[var(--text2)] text-center mb-1">{lang === "TR" ? "Başlangıç" : "Basic"}</p>
                      <p className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center text-base">{Number(pkg.basic)} TL</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-[var(--bg2)] py-3 px-2">
                      <p className="text-[9px] text-[var(--text2)] text-center mb-1">{lang === "TR" ? "Tam" : "Pro"}</p>
                      <p className="font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center text-base">{Number(pkg.pro)} TL</p>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-[var(--text2)]">
                    {lang === "TR" ? "Sınırsız Revize" : "Unlimited Revisions"}
                  </div>
                </div>
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
            <div className="text-white">
              <LayersIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)]">
              {t.createOwn}
            </h3>
            {designDiscount.percent > 0 && (
              <span className="admin-badge" style={{ background: "rgba(46, 160, 67, 0.15)", color: "#2ea043", border: "1px solid rgba(46, 160, 67, 0.3)" }}>
                %{designDiscount.percent} {designDiscount.label || (lang === "TR" ? "İndirim" : "Off")}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text2)] mb-5">{t.createOwnDesc}</p>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: Items Grid */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allItems.map((item: Record<string, unknown>, ii: number) => {
                  const itemTitle = String(item.title);
                  const qty = selectedItems[itemTitle] || 0;
                  const isSelected = qty > 0;
                  const price = Number(item.price || 0);
                  return (
                    <div
                      key={ii}
                      className={`rounded-xl border p-3 flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? "border-[#59abfe] bg-[#59abfe]/10"
                          : "border-[var(--border)] hover:border-[#59abfe]"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(itemTitle)}
                        className="w-full cursor-pointer bg-transparent border-none p-0"
                      >
                        <span className="text-sm font-medium text-[var(--text)]">{itemTitle}</span>
                        <div className="flex flex-col items-center mt-1">
                          <span className="text-xs font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{Number(item.price || 0)} TL</span>
                          {designDiscount.percent > 0 && Number((item as Record<string, unknown>).basePrice || 0) > 0 && (
                            <span className="text-[9px] text-[var(--text2)] line-through">{String((item as Record<string, unknown>).basePrice)} TL</span>
                          )}
                          {Boolean(item.unit) && (
                            <span className="text-[9px] text-[var(--text2)]">/ {String(item.unit as string)}</span>
                          )}
                        </div>
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(itemTitle, qty - 1)}
                            className="w-6 h-6 rounded-md bg-[var(--bg2)] border border-[var(--border)] text-[var(--text)] text-xs flex items-center justify-center hover:bg-[#59abfe] hover:text-white hover:border-[#59abfe] transition-all cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-[#59abfe] min-w-[20px] text-center">{qty}</span>
                          <button
                            onClick={() => updateQuantity(itemTitle, qty + 1)}
                            className="w-6 h-6 rounded-md bg-[var(--bg2)] border border-[var(--border)] text-[var(--text)] text-xs flex items-center justify-center hover:bg-[#59abfe] hover:text-white hover:border-[#59abfe] transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selection Summary */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="card p-4 border-[var(--border)] sticky top-24">
                <h4 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-[10px] flex items-center justify-center font-bold">{selectedCount}</span>
                  {lang === "TR" ? "Seçili Ürünler" : "Selected Items"}
                </h4>

                {selectedCount === 0 ? (
                  <p className="text-xs text-[var(--text2)] text-center py-6">
                    {lang === "TR" ? "Henüz ürün seçmediniz" : "No items selected yet"}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 mb-4">
                      {selectedEntries.map(([itemKey, qty]) => {
                        const info = getSelectedItemInfo(itemKey);
                        if (!info) return null;
                        const price = Number(info.price || 0);
                        return (
                          <div key={itemKey} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[var(--text)] font-medium truncate">{String(info.title)}</p>
                              <p className="text-[var(--text2)] text-[10px]">x{qty} × {price} TL</p>
                            </div>
                            <span className="font-bold text-[#59abfe] ml-2">{price * qty} TL</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-[var(--border)] pt-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text2)]">{t.totalPrice}</span>
                        <span className="text-lg font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{totalPrice} TL</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowInvoice(true)}
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {lang === "TR" ? "Sipariş Oluştur" : "Create Order"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

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

      {showInvoice && (
        <Invoice
          items={getInvoiceItems()}
          totalPrice={totalPrice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}
