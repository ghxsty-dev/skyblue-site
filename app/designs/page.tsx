"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useApp } from "@/lib/context";
import Lightbox from "@/components/Lightbox";
import Reveal from "@/components/Reveal";

interface DesignImage {
  url: string;
  width: number;
  height: number;
}

interface DesignTag {
  id: string;
  name: string;
  emojiName: string | null;
}

interface DesignPost {
  id: string;
  title: string;
  images: DesignImage[];
  createdAt: number;
  tagIds: string[];
}

export default function DesignsPage() {
  const { t, lang } = useApp();
  const [designs, setDesigns] = useState<DesignPost[]>([]);
  const [availableTags, setAvailableTags] = useState<DesignTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(6);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ postIdx: number; imgIdx: number } | null>(null);

  function isBanner(post: DesignPost) {
    return post.images.some((img) => {
      const w = img.width;
      const h = img.height;
      return (
        (w === 1920 && h === 1080) ||
        (w === 2160 && h === 1440) ||
        (w === 3840 && h === 2160)
      );
    });
  }

  const sorted = useMemo(() => {
    let filtered = designs;
    if (selectedTag) {
      filtered = designs.filter((p) => p.tagIds.includes(selectedTag));
    }
    const copy = [...filtered];
    const dir = sortOrder === "newest" ? -1 : 1;
    copy.sort((a, b) => {
      const aBanner = isBanner(a) ? 0 : 1;
      const bBanner = isBanner(b) ? 0 : 1;
      if (aBanner !== bBanner) return aBanner - bBanner;
      return (b.createdAt - a.createdAt) * dir;
    });
    return copy;
  }, [designs, sortOrder, selectedTag]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/designs")
      .then((res) => res.json())
      .then((data: { designs: DesignPost[]; availableTags: DesignTag[] }) => {
        setDesigns(data.designs);
        setAvailableTags(data.availableTags ?? []);
      })
      .catch(() => setDesigns([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (postIdx: number, imgIdx: number) => setLightbox({ postIdx, imgIdx });

  const closeLightbox = () => setLightbox(null);

  const prevImage = () => {
    if (!lightbox) return;
    const post = sorted[lightbox.postIdx];
    const total = post.images.length;
    const next = (lightbox.imgIdx - 1 + total) % total;
    setLightbox({ ...lightbox, imgIdx: next });
  };

  const nextImage = () => {
    if (!lightbox) return;
    const post = sorted[lightbox.postIdx];
    const total = post.images.length;
    const next = (lightbox.imgIdx + 1) % total;
    setLightbox({ ...lightbox, imgIdx: next });
  };

  const currentLightboxImages = lightbox ? sorted[lightbox.postIdx]?.images : [];

  return (
    <div className="page-inner">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {t.designsTitle}
            </span>
          </h2>
          <p>{t.designsDesc}</p>
        </div>
      </Reveal>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#59abfe] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <p className="text-center text-[var(--text2)] py-16">{lang === "TR" ? "Henüz tasarım bulunmuyor." : "No designs yet."}</p>
      ) : (
        <>
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--footer-border)] bg-[var(--bg2)] text-xs text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" /><path d="m3 17 4 4 4-4" /><path d="M7 3v18" />
            </svg>
            {sortOrder === "newest"
              ? (lang === "TR" ? "En Yeni" : "Newest")
              : (lang === "TR" ? "En Eski" : "Oldest")}
          </button>
        </div>
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                selectedTag === null
                  ? "bg-[#59abfe] text-white border-[#59abfe]"
                  : "bg-[var(--bg2)] text-[var(--text2)] border-[var(--footer-border)] hover:border-[#59abfe]"
              }`}
            >
              {lang === "TR" ? "Tümü" : "All"}
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                  selectedTag === tag.id
                    ? "bg-[#59abfe] text-white border-[#59abfe]"
                    : "bg-[var(--bg2)] text-[var(--text2)] border-[var(--footer-border)] hover:border-[#59abfe]"
                }`}
              >
                {tag.emojiName && <span className="mr-1">{tag.emojiName}</span>}
                {tag.name}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.slice(0, visible).map((post, i) => (
            <Reveal key={post.id} delay={i * 40}>
            <div
              className="card group cursor-pointer"
              onClick={() => post.images.length > 0 && openLightbox(sorted.indexOf(post), 0)}
            >
              {post.images.length > 0 ? (
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg2)]">
                  <Image
                    src={post.images[0].url}
                    alt={post.title}
                    width={post.images[0].width || 600}
                    height={post.images[0].height || 400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {post.images.length > 1 && (
                    <div className="relative -mt-8 mr-2 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                        +{post.images.length - 1}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white text-3xl opacity-50">
                  ?
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-base">{post.title}</h4>
              </div>
            </div></Reveal>
          ))}
        </div>
        {visible < sorted.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisible((v) => v + 6)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity"
            >
              {lang === "TR" ? "Daha Fazla Yükle" : "Load More"}
            </button>
          </div>
        )}
        </>
      )}

      {lightbox && currentLightboxImages && currentLightboxImages.length > 0 && (
        <Lightbox
          images={currentLightboxImages}
          index={lightbox.imgIdx}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
}
