"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import data from "@/data/services.json";
import Reveal from "@/components/Reveal";

const DISCORD_URL = "https://discord.gg/DRnxEXCQU";

export default function PackageDetail() {
  const { lang } = useApp();
  const { slug } = useParams<{ slug: string }>();
  const packages = data[lang as "EN" | "TR"].packages;
  const pkg = packages.find((p: any) => p.slug === slug);

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

  return (
    <div className="page-inner max-w-2xl mx-auto">
      <Reveal>
        <Link href="/services/design" className="text-xs text-[var(--text2)] hover:text-[#59abfe] no-underline mb-4 inline-block">
          ← {lang === "TR" ? "Tasarımlara geri dön" : "Back to designs"}
        </Link>
        <div className="card p-8">
          <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">{pkg.title}</h2>
          <p className="text-sm text-[var(--text2)] mb-6">{pkg.desc}</p>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4 text-center">
              <p className="text-[11px] text-[var(--text2)] mb-1">{lang === "TR" ? "Başlangıç" : "Basic"}</p>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{pkg.basic} TL</p>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--bg2)] p-4 text-center">
              <p className="text-[11px] text-[var(--text2)] mb-1">{lang === "TR" ? "Tam" : "Pro"}</p>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{pkg.pro} TL</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text2)] mb-4 text-center">
            {lang === "TR" ? "Sınırsız Revize" : "Unlimited Revisions"}
          </p>

          {pkg.includes && pkg.includes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[var(--text)] mb-3">
                {lang === "TR" ? "Paket İçeriği" : "Package Includes"}
              </h3>
              <div className="flex flex-col gap-2">
                {pkg.includes.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text2)]">
                    <span className="text-[#59abfe]">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

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
