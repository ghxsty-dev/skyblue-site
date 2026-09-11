"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";

const DISMISS_KEY = "welcome-dismissed";

/** İlk ziyarette misafirlere bir kez gösterilen karşılama kutusu (görsel boyutunda). */
export default function WelcomeBox() {
  const { t, lang } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return;
    }
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && !d?.user) setVisible(true); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* yok say */
    }
    setVisible(false);
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
            <Link href="/register" onClick={dismiss} className="btn btn-primary">
              {lang === "TR" ? "Kayıt Ol" : "Sign Up"}
            </Link>
            <Link href="/login" onClick={dismiss} className="btn btn-outline btn-light">
              {lang === "TR" ? "Giriş Yap" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
