"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";

declare global {
  interface Window {
    turnstile?: { render: (container: string | HTMLElement, options: Record<string, unknown>) => string; reset: (widgetId: string) => void; getResponse: (widgetId: string) => string | undefined };
  }
}

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
  CAPTCHA_FAILED: { tr: "Captcha doğrulanamadı. Lütfen tekrar deneyin.", en: "Captcha verification failed. Please try again." },
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !turnstileRef.current || turnstileWidgetRef.current) return;
    const tryRender = () => {
      if (!window.turnstile || !turnstileRef.current || turnstileWidgetRef.current) return;
      turnstileWidgetRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: () => {},
      });
    };
    if (window.turnstile) { tryRender(); return; }
    const interval = setInterval(() => { if (window.turnstile) { clearInterval(interval); tryRender(); } }, 200);
    return () => clearInterval(interval);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const turnstileToken = window.turnstile?.getResponse(turnstileWidgetRef.current || "") || "";
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
          turnstileToken,
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
    <div className="auth-split">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="auth-split-image">
        <Image src="/login.webp" alt="" fill priority className="auth-split-img" />
      </div>

      <div className="auth-split-form">
        <div className="account-auth-heading">
          <span>{mode === "register" ? (tr ? "Yeni hesap" : "New account") : (tr ? "Tekrar hoş geldin" : "Welcome back")}</span>
          <h1 id="auth-title">{mode === "register" ? (tr ? "Hesap oluştur" : "Create account") : (tr ? "Giriş yap" : "Sign in")}</h1>
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
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="account-captcha" />}
          {error && <p className="account-form-error" role="alert">{error}</p>}
          <button type="submit" disabled={pending}>
            {pending ? (tr ? "İşleniyor..." : "Processing...") : mode === "register" ? (tr ? "Hesap oluştur" : "Create account") : (tr ? "Giriş yap" : "Sign in")}
          </button>
        </form>

        <p className="account-auth-switch">
          {mode === "register" ? (tr ? "Zaten hesabın var mı?" : "Already have an account?") : (tr ? "Henüz hesabın yok mu?" : "Need an account?")} {" "}
          <Link href={mode === "register" ? "/login" : "/register"}>{mode === "register" ? (tr ? "Giriş yap" : "Sign in") : (tr ? "Kayıt ol" : "Register")}</Link>
        </p>
      </div>
    </div>
  );
}
