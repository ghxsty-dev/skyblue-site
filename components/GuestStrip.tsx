"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";

const DISMISS_KEY = "guest-strip-dismissed";

/** Giriş yapmamış ziyaretçilere gösterilen ince kayıt davet şeridi. */
export default function GuestStrip() {
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
    <div className="guest-strip" role="region" aria-label={t.signUp}>
      <span>{t.guestStripText}</span>
      <Link href="/register" className="guest-strip-cta">{t.signUp}</Link>
      <button type="button" className="guest-strip-close" onClick={dismiss} aria-label={lang === "TR" ? "Kapat" : "Close"}>
        ×
      </button>
    </div>
  );
}
