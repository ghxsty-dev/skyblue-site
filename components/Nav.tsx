"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/context";
import { MenuIcon } from "@/lib/icons";

const links = ["home", "designs", "services", "minecraft", "packages", "reviews", "contact"] as const;

export default function Nav() {
  const pathname = usePathname();
  const { t, theme } = useApp();
  const [open, setOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, measured: false });
  const ulRef = useRef<HTMLUListElement>(null);

  const current = pathname === "/" ? "home" : pathname.replace("/", "");

  useEffect(() => {
    if (!ulRef.current || open) return;
    const active = ulRef.current.querySelector<HTMLAnchorElement>("a.active-link");
    if (active) {
      const parent = active.parentElement as HTMLLIElement;
      setIndicator({ left: parent.offsetLeft, width: parent.offsetWidth, measured: true });
    }
  }, [current, open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)] px-6 transition-colors">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src={theme === "light" ? "/logo2.png" : "/logo.png"} alt="SkyBlue" width={32} height={32} className="rounded-lg" />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden bg-none border-none text-[var(--text)] cursor-pointer p-1"
          aria-label="Menu"
        >
          <MenuIcon size={24} />
        </button>
        <ul
          ref={ulRef}
          className={`list-none flex-col md:flex-row gap-1 md:gap-0 flex md:flex absolute md:static top-full left-0 right-0 bg-[var(--nav-bg)] md:bg-transparent backdrop-blur-md border-b md:border-b-0 border-[var(--border)] md:border-none p-4 md:p-0 ${open ? "flex" : "hidden md:flex"}`}
        >
          {indicator.measured && (
            <div
              className="hidden md:block absolute bottom-0 h-[2px] bg-gradient-to-r from-[#97cdf2] to-[#59abfe] rounded-full transition-all duration-300 ease-in-out pointer-events-none"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          {links.map((link) => (
            <li key={link}>
              <Link
                href={link === "home" ? "/" : `/${link}`}
                onClick={() => setOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg md:rounded-none text-sm font-medium transition-all duration-300 no-underline ${
                  current === link || (link === "home" && current === "home")
                    ? "text-[#59abfe] active-link"
                    : "text-[var(--text2)] hover:text-[#59abfe]"
                }`}
              >
                {t[link]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
