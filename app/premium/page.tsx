"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

const DISCORD_URL = "https://discord.gg/F3uQ2fU8RV";

export default function PremiumPage() {
  const { lang } = useApp();
  const tr = lang === "TR";

  return (
    <div className="page-inner">
      <Reveal>
        <div className="premium-hero">
          <div className="premium-hero-image">
            <Image src="/premium.webp" alt="Premium" width={420} height={420} priority className="premium-hero-img" />
          </div>
          <div className="premium-hero-text">
            <h1>
              <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                Premium
              </span>
            </h1>
            <p>
              {tr
                ? "Özel isim stilleri, profil bannerı, sınırsız tool erişimi ve daha fazlası için premiuma geç."
                : "Go premium for custom name styles, profile banners, unlimited tool access, and more."}
            </p>
            <div className="premium-hero-actions">
              <Link href="/register" className="account-primary-button" style={{ textDecoration: "none" }}>
                {tr ? "Üye ol" : "Sign up"}
              </Link>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="account-secondary-button" style={{ textDecoration: "none" }}>
                Discord
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
