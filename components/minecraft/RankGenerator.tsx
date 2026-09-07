"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrushIcon } from "@/lib/icons";
import {
  buildPixelText,
  getPixelFont,
  normalizeRankText,
  PIXEL_FONTS,
  type PixelFont,
} from "./pixel-fonts";

const HEIGHT = 9;
const TEXT_TOP = 2;
const TEXT_HEIGHT = 5;
const PADDING_X = 3;
const DEFAULT_BACKGROUND = "#59abfe";
const PREVIEW_SCALE = 28;

const TEXT_COLORS = ["#ffffff", "#000000", "#ffd166", "#ff6b6b", "#68d391", "#c084fc", "#59abfe"];
const BACKGROUND_COLORS = ["#59abfe", "#97cdf2", "#0b0d10", "#1c2128", "#173c62", "#f1f4f7", "#7c3aed", "#ef4444"];

type Pixel = string | null;
type PixelGrid = Pixel[][];
type Tool = "brush" | "eraser";

interface RankGeneratorProps {
  lang?: "tr" | "en";
}

function createGrid(width: number, color: Pixel): PixelGrid {
  return Array.from({ length: HEIGHT }, () => Array.from({ length: width }, () => color));
}

function resizeGrid(grid: PixelGrid, width: number): PixelGrid {
  return Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: width }, (_, x) => grid[y]?.[x] ?? DEFAULT_BACKGROUND)
  );
}

function copyGrid(grid: PixelGrid): PixelGrid {
  return grid.map((row) => [...row]);
}

function getInitialWidth() {
  return buildPixelText(PIXEL_FONTS[0], "VIP").width + PADDING_X * 2;
}

export default function RankGenerator({ lang = "tr" }: RankGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const paintingRef = useRef(false);
  const backgroundRef = useRef<PixelGrid>(createGrid(getInitialWidth(), DEFAULT_BACKGROUND));
  const undoRef = useRef<PixelGrid[]>([]);
  const redoRef = useRef<PixelGrid[]>([]);
  const [text, setText] = useState("VIP");
  const [fontId, setFontId] = useState(PIXEL_FONTS[0].id);
  const [textColor, setTextColor] = useState("#ffffff");
  const [brushColor, setBrushColor] = useState("#0b0d10");
  const [customBrushColor, setCustomBrushColor] = useState("");
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(1);
  const [background, setBackground] = useState<PixelGrid>(() => createGrid(getInitialWidth(), DEFAULT_BACKGROUND));
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [previewScale, setPreviewScale] = useState(PREVIEW_SCALE);

  const font = getPixelFont(fontId);
  const layout = buildPixelText(font, text);
  const width = layout.width + PADDING_X * 2;
  const activeBrushColor = customBrushColor || brushColor;
  const isTurkish = lang === "tr";

  const copy = isTurkish
    ? {
        rankName: "Rank adı",
        rankPlaceholder: "VIP, MVP, Admin...",
        font: "Pixel font",
        textColor: "Yazı rengi",
        background: "Arka plan",
        brush: "Fırça",
        eraser: "Silgi",
        brushSize: "Fırça boyutu",
        fill: "Tümünü boya",
        undo: "Geri al",
        redo: "İleri al",
        reset: "Arka planı sıfırla",
        transparent: "Şeffaf",
        download: "PNG indir",
        dimensions: `${width} × ${HEIGHT} px PNG`,
        gridHint: "Grid üzerinde sadece arka planı boyayabilirsin.",
      }
    : {
        rankName: "Rank name",
        rankPlaceholder: "VIP, MVP, Admin...",
        font: "Pixel font",
        textColor: "Text color",
        background: "Background",
        brush: "Brush",
        eraser: "Eraser",
        brushSize: "Brush size",
        fill: "Fill all",
        undo: "Undo",
        redo: "Redo",
        reset: "Reset background",
        transparent: "Transparent",
        download: "Download PNG",
        dimensions: `${width} × ${HEIGHT} px PNG`,
        gridHint: "Only the background can be painted on the grid.",
      };

  useEffect(() => {
    const next = resizeGrid(backgroundRef.current, width);
    backgroundRef.current = next;
    setBackground(next);
    undoRef.current = [];
    redoRef.current = [];
    setHistoryState({ canUndo: false, canRedo: false });
  }, [width]);

  useEffect(() => {
    const element = stageWrapRef.current;
    if (!element) return;

    const updateScale = () => {
      const availableWidth = Math.max(1, element.clientWidth - 40);
      setPreviewScale(Math.min(PREVIEW_SCALE, availableWidth / width));
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    updateScale();
    return () => observer.disconnect();
  }, [width]);

  const commitGrid = useCallback((next: PixelGrid) => {
    undoRef.current = [...undoRef.current.slice(-19), copyGrid(backgroundRef.current)];
    redoRef.current = [];
    backgroundRef.current = next;
    setBackground(next);
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: false });
  }, []);

  const drawCanvas = useCallback((canvas: HTMLCanvasElement, showGrid: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = HEIGHT;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, HEIGHT);

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const color = background[y]?.[x];
        if (color === null || color === undefined) {
          if (showGrid) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#26313d" : "#1d252f";
            ctx.fillRect(x, y, 1, 1);
          }
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    ctx.fillStyle = textColor;
    for (let y = 0; y < TEXT_HEIGHT; y += 1) {
      for (let x = 0; x < layout.width; x += 1) {
        if (layout.rows[y]?.[x] === "1") ctx.fillRect(PADDING_X + x, TEXT_TOP + y, 1, 1);
      }
    }

    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 0.04;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
      }
      for (let y = 0; y <= HEIGHT; y += 1) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  }, [background, layout, textColor, width]);

  useEffect(() => {
    if (canvasRef.current) drawCanvas(canvasRef.current, true);
  }, [drawCanvas]);

  const cellFromPointer = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width - 1, Math.floor(((event.clientX - rect.left) / rect.width) * width))),
      y: Math.max(0, Math.min(HEIGHT - 1, Math.floor(((event.clientY - rect.top) / rect.height) * HEIGHT))),
    };
  }, [width]);

  const paintAt = useCallback((x: number, y: number) => {
    const next = copyGrid(backgroundRef.current);
    const value = tool === "eraser" ? null : activeBrushColor;
    const start = Math.floor(brushSize / 2);
    let changed = false;

    for (let dy = 0; dy < brushSize; dy += 1) {
      for (let dx = 0; dx < brushSize; dx += 1) {
        const targetX = x + dx - start;
        const targetY = y + dy - start;
        if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= HEIGHT) continue;
        if (next[targetY][targetX] !== value) {
          next[targetY][targetX] = value;
          changed = true;
        }
      }
    }

    if (changed) commitGrid(next);
  }, [activeBrushColor, brushSize, commitGrid, tool, width]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    paintingRef.current = true;
    const { x, y } = cellFromPointer(event);
    paintAt(x, y);
  }, [cellFromPointer, paintAt]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current) return;
    const { x, y } = cellFromPointer(event);
    paintAt(x, y);
  }, [cellFromPointer, paintAt]);

  const stopPainting = useCallback(() => {
    paintingRef.current = false;
  }, []);

  const undo = useCallback(() => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(copyGrid(backgroundRef.current));
    backgroundRef.current = previous;
    setBackground(previous);
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 });
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(copyGrid(backgroundRef.current));
    backgroundRef.current = next;
    setBackground(next);
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 });
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "F12") {
        event.preventDefault();
        return;
      }

      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (modifier && event.shiftKey && ["i", "j", "c"].includes(key)) {
        event.preventDefault();
        return;
      }

      if (modifier && key === "u") {
        event.preventDefault();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;

      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (modifier && key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [redo, undo]);

  const fillBackground = useCallback(() => {
    commitGrid(createGrid(width, tool === "eraser" ? null : activeBrushColor));
  }, [activeBrushColor, commitGrid, tool, width]);

  const resetBackground = useCallback(() => {
    commitGrid(createGrid(width, DEFAULT_BACKGROUND));
    setTool("brush");
    setCustomBrushColor("");
    setBrushColor(DEFAULT_BACKGROUND);
  }, [commitGrid, width]);

  const download = useCallback(() => {
    const exportCanvas = document.createElement("canvas");
    drawCanvas(exportCanvas, false);
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rank-${normalizeRankText(text).toLowerCase() || "rank"}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [drawCanvas, text]);

  return (
    <div className="pixel-rank-editor" onContextMenu={(event) => event.preventDefault()}>
      <div className="pixel-rank-preview-panel">
        <div className="pixel-rank-preview-header">
          <div>
            <span className="pixel-rank-kicker">{isTurkish ? "ItemsAdder uyumlu PNG" : "ItemsAdder-ready PNG"}</span>
            <strong>{copy.dimensions}</strong>
          </div>
          <span className="pixel-rank-grid-badge">9 px</span>
        </div>
        <div ref={stageWrapRef} className="pixel-rank-stage-wrap">
          <div className="pixel-rank-stage" style={{ width: `${width * previewScale}px`, height: `${HEIGHT * previewScale}px` }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={HEIGHT}
              className="pixel-rank-canvas"
              style={{ width: `${width * previewScale}px`, height: `${HEIGHT * previewScale}px` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPainting}
              onPointerCancel={stopPainting}
              aria-label={isTurkish ? "Rank arka plan pixel editörü" : "Rank background pixel editor"}
            />
          </div>
        </div>
        <p className="pixel-rank-hint">{copy.gridHint}</p>
        <button type="button" className="pixel-rank-download" onClick={download}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {copy.download}
        </button>
      </div>

      <div className="pixel-rank-controls">
        <div className="pixel-rank-control-section">
          <label className="pixel-rank-label" htmlFor="rank-text">{copy.rankName}</label>
          <input
            id="rank-text"
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={copy.rankPlaceholder}
            maxLength={32}
            className="pixel-rank-input"
          />
        </div>

        <div className="pixel-rank-control-section">
          <span className="pixel-rank-label">{copy.font}</span>
          <div className="pixel-rank-fonts">
            {PIXEL_FONTS.map((item: PixelFont) => (
              <button
                key={item.id}
                type="button"
                className={`pixel-rank-font-button ${fontId === item.id ? "is-active" : ""}`}
                onClick={() => setFontId(item.id)}
              >
                <span className="pixel-rank-font-preview">Aa</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pixel-rank-control-section">
          <span className="pixel-rank-label">{copy.textColor}</span>
          <div className="pixel-rank-swatches">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`pixel-rank-swatch ${textColor === color ? "is-active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setTextColor(color)}
                aria-label={color}
              />
            ))}
            <label className="pixel-rank-custom-color" title={copy.textColor}>
              <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} aria-label={copy.textColor} />
              <span>+</span>
            </label>
          </div>
        </div>

        <div className="pixel-rank-control-section">
          <span className="pixel-rank-label">{copy.background}</span>
          <div className="pixel-rank-tools">
            <button type="button" className={`pixel-rank-tool-button ${tool === "brush" ? "is-active" : ""}`} onClick={() => setTool("brush")} title={copy.brush}>
              <BrushIcon size={17} />
              <span>{copy.brush}</span>
            </button>
            <button type="button" className={`pixel-rank-tool-button ${tool === "eraser" ? "is-active" : ""}`} onClick={() => setTool("eraser")} title={copy.eraser}>
              <span className="pixel-rank-eraser-icon" aria-hidden="true">⌫</span>
              <span>{copy.eraser}</span>
            </button>
          </div>
          <div className="pixel-rank-swatches pixel-rank-background-swatches">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`pixel-rank-swatch ${activeBrushColor === color && tool === "brush" ? "is-active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => { setBrushColor(color); setCustomBrushColor(""); setTool("brush"); }}
                aria-label={color}
              />
            ))}
            <label className="pixel-rank-custom-color" title={copy.background}>
              <input type="color" value={activeBrushColor} onChange={(event) => { setCustomBrushColor(event.target.value); setTool("brush"); }} aria-label={copy.background} />
              <span>+</span>
            </label>
          </div>
        </div>

        <div className="pixel-rank-control-section pixel-rank-brush-row">
          <span className="pixel-rank-label">{copy.brushSize}</span>
          <div className="pixel-rank-size-buttons">
            {[1, 2, 3].map((size) => (
              <button key={size} type="button" className={brushSize === size ? "is-active" : ""} onClick={() => setBrushSize(size)}>
                {size}px
              </button>
            ))}
          </div>
          <button type="button" className="pixel-rank-fill-button" onClick={fillBackground}>{copy.fill}</button>
        </div>

        <div className="pixel-rank-actions">
          <button type="button" onClick={undo} disabled={!historyState.canUndo}>↶ <span>{copy.undo}</span></button>
          <button type="button" onClick={redo} disabled={!historyState.canRedo}>↷ <span>{copy.redo}</span></button>
          <button type="button" onClick={resetBackground}><span>{copy.reset}</span></button>
        </div>
      </div>
    </div>
  );
}
