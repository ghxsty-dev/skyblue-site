"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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

const CATEGORIES = [
  "Tasarım",
  "Discord Bot",
  "Minecraft",
  "Paket Satışı",
  "Reklam",
  "Diğer",
];

export default function AdminDashboard() {
  const router = useRouter();
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
        router.push("/admin/login");
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({
          type: "income",
          amount: "",
          description: "",
          category: "Tasarım",
          date: new Date().toISOString().split("T")[0],
        });
        fetchData();
      } else {
        const err = await res.json();
        alert("Hata: " + (err.error || err.details || "Bilinmeyen hata"));
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

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d10" }}>
        <div style={{ color: "#8b949e" }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d10", color: "#e6edf3" }}>
      {/* Header */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #1c2128",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(11,13,16,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo.webp"
            alt="SkyBlue"
            width={36}
            height={36}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h1 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: "0.7rem", color: "#8b949e", margin: 0 }}>SkyBlue Yönetim</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #1c2128",
            background: "transparent",
            color: "#8b949e",
            fontSize: "0.8rem",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Çıkış Yap
        </button>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>
        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard title="Toplam Gelir" value={formatAmount(stats.totalIncome)} color="#22c55e" />
            <StatCard title="Toplam Gider" value={formatAmount(stats.totalExpense)} color="#ef4444" />
            <StatCard title="Bakiye" value={formatAmount(stats.balance)} color="#59abfe" />
            <StatCard title="Bu Ay Gelir" value={formatAmount(stats.monthlyIncome)} color="#22c55e" />
            <StatCard title="Bu Ay Gider" value={formatAmount(stats.monthlyExpense)} color="#ef4444" />
            <StatCard title="Toplam İşlem" value={String(stats.transactionCount)} color="#aa44ff" />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #97cdf2, #59abfe)",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {showForm ? "İptal" : "+ Yeni İşlem"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #1c2128",
              background: "#080a0d",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tür</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}
                  style={inputStyle}
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tutar (TL)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Açıklama</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="İşlem açıklaması"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tarih</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "16px",
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                background: submitting ? "#1c2128" : "linear-gradient(135deg, #97cdf2, #59abfe)",
                color: submitting ? "#8b949e" : "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        )}

        {/* Transactions Table */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #1c2128",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#080a0d" }}>
                <th style={thStyle}>Tarih</th>
                <th style={thStyle}>Tür</th>
                <th style={thStyle}>Açıklama</th>
                <th style={thStyle}>Kategori</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tutar</th>
                <th style={{ ...thStyle, textAlign: "center" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#8b949e" }}>
                    Henüz işlem yok
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #1c2128" }}>
                    <td style={tdStyle}>{new Date(tx.date).toLocaleDateString("tr-TR")}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: tx.type === "income" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: tx.type === "income" ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {tx.type === "income" ? "Gelir" : "Gider"}
                      </span>
                    </td>
                    <td style={tdStyle}>{tx.description}</td>
                    <td style={tdStyle}>{tx.category}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        fontWeight: 600,
                        color: tx.type === "income" ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {tx.type === "income" ? "+" : "-"}{formatAmount(tx.amount)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "transparent",
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #1c2128",
        background: "#080a0d",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "#8b949e", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#8b949e",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #1c2128",
  background: "#0b0d10",
  color: "#e6edf3",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#8b949e",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "0.85rem",
};
