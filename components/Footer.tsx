"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import Link from "next/link";
import { SunIcon, MoonIcon } from "@/lib/icons";
import type { Lang } from "@/lib/translations";

const langs: { code: Lang; flag: string; label: string }[] = [
  { code: "TR", flag: "https://flagcdn.com/w20/tr.png", label: "Türkçe" },
  { code: "EN", flag: "https://flagcdn.com/w20/gb.png", label: "English" },
];

export default function Footer() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = langs.find((l) => l.code === lang) ?? langs[0];

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
            <div className="flex items-center gap-2">
              <div ref={ref} className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1.5 bg-[var(--bg2)] border border-[var(--footer-border)] text-[var(--footer-text)] text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:border-[#59abfe]"
                >
                  <img src={current.flag} alt={current.code} width={18} height={12} className="rounded-sm" />
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {open && (
                  <div className="absolute bottom-full mb-1 right-0 bg-[var(--bg2)] border border-[var(--footer-border)] rounded-lg overflow-hidden shadow-lg z-50 min-w-[120px]">
                    {langs.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setOpen(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                          lang === l.code
                            ? "bg-[#59abfe]/10 text-[#59abfe]"
                            : "text-[var(--footer-text)] hover:bg-[var(--border)]"
                        }`}
                      >
                        <img src={l.flag} alt={l.code} width={18} height={12} className="rounded-sm" />
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
