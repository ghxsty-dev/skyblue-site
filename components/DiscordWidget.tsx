"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";

interface DiscordData {
  name: string;
  icon: string | null;
  memberCount: number;
  onlineCount: number;
  voiceCount: number;
  boostCount: number;
}

export default function DiscordWidget() {
  const { lang } = useApp();
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/discord-widget")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((d: DiscordData) => setData(d))
      .catch(() => setData({
        name: "SkyBlue",
        icon: null,
        memberCount: 0,
        onlineCount: 0,
        voiceCount: 0,
        boostCount: 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        { label: lang === "TR" ? "Toplam Üye" : "Total Members", value: data.memberCount, color: "text-[#59abfe]" },
        { label: lang === "TR" ? "Aktif Üye" : "Online", value: data.onlineCount, color: "text-green-400" },
        { label: lang === "TR" ? "Sesteki Üye" : "In Voice", value: data.voiceCount, color: "text-purple-400" },
        { label: "Boost", value: data.boostCount, color: "text-pink-400" },
      ]
    : [];

  return (
    <div className="flex justify-center">
      <div className="card w-full max-w-2xl overflow-hidden">
        <div className="flex items-center gap-5 p-6 pb-4">
          {loading ? (
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg2)] animate-pulse shrink-0" />
          ) : data?.icon ? (
            <img src={data.icon} alt={data.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white font-bold text-xl shrink-0">
              {data?.name?.charAt(0) ?? "S"}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[var(--text)] truncate">
              {loading ? <div className="w-32 h-6 bg-[var(--bg2)] rounded animate-pulse" /> : data?.name}
            </h3>
            <a
              href="https://discord.gg/DRnxEXCQU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#59abfe] hover:underline"
            >
              {lang === "TR" ? "Sunucuya Katıl →" : "Join Server →"}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pb-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg2)] rounded-xl p-3 text-center animate-pulse">
                  <div className="w-8 h-6 bg-[var(--border)] rounded mx-auto mb-1" />
                  <div className="w-16 h-3 bg-[var(--border)] rounded mx-auto" />
                </div>
              ))
            : stats.map((s) => (
                <div key={s.label} className="bg-[var(--bg2)] rounded-xl p-3 text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text2)] mt-0.5">{s.label}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
