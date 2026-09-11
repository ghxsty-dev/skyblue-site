"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { TR, EN, type Lang } from "./translations";

type Theme = "dark" | "light";

interface AppContextType {
  lang: Lang;
  theme: Theme;
  t: typeof TR;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "EN";
  return (window.localStorage.getItem("skyblue-lang") as Lang | null) || "EN";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (window.localStorage.getItem("skyblue-theme") as Theme | null) || "dark";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
    <AppContext.Provider value={{ lang: lang || "EN", theme, t, setLang, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}
