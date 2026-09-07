"use client";

import { useEffect, useState, useCallback } from "react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

const CATEGORIES = ["Tasarım", "Discord Bot", "Minecraft", "Paket Satışı", "Reklam", "Diğer"];

export default function TransactionsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "Tasarım",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/transactions"),
      ]);
      if (statsRes.status === 401 || txRes.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch {
      window.location.assign("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void fetchData(); }, 0);
    return () => window.clearTimeout(t);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ type: "income", amount: "", description: "", category: "Tasarım", date: new Date().toISOString().split("T")[0] });
        fetchData();
      } else {
        const err = await res.json();
        alert("Hata: " + (err.error || "Bilinmeyen hata"));
      }
    } catch (e) {
      alert("Bağlantı hatası: " + String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;
    await fetch("/api/admin/transactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

  if (loading) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <>
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card"><span>Toplam Gelir</span><strong style={{ color: "#22c55e" }}>{fmt(stats.totalIncome)}</strong></div>
          <div className="admin-stat-card"><span>Toplam Gider</span><strong style={{ color: "#ef4444" }}>{fmt(stats.totalExpense)}</strong></div>
          <div className="admin-stat-card"><span>Bakiye</span><strong style={{ color: "#59abfe" }}>{fmt(stats.balance)}</strong></div>
          <div className="admin-stat-card"><span>Bu Ay Gelir</span><strong style={{ color: "#22c55e" }}>{fmt(stats.monthlyIncome)}</strong></div>
          <div className="admin-stat-card"><span>Bu Ay Gider</span><strong style={{ color: "#ef4444" }}>{fmt(stats.monthlyExpense)}</strong></div>
          <div className="admin-stat-card"><span>Toplam İşlem</span><strong style={{ color: "#aa44ff" }}>{stats.transactionCount}</strong></div>
        </div>
      )}

      <div className="admin-section-header">
        <h2>İşlemler</h2>
        <button type="button" className="admin-btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "İptal" : "+ Yeni İşlem"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <label><span>Tür</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}>
              <option value="income">Gelir</option><option value="expense">Gider</option>
            </select></label>
            <label><span>Tutar (TL)</span><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required min="0" step="0.01" /></label>
            <label><span>Açıklama</span><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İşlem açıklaması" required /></label>
            <label><span>Kategori</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></label>
            <label><span>Tarih</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          </div>
          <button type="submit" disabled={submitting} className="admin-btn primary">{submitting ? "Kaydediliyor..." : "Kaydet"}</button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Tarih</th><th>Tür</th><th>Açıklama</th><th>Kategori</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>İşlem</th></tr></thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#8b949e" }}>Henüz işlem yok</td></tr>
            ) : transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString("tr-TR")}</td>
                <td><span className={`admin-badge ${tx.type === "income" ? "green" : "red"}`}>{tx.type === "income" ? "Gelir" : "Gider"}</span></td>
                <td>{tx.description}</td>
                <td>{tx.category}</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: tx.type === "income" ? "#22c55e" : "#ef4444" }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</td>
                <td style={{ textAlign: "center" }}><button type="button" className="admin-btn danger small" onClick={() => handleDelete(tx.id)}>Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
