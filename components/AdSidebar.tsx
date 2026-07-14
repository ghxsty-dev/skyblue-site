"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";

export default function AdSidebar() {
  const { t } = useApp();
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <>
      <Link
        href="/reklam"
        className="absolute left-0 top-32 z-40 hidden xl:flex flex-col items-center justify-center w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-r-2xl text-center text-xs font-medium text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white text-lg mb-3">
          Ad
        </div>
        <span>{t.adText}</span>
      </Link>
      <Link
        href="/reklam"
        className="absolute right-0 top-32 z-40 hidden xl:flex flex-col items-center justify-center w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-l-2xl text-center text-xs font-medium text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white text-lg mb-3">
          Ad
        </div>
        <span>{t.adText}</span>
      </Link>
    </>
  );
}
