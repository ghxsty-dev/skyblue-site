"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import Reveal from "@/components/Reveal";

interface Service {
  name: string;
  key: string;
  status: "checking" | "up" | "down";
  latency: number | null;
  detail?: string;
}

export default function StatusPage() {
  const { lang } = useApp();
  const [services, setServices] = useState<Service[]>([
    { name: lang === "TR" ? "Discord Bot" : "Discord Bot", key: "discord", status: "checking", latency: null },
    { name: lang === "TR" ? "Tasarım API" : "Designs API", key: "designs", status: "checking", latency: null },
    { name: lang === "TR" ? "Yorum API" : "Reviews API", key: "reviews", status: "checking", latency: null },
  ]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const check = () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: "checking" as const, latency: null })));

    const start = Date.now();
    fetch("/api/designs")
      .then((r) => r.json())
      .then((d) => {
        setServices((prev) =>
          prev.map((s) =>
            s.key === "designs"
              ? { ...s, status: d.designs ? "up" as const : "down" as const, latency: Date.now() - start, detail: `${d.designs?.length ?? 0} tasarım` }
              : s
          )
        );
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) => (s.key === "designs" ? { ...s, status: "down" as const, latency: null } : s))
        );
      });

    const start2 = Date.now();
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        setServices((prev) =>
          prev.map((s) =>
            s.key === "reviews"
              ? { ...s, status: d.reviews ? "up" as const : "down" as const, latency: Date.now() - start2, detail: `${d.reviews?.length ?? 0} yorum` }
              : s
          )
        );
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) => (s.key === "reviews" ? { ...s, status: "down" as const, latency: null } : s))
        );
      });

    const start3 = Date.now();
    fetch("/sw.js")
      .then((r) => {
        setServices((prev) =>
          prev.map((s) =>
            s.key === "discord"
              ? { ...s, status: r.ok ? "up" as const : "down" as const, latency: Date.now() - start3 }
              : s
          )
        );
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) => (s.key === "discord" ? { ...s, status: "down" as const, latency: null } : s))
        );
      });

    setLastCheck(new Date());
  };

  useEffect(() => {
    check();
  }, [lang]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "up": return "●";
      case "down": return "●";
      case "checking": return "◌";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "up": return "#22c55e";
      case "down": return "#ef4444";
      case "checking": return "#6b7280";
    }
  };

  return (
    <div className="page-inner max-w-2xl mx-auto">
      <Reveal>
        <div className="section-header">
          <h2>
            <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
              {lang === "TR" ? "Sistem Durumu" : "System Status"}
            </span>
          </h2>
          <p>{lang === "TR" ? "Tüm servislerin anlık durumu" : "Real-time status of all services"}</p>
        </div>
      </Reveal>

      <div className="flex flex-col gap-3">
        {services.map((svc, i) => (
          <Reveal key={svc.key} delay={i * 40}>
            <div className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" style={{ color: statusColor(svc.status) }}>
                  {statusIcon(svc.status)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{svc.name}</p>
                  {svc.detail && (
                    <p className="text-[11px] text-[var(--text2)] mt-0.5">{svc.detail}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium" style={{ color: statusColor(svc.status) }}>
                  {svc.status === "up"
                    ? lang === "TR" ? "Çevrimiçi" : "Online"
                    : svc.status === "down"
                    ? lang === "TR" ? "Çevrimdışı" : "Offline"
                    : lang === "TR" ? "Kontrol ediliyor..." : "Checking..."}
                </p>
                {svc.latency !== null && (
                  <p className="text-[10px] text-[var(--text2)] mt-0.5">{svc.latency}ms</p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="flex flex-col items-center gap-3 mt-8">
          <button
            onClick={check}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            {lang === "TR" ? "Yenile" : "Refresh"}
          </button>
          {lastCheck && (
            <p className="text-[11px] text-[var(--text2)]">
              {lang === "TR" ? "Son kontrol: " : "Last checked: "}
              {lastCheck.toLocaleTimeString(lang === "TR" ? "tr-TR" : "en-US")}
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
