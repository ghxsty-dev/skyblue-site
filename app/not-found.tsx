"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/lib/context";

export default function NotFound() {
  const { lang } = useApp();

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <Link href="/" className="block">
        <Image
          src="/hata.webp"
          alt="404"
          width={200}
          height={200}
          className="cursor-pointer hover:scale-105 transition-transform duration-300 rounded-3xl"
        />
      </Link>
      <Link
        href="/"
        className="text-xl font-bold text-[var(--text2)] hover:text-[#59abfe] transition-colors no-underline"
      >
        {lang === "TR" ? "Ben neden buradayım?" : "Why am I here?"}
      </Link>
    </div>
  );
}
