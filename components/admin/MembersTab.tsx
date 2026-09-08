"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLE_LABELS, type UserRole } from "@/lib/account/types";

interface Member {
  id: string;
  username: string;
  avatar_path: string | null;
  role: UserRole;
  banned: boolean;
  signup_ip: string | null;
  created_at: string;
  discord_username: string | null;
  premium_expires_at: string | null;
}

const ROLE_OPTIONS: UserRole[] = ["user", "rehber", "moderator", "k-gelirtici", "gelirtici", "bas-gelirtici", "kurucu"];

const PREMIUM_DURATIONS = [
  { label: "1 ay", value: 1 },
  { label: "3 ay", value: 3 },
  { label: "1 yıl", value: 12 },
];

export default function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [premiumUserId, setPremiumUserId] = useState<string | null>(null);
  const [premiumDuration, setPremiumDuration] = useState(1);

  const loadMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/members", { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMembers(result.members || []);
    } catch {
      setError("Üye listesi yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadMembers(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadMembers]);

  async function changeRole(userId: string, role: UserRole) {
    setActionPending(userId);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "role", role }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role } : m));
    } catch {
      setError("Rol güncellenemedi.");
    } finally {
      setActionPending(null);
    }
  }

  async function toggleBan(userId: string, banned: boolean) {
    setActionPending(userId);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "ban", banned }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, banned } : m));
    } catch {
      setError("Ban durumu güncellenemedi.");
    } finally {
      setActionPending(null);
    }
  }

  async function addPremium(userId: string) {
    setActionPending(userId);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "premium", toolSlug: "minecraft-rank", durationMonths: premiumDuration }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      const result = await response.json();
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, premium_expires_at: result.expires_at } : m));
      setPremiumUserId(null);
    } catch {
      setError("Premium tanımlanamadı.");
    } finally {
      setActionPending(null);
    }
  }

  const filtered = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.role.includes(search.toLowerCase()) ||
    m.discord_username?.toLowerCase().includes(search.toLowerCase()) ||
    m.signup_ip?.includes(search)
  );

  const roleBadgeClass = (role: UserRole) => {
    if (role === "kurucu") return "admin-badge red";
    if (role === "bas-gelirtici" || role === "gelirtici" || role === "k-gelirtici") return "admin-badge purple";
    if (role === "moderator") return "admin-badge blue";
    if (role === "rehber") return "admin-badge green";
    return "admin-badge";
  };

  return (
    <>
      <div className="admin-section-header">
        <h2>Üye Listesi</h2>
        <span className="admin-hint">{members.length} üye</span>
      </div>

      <input
        type="text"
        placeholder="Kullanıcı adı, rol, IP veya Discord ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="admin-search"
      />

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rol</th>
              <th>Premium</th>
              <th>Discord</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <>
                <tr key={member.id} className={member.banned ? "admin-row-banned" : ""}>
                  <td>
                    <div className="admin-member-cell">
                      {member.avatar_path ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${member.avatar_path}`}
                          alt=""
                          width={28}
                          height={28}
                          className="admin-member-avatar"
                        />
                      ) : (
                        <div className="admin-member-avatar admin-member-avatar-placeholder">{member.username[0]?.toUpperCase()}</div>
                      )}
                      <div>
                        <span className="admin-member-name">@{member.username}</span>
                        <span className="admin-member-ip">{member.signup_ip || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member.id, e.target.value as UserRole)}
                      disabled={actionPending === member.id}
                      className="admin-role-select"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {member.premium_expires_at ? (
                      <span className="admin-badge purple">
                        {new Date(member.premium_expires_at) > new Date()
                          ? `Aktif · ${new Date(member.premium_expires_at).toLocaleDateString("tr-TR")}`
                          : "Süresi dolmuş"}
                      </span>
                    ) : (
                      <span className="admin-badge">Yok</span>
                    )}
                  </td>
                  <td>
                    {member.discord_username ? (
                      <span className="admin-badge blue">@{member.discord_username}</span>
                    ) : (
                      <span className="admin-badge">Bağlı değil</span>
                    )}
                  </td>
                  <td>
                    {member.banned ? (
                      <span className="admin-badge red">Banlı</span>
                    ) : (
                      <span className="admin-badge green">Aktif</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        type="button"
                        className="admin-btn small"
                        onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                      >
                        {expandedId === member.id ? "Kapat" : "Aksiyon"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === member.id && (
                  <tr key={`${member.id}-actions`} className="admin-expanded-row">
                    <td colSpan={6}>
                      <div className="admin-expanded-content">
                        <div className="admin-expanded-info">
                          <span>Katılım: {new Date(member.created_at).toLocaleDateString("tr-TR")}</span>
                          <span>IP: {member.signup_ip || "—"}</span>
                          <span>Rol: {ROLE_LABELS[member.role]}</span>
                        </div>
                        <div className="admin-expanded-actions">
                          <div className="admin-premium-assign">
                            <select
                              value={premiumDuration}
                              onChange={(e) => setPremiumDuration(Number(e.target.value))}
                              className="admin-role-select"
                            >
                              {PREMIUM_DURATIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="admin-btn primary small"
                              disabled={actionPending === member.id}
                              onClick={() => addPremium(member.id)}
                            >
                              Premium Ekle
                            </button>
                          </div>
                          <button
                            type="button"
                            className={`admin-btn small ${member.banned ? "primary" : "danger"}`}
                            disabled={actionPending === member.id}
                            onClick={() => toggleBan(member.id, !member.banned)}
                          >
                            {member.banned ? "Banı Kaldır" : "Banla"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">Üye bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
