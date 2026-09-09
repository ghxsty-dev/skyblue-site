"use client";

import Link from "next/link";
import ColorPicker from "./ColorPicker";
import StyledUsername from "./StyledUsername";
import { NAME_FONTS, type NameStyle } from "@/lib/account/name-style";

interface NameStyleEditorProps {
  username: string;
  premium: boolean;
  font: string;
  from: string;
  to: string | null;
  onFontChange: (font: string) => void;
  onFromChange: (from: string) => void;
  onToChange: (to: string | null) => void;
  onResetDefaults: () => void;
}

export default function NameStyleEditor({ username, premium, font, from, to, onFontChange, onFromChange, onToChange, onResetDefaults }: NameStyleEditorProps) {
  if (!premium) {
    return (
      <section className="account-name-style">
        <div className="account-section-heading">
          <div><span>Premium</span><h2>İsim Görünümü</h2></div>
          <span className="account-badge">Premium</span>
        </div>
        <p className="account-text-muted">
          Özel font ve renk sadece premium üyeler için.
        </p>
        <Link href="/account/premium?tool=minecraft-rank" className="account-primary-button">Premium ol</Link>
      </section>
    );
  }

  const gradient = to !== null;
  const preview: NameStyle = { font, from, to };

  return (
    <section className="account-name-style">
      <div className="account-section-heading">
        <div><span>Premium</span><h2>İsim Görünümü</h2></div>
        <span className="account-badge premium"><img src="/premium.webp" alt="" width={10} height={10} />Aktif</span>
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
            onClick={() => onFontChange(option.id)}
            aria-pressed={font === option.id}
          >
            Ag
            <small>{option.label}</small>
          </button>
        ))}
      </div>

      <span className="account-field-label">Renk</span>
      <div className="account-mode-tabs">
        <button type="button" className={!gradient ? "is-active" : ""} onClick={() => onToChange(null)} aria-pressed={!gradient}>
          Düz renk
        </button>
        <button
          type="button"
          className={gradient ? "is-active" : ""}
          onClick={() => onToChange(to ?? "#59abfe")}
          aria-pressed={gradient}
        >
          Gradient
        </button>
      </div>

      <div className="account-color-row">
        <div className="account-color-field">
          <span>{gradient ? "Başlangıç" : "Renk"}</span>
          <ColorPicker value={from} onChange={onFromChange} />
        </div>
        {gradient && (
          <div className="account-color-field">
            <span>Bitiş</span>
            <ColorPicker value={to ?? "#59abfe"} onChange={onToChange} />
          </div>
        )}
      </div>

      <div className="account-name-actions">
        <button type="button" className="account-ghost-button" onClick={onResetDefaults}>
          Varsayılana dön
        </button>
      </div>
    </section>
  );
}
