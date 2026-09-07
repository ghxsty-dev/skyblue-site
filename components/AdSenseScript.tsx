"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function AdSenseScript() {
  const pathname = usePathname();
  const blocked = ["/account", "/login", "/register", "/users", "/admin"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (blocked) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7679661881079802"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
