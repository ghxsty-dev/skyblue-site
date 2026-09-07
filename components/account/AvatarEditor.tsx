"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/context";

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new window.Image();
  image.src = url;
  await image.decode();
  return image;
}

async function cropToWebp(imageUrl: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    512,
    512
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("WebP conversion failed")), "image/webp", 0.9);
  });
}

export default function AvatarEditor({ src, username }: { src: string; username: string }) {
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

  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_SOURCE_BYTES) {
      setError(tr ? "JPG, PNG veya WebP dosyası seçin. Maksimum boyut 2 MB." : "Choose a JPG, PNG, or WebP file up to 2 MB.");
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
      const form = new FormData();
      form.append("avatar", new File([blob], "avatar.webp", { type: "image/webp" }));
      const response = await fetch("/api/account/avatar", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "UPLOAD_FAILED");
      close();
      router.refresh();
    } catch {
      setError(tr ? "Profil fotoğrafı yüklenemedi." : "Could not upload profile photo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-avatar-editor">
      <Image src={src} alt={`${username} avatar`} width={128} height={128} unoptimized className="account-avatar-image" />
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} hidden />
      <button type="button" className="account-secondary-button" onClick={() => fileInputRef.current?.click()}>
        {tr ? "Fotoğrafı değiştir" : "Change photo"}
      </button>
      {error && !source && <p className="account-form-error" role="alert">{error}</p>}

      {source && (
        <div className="avatar-crop-backdrop" role="dialog" aria-modal="true" aria-labelledby="crop-title">
          <div ref={dialogRef} className="avatar-crop-dialog">
            <div className="avatar-crop-header">
              <div><h2 id="crop-title">{tr ? "Profil fotoğrafını kırp" : "Crop profile photo"}</h2><p>512 × 512 WebP</p></div>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label={tr ? "Kapat" : "Close"}>×</button>
            </div>
            <div className="avatar-crop-area">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
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
    </div>
  );
}
