"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/context";

function useCount(target: number, duration: number, decimals = 0) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = target * eased;
      setVal(decimals > 0 ? Math.round(current * 10 ** decimals) / 10 ** decimals : Math.round(current));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, decimals]);

  return val;
}

export default function StatsCounter() {
  const { t } = useApp();
  const customers = useCount(30, 2000);
  const products = useCount(100, 2500);
  const rating = useCount(47, 1800);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center mb-14 py-6 px-4 max-w-2xl mx-auto">
      <div className="flex flex-col items-center py-2 px-8 min-w-[120px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {customers}+
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsCustomers}</span>
      </div>
      <div className="hidden sm:block w-px h-12 bg-[var(--border)]" />
      <div className="block sm:hidden w-12 h-px bg-[var(--border)] my-3" />
      <div className="flex flex-col items-center py-2 px-8 min-w-[120px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {products}+
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsProducts}</span>
      </div>
      <div className="hidden sm:block w-px h-12 bg-[var(--border)]" />
      <div className="block sm:hidden w-12 h-px bg-[var(--border)] my-3" />
      <div className="flex flex-col items-center py-2 px-8 min-w-[120px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {(rating / 10).toFixed(1)}
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsRating}</span>
      </div>
    </div>
  );
}
