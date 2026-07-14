"use client";

import Image from "next/image";
import { useEffect, useCallback } from "react";

interface LightboxProps {
  images: { url: string; width: number; height: number }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const img = images[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center cursor-pointer border-none hover:bg-white/20 z-10"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-lg flex items-center justify-center cursor-pointer border-none hover:bg-white/20 z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-lg flex items-center justify-center cursor-pointer border-none hover:bg-white/20 z-10"
          >
            ›
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs z-10">
        {index + 1} / {images.length}
      </div>

      <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <Image
          src={img.url}
          alt=""
          width={img.width || 1200}
          height={img.height || 800}
          className="max-w-full max-h-[85vh] w-auto h-auto rounded-lg object-contain shadow-2xl"
          style={{ animation: "slideUp 0.3s ease" }}
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
