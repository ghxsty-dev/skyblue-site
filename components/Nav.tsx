"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/lib/context";
import { MenuIcon, UserIcon } from "@/lib/icons";

const links = ["home", "designs", "services", "contact"] as const;

export default function Nav() {
  const pathname = usePathname();
  const { t, theme } = useApp();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, measured: false });
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [premiumActive, setPremiumActive] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = pathname === "/" ? "home" : pathname.replace("/", "").split("/")[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const measure = useCallback(() => {
    if (!ulRef.current || open) return;
    const active = ulRef.current.querySelector<HTMLAnchorElement>("a.active-link");
    if (active) {
      const parent = active.parentElement as HTMLLIElement;
      setIndicator({ left: parent.offsetLeft, width: parent.offsetWidth, measured: true });
    } else {
      setIndicator({ left: 0, width: 0, measured: false });
    }
  }, [open]);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current, measure]);

  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measure());
    }
    const t = setTimeout(measure, 300);
    return () => clearTimeout(t);
  }, [measure]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          if (d.user.role === "admin") setIsAdminUser(true);
          if (d.user.avatar_path) setAvatarPath(d.user.avatar_path);
        }
      })
      .catch(() => {});
    fetch("/api/account/premium-status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.premium) {
          setPremiumActive(true);
          setPremiumExpiresAt(d.expires_at);
        }
      })
      .catch(() => {});
  }, []);

  function formatRemaining(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "";
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    if (totalHours < 1) return "< 1 saat";
    if (totalHours < 24) return `${totalHours} saat`;
    const totalDays = Math.floor(totalHours / 24);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    if (months > 0 && days > 0) return `${months} ay ${days} gün`;
    if (months > 0) return `${months} ay`;
    return `${days} gün`;
  }

  const accountAvatar = avatarPath ? (
    <img
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`}
      alt=""
      width={36}
      height={36}
      className="rounded-full object-cover w-9 h-9"
    />
  ) : (
    <UserIcon size={19} />
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] px-6 transition-all duration-300 ${
      scrolled
        ? "bg-[var(--nav-bg)]/50 backdrop-blur-xl border-b border-[var(--border)]/50 shadow-lg shadow-black/5"
        : "bg-transparent backdrop-blur-none border-b border-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src={theme === "light" ? "/logo2.webp" : "/logo.webp"} alt="SkyBlue" width={32} height={32} className="rounded-lg" />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden bg-none border-none text-[var(--text)] cursor-pointer p-1"
          aria-label="Menu"
        >
          <MenuIcon size={24} />
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center relative">
          {indicator.measured && (
            <div
              className="absolute bottom-[-2px] h-[2px] bg-white rounded-full transition-all duration-300 ease-in-out pointer-events-none"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          <ul ref={ulRef} className="list-none flex items-center gap-0 m-0 p-0">
            {links.map((link) => (
              <li key={link}>
                <Link
                  href={link === "home" ? "/" : `/${link}`}
                  onClick={() => setOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-none text-[15px] font-semibold transition-all duration-300 no-underline ${
                    current === link || (link === "home" && current === "home")
                      ? "text-white active-link"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {t[link]}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account Dropdown */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex w-9 h-9 items-center justify-center text-white/70 hover:text-white cursor-pointer bg-transparent border-none p-0 overflow-hidden rounded-full"
              aria-label={t.account}
              title={t.account}
            >
              {accountAvatar}
            </button>
            {accountOpen && (
              <div className="nav-dropdown">
                {premiumActive ? (
                  <a href="/account/premium?tool=minecraft-rank" onClick={() => setAccountOpen(false)} className="nav-dropdown-item premium">
                    <span className="nav-dropdown-icon"><Image src="/premium.webp" alt="" width={18} height={18} unoptimized /></span>
                    <span className="premium-gradient-text font-semibold">Premium</span>
                    <span className="ml-auto text-white/50 text-[0.68rem]">{premiumExpiresAt ? formatRemaining(premiumExpiresAt) : ""}</span>
                  </a>
                ) : (
                  <a href="/account/premium?tool=minecraft-rank" onClick={() => setAccountOpen(false)} className="nav-dropdown-item premium">
                    <span className="nav-dropdown-icon"><Image src="/premium.webp" alt="" width={18} height={18} unoptimized /></span>
                    Premium üyesi ol
                  </a>
                )}
                <div className="nav-dropdown-divider" />
                <a href="/account" onClick={() => setAccountOpen(false)} className="nav-dropdown-item">
                  <span className="nav-dropdown-icon">⚙</span>
                  Hesap ayarları
                </a>
              </div>
            )}
          </div>

          {isAdminUser && (
            <a
              href="/admin"
              className="ml-1 flex w-9 h-9 items-center justify-center text-white/70 hover:text-white no-underline"
              aria-label="Admin"
              title="Admin Panel"
            >
              ⚙
            </a>
          )}
        </div>

        {/* Mobile */}
        <ul className={`md:hidden list-none flex-col gap-1 flex absolute top-full left-0 right-0 bg-[var(--nav-bg)]/90 backdrop-blur-xl border-b border-[var(--border)] p-4 ${open ? "flex" : "hidden"}`}>
          {links.map((link) => (
            <li key={link}>
              <Link
                href={link === "home" ? "/" : `/${link}`}
                onClick={() => setOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-[15px] font-semibold transition-all duration-300 no-underline ${
                  current === link || (link === "home" && current === "home")
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {t[link]}
              </Link>
            </li>
          ))}
          <li>
            <a href="/account/premium?tool=minecraft-rank" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[15px] font-semibold premium-gradient-text no-underline">
              <Image src="/premium.webp" alt="" width={18} height={18} unoptimized /> {premiumActive ? (
                <span className="flex items-center gap-2"><span>Premium</span>{premiumExpiresAt && <span className="text-white/50 text-[0.72rem] font-normal">{formatRemaining(premiumExpiresAt)}</span>}</span>
              ) : "Premium üyesi ol"}
            </a>
          </li>
          <li>
            <a href="/account" onClick={() => setOpen(false)} aria-current={current === "account" ? "page" : undefined} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[15px] font-semibold text-white/70 hover:text-white no-underline">
              {avatarPath ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`}
                  alt=""
                  width={18}
                  height={18}
                  className="rounded-full object-cover"
                />
              ) : (
                <UserIcon size={18} />
              )} {t.account}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
