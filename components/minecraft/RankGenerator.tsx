"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MINECRAFT_FONTS } from "@/app/fonts";
import type { MinecraftFontId } from "@/app/fonts";
import FontSelector from "./FontSelector";
import ColorPicker from "./ColorPicker";
import ShapeSelector from "./ShapeSelector";
import DownloadButton from "./DownloadButton";

const CANVAS_W = 512;
const CANVAS_H = 128;

const TEXT_COLORS = [
  { id: "white", value: "#ffffff", label: "Beyaz" },
  { id: "yellow", value: "#ffd700", label: "Altın" },
  { id: "gold", value: "#ffaa00", label: "Sarı" },
  { id: "red", value: "#ff4444", label: "Kırmızı" },
  { id: "green", value: "#44ff44", label: "Yeşil" },
  { id: "cyan", value: "#00ffff", label: "Cyan" },
  { id: "purple", value: "#aa44ff", label: "Mor" },
  { id: "blue", value: "#59abfe", label: "Mavi" },
] as const;

const BG_COLORS = [
  { id: "black", value: "#000000", label: "Siyah" },
  { id: "dark-blue", value: "#0a1628", label: "Koyu Mavi" },
  { id: "dark-red", value: "#1a0a0a", label: "Koyu Kırmızı" },
  { id: "dark-green", value: "#0a1a0a", label: "Koyu Yeşil" },
  { id: "dark-purple", value: "#150a1a", label: "Koyu Mor" },
  { id: "navy", value: "#0d1b2a", label: "Lacivert" },
  { id: "charcoal", value: "#1a1a1a", label: "Kömür" },
  { id: "midnight", value: "#0f0f23", label: "Gece" },
] as const;

const SHAPES = ["rectangle", "shield", "rounded", "hexagon"] as const;
type Shape = (typeof SHAPES)[number];

interface RankGeneratorProps {
  lang?: "tr" | "en";
}

export default function RankGenerator({ lang = "tr" }: RankGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("VIP");
  const [fontId, setFontId] = useState<MinecraftFontId>("monocraft");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0a1628");
  const [shape, setShape] = useState<Shape>("rectangle");
  const [outline, setOutline] = useState(true);
  const [glow, setGlow] = useState(false);
  const [customTextColor, setCustomTextColor] = useState("");
  const [customBgColor, setCustomBgColor] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const activeTextColor = customTextColor || textColor;
  const activeBgColor = customBgColor || bgColor;

  // Load fonts for canvas use
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontPromises = MINECRAFT_FONTS.map(async (f) => {
          try {
            await document.fonts.load(`48px "${f.fontFamily}"`);
          } catch {
            // Font might not be loaded yet, try with CSS
          }
        });
        await Promise.allSettled(fontPromises);
        setFontsLoaded(true);
      } catch {
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  const getFontFamily = useCallback((id: MinecraftFontId): string => {
    const font = MINECRAFT_FONTS.find((f) => f.id === id);
    return font ? font.fontFamily : "Minecraft";
  }, []);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = activeBgColor;
    if (shape === "rectangle") {
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (shape === "rounded") {
      roundRect(ctx, 0, 0, CANVAS_W, CANVAS_H, 20);
      ctx.fill();
    } else if (shape === "shield") {
      drawShield(ctx, CANVAS_W, CANVAS_H, activeBgColor);
    } else if (shape === "hexagon") {
      drawHexagon(ctx, CANVAS_W, CANVAS_H, activeBgColor);
    }

    // Outline
    if (outline) {
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      if (shape === "rectangle") {
        ctx.strokeRect(1.5, 1.5, CANVAS_W - 3, CANVAS_H - 3);
      } else if (shape === "rounded") {
        roundRect(ctx, 1.5, 1.5, CANVAS_W - 3, CANVAS_H - 3, 20);
        ctx.stroke();
      } else if (shape === "shield") {
        drawShieldStroke(ctx, CANVAS_W, CANVAS_H);
      } else if (shape === "hexagon") {
        drawHexagonStroke(ctx, CANVAS_W, CANVAS_H);
      }
    }

    // Text glow
    if (glow) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = activeTextColor;
    }

    // Text
    ctx.fillStyle = activeTextColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const displayText = text || "VIP";
    const fontFamily = getFontFamily(fontId);
    let fontSize = 48;

    // Auto-size: shrink if text is too wide
    ctx.font = `${fontSize}px "${fontFamily}", monospace`;
    while (ctx.measureText(displayText).width > CANVAS_W - 60 && fontSize > 16) {
      fontSize -= 2;
      ctx.font = `${fontSize}px "${fontFamily}", monospace`;
    }

    ctx.fillText(displayText, CANVAS_W / 2, CANVAS_H / 2);
    ctx.shadowBlur = 0;
  }, [text, fontId, activeTextColor, activeBgColor, shape, outline, glow, getFontFamily]);

  useEffect(() => {
    if (fontsLoaded) {
      draw();
    }
  }, [draw, fontsLoaded]);

  const handleDownload = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rank-${text.toLowerCase().replace(/\s+/g, "-") || "rank"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [text]);

  return (
    <div className="rank-generator">
      <div className="rank-preview">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rank-canvas"
        />
        <DownloadButton onClick={handleDownload} lang={lang} />
      </div>

      <div className="rank-controls">
        <div className="rank-field">
          <label className="rank-label">
            {lang === "tr" ? "Rank Adı" : "Rank Name"}
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 20))}
            maxLength={20}
            placeholder={lang === "tr" ? "Örn: VIP, Admin, Owner" : "e.g. VIP, Admin, Owner"}
            className="rank-input"
          />
        </div>

        <FontSelector
          fonts={MINECRAFT_FONTS}
          selected={fontId}
          onChange={(id) => setFontId(id as MinecraftFontId)}
          lang={lang}
        />

        <ColorPicker
          colors={TEXT_COLORS}
          selected={textColor}
          customColor={customTextColor}
          onChange={setTextColor}
          onCustomChange={setCustomTextColor}
          label={lang === "tr" ? "Metin Rengi" : "Text Color"}
        />

        <ColorPicker
          colors={BG_COLORS}
          selected={bgColor}
          customColor={customBgColor}
          onChange={setBgColor}
          onCustomChange={setCustomBgColor}
          label={lang === "tr" ? "Arka Plan Rengi" : "Background Color"}
        />

        <ShapeSelector
          shapes={SHAPES}
          selected={shape}
          onChange={(s) => setShape(s as Shape)}
          lang={lang}
        />

        <div className="rank-toggles">
          <label className="rank-toggle">
            <input
              type="checkbox"
              checked={outline}
              onChange={(e) => setOutline(e.target.checked)}
            />
            <span>{lang === "tr" ? "Kenarlık" : "Outline"}</span>
          </label>
          <label className="rank-toggle">
            <input
              type="checkbox"
              checked={glow}
              onChange={(e) => setGlow(e.target.checked)}
            />
            <span>{lang === "tr" ? "Neon Glow" : "Neon Glow"}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawShield(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.08);
  ctx.lineTo(w * 0.95, h * 0.08);
  ctx.lineTo(w * 0.95, h * 0.55);
  ctx.quadraticCurveTo(w * 0.5, h * 1.05, w * 0.05, h * 0.55);
  ctx.closePath();
  ctx.fill();
}

function drawShieldStroke(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.08);
  ctx.lineTo(w * 0.95, h * 0.08);
  ctx.lineTo(w * 0.95, h * 0.55);
  ctx.quadraticCurveTo(w * 0.5, h * 1.05, w * 0.05, h * 0.55);
  ctx.closePath();
  ctx.stroke();
}

function drawHexagon(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.48;
  const ry = h * 0.48;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHexagonStroke(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.48;
  const ry = h * 0.48;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}
