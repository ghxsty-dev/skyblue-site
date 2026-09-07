"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

export default function AccountLogoutButton() {
  const { lang } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setPending(true);
    setError(false);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError(true);
        return;
      }
      window.location.assign("/login");
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-logout-control">
      <button type="button" className="account-secondary-button" onClick={logout} disabled={pending}>
        {pending ? (lang === "TR" ? "Çıkılıyor..." : "Signing out...") : (lang === "TR" ? "Çıkış yap" : "Sign out")}
      </button>
      {error && <span role="alert">{lang === "TR" ? "Çıkış yapılamadı." : "Could not sign out."}</span>}
    </div>
  );
}
