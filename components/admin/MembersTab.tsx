"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLE_LABELS, type UserRole } from "@/lib/account/types";

interface Member {
  id: string;
  username: string;
  avatar_path: string | null;
  role: UserRole;
  created_at: string;
}

const ROLE_OPTIONS: UserRole[] = ["user", "rehber", "moderator", "admin"];

export default function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    setUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role } : m));
    } catch {
      setError("Rol güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()) || m.role.includes(search.toLowerCase())
  );

  const roleBadgeClass = (role: UserRole) => {
    if (role === "admin") return "admin-badge red";
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
        placeholder="Kullanıcı adı veya rol ara..."
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
              <th>Katılım</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id}>
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
                    <span>@{member.username}</span>
                  </div>
                </td>
                <td><span className={roleBadgeClass(member.role)}>{ROLE_LABELS[member.role]}</span></td>
                <td>{new Date(member.created_at).toLocaleDateString("tr-TR")}</td>
                <td>
                  <select
                    value={member.role}
                    onChange={(e) => changeRole(member.id, e.target.value as UserRole)}
                    disabled={updatingId === member.id}
                    className="admin-role-select"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">Üye bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
