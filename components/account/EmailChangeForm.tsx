"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  INVALID_EMAIL: { tr: "Geçerli bir e-posta adresi girin.", en: "Enter a valid email address." },
  EMAIL_UNCHANGED: { tr: "Yeni e-posta mevcut e-postayla aynı.", en: "The new email is the same as the current one." },
  WRONG_PASSWORD: { tr: "Şifre hatalı.", en: "Incorrect password." },
  EMAIL_TAKEN: { tr: "Bu e-posta adresi başka bir hesapta kullanılıyor.", en: "This email address is already used by another account." },
  LOGIN_REQUIRED: { tr: "Devam etmek için tekrar giriş yapın.", en: "Please sign in again to continue." },
  SESSION_REVOKED: { tr: "Oturumun kapatıldı. Tekrar giriş yap.", en: "Your session was revoked. Please sign in again." },
  RATE_LIMITED: { tr: "Çok fazla deneme. Lütfen birkaç dakika bekleyin.", en: "Too many attempts. Please wait a few minutes." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  UPDATE_FAILED: { tr: "E-posta değiştirilemedi. Lütfen tekrar deneyin.", en: "Could not change the email. Please try again." },
};

export default function EmailChangeForm({ currentEmail }: { currentEmail: string }) {
  const { lang } = useApp();
  const router = useRouter();
  const tr = lang === "TR";
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function changeEmail(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        const known = ERROR_MESSAGES[result.error];
        setMessage({ type: "error", text: known ? (tr ? known.tr : known.en) : (tr ? "Bir hata oluştu." : "Something went wrong.") });
        if (result.error === "SESSION_REVOKED") window.setTimeout(() => window.location.assign("/login"), 1500);
        return;
      }
      setNewEmail("");
      setPassword("");
      setMessage({ type: "success", text: tr ? `E-posta ${result.email} olarak güncellendi.` : `Email updated to ${result.email}.` });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: tr ? "Bağlantı kurulamadı." : "Could not connect." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="account-form" onSubmit={changeEmail}>
      <label>
        <span>{tr ? "Mevcut e-posta" : "Current email"}</span>
        <input value={currentEmail} disabled autoComplete="email" />
      </label>
      <label>
        <span>{tr ? "Yeni e-posta" : "New email"}</span>
        <input
          type="email"
          required
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          placeholder="yeni@example.com"
          autoComplete="email"
        />
      </label>
      <label>
        <span>{tr ? "Mevcut şifre" : "Current password"}</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
          onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
          autoComplete="current-password"
        />
        <small className="account-form-warning" aria-live="polite" style={{ visibility: capsLock ? "visible" : "hidden" }}>
          {tr ? "Caps Lock açık" : "Caps Lock is on"}
        </small>
      </label>
      {message && <p className={message.type === "success" ? "account-form-success" : "account-form-error"} role="status">{message.text}</p>}
      <button type="submit" disabled={pending || !newEmail.trim() || !password}>
        {pending ? (tr ? "Güncelleniyor..." : "Updating...") : (tr ? "E-postayı değiştir" : "Change email")}
      </button>
    </form>
  );
}
