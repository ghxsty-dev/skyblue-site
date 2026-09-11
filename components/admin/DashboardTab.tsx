"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  username: string;
  role: string;
  banned: boolean;
  created_at: string;
  premium_expires_at: string | null;
  discord_username: string | null;
}

interface Tx {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

const MONTHS_BACK = 6;

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("tr-TR", { month: "short" }).replace(".", "");
}

function lastMonths(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return out;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/stats", { cache: "no-store" }).then((r) => {
        if (r.status === 401) window.location.assign("/login");
        return r.ok ? r.json() : null;
      }),
      fetch("/api/admin/members", { cache: "no-store" }).then((r) => {
        if (r.status === 401) window.location.assign("/login");
        return r.ok ? r.json() : null;
      }),
      fetch("/api/admin/transactions", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([s, m, t]) => {
        if (!active) return;
        if (s && !s.error) setStats(s);
        if (m?.members) setMembers(m.members);
        if (Array.isArray(t)) setTransactions(t);
        if ((!s || s.error) && !m?.members) setError("Veriler yüklenemedi.");
      })
      .catch(() => {
        if (active) setError("Veriler yüklenemedi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="admin-text-muted">Yükleniyor...</p>;
  if (error) return <p className="admin-error" role="alert">{error}</p>;

  // eslint-disable-next-line react-hooks/purity -- panel açılışındaki anlık özet için render zamanı yeterli
  const now = Date.now();
  const thisMonth = monthKey(new Date());
  const newThisMonth = members.filter((m) => monthKey(new Date(m.created_at)) === thisMonth).length;
  const premiumActive = members.filter((m) => m.premium_expires_at && new Date(m.premium_expires_at).getTime() > now).length;
  const discordLinked = members.filter((m) => m.discord_username).length;

  const months = lastMonths(MONTHS_BACK);
  const memberSeries = months.map((k) => ({
    key: k,
    label: monthLabel(k),
    value: members.filter((m) => monthKey(new Date(m.created_at)) === k).length,
  }));
  const financeSeries = months.map((k) => ({
    key: k,
    label: monthLabel(k),
    income: transactions.filter((t) => t.type === "income" && monthKey(new Date(t.date)) === k).reduce((s, t) => s + t.amount, 0),
    expense: transactions.filter((t) => t.type === "expense" && monthKey(new Date(t.date)) === k).reduce((s, t) => s + t.amount, 0),
  }));
  const maxMembers = Math.max(1, ...memberSeries.map((m) => m.value));
  const maxFinance = Math.max(1, ...financeSeries.flatMap((m) => [m.income, m.expense]));
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentTx = transactions.slice(0, 5);

  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card"><span>Toplam Üye</span><strong>{members.length}</strong></div>
        <div className="admin-stat-card"><span>Bu Ay Yeni Üye</span><strong>{newThisMonth}</strong></div>
        <div className="admin-stat-card"><span>Aktif Premium</span><strong>{premiumActive}</strong></div>
        <div className="admin-stat-card"><span>Net Bakiye</span><strong>{stats ? fmtMoney(stats.balance) : "—"}</strong></div>
        <div className="admin-stat-card"><span>Discord Bağlı</span><strong>{discordLinked}</strong></div>
        <div className="admin-stat-card"><span>Aylık Gelir / Gider</span><strong>{stats ? `${fmtMoney(stats.monthlyIncome)} / ${fmtMoney(stats.monthlyExpense)}` : "—"}</strong></div>
      </div>

      <div className="admin-dash-grid">
        <section className="admin-panel-box">
          <h3>Üye Kaydı · Son 6 Ay</h3>
          <div className="admin-bars">
            {memberSeries.map((m) => (
              <div key={m.key} className="admin-bar-col">
                <div className="admin-bar-track">
                  <div className="admin-bar is-blue" style={{ height: `${Math.max(m.value > 0 ? 6 : 0, (m.value / maxMembers) * 100)}%` }} title={`${m.value}`} />
                </div>
                <span className="admin-bar-value">{m.value}</span>
                <span className="admin-bar-label">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel-box">
          <h3>Gelir / Gider · Son 6 Ay</h3>
          <div className="admin-bars">
            {financeSeries.map((m) => (
              <div key={m.key} className="admin-bar-col">
                <div className="admin-bar-track is-double">
                  <div className="admin-bar is-green" style={{ height: `${Math.max(m.income > 0 ? 6 : 0, (m.income / maxFinance) * 100)}%` }} title={`Gelir: ${fmtMoney(m.income)}`} />
                  <div className="admin-bar is-red" style={{ height: `${Math.max(m.expense > 0 ? 6 : 0, (m.expense / maxFinance) * 100)}%` }} title={`Gider: ${fmtMoney(m.expense)}`} />
                </div>
                <span className="admin-bar-label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="admin-legend">
            <span><i className="is-green" /> Gelir</span>
            <span><i className="is-red" /> Gider</span>
          </div>
        </section>
      </div>

      <div className="admin-dash-grid">
        <section className="admin-panel-box">
          <h3>Son Üyeler</h3>
          {recentMembers.length === 0 ? (
            <p className="admin-text-muted">Henüz üye yok.</p>
          ) : (
            <ul className="admin-mini-list">
              {recentMembers.map((m) => (
                <li key={m.id}>
                  <strong>{m.username}</strong>
                  <span>{new Date(m.created_at).toLocaleDateString("tr-TR")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel-box">
          <h3>Son İşlemler</h3>
          {recentTx.length === 0 ? (
            <p className="admin-text-muted">Henüz işlem yok.</p>
          ) : (
            <ul className="admin-mini-list">
              {recentTx.map((t) => (
                <li key={t.id}>
                  <strong className={t.type === "income" ? "is-positive" : "is-negative"}>
                    {t.type === "income" ? "+" : "−"}{fmtMoney(t.amount)}
                  </strong>
                  <span>{t.description || t.category} · {new Date(t.date).toLocaleDateString("tr-TR")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
