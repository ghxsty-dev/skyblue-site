"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  WEAK_PASSWORD: { tr: "Yeni şifre en az 8 karakter, bir harf ve bir rakam içermeli.", en: "The new password must contain at least 8 characters, one letter, and one number." },
  PASSWORD_UNCHANGED: { tr: "Yeni şifre mevcut şifreyle aynı olamaz.", en: "The new password cannot be the same as the current one." },
  PASSWORD_MISMATCH: { tr: "Yeni şifreler birbiriyle eşleşmiyor.", en: "The new passwords do not match." },
  WRONG_PASSWORD: { tr: "Mevcut şifre hatalı.", en: "Incorrect current password." },
  LOGIN_REQUIRED: { tr: "Devam etmek için tekrar giriş yapın.", en: "Please sign in again to continue." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  UPDATE_FAILED: { tr: "Şifre değiştirilemedi. Lütfen tekrar deneyin.", en: "Could not change the password. Please try again." },
};

export default function PasswordChangeForm() {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function trackCapsLock(event: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      const known = ERROR_MESSAGES.PASSWORD_MISMATCH;
      setMessage({ type: "error", text: tr ? known.tr : known.en });
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        const known = ERROR_MESSAGES[result.error];
        setMessage({ type: "error", text: known ? (tr ? known.tr : known.en) : (tr ? "Bir hata oluştu." : "Something went wrong.") });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: tr ? "Şifren güncellendi." : "Your password was updated." });
    } catch {
      setMessage({ type: "error", text: tr ? "Bağlantı kurulamadı." : "Could not connect." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="account-form" onSubmit={changePassword}>
      <label>
        <span>{tr ? "Mevcut şifre" : "Current password"}</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
          autoComplete="current-password"
        />
      </label>
      <label>
        <span>{tr ? "Yeni şifre" : "New password"}</span>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
          autoComplete="new-password"
        />
      </label>
      <label>
        <span>{tr ? "Yeni şifre (tekrar)" : "New password (again)"}</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
          autoComplete="new-password"
        />
        <small className="account-form-warning" aria-live="polite" style={{ visibility: capsLock ? "visible" : "hidden" }}>
          {tr ? "Caps Lock açık" : "Caps Lock is on"}
        </small>
      </label>
      {message && <p className={message.type === "success" ? "account-form-success" : "account-form-error"} role="status">{message.text}</p>}
      <button type="submit" disabled={pending || !currentPassword || !newPassword || !confirmPassword}>
        {pending ? (tr ? "Güncelleniyor..." : "Updating...") : (tr ? "Şifreyi değiştir" : "Change password")}
      </button>
    </form>
  );
}
