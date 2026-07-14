"use client";

import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

export default function ReklamPage() {
  const { t, lang } = useApp();

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.reklamTitle}
            </span>
          </h2>
          <p>{t.reklamDesc}</p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="card mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white text-2xl font-bold">
                Ad
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">{lang === "TR" ? "Reklam Alanları" : "Ad Spaces"}</h3>
                <p className="text-sm text-[var(--text2)]">{lang === "TR" ? "Sağ ve sol kenar" : "Left and right sidebar"}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text2)] leading-relaxed">
              {t.reklamDetails}
            </p>
          </div>

          <a
            href="https://discord.gg/DRnxEXCQU"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-block"
          >
            {t.reklamCTA}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
