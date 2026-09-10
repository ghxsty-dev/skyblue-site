"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import adData from "@/data/ads.json";

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

  const ids = adData.map((a) => a.id);
  const checks = ids.map((id) =>
    checkImage(`/reklam${id}.webp`).then((ok) => (ok ? id : 0))
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
  const [ads, setAds] = useState<number[]>([]);
  const [leftAd, setLeftAd] = useState<number | null>(null);
  const [rightAd, setRightAd] = useState<number | null>(null);
  const [fade, setFade] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetch("/api/account/premium-status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.premium) setIsPremium(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPremium) return;
    getAvailableAds().then((available) => {
      setAds(available);
      if (available.length === 0) return;
      const shuffled = shuffle(available);
      setLeftAd(shuffled[0]);
      setRightAd(shuffled.length > 1 ? shuffled[1] : shuffled[0]);
    });
  }, []);

  const rotate = useCallback(() => {
    if (ads.length === 0) return;
    setFade(false);
    setTimeout(() => {
      const shuffled = shuffle(ads);
      setLeftAd(shuffled[0]);
      setRightAd(shuffled.length > 1 ? shuffled[1] : shuffled[0]);
      setFade(true);
    }, 400);
  }, [ads]);

  useEffect(() => {
    if (ads.length === 0) return;
    const interval = setInterval(rotate, 30000);
    return () => clearInterval(interval);
  }, [ads, rotate]);

  if (
    isPremium ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/tools") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/" ||
    leftAd === null
  ) return null;

  const leftHref = adData.find((a) => a.id === leftAd)?.url || "/reklam";
  const rightHref = rightAd !== null ? (adData.find((a) => a.id === rightAd)?.url || "/reklam") : "/reklam";

  return (
    <>
      <div className="ad-side ad-side-left">
        <Link href={leftHref} target="_blank" rel="noopener noreferrer" className="relative block aspect-[1/3] w-full">
          <NextImage
            src={`/reklam${leftAd}.webp`}
            alt="Reklam"
            fill
            sizes="150px"
            className={`rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all duration-400 cursor-pointer object-cover ${fade ? "opacity-100" : "opacity-0"}`}
          />
        </Link>
      </div>
      {rightAd !== null && rightAd !== leftAd && (
        <div className="ad-side ad-side-right">
          <Link href={rightHref} target="_blank" rel="noopener noreferrer" className="relative block aspect-[1/3] w-full">
            <NextImage
              src={`/reklam${rightAd}.webp`}
              alt="Reklam"
              fill
              sizes="150px"
              className={`rounded-xl border border-[var(--border)] hover:border-[#59abfe] transition-all duration-400 cursor-pointer object-cover ${fade ? "opacity-100" : "opacity-0"}`}
            />
          </Link>
        </div>
      )}
    </>
  );
}
