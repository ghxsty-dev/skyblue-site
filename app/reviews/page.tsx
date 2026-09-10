"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { StarIcon } from "@/lib/icons";
import Reveal from "@/components/Reveal";
import Image from "next/image";

interface Review {
  text: string;
  author: string;
  stars: number;
  date?: string;
  avatar?: string;
}

export default function ReviewsPage() {
  const { t, lang } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadedLang, setLoadedLang] = useState<typeof lang | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const loading = loadedLang !== lang;

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 25000);

    fetch(`/api/reviews?lang=${lang}`, { cache: "no-store", signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`reviews ${res.status}`);
        return res.json();
      })
      .then((data: { reviews: Review[] }) => {
        if (!active) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setFailed(false);
        setLoadedLang(lang);
      })
      .catch(() => {
        if (!active) return;
        setReviews([]);
        setFailed(true);
        setLoadedLang(lang);
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [lang, retryKey]);

  function retry() {
    setFailed(false);
    setLoadedLang(null);
    setRetryKey((k) => k + 1);
  }

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.reviewsTitle}
            </span>
          </h2>
          <p>{t.reviewsDesc}</p>
        </div>
      </Reveal>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#59abfe] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : failed && reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-center text-[var(--text2)]">{lang === "TR" ? "Yorumlar yüklenemedi." : "Could not load reviews."}</p>
          <button type="button" onClick={retry} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity">
            {lang === "TR" ? "Tekrar dene" : "Retry"}
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-[var(--text2)] py-16">{lang === "TR" ? "Henüz yorum bulunmuyor." : "No reviews yet."}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reviews.map((item, i) => (
            <Reveal key={i} delay={i * 50}><div className="card group">
              <div className="flex items-center gap-3 mb-4">
                {item.avatar ? (
                  <Image src={item.avatar} alt={item.author} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--bg2)] flex items-center justify-center text-[#59abfe] font-bold text-sm shrink-0">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{item.author}</div>
                  {item.date && <div className="text-[10px] text-[var(--text2)] opacity-60">{item.date}</div>}
                </div>
              </div>
              <div className="flex gap-0.5 mb-3 text-[#f5a623]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon
                    key={s}
                    size={16}
                    fill={s <= item.stars ? "#f5a623" : "none"}
                    stroke={s <= item.stars ? "#f5a623" : "var(--border)"}
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--text2)] leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>
            </div></Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
