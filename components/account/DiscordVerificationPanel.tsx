"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";

export default function DiscordVerificationPanel() {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [code, setCode] = useState("");
  const [linked, setLinked] = useState(false);
  const [username, setUsername] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/account/discord", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!active || !result?.linked) return;
        setLinked(true);
        setUsername(result.discord?.discord_username || "");
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!code || linked) return;
    const timer = window.setInterval(() => {
      fetch("/api/account/discord", { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          if (!result?.linked) return;
          setLinked(true);
          setUsername(result.discord?.discord_username || "");
          setCode("");
        })
        .catch(() => {});
    }, 3000);
    return () => window.clearInterval(timer);
  }, [code, linked]);

  useEffect(() => {
    if (!code || !expiresAt) return;
    const timeout = window.setTimeout(() => {
      setCode("");
      setExpiresAt(0);
      setError(tr ? "Kodun süresi doldu. Yeni bir kod oluşturabilirsin." : "The code expired. You can create a new one.");
    }, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [code, expiresAt, tr]);

  async function createCode() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/account/discord", { method: "POST" });
      const result = await response.json();
      if (response.ok) {
        setCode(result.code);
        setExpiresAt(Date.now() + Number(result.expiresIn || 600) * 1000);
      } else if (result.error === "ALREADY_LINKED") {
        setLinked(true);
      } else {
        setError(tr ? "Kod oluşturulamadı." : "Could not create a code.");
      }
    } catch {
      setError(tr ? "Kod oluşturulamadı." : "Could not create a code.");
    } finally {
      setPending(false);
    }
  }

  if (linked) {
    return <div className="discord-verification-success"><span>✓</span><div><h2>{tr ? "Discord doğrulandı" : "Discord verified"}</h2><p>{username ? `@${username}` : (tr ? "Hesabın başarıyla bağlandı." : "Your account was linked successfully.")}</p></div><Link href="/account">{tr ? "Hesabıma dön" : "Back to account"}</Link></div>;
  }

  return (
    <div className="discord-verification-panel">
      <div className="discord-verification-steps"><div><span>01</span><p>{tr ? "Tek kullanımlık kod oluştur." : "Create a one-time code."}</p></div><div><span>02</span><p>{tr ? "SkyBlue Discord sunucusunda bot komutunu çalıştır." : "Run the bot command in the SkyBlue Discord server."}</p></div><div><span>03</span><p>{tr ? "Doğrulama sonrası günlük limitin 4 olur." : "Your daily limit becomes 4 after verification."}</p></div></div>
      {!code ? <button type="button" className="account-primary-button" onClick={createCode} disabled={pending}>{pending ? (tr ? "Oluşturuluyor..." : "Creating...") : (tr ? "Doğrulama kodu oluştur" : "Create verification code")}</button> : <div className="discord-verification-code"><span>{tr ? "10 dakika geçerli" : "Valid for 10 minutes"}</span><strong>{code}</strong><code>/verify kod:{code}</code></div>}
      {error && <p className="account-form-error">{error}</p>}
    </div>
  );
}
