"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardTab from "./DashboardTab";
import TransactionsTab from "./TransactionsTab";
import PremiumCodesTab from "./PremiumCodesTab";
import MembersTab from "./MembersTab";
import DesignProductsTab from "./DesignProductsTab";
import DiscountsTab from "./DiscountsTab";

type Tab = "anasayfa" | "gelir-gider" | "premium-kod" | "uyeler" | "urunler" | "indirimler";

const TABS: { id: Tab; label: string }[] = [
  { id: "anasayfa", label: "Ana Sayfa" },
  { id: "gelir-gider", label: "Gelir / Gider" },
  { id: "premium-kod", label: "Premium Kodlar" },
  { id: "uyeler", label: "Üyeler" },
  { id: "urunler", label: "Ürünler" },
  { id: "indirimler", label: "İndirimler" },
];

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("anasayfa");

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
          <Link href="/" className="admin-sidebar-link">
            Siteye Dön
          </Link>
          <button type="button" onClick={handleLogout} className="admin-sidebar-link logout">
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "anasayfa" && <DashboardTab />}
        {tab === "gelir-gider" && <TransactionsTab />}
        {tab === "premium-kod" && <PremiumCodesTab />}
        {tab === "uyeler" && <MembersTab />}
        {tab === "urunler" && <DesignProductsTab />}
        {tab === "indirimler" && <DiscountsTab />}
      </main>
    </div>
  );
}
