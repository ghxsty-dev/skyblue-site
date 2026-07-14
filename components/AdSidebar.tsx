"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";

export default function AdSidebar() {
  const { t } = useApp();

  return (
    <>
      <Link
        href="/reklam"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center justify-center w-20 h-64 bg-[var(--bg2)] border border-[var(--border)] rounded-r-2xl text-center text-[10px] font-medium text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest">
          {t.adText}
        </span>
      </Link>
      <Link
        href="/reklam"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center justify-center w-20 h-64 bg-[var(--bg2)] border border-[var(--border)] rounded-l-2xl text-center text-[10px] font-medium text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <span className="[writing-mode:vertical-rl] tracking-widest">
          {t.adText}
        </span>
      </Link>
    </>
  );
}
