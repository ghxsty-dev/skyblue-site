"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import Image from "next/image";

interface DiscordData {
  name: string;
  icon: string | null;
  memberCount: number;
  onlineCount: number;
  boostCount: number;
}

export default function DiscordWidget() {
  const { lang } = useApp();
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/discord-widget")
      .then((res) => res.json())
      .then((d: DiscordData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        { label: lang === "TR" ? "Aktif Üye" : "Online", value: data.onlineCount, color: "text-green-400" },
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
            <Image src={data.icon} alt={data.name} width={64} height={64} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white font-bold text-xl shrink-0">
              S
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[var(--text)] truncate">
              {loading ? <div className="w-32 h-6 bg-[var(--bg2)] rounded animate-pulse" /> : data?.name}
            </h3>
            <a
              href="https://discord.gg/F3uQ2fU8RV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#59abfe] hover:underline"
            >
              {lang === "TR" ? "Sunucuya Katıl →" : "Join Server →"}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg2)] rounded-xl p-4 text-center animate-pulse">
                  <div className="w-10 h-8 bg-[var(--border)] rounded mx-auto mb-1" />
                  <div className="w-20 h-3 bg-[var(--border)] rounded mx-auto" />
                </div>
              ))
            : stats.map((s) => (
                <div key={s.label} className="bg-[var(--bg2)] rounded-xl p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</div>
                  <div className="text-xs text-[var(--text2)] mt-1">{s.label}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
