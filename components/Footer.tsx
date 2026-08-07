"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import Link from "next/link";
import { SunIcon, MoonIcon, MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import contactData from "@/data/contact.json";
import type { Lang } from "@/lib/translations";

const langs: { code: Lang; flag: string; label: string }[] = [
  { code: "TR", flag: "https://flagcdn.com/w20/tr.png", label: "Türkçe" },
  { code: "EN", flag: "https://flagcdn.com/w20/gb.png", label: "English" },
];

function YouTubeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const info = contactData[lang as "EN" | "TR"];

  const current = langs.find((l) => l.code === lang) ?? langs[0];

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const socials = [
    { icon: <MessageIcon size={18} />, href: info.discordUrl, label: "Discord" },
    { icon: <CameraIcon size={18} />, href: info.instagramUrl, label: "Instagram" },
    { icon: <YouTubeIcon size={18} />, href: info.youtubeUrl, label: "YouTube" },
    { icon: <MailIcon size={18} />, href: `mailto:${info.email}`, label: "Email" },
  ];

  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)] px-6 py-12 pb-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <Image src="/skyblue.png" alt="SkyBlue" width={140} height={32} className="object-contain" style={{ width: 140, height: "auto", maxHeight: 32 }} />
            <p className="text-xs text-[var(--footer-text)] opacity-50 leading-relaxed">{t.footerCopyright}</p>
          </div>

          <div className="flex gap-10">
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-[var(--footer-text)] mb-1">{t.footerLegal}</h4>
              <Link href="/sozlesme" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.contract}
              </Link>
              <Link href="/privacy" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.privacy}
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-[var(--footer-text)] mb-1">{t.footerServices}</h4>
              <Link href="/services/design" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                {t.services}
              </Link>
              <Link href="/services/discord" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                Discord
              </Link>
              <Link href="/minecraft" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                Minecraft
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-[var(--footer-border)] bg-[var(--bg2)] flex items-center justify-center text-[var(--footer-text)] transition-all duration-300 hover:bg-[#59abfe] hover:text-white hover:border-[#59abfe]"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
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
      </div>
    </footer>
  );
}
