"use client";

import { useEffect, useRef, useState } from "react";

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function hexToHsv(hex: string): Hsv | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Site içine gömülü renk seçici: doygunluk paneli + ton kaydırıcı + hex girişi. */
export default function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const initial = hexToHsv(value) ?? { h: 210, s: 1, v: 1 };
  const [hsv, setHsv] = useState<Hsv>(initial);
  const [hexInput, setHexInput] = useState(value.toLowerCase());
  const hsvRef = useRef<Hsv>(initial);
  const padRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const parsed = hexToHsv(value);
    if (parsed && value.toLowerCase() !== hsvToHex(hsvRef.current.h, hsvRef.current.s, hsvRef.current.v)) {
      hsvRef.current = parsed;
      setHsv(parsed);
      setHexInput(value.toLowerCase());
    }
  }, [value]);

  function emit(next: Hsv) {
    hsvRef.current = next;
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    setHexInput(hex);
    onChange(hex);
  }

  function padFromPointer(clientX: number, clientY: number) {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    emit({
      h: hsvRef.current.h,
      s: clamp((clientX - rect.left) / rect.width),
      v: clamp(1 - (clientY - rect.top) / rect.height),
    });
  }

  function commitHex(raw: string) {
    const parsed = hexToHsv(raw.startsWith("#") ? raw : `#${raw}`);
    if (parsed) {
      emit(parsed);
    } else {
      setHexInput(hsvToHex(hsvRef.current.h, hsvRef.current.s, hsvRef.current.v));
    }
  }

  return (
    <div className="account-color-picker">
      <div
        ref={padRef}
        className="account-sv-pad"
        style={{ backgroundColor: hsvToHex(hsv.h, 1, 1) }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          padFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => { if (dragging.current) padFromPointer(e.clientX, e.clientY); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        <span
          className="account-sv-thumb"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        onChange={(e) => emit({ ...hsvRef.current, h: Number(e.target.value) })}
        className="account-hue-slider"
        aria-label="Ton"
      />
      <div className="account-hex-row">
        <span className="account-hex-preview" style={{ backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }} aria-hidden="true" />
        <input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value.toLowerCase())}
          onBlur={(e) => commitHex(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-label="Hex renk kodu"
        />
      </div>
    </div>
  );
}
