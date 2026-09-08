"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/context";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const OUTPUT_W = 1520;
const OUTPUT_H = 304;

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new window.Image();
  image.src = url;
  await image.decode();
  return image;
}

async function cropToWebp(imageUrl: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_W;
  canvas.height = OUTPUT_H;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_W, OUTPUT_H);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("WebP conversion failed"))), "image/webp", 0.85);
  });
}

interface BannerEditorProps {
  current: string | null;
  premium: boolean;
}

export default function BannerEditor({ current, premium }: BannerEditorProps) {
  const { lang } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const tr = lang === "TR";

  useEffect(() => {
    if (!source) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSource(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button, input, [tabindex]:not([tabindex='-1'])")].filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      URL.revokeObjectURL(source);
      previousFocus?.focus();
    };
  }, [source]);

  if (!premium) {
    return (
      <section className="account-name-style account-card">
        <div className="account-section-heading">
          <div><span>Premium</span><h2>{tr ? "Profil Bannerı" : "Profile Banner"}</h2></div>
          <span className="account-badge">Premium özel</span>
        </div>
        <p className="account-text-muted">
          {tr ? "Profil sayfana özel banner yüklemek sadece premium üyelere açık." : "Custom profile banners are for premium members only."}
        </p>
        <Link href="/account/premium?tool=minecraft-rank" className="account-primary-button">
          {tr ? "Premium üyesi ol" : "Become premium"}
        </Link>
      </section>
    );
  }

  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_SOURCE_BYTES) {
      setError(tr ? "JPG, PNG veya WebP dosyası seçin. Maksimum boyut 10 MB." : "Choose a JPG, PNG, or WebP file up to 10 MB.");
      return;
    }
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    setError("");
  }

  function close() {
    setSource(null);
    setError("");
  }

  async function upload() {
    if (!source || !area) return;
    setPending(true);
    setError("");
    try {
      const blob = await cropToWebp(source, area);
      if (blob.size > MAX_SOURCE_BYTES) throw new Error("TOO_LARGE");
      const form = new FormData();
      form.append("banner", new File([blob], "banner.webp", { type: "image/webp" }));
      const response = await fetch("/api/account/banner", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (response.status === 403) throw new Error("PREMIUM_REQUIRED");
      if (!response.ok) throw new Error(result.error || "UPLOAD_FAILED");
      close();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error && error.message === "PREMIUM_REQUIRED"
          ? (tr ? "Yüklemek için aktif premium gerekli." : "Active premium is required.")
          : (tr ? "Banner yüklenemedi." : "Could not upload banner.")
      );
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!window.confirm(tr ? "Banner kaldırılsın mı?" : "Remove the banner?")) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/account/banner", { method: "DELETE" });
      if (!response.ok) throw new Error("DELETE_FAILED");
      router.refresh();
    } catch {
      setError(tr ? "Banner kaldırılamadı." : "Could not remove banner.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="account-name-style account-card">
      <div className="account-section-heading">
        <div><span>Premium</span><h2>{tr ? "Profil Bannerı" : "Profile Banner"}</h2></div>
        <span className="account-badge premium"><img src="/premium.webp" alt="" width={12} height={12} />{tr ? "Aktif" : "Active"}</span>
      </div>

      {current ? (
        <div className="account-banner-preview" style={{ backgroundImage: `url("${current}")` }} role="img" aria-label={tr ? "Mevcut banner" : "Current banner"} />
      ) : (
        <p className="account-text-muted">{tr ? "Henüz banner yok. Önerilen oran 5:1 (örn. 1520 × 304)." : "No banner yet. Suggested ratio 5:1 (e.g. 1520 × 304)."}</p>
      )}

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} hidden />
      <div className="account-name-actions">
        <button type="button" className="account-primary-button" onClick={() => fileInputRef.current?.click()}>
          {current ? (tr ? "Bannerı değiştir" : "Change banner") : (tr ? "Banner yükle" : "Upload banner")}
        </button>
        {current && (
          <button type="button" className="account-ghost-button" onClick={remove} disabled={pending}>
            {tr ? "Kaldır" : "Remove"}
          </button>
        )}
      </div>
      {error && !source && <p className="account-form-error" role="alert">{error}</p>}

      {source && (
        <div className="avatar-crop-backdrop" role="dialog" aria-modal="true" aria-labelledby="banner-crop-title">
          <div ref={dialogRef} className="avatar-crop-dialog avatar-crop-dialog-wide">
            <div className="avatar-crop-header">
              <div><h2 id="banner-crop-title">{tr ? "Bannerı kırp" : "Crop banner"}</h2><p>1520 × 304 WebP</p></div>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label={tr ? "Kapat" : "Close"}>×</button>
            </div>
            <div className="avatar-crop-area avatar-crop-area-wide">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={5 / 1}
                showGrid
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setArea(pixels)}
                onZoomChange={setZoom}
              />
            </div>
            <label className="avatar-zoom-control">
              <span>{tr ? "Yakınlaştır" : "Zoom"}</span>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>
            {error && <p className="account-form-error" role="alert">{error}</p>}
            <div className="avatar-crop-actions">
              <button type="button" className="account-secondary-button" onClick={close}>{tr ? "İptal" : "Cancel"}</button>
              <button type="button" className="account-primary-button" onClick={upload} disabled={pending || !area}>{pending ? (tr ? "Yükleniyor..." : "Uploading...") : (tr ? "Kaydet" : "Save")}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
