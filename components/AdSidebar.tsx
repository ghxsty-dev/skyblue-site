"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import ads from "@/data/ads.json";

export default function AdSidebar() {
  const pathname = usePathname();
  const adPages = ["/designs", "/services", "/packages", "/reviews", "/contact"];
  if (!adPages.includes(pathname)) return null;

  const [left, right] = useMemo(() => {
    const shuffled = [...ads].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }, [pathname]);

  return (
    <>
      <Link
        href={left.url}
        className="absolute left-0 top-32 z-40 hidden xl:block w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-r-2xl overflow-hidden hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <Image
          src={left.image}
          alt="Reklam"
          width={200}
          height={600}
          className="w-full h-full object-cover"
        />
      </Link>
      <Link
        href={right.url}
        className="absolute right-0 top-32 z-40 hidden xl:block w-[200px] h-[600px] bg-[var(--bg2)] border border-[var(--border)] rounded-l-2xl overflow-hidden hover:border-[#59abfe] transition-all duration-300 no-underline cursor-pointer"
      >
        <Image
          src={right.image}
          alt="Reklam"
          width={200}
          height={600}
          className="w-full h-full object-cover"
        />
      </Link>
    </>
  );
}
