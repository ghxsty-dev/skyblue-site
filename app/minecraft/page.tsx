"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

export default function MinecraftPage() {
  const { t, lang } = useApp();

  return (
    <div className="page-inner max-w-2xl mx-auto text-center">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              Minecraft
            </span>
          </h2>
          <p>{lang === "TR" ? "Minecraft sunucunuz için profesyonel hizmetler" : "Professional services for your Minecraft server"}</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="card p-12 flex flex-col items-center gap-6">
          <div className="text-6xl">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#59abfe" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <rect x="7" y="7" width="4" height="4" rx="1" />
              <rect x="13" y="7" width="4" height="4" rx="1" />
              <rect x="7" y="13" width="4" height="4" rx="1" />
              <rect x="13" y="13" width="4" height="4" rx="1" />
            </svg>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-bold">
            {lang === "TR" ? "ÇOK YAKINDA" : "COMING SOON"}
          </span>
          <p className="text-[var(--text2)] text-sm max-w-md leading-relaxed">
            {lang === "TR"
              ? "Minecraft sunucunuz için özel tasarımlar, plugin kurulumları, konfigürasyon ve daha fazlasını sunmak için hazırlanıyoruz. Yakında sizlerle!"
              : "We are preparing to offer custom designs, plugin setups, configuration, and more for your Minecraft server. Coming soon!"}
          </p>
          <Link
            href="https://discord.gg/DRnxEXCQU"
            target="_blank"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity no-underline" style={{ color: "#fff" }}
          >
            {lang === "TR" ? "Discord Sunucumuza Katıl" : "Join Our Discord"}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
