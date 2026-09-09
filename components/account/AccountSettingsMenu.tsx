"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";

export type AccountTab = "profil" | "premium" | "hesap";

const TABS: { id: AccountTab; tr: string; en: string }[] = [
  { id: "profil", tr: "Profil", en: "Profile" },
  { id: "premium", tr: "Premium", en: "Premium" },
  { id: "hesap", tr: "Hesap Ayarları", en: "Account Settings" },
];

export default function AccountSettingsMenu({ active }: { active: AccountTab }) {
  const { lang } = useApp();
  const tr = lang === "TR";
  return (
    <nav className="account-settings-menu" aria-label={tr ? "Hesap bölümleri" : "Account sections"}>
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/account?tab=${tab.id}`}
          aria-current={tab.id === active ? "page" : undefined}
          className={tab.id === active ? "is-active" : undefined}
        >
          {tr ? tab.tr : tab.en}
        </Link>
      ))}
    </nav>
  );
}
