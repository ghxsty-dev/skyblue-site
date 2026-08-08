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

function drawInvoice(items: InvoiceItem[], totalPrice: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const w = 600;
    const h = 220 + items.length * 70 + 160;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(null); return; }

    ctx.scale(scale, scale);

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#0f1729");
    grad.addColorStop(1, "#162040");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 20);
    ctx.fill();

    const px = 40;
    let y = 50;

    // Header - SkyBlue logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("SkyBlue", px, y);
    ctx.fillStyle = "rgba(147,205,242,0.6)";
    ctx.font = "14px sans-serif";
    ctx.fillText("Tasarım Hizmetleri", px, y + 22);

    // Invoice no
    const now = new Date();
    const invoiceNo = `SB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    ctx.fillStyle = "rgba(147,205,242,0.6)";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Sipariş No", w - px, y - 6);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(invoiceNo, w - px, y + 18);
    ctx.textAlign = "left";

    y += 56;

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 30;

    // Date & status
    const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    ctx.fillStyle = "rgba(147,205,242,0.5)";
    ctx.font = "12px sans-serif";
    ctx.fillText("Tarih", px, y);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${dateStr}  ${timeStr}`, px, y + 20);

    ctx.fillStyle = "rgba(147,205,242,0.5)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Durum", w - px, y);
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Beklemede", w - px, y + 20);
    ctx.textAlign = "left";

    y += 48;

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 30;

    // Section title
    ctx.fillStyle = "rgba(147,205,242,0.5)";
    ctx.font = "bold 11px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("SİPARİŞ DETAYI", px, y);

    y += 30;

    // Items
    items.forEach((item, i) => {
      // Item name
      ctx.fillStyle = "#ffffff";
      ctx.font = "15px sans-serif";
      ctx.fillText(item.title, px, y);

      // Price right
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${item.price * item.qty} TL`, w - px, y);
      ctx.textAlign = "left";

      // Sub detail
      ctx.fillStyle = "rgba(147,205,242,0.5)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`x${item.qty}  ×  ${item.price} TL`, px, y + 18);

      y += 44;

      // Subtle separator
      if (i < items.length - 1) {
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, y - 10);
        ctx.lineTo(w - px, y - 10);
        ctx.stroke();
      }
    });

    y += 16;

    // Total divider
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 36;

    // Total
    ctx.fillStyle = "rgba(147,205,242,0.7)";
    ctx.font = "15px sans-serif";
    ctx.fillText("Toplam", px, y);

    ctx.fillStyle = "#59abfe";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${totalPrice} TL`, w - px, y + 4);
    ctx.textAlign = "left";

    y += 48;

    // Footer divider
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(w - px, y);
    ctx.stroke();

    y += 24;

    // Footer note
    ctx.fillStyle = "rgba(147,205,242,0.35)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Bu görseli Discord'a yapıştırarak sipariş verebilirsiniz.", w / 2, y);

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
      <div className="bg-[#1a1f2e] rounded-2xl border border-[var(--border)] max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--text)]">Sipariş Özeti</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[var(--bg2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] cursor-pointer border-none transition-colors">✕</button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #0f1729 0%, #162040 100%)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">SkyBlue</h2>
                <p className="text-[10px] text-blue-300/60">Tasarım Hizmetleri</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-300/60">Sipariş No</p>
                <p className="text-xs font-bold text-white">{invoiceNo}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <p className="text-[9px] text-blue-300/50">Tarih</p>
                <p className="text-[11px] text-white/80">{dateStr} {timeStr}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-blue-300/50">Durum</p>
                <p className="text-[11px] text-green-400 font-medium">Beklemede</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[9px] text-blue-300/50 mb-2 uppercase tracking-wider">Sipariş Detayı</p>
              <div className="flex flex-col gap-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex-1">
                      <p className="text-[11px] text-white font-medium">{item.title}</p>
                      <p className="text-[9px] text-blue-300/50">x{item.qty} × {item.price} TL</p>
                    </div>
                    <p className="text-[11px] text-white font-bold">{item.price * item.qty} TL</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-300/60 font-medium">Toplam</p>
                <p className="text-xl font-extrabold bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">{totalPrice} TL</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <p className="text-[9px] text-blue-300/40">Bu görseli Discord&apos;a yapıştırarak sipariş verebilirsiniz.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
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
