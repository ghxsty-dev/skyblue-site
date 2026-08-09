"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const TOTAL_ADS = 6;

function shuffle(arr: number[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AdSidebar() {
  const pathname = usePathname();
  const [leftAd, setLeftAd] = useState(1);
  const [rightAd, setRightAd] = useState(2);

  useEffect(() => {
    const indices = Array.from({ length: TOTAL_ADS }, (_, i) => i + 1);
    const shuffled = shuffle(indices);
    setLeftAd(shuffled[0]);
    setRightAd(shuffled[1]);
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <>
      <div className="absolute left-0 top-32 z-40 hidden xl:block w-[180px]">
        <Link href="/reklam" target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={`/reklam${leftAd}.png`}
            alt="Reklam"
            className="w-[160px] mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
          />
        </Link>
      </div>
      <div className="absolute right-0 top-32 z-40 hidden xl:block w-[180px]">
        <Link href="/reklam" target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={`/reklam${rightAd}.png`}
            alt="Reklam"
            className="w-[160px] mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
          />
        </Link>
      </div>
    </>
  );
}
