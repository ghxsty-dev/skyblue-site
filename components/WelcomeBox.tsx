"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/context";

const DISMISS_KEY = "welcome-dismissed";

function wasDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return Boolean(window.sessionStorage.getItem(DISMISS_KEY));
  } catch {
    return false;
  }
}

/** İlk ziyarette misafirlere bir kez gösterilen karşılama kutusu (görsel boyutunda). */
export default function WelcomeBox() {
  const { t, lang, me, authChecked } = useApp();
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (!authChecked || dismissed || me) return null;

  function dismiss() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* yok say */
    }
    setDismissed(true);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ animation: "fadeIn 0.3s ease" }}
      role="dialog"
      aria-modal="true"
      aria-label={t.welcomeTitle}
    >
      <div
        className="welcome-box"
        style={{ animation: "slideUp 0.35s ease" }}
      >
        <Image src="/welcome.webp" alt="" width={3360} height={2160} priority className="welcome-box-img" />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <button
          type="button"
          onClick={dismiss}
          aria-label={lang === "TR" ? "Kapat" : "Close"}
          className="welcome-box-close"
        >
          ×
        </button>
        <div className="welcome-box-overlay">
          <p>{t.welcomeTitle}</p>
          <div className="welcome-box-actions">
            <Link href="/register" onClick={dismiss} className="btn btn-glass">
              {lang === "TR" ? "Kayıt Ol" : "Sign Up"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
