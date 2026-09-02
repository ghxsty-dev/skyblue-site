"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const router = useRouter();

  const handleCapsLock = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState("CapsLock"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Giriş başarısız");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0d10",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "40px 32px",
          borderRadius: "16px",
          border: "1px solid #1c2128",
          background: "#080a0d",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/logo.webp"
            alt="SkyBlue"
            width={64}
            height={64}
            style={{
              borderRadius: "50%",
              margin: "0 auto 16px",
              display: "block",
              objectFit: "cover",
            }}
          />
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#e6edf3", margin: 0 }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#8b949e", margin: "6px 0 0" }}>
            SkyBlue Yönetim Paneli
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#8b949e",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleCapsLock}
              onKeyUp={handleCapsLock}
              placeholder="••••••••"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "2px solid #1c2128",
                background: "#0b0d10",
                color: "#e6edf3",
                fontSize: "1rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#59abfe")}
              onBlur={(e) => (e.target.style.borderColor = "#1c2128")}
            />
            {capsLock && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.75rem",
                  color: "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
                Caps Lock açık
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
                fontSize: "0.85rem",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: loading || !password ? "#1c2128" : "linear-gradient(135deg, #97cdf2, #59abfe)",
              color: loading || !password ? "#8b949e" : "#fff",
              fontSize: "0.95rem",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "all 0.3s",
            }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
