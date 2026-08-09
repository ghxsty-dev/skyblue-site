"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdSidebar() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <>
      <div className="absolute left-0 top-32 z-40 hidden xl:block w-[180px]">
        <Link href="/reklam" target="_blank" rel="noopener noreferrer" className="block">
          <img
            src="/reklam1.png"
            alt="Reklam"
            className="w-[160px] mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
          />
        </Link>
      </div>
      <div className="absolute right-0 top-32 z-40 hidden xl:block w-[180px]">
        <Link href="/reklam" target="_blank" rel="noopener noreferrer" className="block">
          <img
            src="/reklam2.png"
            alt="Reklam"
            className="w-[160px] mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
          />
        </Link>
      </div>
    </>
  );
}
