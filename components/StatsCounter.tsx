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
      setVal(Math.round(target * eased * 10 ** decimals) / 10 ** decimals);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, decimals]);

  return decimals > 0 ? val.toFixed(decimals) : val.toString();
}

export default function StatsCounter() {
  const { t, lang } = useApp();
  const customers = useCount(30, 2000);
  const products = useCount(100, 2500);
  const rating = useCount(47, 1800, 1);

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
      <div className="card flex flex-col items-center py-6 px-10 min-w-[180px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {customers}+
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsCustomers}</span>
      </div>
      <div className="card flex flex-col items-center py-6 px-10 min-w-[180px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {products}+
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsProducts}</span>
      </div>
      <div className="card flex flex-col items-center py-6 px-10 min-w-[180px]">
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
          {rating}
        </span>
        <span className="text-xs text-[var(--text2)] mt-1 font-medium">{t.statsRating}</span>
      </div>
    </div>
  );
}
