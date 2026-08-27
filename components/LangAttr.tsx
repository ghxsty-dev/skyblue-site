"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/context";

export default function LangAttr() {
  const { lang } = useApp();
  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);
  return null;
}
