"use client";

import { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-[22px] z-[998] w-[40px] h-[40px] rounded-full bg-[var(--bg2)] border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--text2)] hover:text-[#59abfe] hover:border-[#59abfe] transition-all cursor-pointer"
      aria-label="Back to top"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M6 14.5L12 8.5l6 6-2.2 2.2L12 13l-3.8 3.7L6 14.5z" />
      </svg>
    </button>
  );
}
