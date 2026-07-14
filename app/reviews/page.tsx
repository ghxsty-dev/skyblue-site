"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { StarIcon } from "@/lib/icons";
import Reveal from "@/components/Reveal";

interface Review {
  text: string;
  author: string;
  stars: number;
  date?: string;
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
            <Reveal key={i} delay={i * 80}><div className="review-card">
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
              <p className="text-sm text-[var(--text2)] italic leading-relaxed mb-4">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{item.author}</div>
                {item.date && <div className="text-[10px] text-[var(--text2)] opacity-60">{item.date}</div>}
              </div>
            </div></Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
