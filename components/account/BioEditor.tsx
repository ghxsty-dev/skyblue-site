"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

const MAX_BIO_LENGTH = 100;

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  INVALID_BIO: { tr: "Hakkında yazısı en fazla 100 karakter olabilir.", en: "The bio can be at most 100 characters." },
  LOGIN_REQUIRED: { tr: "Devam etmek için tekrar giriş yapın.", en: "Please sign in again to continue." },
  SESSION_REVOKED: { tr: "Oturumun kapatıldı. Tekrar giriş yap.", en: "Your session was revoked. Please sign in again." },
  RATE_LIMITED: { tr: "Çok fazla deneme. Lütfen birkaç dakika bekleyin.", en: "Too many attempts. Please wait a few minutes." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  SAVE_FAILED: { tr: "Kaydedilemedi. Lütfen tekrar deneyin.", en: "Could not save. Please try again." },
};

export default function BioEditor({ initial }: { initial: string }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [bio, setBio] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      const result = await response.json();
      if (!response.ok) {
        const known = ERROR_MESSAGES[result.error];
        setMessage({ type: "error", text: known ? (tr ? known.tr : known.en) : (tr ? "Bir hata oluştu." : "Something went wrong.") });
        if (result.error === "SESSION_REVOKED") window.setTimeout(() => window.location.assign("/login"), 1500);
        return;
      }
      setBio(result.bio ?? bio);
      setMessage({ type: "success", text: tr ? "Hakkında yazın güncellendi." : "Your bio was updated." });
    } catch {
      setMessage({ type: "error", text: tr ? "Bağlantı kurulamadı." : "Could not connect." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="account-form" onSubmit={save}>
      <label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value.slice(0, MAX_BIO_LENGTH))}
          maxLength={MAX_BIO_LENGTH}
          rows={2}
          placeholder={tr ? "Kendinden kısaca bahset..." : "Tell us briefly about yourself..."}
        />
        <small>{bio.length}/{MAX_BIO_LENGTH}</small>
      </label>
      {message && <p className={message.type === "success" ? "account-form-success" : "account-form-error"} role="status">{message.text}</p>}
      <button type="submit" disabled={pending}>
        {pending ? (tr ? "Kaydediliyor..." : "Saving...") : (tr ? "Kaydet" : "Save")}
      </button>
    </form>
  );
}
