"use client";

import Image from "next/image";
import { useApp } from "@/lib/context";

export default function LangModal() {
  const { showLangModal, setLang, t, theme } = useApp();

  if (!showLangModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.3s ease" }}
    >
      <div
        className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-10 sm:p-12 max-w-sm w-[90%] text-center shadow-2xl"
        style={{ animation: "slideUp 0.35s ease" }}
      >
        <Image src={theme === "light" ? "/logo2.png" : "/logo.png"} alt="SkyBlue" width={56} height={56} className="rounded-xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {t.selectLang}
        </h2>
        <p className="text-[var(--text2)] mb-7 text-sm">{t.selectLangDesc}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setLang("TR")}
            className="flex-1 py-3.5 px-5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg2)] text-[var(--text)] font-semibold cursor-pointer transition-all duration-300 hover:border-[#59abfe] hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:-translate-y-0.5"
          >
            🇹🇷 Türkçe
          </button>
          <button
            onClick={() => setLang("EN")}
            className="flex-1 py-3.5 px-5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg2)] text-[var(--text)] font-semibold cursor-pointer transition-all duration-300 hover:border-[#59abfe] hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:-translate-y-0.5"
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  );
}
