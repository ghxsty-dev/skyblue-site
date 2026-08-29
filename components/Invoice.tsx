"use client";

import { useState } from "react";

interface InvoiceItem {
  title: string;
  qty: number;
  price: number;
}

interface InvoiceProps {
  items: InvoiceItem[];
  totalPrice: number;
  onClose: () => void;
}

const FONT = "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

function drawInvoice(items: InvoiceItem[], totalPrice: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const w = 600;
    const h = 200 + items.length * 56 + 120;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(null); return; }

    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 20);
    ctx.fill();

    // Top accent bar
    const accentGrad = ctx.createLinearGradient(0, 0, w, 0);
    accentGrad.addColorStop(0, "#97cdf2");
    accentGrad.addColorStop(1, "#59abfe");
    ctx.fillStyle = accentGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 6, [20, 20, 0, 0]);
    ctx.fill();

    const px = 40;
    let y = 48;

    // Header
    const headerGrad = ctx.createLinearGradient(px, 0, px + 120, 0);
    headerGrad.addColorStop(0, "#97cdf2");
    headerGrad.addColorStop(1, "#59abfe");
    ctx.fillStyle = headerGrad;
    ctx.font = `bold 32px ${FONT}`;
    ctx.fillText("SkyBlue", px, y);
    ctx.fillStyle = "#8b949e";
    ctx.font = `14px ${FONT}`;
    ctx.fillText("Tasar\u0131m Hizmetleri", px, y + 22);

    // Invoice no
    const now = new Date();
    const invoiceNo = `SB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    ctx.fillStyle = "#8b949e";
    ctx.font = `13px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("Sipari\u015f No", w - px, y - 6);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText(invoiceNo, w - px, y + 18);
    ctx.textAlign = "left";

    y += 52;

    // Divider
    ctx.strokeStyle = "#e0e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 26;

    // Date & status
    const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    ctx.fillStyle = "#8b949e";
    ctx.font = `12px ${FONT}`;
    ctx.fillText("Tarih", px, y);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = `14px ${FONT}`;
    ctx.fillText(`${dateStr}  ${timeStr}`, px, y + 18);

    ctx.fillStyle = "#8b949e";
    ctx.font = `12px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("Durum", w - px, y);
    ctx.fillStyle = "#22c55e";
    ctx.font = `bold 14px ${FONT}`;
    ctx.fillText("Beklemede", w - px, y + 18);
    ctx.textAlign = "left";

    y += 42;

    // Divider
    ctx.strokeStyle = "#e0e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 26;

    // Section title
    ctx.fillStyle = "#8b949e";
    ctx.font = `bold 11px ${FONT}`;
    ctx.fillText("S\u0130PAR\u0130\u015e DETAYI", px, y);

    y += 24;

    // Items
    items.forEach((item, i) => {
      ctx.fillStyle = "#1a1a2e";
      ctx.font = `14px ${FONT}`;
      ctx.fillText(item.title, px, y);

      ctx.fillStyle = "#1a1a2e";
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = "right";
      ctx.fillText(`${item.price * item.qty} TL`, w - px, y);
      ctx.textAlign = "left";

      ctx.fillStyle = "#8b949e";
      ctx.font = `11px ${FONT}`;
      ctx.fillText(`x${item.qty}  \u00d7  ${item.price} TL`, px, y + 16);

      y += 38;

      if (i < items.length - 1) {
        ctx.strokeStyle = "#f0f4f8";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, y - 8);
        ctx.lineTo(w - px, y - 8);
        ctx.stroke();
      }
    });

    y += 12;

    // Total divider
    ctx.strokeStyle = "#e0e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 30;

    // Total
    ctx.fillStyle = "#8b949e";
    ctx.font = `14px ${FONT}`;
    ctx.fillText("Toplam", px, y);

    const totalGrad = ctx.createLinearGradient(px, 0, px + 100, 0);
    totalGrad.addColorStop(0, "#97cdf2");
    totalGrad.addColorStop(1, "#59abfe");
    ctx.fillStyle = totalGrad;
    ctx.font = `bold 26px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(`${totalPrice} TL`, w - px, y + 4);
    ctx.textAlign = "left";

    y += 40;

    // Footer divider
    ctx.strokeStyle = "#f0f4f8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 22;

    // Footer note
    ctx.fillStyle = "#8b949e";
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("Bu g\u00f6rseli Discord'a yap\u0131\u015ft\u0131rarak sipari\u015f verebilirsiniz.", w / 2, y);

    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export default function Invoice({ items, totalPrice, onClose }: InvoiceProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      const blob = await drawInvoice(items, totalPrice);
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await drawInvoice(items, totalPrice);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "skyblue-siparis.png";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const invoiceNo = `SB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" style={{ animation: "fadeIn 0.2s ease" }}>
      <div className="rounded-2xl border border-[var(--border)] max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ background: "var(--card-bg)" }}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--text)]">Sipariş Özeti</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[var(--bg2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] cursor-pointer border-none transition-colors">✕</button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e0e8f0" }}>
            {/* Accent bar */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #97cdf2, #59abfe)" }} />

            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #97cdf2, #59abfe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkyBlue</h2>
                  <p className="text-[10px]" style={{ color: "#8b949e" }}>Tasarım Hizmetleri</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: "#8b949e" }}>Sipariş No</p>
                  <p className="text-xs font-bold" style={{ color: "#1a1a2e" }}>{invoiceNo}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid #e0e8f0" }}>
                <div>
                  <p className="text-[9px]" style={{ color: "#8b949e" }}>Tarih</p>
                  <p className="text-[11px]" style={{ color: "#1a1a2e" }}>{dateStr} {timeStr}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px]" style={{ color: "#8b949e" }}>Durum</p>
                  <p className="text-[11px] font-medium" style={{ color: "#22c55e" }}>Beklemede</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[9px] mb-2 uppercase tracking-wider" style={{ color: "#8b949e" }}>Sipariş Detayı</p>
                <div className="flex flex-col gap-1.5">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 last:border-0" style={{ borderBottom: i < items.length - 1 ? "1px solid #f0f4f8" : "none" }}>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium" style={{ color: "#1a1a2e" }}>{item.title}</p>
                        <p className="text-[9px]" style={{ color: "#8b949e" }}>x{item.qty} × {item.price} TL</p>
                      </div>
                      <p className="text-[11px] font-bold" style={{ color: "#1a1a2e" }}>{item.price * item.qty} TL</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e0e8f0" }} className="pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: "#8b949e" }}>Toplam</p>
                  <p className="text-xl font-extrabold" style={{ background: "linear-gradient(135deg, #97cdf2, #59abfe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{totalPrice} TL</p>
                </div>
              </div>

              <div className="mt-4 pt-3 text-center" style={{ borderTop: "1px solid #f0f4f8" }}>
                <p className="text-[9px]" style={{ color: "#8b949e" }}>Bu görseli Discord&apos;a yapıştırarak sipariş verebilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: "linear-gradient(135deg, #97cdf2, #59abfe)" }}
          >
            {copied ? "Kopyalandı!" : "Görseli Kopyala"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-[var(--text2)] text-sm font-medium hover:border-[#59abfe] hover:text-[#59abfe] transition-all cursor-pointer"
          >
            {downloading ? "..." : "İndir"}
          </button>
        </div>
      </div>
    </div>
  );
}
