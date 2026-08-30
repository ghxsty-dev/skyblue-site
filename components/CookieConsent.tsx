"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";

const STORAGE_KEY = "skyblue-cookie-consent";

export default function CookieConsent() {
  const { t, lang } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-[var(--bg2)] border border-[var(--border)] rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">{t.cookieTitle}</p>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            {t.cookieDesc}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
          >
            {t.cookieDecline}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            {t.cookieAccept}
          </button>
        </div>
      </div>
    </div>
  );
}
