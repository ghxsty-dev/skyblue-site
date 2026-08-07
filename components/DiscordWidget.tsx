"use client";

import { useState, useEffect } from "react";
import { MessageIcon } from "@/lib/icons";
import { useApp } from "@/lib/context";

interface GuildData {
  presence_count: number;
  member_count: number;
}

export default function DiscordWidget() {
  const { lang } = useApp();
  const [data, setData] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/discord-widget")
      .then((res) => res.json())
      .then((d: GuildData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="card flex flex-col sm:flex-row items-center gap-6 px-8 py-6 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] flex items-center justify-center text-white shrink-0">
          <MessageIcon size={28} />
        </div>
        <div className="text-center sm:text-left">
          <div className="text-3xl font-bold text-[var(--text)]">
            {loading ? (
              <div className="w-20 h-8 bg-[var(--bg2)] rounded animate-pulse" />
            ) : (
              <>
                {data?.presence_count ?? 0}
                <span className="text-sm font-normal text-[var(--text2)] ml-2">
                  {lang === "TR" ? "çevrimiçi" : "online"}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-[var(--text2)] mt-1">
            {lang === "TR" ? "şu an aktif" : "currently active"}
          </div>
        </div>
      </div>
      <a
        href="https://discord.gg/DRnxEXCQU"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        {lang === "TR" ? "Discord'a Katıl" : "Join Discord"}
      </a>
    </div>
  );
}
