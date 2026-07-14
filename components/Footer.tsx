"use client";

import Image from "next/image";
import { useApp } from "@/lib/context";
import Link from "next/link";
import { SunIcon, MoonIcon } from "@/lib/icons";
import type { Lang } from "@/lib/translations";

export default function Footer() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();

  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)] px-6 py-12 pb-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Image src="/skyblue.png" alt="SkyBlue" width={160} height={36} className="object-contain" style={{ width: 160, height: "auto", maxHeight: 36 }} />
            <div className="text-center md:text-left border-l border-[var(--footer-border)] pl-4">
              <p className="text-xs text-[var(--footer-text)] opacity-80">{t.footerDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-[var(--bg2)] border border-[var(--footer-border)] text-[var(--footer-text)] text-sm px-3.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#59abfe]"
            >
              <option value="TR">🇹🇷 Türkçe</option>
              <option value="EN">🇬🇧 English</option>
            </select>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-[var(--footer-border)] bg-[var(--bg2)] cursor-pointer flex items-center justify-center text-[var(--footer-text)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:border-transparent"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t border-[var(--footer-border)] flex flex-col items-start gap-1.5 text-xs">
          <Link href="/privacy" className="text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
            {t.privacy}
          </Link>
          <Link href="/status" className="text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
            {t.status}
          </Link>
          <p className="mt-2 text-[var(--footer-text)] opacity-50">{t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
