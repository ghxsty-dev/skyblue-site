"use client";

import { useCallback, useEffect, useState } from "react";

interface Discount {
  id: string;
  category: string;
  percent: number;
  active: boolean;
  label_en: string | null;
  label_tr: string | null;
  updated_at: string;
}

const CATEGORIES = [
  { value: "design", label: "Tasarım", icon: "🎨" },
  { value: "minecraft", label: "Minecraft", icon: "⛏" },
  { value: "discord", label: "Discord Bot", icon: "💬" },
];

export default function DiscountsTab() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const loadDiscounts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/discounts", { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDiscounts(result.discounts || []);
    } catch {
      setError("İndirim listesi yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadDiscounts(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadDiscounts]);

  async function updateDiscount(id: string, field: string, value: unknown) {
    setPending(true);
    try {
      const response = await fetch("/api/admin/discounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setDiscounts((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
    } catch {
      setError("Güncellenemedi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>Kategori İndirimleri</h2>
        <span className="text-xs text-[var(--text2)]">Hizmet kategorilerine özel indirim yüzdesi ayarla</span>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-discount-grid">
        {discounts.map((discount) => {
          const cat = CATEGORIES.find((c) => c.value === discount.category);
          return (
            <div key={discount.id} className={`admin-discount-card ${discount.active ? "active" : ""}`}>
              <div className="admin-discount-header">
                <span className="admin-discount-icon">{cat?.icon}</span>
                <div>
                  <h3 className="admin-discount-title">{cat?.label || discount.category}</h3>
                  <p className="admin-discount-subtitle">İndirim Oranı</p>
                </div>
              </div>

              <div className="admin-discount-body">
                <label className="admin-field">
                  <span>Yüzde (%)</span>
                  <div className="admin-discount-input-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={discount.percent}
                      onChange={(e) => updateDiscount(discount.id, "percent", Number(e.target.value))}
                      className="admin-discount-slider"
                    />
                    <span className="admin-discount-value">%{discount.percent}</span>
                  </div>
                </label>

                <label className="admin-field">
                  <span>İndirim Etiketi (TR)</span>
                  <input
                    type="text"
                    className="admin-search"
                    placeholder="Örn: %20 İndirim"
                    value={discount.label_tr || ""}
                    onChange={(e) => updateDiscount(discount.id, "label_tr", e.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>İndirim Etiketi (EN)</span>
                  <input
                    type="text"
                    className="admin-search"
                    placeholder="E.g: 20% Off"
                    value={discount.label_en || ""}
                    onChange={(e) => updateDiscount(discount.id, "label_en", e.target.value)}
                  />
                </label>

                <div className="admin-discount-toggle-row">
                  <span className="text-xs text-[var(--text2)]">
                    {discount.active ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    type="button"
                    className={`admin-btn small ${discount.active ? "primary" : "danger"}`}
                    disabled={pending}
                    onClick={() => updateDiscount(discount.id, "active", !discount.active)}
                  >
                    {discount.active ? "Açık" : "Kapalı"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
