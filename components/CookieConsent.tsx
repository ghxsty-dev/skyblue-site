"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

const STORAGE_KEY = "skyblue-cookie-consent";

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function CookieConsent() {
  const { t } = useApp();
  const [show, setShow] = useState(shouldShow);

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
    <div className="fixed bottom-4 left-4 z-[9999] max-w-[280px]">
      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold mb-1">{t.cookieTitle}</p>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            {t.cookieDesc}
          </p>
        </div>
        <div className="flex gap-2">
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
