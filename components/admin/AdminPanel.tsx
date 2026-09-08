"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TransactionsTab from "./TransactionsTab";
import PremiumCodesTab from "./PremiumCodesTab";
import MembersTab from "./MembersTab";

type Tab = "gelir-gider" | "premium-kod" | "uyeler";

const TABS: { id: Tab; label: string }[] = [
  { id: "gelir-gider", label: "Gelir / Gider" },
  { id: "premium-kod", label: "Premium Kodlar" },
  { id: "uyeler", label: "Üyeler" },
];

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("gelir-gider");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Image src="/logo.webp" alt="SkyBlue" width={32} height={32} unoptimized className="admin-sidebar-logo" />
          <div>
            <strong>SkyBlue Kurucu Paneli</strong>
            <span>Yönetim</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`admin-sidebar-link ${tab === t.id ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-sidebar-link">
            Siteye Dön
          </a>
          <button type="button" onClick={handleLogout} className="admin-sidebar-link logout">
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "gelir-gider" && <TransactionsTab />}
        {tab === "premium-kod" && <PremiumCodesTab />}
        {tab === "uyeler" && <MembersTab />}
      </main>
    </div>
  );
}
