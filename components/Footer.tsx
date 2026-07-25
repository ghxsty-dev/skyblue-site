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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <Image src="/skyblue.png" alt="SkyBlue" width={140} height={32} className="object-contain" style={{ width: 140, height: "auto", maxHeight: 32 }} />
            <p className="text-xs text-[var(--footer-text)] opacity-70 leading-relaxed">{t.footerDesc}</p>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <h4 className="text-sm font-semibold text-[var(--footer-text)] mb-1">{t.footerQuickLinks}</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <Link href="/privacy" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.privacy}
              </Link>
              <Link href="/status" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.status}
              </Link>
              <Link href="/sozlesme" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.contract}
              </Link>
              <Link href="/minecraft" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                Minecraft
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <h4 className="text-sm font-semibold text-[var(--footer-text)] mb-1">{t.footerSettings}</h4>
            <div className="flex items-center gap-3">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="bg-[var(--bg2)] border border-[var(--footer-border)] text-[var(--footer-text)] text-xs px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-[#59abfe]"
              >
                <option value="TR">🇹🇷 Türkçe</option>
                <option value="EN">🇬🇧 English</option>
              </select>
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg border border-[var(--footer-border)] bg-[var(--bg2)] cursor-pointer flex items-center justify-center text-[var(--footer-text)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#97cdf2] hover:to-[#59abfe] hover:text-white hover:border-transparent"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[var(--footer-border)] text-center">
          <p className="text-xs text-[var(--footer-text)] opacity-50">{t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
