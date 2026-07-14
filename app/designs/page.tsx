"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/lib/context";
import Lightbox from "@/components/Lightbox";

interface DesignImage {
  url: string;
  width: number;
  height: number;
}

interface DesignPost {
  id: string;
  title: string;
  images: DesignImage[];
}

export default function DesignsPage() {
  const { t, lang } = useApp();
  const [designs, setDesigns] = useState<DesignPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ postIdx: number; imgIdx: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/designs")
      .then((res) => res.json())
      .then((data: { designs: DesignPost[] }) => setDesigns(data.designs))
      .catch(() => setDesigns([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (postIdx: number, imgIdx: number) => setLightbox({ postIdx, imgIdx });

  const closeLightbox = () => setLightbox(null);

  const prevImage = () => {
    if (!lightbox) return;
    const post = designs[lightbox.postIdx];
    const total = post.images.length;
    const next = (lightbox.imgIdx - 1 + total) % total;
    setLightbox({ ...lightbox, imgIdx: next });
  };

  const nextImage = () => {
    if (!lightbox) return;
    const post = designs[lightbox.postIdx];
    const total = post.images.length;
    const next = (lightbox.imgIdx + 1) % total;
    setLightbox({ ...lightbox, imgIdx: next });
  };

  const currentLightboxImages = lightbox ? designs[lightbox.postIdx]?.images : [];

  return (
    <div className="page-inner">
      <div className="section-header">
        <h2>
          <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
            {t.designsTitle}
          </span>
        </h2>
        <p>{t.designsDesc}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#59abfe] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <p className="text-center text-[var(--text2)] py-16">{lang === "TR" ? "Henüz tasarım bulunmuyor." : "No designs yet."}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((post, i) => (
            <div
              key={post.id}
              className="card group cursor-pointer"
              onClick={() => post.images.length > 0 && openLightbox(i, 0)}
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
            </div>
          ))}
        </div>
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
