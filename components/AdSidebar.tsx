"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";

const MAX_ADS = 20;

const adLinks: Record<number, string> = {
  3: "https://discore.app",
};

function shuffle(arr: number[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function checkImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

const CACHE_KEY = "skyblue-ads";
const CACHE_TTL = 3600_000;

async function getAvailableAds(): Promise<number[]> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { ads, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return ads;
    }
  } catch {}

  const checks = Array.from({ length: MAX_ADS }, (_, i) =>
    checkImage(`/reklam${i + 1}.webp`).then((ok) => (ok ? i + 1 : 0))
  );
  const results = await Promise.all(checks);
  const ads = results.filter((n) => n > 0);

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ads, ts: Date.now() }));
  } catch {}

  return ads;
}

export default function AdSidebar() {
  const pathname = usePathname();
  const [leftAd, setLeftAd] = useState<number | null>(null);
  const [rightAd, setRightAd] = useState<number | null>(null);

  useEffect(() => {
    getAvailableAds().then((ads) => {
      if (ads.length === 0) return;
      const shuffled = shuffle(ads);
      setLeftAd(shuffled[0]);
      setRightAd(shuffled.length > 1 ? shuffled[1] : shuffled[0]);
    });
  }, [pathname]);

  if (pathname === "/" || leftAd === null) return null;

  const leftHref = adLinks[leftAd] || "/reklam";
  const rightHref = rightAd !== null ? (adLinks[rightAd] || "/reklam") : "/reklam";

  return (
    <>
      <div className="absolute left-0 top-32 z-40 hidden xl:block w-[180px]">
        <Link href={leftHref} target="_blank" rel="noopener noreferrer" className="block">
          <NextImage
            src={`/reklam${leftAd}.webp`}
            alt="Reklam"
            width={160}
            height={160}
            className="mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
          />
        </Link>
      </div>
      {rightAd !== null && rightAd !== leftAd && (
        <div className="absolute right-0 top-32 z-40 hidden xl:block w-[180px]">
          <Link href={rightHref} target="_blank" rel="noopener noreferrer" className="block">
            <NextImage
              src={`/reklam${rightAd}.webp`}
              alt="Reklam"
              width={160}
              height={160}
              className="mx-auto rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all cursor-pointer"
            />
          </Link>
        </div>
      )}
    </>
  );
}
