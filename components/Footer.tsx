"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import Link from "next/link";
import { SunIcon, MoonIcon } from "@/lib/icons";
import contactData from "@/data/contact.json";
import type { Lang } from "@/lib/translations";

const langs: { code: Lang; flag: string; label: string }[] = [
  { code: "TR", flag: "https://flagcdn.com/w20/tr.png", label: "Türkçe" },
  { code: "EN", flag: "https://flagcdn.com/w20/gb.png", label: "English" },
];

function DiscordIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function YouTubeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function MailIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

interface ApiStatus {
  key: string;
  label: string;
  status: "up" | "down" | "checking";
}

export default function Footer() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const info = contactData[lang as "EN" | "TR"];
  const [statuses, setStatuses] = useState<ApiStatus[]>([
    { key: "designs", label: "Tasarımlar", status: "checking" },
    { key: "reviews", label: "Yorumlar", status: "checking" },
    { key: "status", label: "Sistem", status: "checking" },
  ]);

  const current = langs.find((l) => l.code === lang) ?? langs[0];

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/designs")
      .then((r) => r.json())
      .then((d) => setStatuses((prev) => prev.map((s) => s.key === "designs" ? { ...s, status: d.designs?.length > 0 ? "up" : "down" } : s)))
      .catch(() => setStatuses((prev) => prev.map((s) => s.key === "designs" ? { ...s, status: "down" } : s)));

    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setStatuses((prev) => prev.map((s) => s.key === "reviews" ? { ...s, status: d.reviews?.length > 0 ? "up" : "down" } : s)))
      .catch(() => setStatuses((prev) => prev.map((s) => s.key === "reviews" ? { ...s, status: "down" } : s)));

    fetch("/status")
      .then((r) => setStatuses((prev) => prev.map((s) => s.key === "status" ? { ...s, status: r.ok ? "up" : "down" } : s)))
      .catch(() => setStatuses((prev) => prev.map((s) => s.key === "status" ? { ...s, status: "down" } : s)));
  }, []);

  const socials = [
    { icon: <DiscordIcon size={18} />, href: info.discordUrl, label: "Discord" },
    { icon: <InstagramIcon size={18} />, href: info.instagramUrl, label: "Instagram" },
    { icon: <YouTubeIcon size={18} />, href: info.youtubeUrl, label: "YouTube" },
    { icon: <MailIcon size={18} />, href: `mailto:${info.email}`, label: "Email" },
  ];

  return (
    <footer className="relative bg-[var(--footer-bg)] text-[var(--footer-text)] px-6 py-12 pb-8 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#59abfe] to-transparent opacity-60 animate-[gradientSlide_4s_linear_infinite]" style={{ backgroundSize: "200% 100%" }} />
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <Image src="/skyblue.webp" alt="SkyBlue" width={180} height={42} className="object-contain" style={{ width: 180, height: "auto", maxHeight: 42 }} />
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
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-[var(--footer-text)] mb-1">{lang === "TR" ? "Durum" : "Status"}</h4>
              {statuses.map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: s.status === "up" ? "#22c55e" : s.status === "down" ? "#ef4444" : "#6b7280" }}>●</span>
                  <Link href="/status" className="text-xs text-[var(--footer-text)] opacity-70 hover:text-[#59abfe] hover:opacity-100 transition-all no-underline">
                    {s.label}
                  </Link>
                </div>
              ))}
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
                  <img src={current.flag} alt={current.code} width={18} height={12} />
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
                        <img src={l.flag} alt={l.code} width={18} height={12} />
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
