"use client";

import { useApp } from "@/lib/context";
import { CheckIcon } from "@/lib/icons";
import data from "@/data/packages.json";
import Reveal from "@/components/Reveal";

export default function PackagesPage() {
  const { t, lang } = useApp();
  const packages = data[lang];

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.packagesTitle}
            </span>
          </h2>
          <p>{t.packagesDesc}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {packages.map((pkg, i) => (
          <Reveal key={i} delay={i * 100}>
          <div
            className={`relative p-8 rounded-2xl border transition-all duration-300 ${
              pkg.featured
                ? "border-[#59abfe] shadow-[0_8px_30px_var(--card-shadow)] scale-105 md:scale-105"
                : "border-[var(--border)]"
            }`}
            style={{
              background: "var(--card-bg)",
              boxShadow: pkg.featured ? "0 8px 30px var(--card-shadow)" : undefined,
            }}
          >
            {pkg.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-xs font-semibold px-4 py-1 rounded-full">
                {t.popular}
              </span>
            )}
            <div className="text-center">
              <div className="text-sm font-bold text-[var(--text2)] mb-2">{pkg.name}</div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent mb-1">
                {pkg.price}
              </div>
              <div className="text-xs text-[var(--text2)] mb-5">{pkg.duration}</div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">
                {lang === "TR" ? "Paket İçeriği" : "Package Includes"}
              </p>
              <ul className="list-none">
                {pkg.features.map((feat, fi) => (
                  <li
                    key={fi}
                    className="py-1.5 text-xs text-[var(--text2)] flex items-start gap-2"
                  >
                    <CheckIcon size={14} className="text-[#59abfe] shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                {lang === "TR" ? "Kimler için uygun?" : "Who is it for?"}
              </p>
              <p className="text-xs text-[var(--text2)] italic">{pkg.suitable}</p>
            </div>

            <div className="mt-6">
              <a
                href="https://discord.gg/DRnxEXCQU"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-center block"
              >
                {t.buyViaDiscord}
              </a>
            </div>
          </div></Reveal>
        ))}
      </div>
    </div>
  );
}
