"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/context";

const ERROR_MESSAGES: Record<string, { tr: string; en: string }> = {
  INVALID_USERNAME: { tr: "Kullanıcı adı 3-20 karakter olmalı; yalnızca küçük harf, rakam ve _ kullanılabilir.", en: "Username must be 3-20 characters and use only lowercase letters, numbers, and _." },
  INVALID_EMAIL: { tr: "Geçerli bir e-posta adresi girin.", en: "Enter a valid email address." },
  WEAK_PASSWORD: { tr: "Şifre en az 8 karakter, bir harf ve bir rakam içermeli.", en: "Password must contain at least 8 characters, one letter, and one number." },
  USERNAME_TAKEN: { tr: "Bu kullanıcı adı kullanılıyor.", en: "This username is already taken." },
  EMAIL_TAKEN: { tr: "Bu e-posta adresiyle bir hesap bulunuyor.", en: "An account already uses this email address." },
  IP_ACCOUNT_EXISTS: { tr: "Bu bağlantı üzerinden daha önce hesap oluşturulmuş.", en: "An account has already been created from this connection." },
  INVALID_CREDENTIALS: { tr: "E-posta veya şifre hatalı.", en: "Incorrect email or password." },
  AUTH_NOT_CONFIGURED: { tr: "Hesap sistemi henüz yapılandırılmadı.", en: "The account system is not configured yet." },
  CONFIRMATION_FAILED: { tr: "Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.", en: "Could not send the confirmation email. Please try again." },
  REGISTER_FAILED: { tr: "Hesap oluşturulamadı. Lütfen tekrar deneyin.", en: "The account could not be created. Please try again." },
  LOGIN_FAILED: { tr: "Giriş yapılamadı. Lütfen tekrar deneyin.", en: "Unable to sign in. Please try again." },
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [capsLock, setCapsLock] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const message = ERROR_MESSAGES[result.error];
        setError(message ? (tr ? message.tr : message.en) : (tr ? "Bir hata oluştu." : "Something went wrong."));
        return;
      }
      window.location.assign("/account");
    } catch {
      setError(tr ? "Bağlantı kurulamadı." : "Could not connect.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="account-auth-shell" aria-labelledby="auth-title">
      <div className="account-auth-brand" aria-hidden="true">SB</div>
      <div className="account-auth-heading">
        <span>{mode === "register" ? (tr ? "Yeni hesap" : "New account") : (tr ? "Tekrar hoş geldin" : "Welcome back")}</span>
        <h1 id="auth-title">{mode === "register" ? (tr ? "SkyBlue hesabı oluştur" : "Create a SkyBlue account") : (tr ? "Hesabına giriş yap" : "Sign in to your account")}</h1>
        <p>{mode === "register" ? (tr ? "Tool haklarını, premium kodlarını ve profilini tek yerden yönet." : "Manage tool access, premium codes, and your profile in one place.") : (tr ? "Tool haklarına ve hesabına devam et." : "Continue to your tools and account.")}</p>
      </div>

      <form className="account-form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            <span>{tr ? "Kullanıcı adı" : "Username"}</span>
            <input name="username" required minLength={3} maxLength={20} pattern="[a-z0-9_]+" autoComplete="username" placeholder="skyblue_user" />
            <small>{tr ? "Sonradan değiştirilemez." : "Cannot be changed later."}</small>
          </label>
        )}
        <label>
          <span>{tr ? "E-posta" : "Email"}</span>
          <input name="email" type="email" required autoComplete="email" placeholder="mail@example.com" />
        </label>
        <label>
          <span>{tr ? "Şifre" : "Password"}</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
            onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
          />
          {capsLock && <small className="account-form-warning">{tr ? "Caps Lock açık" : "Caps Lock is on"}</small>}
        </label>
        {error && <p className="account-form-error" role="alert">{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? (tr ? "İşleniyor..." : "Processing...") : mode === "register" ? (tr ? "Hesap oluştur" : "Create account") : (tr ? "Giriş yap" : "Sign in")}
        </button>
      </form>

      <p className="account-auth-switch">
        {mode === "register" ? (tr ? "Zaten hesabın var mı?" : "Already have an account?") : (tr ? "Henüz hesabın yok mu?" : "Need an account?")} {" "}
        <Link href={mode === "register" ? "/login" : "/register"}>{mode === "register" ? (tr ? "Giriş yap" : "Sign in") : (tr ? "Kayıt ol" : "Register")}</Link>
      </p>
    </section>
  );
}
