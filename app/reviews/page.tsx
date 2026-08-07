"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews?lang=${lang}`)
      .then((res) => res.json())
      .then((data: { reviews: Review[] }) => setReviews(data.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [lang]);

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
      ) : reviews.length === 0 ? (
        <p className="text-center text-[var(--text2)] py-16">{lang === "TR" ? "Henüz yorum bulunmuyor." : "No reviews yet."}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reviews.map((item, i) => (
            <Reveal key={i} delay={i * 50}><div className="card group">
              <div className="flex items-center gap-3 mb-4">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{item.author}</div>
                  {item.date && <div className="text-[10px] text-[var(--text2)] opacity-60">{item.date}</div>}
                </div>
              </div>
              <div className="flex gap-0.5 mb-3 text-[#8ec8f4]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-sm ${s <= item.stars ? "opacity-100" : "opacity-25"}`}>
                    {"⭐"}
                  </span>
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
