"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";

export default function PremiumRedeemForm({ toolSlug = "minecraft-rank" }: { toolSlug?: string }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function redeem(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, toolSlug }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: tr ? "Kod geçersiz, kullanılmış veya bu tool’a ait değil." : "The code is invalid, used, or belongs to another tool." });
        return;
      }
      const date = new Date(result.expiresAt).toLocaleDateString(tr ? "tr-TR" : "en-GB");
      setCode("");
      setMessage({ type: "success", text: tr ? `Premium erişim ${date} tarihine kadar aktif.` : `Premium access is active until ${date}.` });
    } catch {
      setMessage({ type: "error", text: tr ? "Kod kullanılamadı." : "Could not redeem the code." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="premium-redeem-form" onSubmit={redeem}>
      <label htmlFor="premium-code">{tr ? "Premium kodu" : "Premium code"}</label>
      <div>
        <input id="premium-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="MCR-XXXX-XXXX-XXXX" required autoComplete="off" />
        <button type="submit" disabled={pending || !code.trim()}>{pending ? (tr ? "Kontrol ediliyor..." : "Checking...") : (tr ? "Kodu kullan" : "Redeem")}</button>
      </div>
      {message && <p className={message.type === "success" ? "account-form-success" : "account-form-error"} role="status">{message.text}</p>}
    </form>
  );
}
