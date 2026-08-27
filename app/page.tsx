"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/context";
import { StarIcon, MessageIcon, CameraIcon, MailIcon } from "@/lib/icons";
import contactData from "@/data/contact.json";
import Reveal from "@/components/Reveal";
import StatsCounter from "@/components/StatsCounter";
import DiscordWidget from "@/components/DiscordWidget";
import ColourfulText from "@/components/ui/colourful-text";

interface Review {
  text: string;
  author: string;
  stars: number;
  date?: string;
  avatar?: string;
}

export default function HomePage() {
  const { t, lang } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const info = contactData[lang as "EN" | "TR"];

  useEffect(() => {
    fetch(`/api/reviews?lang=${lang}`)
      .then((res) => res.json())
      .then((data: { reviews: Review[] }) => setReviews(data.reviews))
      .catch(() => setReviews([]));
  }, [lang]);

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
      <section className="relative h-[calc(100vh-64px)] min-h-[500px] -mt-6 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw] overflow-hidden rounded-b-3xl">
          <Image
            src="/background.webp"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white">
            {t.heroTitle.split(t.heroTitleSpan)[0]}
            <ColourfulText text={t.heroTitleSpan} />
            {t.heroTitle.split(t.heroTitleSpan)[1] || ""}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            {t.heroDesc}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/services" className="btn btn-primary">
              {t.heroCTA}
            </Link>
            <Link href="/contact" className="btn btn-outline">
              {t.contact}
            </Link>
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
                <div key={i} className="min-w-0 w-full md:w-1/3 shrink-0 px-4">
                  <div className="card group h-full">
                    <div className="flex items-center gap-3 mb-3">
                      {item.avatar ? (
                        <Image src={item.avatar} alt={item.author} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--bg2)] flex items-center justify-center text-[#59abfe] font-bold text-sm shrink-0">
                {item.author.charAt(0).toUpperCase()}
              </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-[var(--text)]">{item.author}</div>
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
                {t.brandsTitle}
              </span>
            </h2>
            <p>{t.brandsDesc}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { slug: "discore", name: "DisCore", url: "https://discore.app" },
              { slug: "modique", name: "Modique", url: "https://modiqueps.com" },
              { slug: "armea", name: "Armea", url: "https://armea.xyz" },
              { slug: "mangitto", name: "Mangitto", url: "https://mangtto.com" },
            ].map((brand) => (
              <a
                key={brand.slug}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] opacity-80 hover:opacity-100 hover:border-[#59abfe] transition-all duration-300 overflow-hidden"
              >
                <Image
                  src={`/${brand.slug}.webp`}
                  alt={brand.name}
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white font-semibold text-sm">{brand.name}</span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="page-inner py-16 border-t border-[var(--border)]">
        <Reveal>
          <div className="section-header">
            <h2>
              <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                {t.discordWidgetTitle}
              </span>
            </h2>
          </div>
          <DiscordWidget />
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
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href={info.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-white shrink-0">
                <MessageIcon size={24} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text)] group-hover:text-[#59abfe] transition-colors">{t.discord}</div>
                <div className="text-[10px] text-[var(--text2)]">discord.gg/F3uQ2fU8RV</div>
              </div>
            </a>
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-white shrink-0">
                <CameraIcon size={24} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text)] group-hover:text-[#59abfe] transition-colors">Instagram</div>
                <div className="text-[10px] text-[var(--text2)]">{t.instagram}</div>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <div className="text-white shrink-0">
                <MailIcon size={24} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--text)]">Email</div>
                <div className="text-[10px] text-[var(--text2)]">{info.email}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
