"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { TR, EN, type Lang } from "./translations";

type Theme = "dark" | "light";

export interface MeUser {
  id: string;
  username: string;
  avatar_path: string | null;
  role: string;
  updated_at: string;
}

interface AppContextType {
  lang: Lang;
  theme: Theme;
  t: typeof TR;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  /** Girişli kullanıcı (tek istekle yüklenir, her yerde paylaşılır). */
  me: MeUser | null;
  /** Oturum durumu netleşti mi? */
  authChecked: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "TR";
  return (window.localStorage.getItem("skyblue-lang") as Lang | null) || "TR";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (window.localStorage.getItem("skyblue-theme") as Theme | null) || "dark";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [me, setMe] = useState<MeUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return;
        setMe(d?.user ?? null);
        setAuthChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setMe(null);
        setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("skyblue-lang", l);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("skyblue-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const t = lang === "TR" ? TR : EN;

  return (
    <AppContext.Provider value={{ lang: lang || "TR", theme, t, setLang, toggleTheme, me, authChecked }}>
      {children}
    </AppContext.Provider>
  );
}
