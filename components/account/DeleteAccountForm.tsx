"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  WRONG_PASSWORD: { tr: "Şifre hatalı.", en: "Incorrect password." },
  LOGIN_REQUIRED: { tr: "Devam etmek için tekrar giriş yapın.", en: "Please sign in again to continue." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  DELETE_FAILED: { tr: "Hesap silinemedi. Lütfen tekrar deneyin.", en: "Could not delete the account. Please try again." },
};

export default function DeleteAccountForm({ username }: { username: string }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) {
        const known = ERROR_MESSAGES[result.error];
        setError(known ? (tr ? known.tr : known.en) : (tr ? "Bir hata oluştu." : "Something went wrong."));
        return;
      }
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      window.location.assign("/");
    } catch {
      setError(tr ? "Bağlantı kurulamadı." : "Could not connect.");
    } finally {
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <div>
        <p className="account-danger-text">
          {tr
            ? `"${username}" hesabın, profilin ve tüm verilerin kalıcı olarak silinir. Bu işlem geri alınamaz.`
            : `Your "${username}" account, profile, and all data will be permanently deleted. This cannot be undone.`}
        </p>
        <button type="button" className="account-danger-button" onClick={() => setConfirming(true)}>
          {tr ? "Hesabı sil" : "Delete account"}
        </button>
      </div>
    );
  }

  return (
    <form className="account-form" onSubmit={deleteAccount}>
      <label>
        <span>{tr ? "Onay için şifreni gir" : "Enter your password to confirm"}</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && <p className="account-form-error" role="alert">{error}</p>}
      <div className="account-danger-actions">
        <button type="button" className="account-secondary-button" onClick={() => { setConfirming(false); setPassword(""); setError(""); }} disabled={pending}>
          {tr ? "Vazgeç" : "Cancel"}
        </button>
        <button type="submit" className="account-danger-button" disabled={pending || !password}>
          {pending ? (tr ? "Siliniyor..." : "Deleting...") : (tr ? "Evet, kalıcı olarak sil" : "Yes, delete permanently")}
        </button>
      </div>
    </form>
  );
}
