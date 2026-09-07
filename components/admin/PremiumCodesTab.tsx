"use client";

import { useCallback, useEffect, useState } from "react";

interface CodeRecord {
  id: string;
  code_prefix: string;
  tool_slug: string;
  duration_months: number;
  redeemed_by: string | null;
  redeemed_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export default function PremiumCodesTab() {
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [generated, setGenerated] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const loadCodes = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/premium-codes", { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCodes(result.codes || []);
    } catch {
      setError("Kod listesi yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadCodes(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadCodes]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    setGenerated([]);
    try {
      const response = await fetch("/api/admin/premium-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: "minecraft-rank", durationMonths: duration, quantity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setGenerated(result.codes || []);
      await loadCodes();
    } catch {
      setError("Kodlar üretilemedi.");
    } finally {
      setPending(false);
    }
  }

  async function revoke(id: string) {
    await fetch("/api/admin/premium-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadCodes();
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>Premium Kodlar</h2>
      </div>

      <form onSubmit={generate} className="admin-form">
        <div className="admin-form-grid">
          <label><span>Tool</span><select disabled><option>Minecraft Rank Generator</option></select></label>
          <label><span>Süre</span><select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={1}>1 ay</option><option value={3}>3 ay</option><option value={12}>1 yıl</option>
          </select></label>
          <label><span>Adet</span><input type="number" min={1} max={25} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label>
        </div>
        <button type="submit" disabled={pending} className="admin-btn primary">{pending ? "Üretiliyor..." : "Kod oluştur"}</button>
      </form>

      {error && <p className="admin-error">{error}</p>}

      {generated.length > 0 && (
        <div className="admin-generated-codes">
          <div className="admin-section-header"><h3>Yeni Kodlar</h3><button type="button" className="admin-btn" onClick={() => navigator.clipboard.writeText(generated.join("\n"))}>Kopyala</button></div>
          <p className="admin-hint">Bu kodlar yalnızca şimdi gösterilir.</p>
          <pre>{generated.join("\n")}</pre>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Kod</th><th>Süre</th><th>Durum</th><th>Tarih</th><th /></tr></thead>
          <tbody>
            {codes.map((code) => {
              const status = code.revoked_at ? "İptal" : code.redeemed_at ? "Kullanıldı" : "Aktif";
              return (
                <tr key={code.id}>
                  <td>{code.code_prefix}••••</td>
                  <td>{code.duration_months === 12 ? "1 yıl" : `${code.duration_months} ay`}</td>
                  <td><span className={`admin-badge ${status === "Aktif" ? "green" : status === "Kullanıldı" ? "blue" : "red"}`}>{status}</span></td>
                  <td>{new Date(code.created_at).toLocaleDateString("tr-TR")}</td>
                  <td>{status === "Aktif" && <button type="button" className="admin-btn danger small" onClick={() => revoke(code.id)}>İptal</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
