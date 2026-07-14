"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--bg)]">
      <Image src="/logo.png" alt="SkyBlue" width={80} height={80} className="rounded-2xl mb-6" priority />
      <div className="w-8 h-8 border-2 border-[#59abfe] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
