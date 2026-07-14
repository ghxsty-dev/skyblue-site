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
  showLangModal: boolean;
  dismissModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN");
  const [theme, setTheme] = useState<Theme>("dark");
  const [showLangModal, setShowLangModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("skyblue-lang") as Lang | null;
    const savedTheme = localStorage.getItem("skyblue-theme") as Theme | null;

    if (savedLang) {
      setLangState(savedLang);
    } else {
      setLangState("EN");
      setShowLangModal(true);
    }

    if (savedTheme) setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("skyblue-lang", l);
    setShowLangModal(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("skyblue-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const dismissModal = useCallback(() => {
    setShowLangModal(false);
  }, []);

  const t = lang === "TR" ? TR : EN;

  return (
    <AppContext.Provider value={{ lang: lang || "EN", theme, t, setLang, toggleTheme, showLangModal, dismissModal }}>
      {children}
    </AppContext.Provider>
  );
}
