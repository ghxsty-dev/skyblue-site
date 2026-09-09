"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/context";

const DISCORD_INVITE = "https://discord.gg/F3uQ2fU8RV";

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  INVALID_EMAIL: { tr: "Geçerli bir e-posta adresi girin.", en: "Enter a valid email address." },
  INVALID_CODE: { tr: "Kod hatalı veya süresi dolmuş.", en: "The code is incorrect or expired." },
  WEAK_PASSWORD: { tr: "Yeni şifre en az 8 karakter, bir harf ve bir rakam içermeli.", en: "The new password must contain at least 8 characters, one letter, and one number." },
  PASSWORD_MISMATCH: { tr: "Yeni şifreler birbiriyle eşleşmiyor.", en: "The new passwords do not match." },
  RATE_LIMITED: { tr: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.", en: "Too many attempts. Please try again later." },
  SEND_FAILED: { tr: "Kod gönderilemedi. Lütfen tekrar deneyin.", en: "Could not send the code. Please try again." },
  UPDATE_FAILED: { tr: "Şifre sıfırlanamadı. Lütfen tekrar deneyin.", en: "Could not reset the password. Please try again." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
};

type Step = "email" | "code" | "support" | "done";

export default function ForgotPasswordForm() {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function apiError(code: string | undefined): string {
    const known = code ? ERROR_MESSAGES[code] : undefined;
    return known ? (tr ? known.tr : known.en) : (tr ? "Bir hata oluştu." : "Something went wrong.");
  }

  async function submitEmail(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(apiError(result.error));
        return;
      }
      if (result.method === "discord") {
        setDiscordUsername(result.discordUsername || "");
        setStep("code");
      } else {
        setStep("support");
      }
    } catch {
      setError(tr ? "Bağlantı kurulamadı." : "Could not connect.");
    } finally {
      setPending(false);
    }
  }

  async function submitReset(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError(tr ? ERROR_MESSAGES.PASSWORD_MISMATCH.tr : ERROR_MESSAGES.PASSWORD_MISMATCH.en);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(apiError(result.error));
        return;
      }
      setStep("done");
    } catch {
      setError(tr ? "Bağlantı kurulamadı." : "Could not connect.");
    } finally {
      setPending(false);
    }
  }

  if (step === "support") {
    return (
      <div>
        <p className="account-section-desc">
          {tr
            ? "Bu e-postaya bağlı bir Discord hesabı bulunamadı. Şifreni sıfırlamak için Discord sunucumuza katılıp bir destek talebi açman gerekiyor. Hesap sahipliğini doğruladıktan sonra yönetici şifreni sıfırlayacak."
            : "No linked Discord account was found for this email. To reset your password, join our Discord server and open a support ticket. An admin will reset your password after verifying ownership."}
        </p>
        <div className="account-danger-actions" style={{ marginTop: 12 }}>
          <a className="account-primary-button" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            {tr ? "Discord sunucusuna katıl" : "Join the Discord server"}
          </a>
          <button type="button" className="account-secondary-button" onClick={() => { setStep("email"); setError(""); }}>
            {tr ? "Geri dön" : "Go back"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div>
        <p className="account-form-success" role="status">
          {tr ? "Şifren sıfırlandı. Yeni şifrenle giriş yapabilirsin." : "Your password was reset. You can sign in with your new password."}
        </p>
        <div style={{ marginTop: 12 }}>
          <Link href="/login" className="account-primary-button" style={{ textDecoration: "none" }}>
            {tr ? "Giriş yap" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form className="account-form" onSubmit={submitReset}>
        <p className="account-section-desc" role="status">
          {tr
            ? `Discord ${discordUsername ? `@${discordUsername} ` : ""}hesabına 15 dakika geçerli bir kod gönderildi.`
            : `A code valid for 15 minutes was sent to your Discord ${discordUsername ? `@${discordUsername} ` : ""}account.`}
        </p>
        <label>
          <span>{tr ? "Sıfırlama kodu" : "Reset code"}</span>
          <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="XXXXXXXX" required autoComplete="one-time-code" />
        </label>
        <label>
          <span>{tr ? "Yeni şifre" : "New password"}</span>
          <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <label>
          <span>{tr ? "Yeni şifre (tekrar)" : "New password (again)"}</span>
          <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
        </label>
        {error && <p className="account-form-error" role="alert">{error}</p>}
        <button type="submit" disabled={pending || !code.trim() || !password || !confirmPassword}>
          {pending ? (tr ? "Sıfırlanıyor..." : "Resetting...") : (tr ? "Şifreyi sıfırla" : "Reset password")}
        </button>
      </form>
    );
  }

  return (
    <form className="account-form" onSubmit={submitEmail}>
      <label>
        <span>{tr ? "E-posta" : "Email"}</span>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="mail@example.com" autoComplete="email" />
      </label>
      {error && <p className="account-form-error" role="alert">{error}</p>}
      <button type="submit" disabled={pending || !email.trim()}>
        {pending ? (tr ? "Gönderiliyor..." : "Sending...") : (tr ? "Devam et" : "Continue")}
      </button>
    </form>
  );
}
