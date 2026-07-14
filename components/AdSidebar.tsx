"use client";

import Link from "next/link";
import Image from "next/image";
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
        className="absolute left-0 top-32 z-40 hidden xl:block w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-r-2xl overflow-hidden hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <Image
          src="/reklam1.png"
          alt="Reklam"
          width={200}
          height={600}
          className="w-full h-full object-cover"
        />
      </Link>
      <Link
        href="/reklam"
        className="absolute right-0 top-32 z-40 hidden xl:block w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-l-2xl overflow-hidden hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <Image
          src="/reklam2.png"
          alt="Reklam"
          width={200}
          height={600}
          className="w-full h-full object-cover"
        />
      </Link>
    </>
  );
}
