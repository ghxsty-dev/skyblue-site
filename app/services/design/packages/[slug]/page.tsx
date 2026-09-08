"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import fallbackData from "@/data/services.json";
import Reveal from "@/components/Reveal";

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

function getArr(data: Record<string, unknown>, lang: string, key: string): string[] {
  const section = data[lang] as Record<string, unknown> | undefined;
  const v = section?.[key];
  return Array.isArray(v) ? v : [];
}

export default function PackageDetail() {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const [pkg, setPkg] = useState<Record<string, unknown> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/design-products", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        const products: ApiProduct[] = result.products || [];
        const found = products.find((p) => {
          if (p.category !== "package") return false;
          const rootSlug = String((p.data as Record<string, unknown>).slug || "");
          const sEn = getStr(p.data, "en", "slug");
          const sTr = getStr(p.data, "tr", "slug");
          return rootSlug === slug || sEn === slug || sTr === slug || p.slug === slug;
        });
        if (found) setPkg(found.data);
        setLoaded(true);
      })
      .catch(() => {
        const d = fallbackData[lang as "EN" | "TR"];
        const found = d.packages.find((p: Record<string, unknown>) => String(p.slug) === slug);
        if (found) setPkg(found);
        setLoaded(true);
      });
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
  const basic = getNum(pkg, lang, "basic");
  const pro = getNum(pkg, lang, "pro");
  const basicIncludes = getArr(pkg, lang, "basicIncludes");
  const proIncludes = getArr(pkg, lang, "proIncludes");

  return (
    <div className="page-inner max-w-2xl mx-auto">
      <Reveal>
        <Link href="/services/design" className="text-xs text-[var(--text2)] hover:text-[#59abfe] no-underline mb-4 inline-block">
          ← {lang === "TR" ? "Tasarımlara geri dön" : "Back to designs"}
        </Link>
        <div className="card p-8">
          <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">{title}</h2>
          <p className="text-sm text-[var(--text2)] mb-6">{desc}</p>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
              <p className="text-[11px] text-[var(--text2)] mb-1 text-center">{lang === "TR" ? "Başlangıç" : "Basic"}</p>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center">{basic} TL</p>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4">
              <p className="text-[11px] text-[var(--text2)] mb-1 text-center">{lang === "TR" ? "Tam" : "Pro"}</p>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent text-center">{pro} TL</p>
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
                  {lang === "TR" ? "Başlangıç" : "Basic"} ({basic} TL)
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
                  {lang === "TR" ? "Tam" : "Pro"} ({pro} TL)
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
