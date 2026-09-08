"use client";

import Link from "next/link";
import { useState } from "react";
import StyledUsername from "./StyledUsername";
import { NAME_FONTS, type NameStyle } from "@/lib/account/name-style";

const PRESETS = ["#ffffff", "#0b0d10", "#59abfe", "#eab308", "#ef4444", "#22c55e", "#8b5cf6", "#f97316"];

interface NameStyleEditorProps {
  username: string;
  initial: NameStyle;
  premium: boolean;
}

export default function NameStyleEditor({ username, initial, premium }: NameStyleEditorProps) {
  const [font, setFont] = useState(initial.font);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState<string | null>(initial.to);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!premium) {
    return (
      <section className="account-name-style account-card">
        <div className="account-section-heading">
          <div><span>Premium</span><h2>İsim Görünümü</h2></div>
          <span className="account-badge">Premium özel</span>
        </div>
        <p className="account-text-muted">
          Profil sayfandaki ismine özel font, renk ve gradient sadece premium üyeler için.
        </p>
        <Link href="/account/premium?tool=minecraft-rank" className="account-primary-button">Premium üyesi ol</Link>
      </section>
    );
  }

  const gradient = to !== null;
  const preview: NameStyle = { font, from, to };

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/name-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font, from, to: gradient ? to : null }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) {
        setMessage({
          ok: false,
          text: result.error === "PREMIUM_REQUIRED"
            ? "Kaydetmek için aktif premium gerekli."
            : "Kaydedilemedi. Renkleri kontrol edip tekrar dene.",
        });
        return;
      }
      setMessage({ ok: true, text: "Kaydedildi. Profil sayfanda görünüyor." });
    } catch {
      setMessage({ ok: false, text: "Bağlantı kurulamadı." });
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setFont("default");
    setFrom("#ffffff");
    setTo(null);
    setMessage(null);
  }

  return (
    <section className="account-name-style account-card">
      <div className="account-section-heading">
        <div><span>Premium</span><h2>İsim Görünümü</h2></div>
        <span className="account-badge premium"><img src="/premium.webp" alt="" width={12} height={12} />Aktif</span>
      </div>

      <div className="account-name-preview">
        <StyledUsername username={username} style={preview} enabled />
      </div>

      <span className="account-field-label">Font</span>
      <div className="account-font-grid">
        {NAME_FONTS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`account-font-btn ${font === option.id ? "is-active" : ""}`}
            style={option.css ? { fontFamily: option.css } : undefined}
            onClick={() => setFont(option.id)}
            aria-pressed={font === option.id}
          >
            Ag
            <small>{option.label}</small>
          </button>
        ))}
      </div>

      <span className="account-field-label">Renk</span>
      <div className="account-mode-tabs">
        <button type="button" className={!gradient ? "is-active" : ""} onClick={() => setTo(null)} aria-pressed={!gradient}>
          Düz renk
        </button>
        <button
          type="button"
          className={gradient ? "is-active" : ""}
          onClick={() => setTo((prev) => prev ?? "#59abfe")}
          aria-pressed={gradient}
        >
          Gradient
        </button>
      </div>

      <div className="account-color-row">
        <label>
          <span>{gradient ? "Başlangıç" : "Renk"}</span>
          <input type="color" value={from} onChange={(e) => setFrom(e.target.value.toLowerCase())} />
          <code>{from}</code>
        </label>
        {gradient && (
          <label>
            <span>Bitiş</span>
            <input type="color" value={to ?? "#59abfe"} onChange={(e) => setTo(e.target.value.toLowerCase())} />
            <code>{to}</code>
          </label>
        )}
      </div>

      <div className="account-color-presets">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            className="account-color-dot"
            style={{ backgroundColor: color }}
            onClick={() => setFrom(color)}
            aria-label={color}
            title={color}
          />
        ))}
      </div>

      <div className="account-name-actions">
        <button type="button" className="account-primary-button" onClick={save} disabled={pending}>
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button type="button" className="account-ghost-button" onClick={reset}>
          Varsayılana dön
        </button>
      </div>
      {message && (
        <p className={message.ok ? "account-form-ok" : "account-form-error"} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
