"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import BannerEditor from "./BannerEditor";
import NameStyleEditor from "./NameStyleEditor";
import { NAME_FONTS, type NameStyle } from "@/lib/account/name-style";

const MAX_BIO_LENGTH = 100;

interface ProfileEditorsProps {
  username: string;
  initialBio: string;
  initialStyle: NameStyle;
  premium: boolean;
  bannerCurrent: string | null;
}

function errorText(code: string | undefined, tr: boolean): string {
  const messages: Record<string, { tr: string; en: string }> = {
    INVALID_BIO: { tr: "Hakkında yazısı en fazla 100 karakter olabilir.", en: "The bio can be at most 100 characters." },
    INVALID_STYLE: { tr: "Stil geçersiz. Renkleri kontrol edip tekrar dene.", en: "Invalid style. Check the colors and try again." },
    PREMIUM_REQUIRED: { tr: "Kaydetmek için aktif premium gerekli.", en: "Active premium is required to save." },
    LOGIN_REQUIRED: { tr: "Devam etmek için tekrar giriş yapın.", en: "Please sign in again to continue." },
    SESSION_REVOKED: { tr: "Oturumun kapatıldı. Tekrar giriş yap.", en: "Your session was revoked. Please sign in again." },
    RATE_LIMITED: { tr: "Çok fazla deneme. Lütfen birkaç dakika bekleyin.", en: "Too many attempts. Please wait a few minutes." },
    AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  };
  const known = code ? messages[code] : undefined;
  return known ? (tr ? known.tr : known.en) : (tr ? "Kaydedilemedi. Lütfen tekrar deneyin." : "Could not save. Please try again.");
}

/** Hakkında + isim görünümü tek formda; değişiklik olunca yüzen kayıt çubuğu çıkar. */
export default function ProfileEditors({ username, initialBio, initialStyle, premium, bannerCurrent }: ProfileEditorsProps) {
  const { lang } = useApp();
  const router = useRouter();
  const tr = lang === "TR";
  const validInitialFont = NAME_FONTS.some((f) => f.id === initialStyle.font) ? initialStyle.font : "default";

  const [bio, setBio] = useState(initialBio);
  const [font, setFont] = useState(validInitialFont);
  const [from, setFrom] = useState(initialStyle.from);
  const [to, setTo] = useState<string | null>(initialStyle.to);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const bioDirty = bio !== initialBio;
  const styleDirty =
    font !== initialStyle.font || from !== initialStyle.from || (to ?? null) !== (initialStyle.to ?? null);
  const dirty = bioDirty || (premium && styleDirty);

  useEffect(() => {
    if (dirty) {
      setShown(true);
      setLeaving(false);
      return;
    }
    if (!shown) return;
    setLeaving(true);
    const timer = window.setTimeout(() => {
      setShown(false);
      setLeaving(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [dirty, shown]);

  function resetAll() {
    setBio(initialBio);
    setFont(validInitialFont);
    setFrom(initialStyle.from);
    setTo(initialStyle.to);
    setMessage(null);
  }

  function resetDefaults() {
    setFont("default");
    setFrom("#ffffff");
    setTo(null);
  }

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      if (bioDirty) {
        const response = await fetch("/api/account/bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio }),
        });
        const result = await response.json();
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        if (!response.ok) {
          setMessage({ ok: false, text: errorText(result.error, tr) });
          if (result.error === "SESSION_REVOKED") window.setTimeout(() => window.location.assign("/login"), 1500);
          return;
        }
      }

      if (premium && styleDirty) {
        const response = await fetch("/api/account/name-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ font, from, to }),
        });
        const result = await response.json().catch(() => ({}));
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        if (!response.ok) {
          setMessage({ ok: false, text: errorText(result.error, tr) });
          if (result.error === "SESSION_REVOKED") window.setTimeout(() => window.location.assign("/login"), 1500);
          return;
        }
      }

      setMessage({ ok: true, text: tr ? "Değişiklikler kaydedildi." : "Changes saved." });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: tr ? "Bağlantı kurulamadı." : "Could not connect." });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="account-access-section">
        <div className="account-section-heading"><div><span>Profil</span><h2>Hakkında</h2></div></div>
        <div className="account-form">
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
        </div>
      </section>

      <div className="account-profile-edit-grid">
        <NameStyleEditor
          username={username}
          premium={premium}
          font={font}
          from={from}
          to={to}
          onFontChange={setFont}
          onFromChange={setFrom}
          onToChange={setTo}
          onResetDefaults={resetDefaults}
        />
        <BannerEditor current={bannerCurrent} premium={premium} />
      </div>

      {message && (
        <p className={message.ok ? "account-form-ok" : "account-form-error"} role="status">
          {message.text}
        </p>
      )}

      {shown && (
        <div className={`profile-save-bar${leaving ? " is-leaving" : ""}`} role="region" aria-label={tr ? "Kaydedilmemiş değişiklikler" : "Unsaved changes"}>
          <span>{tr ? "Değişiklikler kaydedilsin mi?" : "Save changes?"}</span>
          <div className="profile-save-bar-actions">
            <button type="button" className="account-secondary-button" onClick={resetAll} disabled={pending}>
              {tr ? "Vazgeç" : "Discard"}
            </button>
            <button type="button" className="account-primary-button" onClick={save} disabled={pending}>
              {pending ? (tr ? "Kaydediliyor..." : "Saving...") : (tr ? "Kaydet" : "Save")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
