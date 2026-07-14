"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/context";
import { StarIcon, MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import contactData from "@/data/contact.json";
import Reveal from "@/components/Reveal";
import StatsCounter from "@/components/StatsCounter";

interface Review {
  text: string;
  author: string;
  stars: number;
  date?: string;
}

interface DesignImage {
  url: string;
  width: number;
  height: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const { t, lang } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const [bgImages, setBgImages] = useState<DesignImage[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const info = contactData[lang as "EN" | "TR"];

  useEffect(() => {
    fetch(`/api/reviews?lang=${lang}`)
      .then((res) => res.json())
      .then((data: { reviews: Review[] }) => setReviews(data.reviews))
      .catch(() => setReviews([]));
  }, [lang]);

  useEffect(() => {
    fetch("/api/designs")
      .then((res) => res.json())
      .then((data: { designs: { images: DesignImage[] }[] }) => {
        const all = data.designs.flatMap((d) => d.images);
        setBgImages(shuffle(all).slice(0, 30));
      })
      .catch(() => {})
      .finally(() => window.dispatchEvent(new CustomEvent("app:ready")));
  }, []);

  const rows = bgImages.length >= 5
    ? (() => {
        const result: { images: DesignImage[]; speed: number; dir: "left" | "right"; h: number; topPx: number }[] = [];
        let cumTop = 25;
        for (let ri = 0; ri < 6; ri++) {
          const groupSize = 6;
          const start = (ri * groupSize) % bgImages.length;
          const images = [...bgImages.slice(start), ...bgImages.slice(0, start)].slice(0, groupSize);
          const h = 60 + (ri % 5) * 15;
          result.push({
            images,
            speed: 30,
              dir: "left" as "left",
            h,
            topPx: cumTop,
          });
          cumTop += h + 3 * 15 + 25;
        }
        return result;
      })()
    : [];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perPage = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, reviews.length - perPage);

  useEffect(() => {
    if (reviews.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 10000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reviews.length, maxIndex]);

  return (
    <div>
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {rows.length > 0 && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.1] dark:opacity-[0.07]">
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="absolute"
                style={{
                  top: `${row.topPx}px`,
                  transform: "skewY(-3deg)",
                  transformOrigin: "center center",
                }}
              >
                <div
                  className="flex whitespace-nowrap"
                  style={{
                    animation: `scroll${row.dir === "right" ? "Right" : "Left"} ${row.speed}s linear infinite`,
                    willChange: "transform",
                  }}
                >
                  {[...row.images, ...row.images, ...row.images].map((img, i) => (
                    <div
                      key={i}
                      className="inline-block shrink-0 rounded-lg overflow-hidden bg-[var(--bg2)]"
                      style={{
                        height: row.h + (i % 4) * 15,
                        aspectRatio: `${img.width}/${img.height}`,
                        margin: `0 ${10 + (i % 3) * 6}px`,
                      }}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        width={img.width}
                        height={img.height}
                        className="w-full h-full object-cover"
                        sizes="100px"
                        quality={15}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="page-inner w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-20 md:py-24 relative z-10">
          <div>
            <span className="inline-block px-5 py-1.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-xs font-semibold mb-5">
              {t.heroBadge}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              {t.heroTitle.split(t.heroTitleSpan)[0]}
              <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                {t.heroTitleSpan}
              </span>
              {t.heroTitle.split(t.heroTitleSpan)[1] || ""}
            </h1>
            <p className="text-lg text-[var(--text2)] max-w-xl mb-8">
              {t.heroDesc}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/packages" className="btn btn-primary">
                {t.heroCTA}
              </Link>
              <Link href="/contact" className="btn btn-outline">
                {t.contact}
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end relative">
            <div
              className="absolute w-[500px] h-[500px] rounded-full opacity-50 blur-3xl pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(89,171,254,0.8) 0%, rgba(151,205,242,0.4) 40%, transparent 65%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <Image
              src="/anasayfa.png"
              alt="SkyBlue"
              width={600}
              height={600}
              className="w-full max-w-[500px] h-auto rounded-2xl animate-float relative"
              priority
            />
          </div>
        </div>
      </section>

      <section className="page-inner py-16">
        <StatsCounter />
        <Reveal>
          <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.reviewsTitle}
            </span>
          </h2>
          <p>{t.reviewsDesc}</p>
        </div>
        {reviews.length > 0 ? (
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${(index * 100) / perPage}%)` }}
            >
              {reviews.map((item, i) => (
                <div key={i} className="min-w-0 w-full md:w-1/3 shrink-0 px-3">
                  <div className="review-card h-full">
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
                    <div className="font-semibold text-sm">{item.author}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === index ? "bg-[#59abfe] w-5" : "bg-[var(--border)]"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text2)]">
            {lang === "TR" ? "Henüz yorum bulunmuyor." : "No reviews yet."}
          </p>
        )}
        <div className="text-center mt-8">
          <Link href="/reviews" className="text-sm font-medium text-[#59abfe] hover:underline">
            {lang === "TR" ? "Tüm yorumları gör →" : "View all reviews →"}
          </Link>
        </div>
        </Reveal>
      </section>

      <section className="page-inner py-16 border-t border-[var(--border)]">
        <Reveal>
          <div className="section-header">
            <h2>
              <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                {t.contactInfo}
              </span>
            </h2>
            <p>{t.contactInfoDesc}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href={info.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="review-card flex items-center gap-3 px-6 py-4 min-w-[200px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
                <MessageIcon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">{t.discord}</div>
                <div className="text-[10px] text-[var(--text2)]">discord.gg/DRnxEXCQU</div>
              </div>
            </a>
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="review-card flex items-center gap-3 px-6 py-4 min-w-[200px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
                <CameraIcon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">Instagram</div>
                <div className="text-[10px] text-[var(--text2)]">{t.instagram}</div>
              </div>
            </a>
            <div className="review-card flex items-center gap-3 px-6 py-4 min-w-[200px]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
                <MailIcon size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">Email</div>
                <div className="text-[10px] text-[var(--text2)]">{info.email}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
