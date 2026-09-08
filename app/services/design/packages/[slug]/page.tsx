"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import fallbackData from "@/data/services.json";
import Reveal from "@/components/Reveal";
import { formatPrice, getDiscountedPrice } from "@/lib/pricing";

const DISCORD_URL = "https://discord.gg/F3uQ2fU8RV";

interface ApiProduct {
  id: string;
  category: string;
  slug: string | null;
  data: Record<string, unknown>;
  sort_order: number;
}

function getStr(data: Record<string, unknown>, lang: string, key: string): string {
  const section = (data[lang] || data[lang.toLowerCase()]) as Record<string, unknown> | undefined;
  return String(section?.[key] ?? "");
}

function getNum(data: Record<string, unknown>, lang: string, key: string): number {
  const section = (data[lang] || data[lang.toLowerCase()]) as Record<string, unknown> | undefined;
  return Number(section?.[key] ?? 0);
}

function getArr(data: Record<string, unknown>, lang: string, key: string): string[] {
  const section = (data[lang] || data[lang.toLowerCase()]) as Record<string, unknown> | undefined;
  const v = section?.[key];
  return Array.isArray(v) ? v : [];
}

interface DiscountState {
  percent: number;
  labelEn: string | null;
  labelTr: string | null;
}

const EMPTY_DISCOUNT: DiscountState = { percent: 0, labelEn: null, labelTr: null };

export default function PackageDetail() {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const [pkg, setPkg] = useState<Record<string, unknown> | null>(null);
  const [discount, setDiscount] = useState<DiscountState>(EMPTY_DISCOUNT);
  const [loaded, setLoaded] = useState(false);

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
        const found = products.find((p) => {
          if (p.category !== "package") return false;
          const rootSlug = String((p.data as Record<string, unknown>).slug || "");
          const sEn = getStr(p.data, "en", "slug");
          const sTr = getStr(p.data, "tr", "slug");
          return rootSlug === slug || sEn === slug || sTr === slug || p.slug === slug;
        });

        let nextDiscount = EMPTY_DISCOUNT;
        if (discountsResponse.ok) {
          const discountResult = await discountsResponse.json();
          const activeDiscount = (discountResult.discounts || []).find((item: { category: string }) => item.category === "design");
          if (activeDiscount) {
            nextDiscount = {
              percent: Number(activeDiscount.percent) || 0,
              labelEn: activeDiscount.label_en || null,
              labelTr: activeDiscount.label_tr || null,
            };
          }
        }

        const fallbackPackage = products.length === 0
          ? fallbackData[lang as "EN" | "TR"].packages.find((item: Record<string, unknown>) => String(item.slug) === slug)
          : undefined;
        if (!cancelled) {
          setPkg(found?.data || fallbackPackage || null);
          setDiscount(nextDiscount);
          setLoaded(true);
        }
      } catch {
        const d = fallbackData[lang as "EN" | "TR"];
        const found = d.packages.find((p: Record<string, unknown>) => String(p.slug) === slug);
        if (!cancelled) {
          setPkg(found || null);
          setDiscount(EMPTY_DISCOUNT);
          setLoaded(true);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [slug, lang]);

  if (!loaded) {
    return (
      <div className="page-inner text-center py-20">
        <p className="text-[var(--text2)]">Yükleniyor...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="page-inner text-center py-20">
        <p className="text-[var(--text2)]">{lang === "TR" ? "Paket bulunamadı." : "Package not found."}</p>
        <Link href="/services/design" className="text-[#59abfe] text-sm mt-4 inline-block">
          ← {lang === "TR" ? "Geri dön" : "Go back"}
        </Link>
      </div>
    );
  }

  const title = getStr(pkg, lang, "title");
  const desc = getStr(pkg, lang, "desc");
  const basicBase = getNum(pkg, lang, "basic");
  const proBase = getNum(pkg, lang, "pro");
  const basic = getDiscountedPrice(basicBase, discount.percent);
  const pro = getDiscountedPrice(proBase, discount.percent);
  const basicIncludes = getArr(pkg, lang, "basicIncludes");
  const proIncludes = getArr(pkg, lang, "proIncludes");

  return (
    <div className="page-inner max-w-2xl mx-auto">
      <Reveal>
        <Link href="/services/design" className="text-xs text-[var(--text2)] hover:text-[#59abfe] no-underline mb-4 inline-block">
          ← {lang === "TR" ? "Tasarımlara geri dön" : "Back to designs"}
        </Link>
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-extrabold text-[var(--text)]">{title}</h2>
            {discount.percent > 0 && (
              <span className="admin-badge" style={{ background: "rgba(46, 160, 67, 0.15)", color: "#2ea043", border: "1px solid rgba(46, 160, 67, 0.3)" }}>
                {discount.labelTr && lang === "TR" ? discount.labelTr : discount.labelEn && lang === "EN" ? discount.labelEn : `%${discount.percent} ${lang === "TR" ? "İndirim" : "Off"}`}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text2)] mb-6">{desc}</p>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
              <p className="text-[11px] text-[var(--text2)] mb-1 text-center">{lang === "TR" ? "Başlangıç" : "Basic"}</p>
              {discount.percent > 0 && basicBase > 0 && <p className="text-xs text-[var(--text2)] text-center line-through">{formatPrice(basicBase)} TL</p>}
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center">{formatPrice(basic)} TL</p>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
              <p className="text-[11px] text-[var(--text2)] mb-1 text-center">{lang === "TR" ? "Tam" : "Pro"}</p>
              {discount.percent > 0 && proBase > 0 && <p className="text-xs text-[var(--text2)] text-center line-through">{formatPrice(proBase)} TL</p>}
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center">{formatPrice(pro)} TL</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text2)] mb-4 text-center">
            {lang === "TR" ? "Sınırsız Revize" : "Unlimited Revisions"}
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--text)] mb-4 text-center">
              {lang === "TR" ? "Paket İçeriği" : "Package Includes"}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
                <p className="text-[11px] font-medium text-[var(--text2)] mb-2">
                  {lang === "TR" ? "Başlangıç" : "Basic"} ({formatPrice(basic)} TL)
                  {discount.percent > 0 && basicBase > 0 && <span className="ml-1 line-through">{formatPrice(basicBase)} TL</span>}
                </p>
                <div className="flex flex-col gap-1.5">
                  {basicIncludes.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--text2)]">
                      <span className="text-[#59abfe]">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
                <p className="text-[11px] font-medium text-[var(--text2)] mb-2">
                  {lang === "TR" ? "Tam" : "Pro"} ({formatPrice(pro)} TL)
                  {discount.percent > 0 && proBase > 0 && <span className="ml-1 line-through">{formatPrice(proBase)} TL</span>}
                </p>
                <div className="flex flex-col gap-1.5">
                  {proIncludes.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--text2)]">
                      <span className="text-[#59abfe]">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity no-underline"
            style={{ color: "#fff" }}
          >
            {lang === "TR" ? "Daha Fazla Bilgi İçin Discord'a Katıl" : "Join Discord for More Info"}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
