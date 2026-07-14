"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

export default function NotFound() {
  const router = useRouter();
  const { lang } = useApp();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--bg)] z-50 gap-6">
      <button onClick={() => router.push("/")} className="cursor-pointer bg-none border-none p-0">
        <Image
          src="/hata.jpg"
          alt="404"
          width={200}
          height={200}
          className="w-full max-w-[200px] h-auto rounded-2xl"
          priority
        />
      </button>
      <p className="text-lg text-[var(--text2)] font-medium">
        {lang === "TR" ? "Ben burada ne yapıyorum?" : "What am I doing here?"}
      </p>
    </div>
  );
}
