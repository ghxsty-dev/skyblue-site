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

const PADDING_X = 3;
const PADDING_Y = 2;
const TEXT_TOP = PADDING_Y;
const DEFAULT_BACKGROUND = "#59abfe";
const PREVIEW_SCALE = 28;

const TEXT_COLORS = ["#ffffff", "#000000", "#ffd166", "#ff6b6b", "#68d391", "#c084fc", "#59abfe", "#f97316", "#ec4899", "#14b8a6", "#eab308", "#a855f7", "#f43f5e", "#06b6d4"];
const BACKGROUND_COLORS = ["#59abfe", "#97cdf2", "#0b0d10", "#1c2128", "#173c62", "#f1f4f7", "#7c3aed", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"];

type Pixel = string | null;
type PixelGrid = Pixel[][];
type Tool = "brush" | "eraser";

interface RankGeneratorProps {
  lang?: "tr" | "en";
}

function createGrid(width: number, height: number, color: Pixel): PixelGrid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => color));
}

function resizeGrid(grid: PixelGrid, width: number, height: number): PixelGrid {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => grid[y]?.[x] ?? DEFAULT_BACKGROUND)
  );
}

function copyGrid(grid: PixelGrid): PixelGrid {
  return grid.map((row) => [...row]);
}

function getInitialDimensions() {
  const layout = buildPixelText(PIXEL_FONTS[0], "VIP");
  return {
    width: layout.width + PADDING_X * 2,
    height: layout.height + PADDING_Y * 2,
  };
}

const INITIAL_DIMENSIONS = getInitialDimensions();

export default function RankGenerator({ lang = "tr" }: RankGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const paintingRef = useRef(false);
  const backgroundRef = useRef<PixelGrid>(createGrid(INITIAL_DIMENSIONS.width, INITIAL_DIMENSIONS.height, DEFAULT_BACKGROUND));
  const undoRef = useRef<PixelGrid[]>([]);
  const redoRef = useRef<PixelGrid[]>([]);
  const [text, setText] = useState("VIP");
  const [fontId, setFontId] = useState(PIXEL_FONTS[0].id);
  const [textColor, setTextColor] = useState("#ffffff");
  const [extraTextColors, setExtraTextColors] = useState<string[]>([]);
  const [brushColor, setBrushColor] = useState("#0b0d10");
  const [customBrushColor, setCustomBrushColor] = useState("");
  const [extraBrushColors, setExtraBrushColors] = useState<string[]>([]);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(1);
  const [background, setBackground] = useState<PixelGrid>(() => createGrid(INITIAL_DIMENSIONS.width, INITIAL_DIMENSIONS.height, DEFAULT_BACKGROUND));
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [previewScale, setPreviewScale] = useState(PREVIEW_SCALE);
  const [downloadState, setDownloadState] = useState<{ authenticated: boolean; premium: boolean; remaining: number } | null>(null);
  const [downloadPending, setDownloadPending] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const resizingRef = useRef(false);
  const [savedProjects, setSavedProjects] = useState<{ id: string; name: string; text: string; font_id: string; text_color: string; updated_at: string }[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);

  const font = getPixelFont(fontId);
  const layout = buildPixelText(font, text);
  const width = layout.width + PADDING_X * 2;
  const height = layout.height + PADDING_Y * 2;
  const activeBrushColor = customBrushColor || brushColor;
  const isTurkish = lang === "tr";

  const addTextColor = useCallback((color: string) => {
    setExtraTextColors((prev) => {
      if (prev.includes(color) || TEXT_COLORS.includes(color)) return prev;
      const next = [...prev, color];
      return next.slice(-6);
    });
  }, []);

  const addBrushColor = useCallback((color: string) => {
    setExtraBrushColors((prev) => {
      if (prev.includes(color) || BACKGROUND_COLORS.includes(color)) return prev;
      const next = [...prev, color];
      return next.slice(-6);
    });
  }, []);

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
        save: "Kaydet",
        saved: "Kaydedildi",
        myProjects: "Projelerim",
        loadProject: "Yükle",
        deleteProject: "Sil",
        loginToSave: "Kaydetmek için giriş yap",
        dimensions: `${width} × ${height} px PNG`,
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
        save: "Save",
        saved: "Saved",
        myProjects: "My Projects",
        loadProject: "Load",
        deleteProject: "Delete",
        loginToSave: "Sign in to save",
        dimensions: `${width} × ${height} px PNG`,
        gridHint: "Only the background can be painted on the grid.",
      };

  useEffect(() => {
    const next = resizeGrid(backgroundRef.current, width, height);
    backgroundRef.current = next;
    setBackground(next);
    undoRef.current = [];
    redoRef.current = [];
    setHistoryState({ canUndo: false, canRedo: false });
  }, [height, width]);

  useEffect(() => {
    let active = true;
    fetch("/api/tools/minecraft-rank/download", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() }))
      .then(({ response, result }) => {
        if (!active) return;
        if (response.ok) setDownloadState({ authenticated: true, premium: Boolean(result.premium), remaining: Number(result.remaining) });
        else setDownloadState({ authenticated: false, premium: false, remaining: 0 });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/tools/minecraft-rank/projects", { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(async ({ ok, data }) => {
        if (!active || !ok) return;
        const projects = data.projects || [];
        setSavedProjects(projects);
        if (projects.length > 0 && projects[0].id) {
          const detail = await fetch(`/api/tools/minecraft-rank/projects?id=${projects[0].id}`, { cache: "no-store" });
          if (!active || !detail.ok) return;
          const { project } = await detail.json();
          if (!active || !project) return;
          setText(project.text);
          setFontId(project.font_id);
          setTextColor(project.text_color);
          setExtraTextColors(Array.isArray(project.extra_text_colors) ? project.extra_text_colors : []);
          setExtraBrushColors(Array.isArray(project.extra_brush_colors) ? project.extra_brush_colors : []);
          if (Array.isArray(project.background) && project.background.length > 0) {
            backgroundRef.current = project.background;
            setBackground(project.background);
          }
          setCurrentProjectId(project.id);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y += 1) {
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
    for (let y = 0; y < layout.height; y += 1) {
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
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += 1) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  }, [background, height, layout, textColor, width]);

  useEffect(() => {
    if (canvasRef.current) drawCanvas(canvasRef.current, true);
  }, [drawCanvas]);

  const cellFromPointer = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width - 1, Math.floor(((event.clientX - rect.left) / rect.width) * width))),
      y: Math.max(0, Math.min(height - 1, Math.floor(((event.clientY - rect.top) / rect.height) * height))),
    };
  }, [height, width]);

  const paintAt = useCallback((x: number, y: number) => {
    const next = copyGrid(backgroundRef.current);
    const value = tool === "eraser" ? null : activeBrushColor;
    const start = Math.floor(brushSize / 2);
    let changed = false;

    for (let dy = 0; dy < brushSize; dy += 1) {
      for (let dx = 0; dx < brushSize; dx += 1) {
        const targetX = x + dx - start;
        const targetY = y + dy - start;
        if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) continue;
        if (next[targetY][targetX] !== value) {
          next[targetY][targetX] = value;
          changed = true;
        }
      }
    }

    if (changed) commitGrid(next);
  }, [activeBrushColor, brushSize, commitGrid, height, tool, width]);

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

  const handleCanvasDoubleClick = useCallback(() => {
    textInputRef.current?.focus();
    textInputRef.current?.select();
  }, []);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = (e.target as HTMLElement).closest(".pixel-rank-editor")?.getBoundingClientRect().width || 0;
    const onMove = (ev: PointerEvent) => {
      if (!resizingRef.current) return;
      const diff = ev.clientX - startX;
      const newWidth = Math.max(600, Math.min(1400, startWidth + diff));
      setPanelWidth(newWidth);
    };
    const onUp = () => {
      resizingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
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
    commitGrid(createGrid(width, height, tool === "eraser" ? null : activeBrushColor));
  }, [activeBrushColor, commitGrid, height, tool, width]);

  const resetBackground = useCallback(() => {
    commitGrid(createGrid(width, height, DEFAULT_BACKGROUND));
    setTool("brush");
    setCustomBrushColor("");
    setBrushColor(DEFAULT_BACKGROUND);
  }, [commitGrid, height, width]);

  const download = useCallback(async () => {
    setDownloadPending(true);
    setDownloadError("");
    try {
      const response = await fetch("/api/tools/minecraft-rank/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fontId, textColor, background }),
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (response.status === 429) {
        setDownloadState({ authenticated: true, premium: false, remaining: 0 });
        setDownloadError(isTurkish ? "Günlük indirme hakkın doldu. Premium kodu kullan veya Discord hesabını doğrula." : "Your daily downloads are used. Redeem a premium code or verify Discord.");
        return;
      }
      if (!response.ok) throw new Error("DOWNLOAD_FAILED");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rank-${normalizeRankText(text).toLowerCase() || "rank"}.png`;
      link.click();
      URL.revokeObjectURL(url);
      const premium = response.headers.get("X-Premium") === "true";
      const remaining = Number(response.headers.get("X-Downloads-Remaining") || 0);
      setDownloadState({ authenticated: true, premium, remaining });
    } catch {
      setDownloadError(isTurkish ? "PNG indirilemedi. Hesap sistemi ayarlarını kontrol edin." : "Could not download PNG. Check the account system configuration.");
    } finally {
      setDownloadPending(false);
    }
  }, [background, fontId, isTurkish, text, textColor]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/tools/minecraft-rank/projects?id=${projectId}`, { cache: "no-store" });
      if (!response.ok) return;
      const { project } = await response.json();
      if (!project) return;

      setText(project.text);
      setFontId(project.font_id);
      setTextColor(project.text_color);
      setExtraTextColors(Array.isArray(project.extra_text_colors) ? project.extra_text_colors : []);
      setExtraBrushColors(Array.isArray(project.extra_brush_colors) ? project.extra_brush_colors : []);

      if (Array.isArray(project.background) && project.background.length > 0) {
        const rows = project.background;
        const h = rows.length;
        const w = rows[0]?.length || 0;
        if (w > 0 && h > 0) {
          backgroundRef.current = rows;
          setBackground(rows);
          undoRef.current = [];
          redoRef.current = [];
          setHistoryState({ canUndo: false, canRedo: false });
        }
      }
      setCurrentProjectId(project.id);
    } catch {}
  }, []);

  const saveProject = useCallback(async () => {
    if (!downloadState?.authenticated) {
      window.location.assign("/login");
      return;
    }
    setSavePending(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const projectName = text || "Proje";
      const response = await fetch("/api/tools/minecraft-rank/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentProjectId || undefined,
          name: projectName,
          text,
          fontId,
          textColor,
          background,
          extraBrushColors,
          extraTextColors,
        }),
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "SAVE_FAILED");
      if (result.project) {
        setCurrentProjectId(result.project.id);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      const listRes = await fetch("/api/tools/minecraft-rank/projects", { cache: "no-store" });
      if (listRes.ok) {
        const { projects } = await listRes.json();
        setSavedProjects(projects || []);
      }
    } catch {
      setSaveError(isTurkish ? "Kaydedilemedi." : "Could not save.");
    } finally {
      setSavePending(false);
    }
  }, [background, currentProjectId, downloadState, extraBrushColors, extraTextColors, fontId, isTurkish, text, textColor]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch("/api/tools/minecraft-rank/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId }),
      });
      if (!response.ok) return;
      if (currentProjectId === projectId) setCurrentProjectId(null);
      setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {}
  }, [currentProjectId]);

  return (
      <div className="pixel-rank-editor" style={panelWidth ? { maxWidth: `${panelWidth}px` } : undefined} onContextMenu={(event) => event.preventDefault()}>
        <div className="pixel-rank-preview-panel">
        <div className="pixel-rank-preview-header">
          <div>
            <span className="pixel-rank-kicker">{isTurkish ? "ItemsAdder uyumlu PNG" : "ItemsAdder-ready PNG"}</span>
            <strong>{copy.dimensions}</strong>
          </div>
          <span className="pixel-rank-grid-badge">{height} px</span>
        </div>
        <div ref={stageWrapRef} className="pixel-rank-stage-wrap">
          <div className="pixel-rank-stage" style={{ width: `${width * previewScale}px`, height: `${height * previewScale}px` }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="pixel-rank-canvas"
              style={{ width: `${width * previewScale}px`, height: `${height * previewScale}px` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPainting}
              onPointerCancel={stopPainting}
              onDoubleClick={handleCanvasDoubleClick}
              aria-label={isTurkish ? "Rank arka plan pixel editörü" : "Rank background pixel editor"}
            />
          </div>
        </div>
        <p className="pixel-rank-hint">{copy.gridHint}</p>
        <div className="pixel-rank-action-row">
          <button type="button" className="pixel-rank-download" onClick={download} disabled={downloadPending}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadPending ? (isTurkish ? "Hazırlanıyor..." : "Preparing...") : copy.download}
          </button>
          <button type="button" className={`pixel-rank-save ${saveSuccess ? "is-success" : ""}`} onClick={saveProject} disabled={savePending}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {savePending ? "..." : saveSuccess ? copy.saved : copy.save}
          </button>
        </div>
        {saveError && <p className="pixel-rank-download-error" role="alert">{saveError}</p>}
        <div className="pixel-rank-quota">
          {downloadState?.authenticated ? (
            downloadState.premium ? <span>Premium / {isTurkish ? "sınırsız indirme" : "unlimited downloads"}</span> : <span>{isTurkish ? `Bugün ${downloadState.remaining} indirme hakkın kaldı` : `${downloadState.remaining} downloads left today`}</span>
          ) : <a href="/login">{isTurkish ? "İndirmek için giriş yap" : "Sign in to download"}</a>}
          {downloadState?.authenticated && !downloadState.premium && <span><a href="/account/premium?tool=minecraft-rank">Premium</a> · <a href="/account/discord">Discord +2</a></span>}
        </div>
        {downloadError && <p className="pixel-rank-download-error" role="alert">{downloadError}</p>}
        {downloadState?.authenticated && savedProjects.length > 0 && (
          <div className="pixel-rank-projects">
            <button type="button" className="pixel-rank-projects-toggle" onClick={() => setShowProjectList((prev) => !prev)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {copy.myProjects} ({savedProjects.length})
              <span className={`pixel-rank-projects-chevron ${showProjectList ? "is-open" : ""}`}>▾</span>
            </button>
            {showProjectList && (
              <div className="pixel-rank-projects-list">
                {savedProjects.map((project) => (
                  <div key={project.id} className={`pixel-rank-project-item ${currentProjectId === project.id ? "is-active" : ""}`}>
                    <span className="pixel-rank-project-name" title={project.name}>{project.name}</span>
                    <span className="pixel-rank-project-meta">{project.text} · {project.font_id}</span>
                    <div className="pixel-rank-project-actions">
                      <button type="button" onClick={() => loadProject(project.id)}>{copy.loadProject}</button>
                      <button type="button" className="pixel-rank-project-delete" onClick={() => deleteProject(project.id)}>{copy.deleteProject}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="pixel-rank-resize-handle" onPointerDown={handleResizeStart} />
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
            {extraTextColors.map((color) => (
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
              <input type="color" value={textColor} onChange={(event) => { setTextColor(event.target.value); addTextColor(event.target.value); }} aria-label={copy.textColor} />
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
            {extraBrushColors.map((color) => (
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
              <input type="color" value={activeBrushColor} onChange={(event) => { setCustomBrushColor(event.target.value); setTool("brush"); addBrushColor(event.target.value); }} aria-label={copy.background} />
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
