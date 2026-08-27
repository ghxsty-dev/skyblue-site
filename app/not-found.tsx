"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <Link href="/" className="block">
        <Image
          src="/hata.webp"
          alt="404"
          width={200}
          height={200}
          className="cursor-pointer hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <Link
        href="/"
        className="text-xl font-bold text-[var(--text)] hover:text-[#59abfe] transition-colors no-underline"
      >
        Ben neden buradayım?
      </Link>
    </div>
  );
}
