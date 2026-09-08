"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrushIcon } from "@/lib/icons";
import {
  buildPixelText,
  getPixelFont,
  normalizeRankText,
  PIXEL_FONTS,
  type PixelFont,
} from "./pixel-fonts";
import {
  buildGradientGrid,
  contrastRatio,
  GRADIENT_PRESETS,
  MAX_RANK_LENGTH,
  mixHex,
  QUICK_RANKS,
  type GradientDirection,
} from "./rank-presets";

const PADDING_X = 3;
const PADDING_Y = 2;
const TEXT_TOP = PADDING_Y;
const DEFAULT_PRESET = GRADIENT_PRESETS[0];
const DEFAULT_SOLID = "#59abfe";
const BASE_PREVIEW_SCALE = 22;

const TEXT_COLORS = ["#ffffff", "#0b0d10", "#ffd166", "#ff6b6b", "#68d391", "#c084fc", "#59abfe", "#f97316", "#ec4899", "#14b8a6", "#eab308", "#a855f7"];
const SOLID_COLORS = ["#59abfe", "#2f80ed", "#0b0d10", "#4a5568", "#f1f4f7", "#7c3aed", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#ec4899"];

type Pixel = string | null;
type PixelGrid = Pixel[][];
type Tool = "brush" | "eraser";
type BgMode = "gradient" | "solid" | "custom";

interface RankGeneratorProps {
  lang?: "tr" | "en";
}

function createGrid(width: number, height: number, color: Pixel): PixelGrid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => color));
}

function copyGrid(grid: PixelGrid): PixelGrid {
  return grid.map((row) => [...row]);
}

/**
 * BUG FIX: eski kod yeni açılan alanı hep varsayılan maviye boyuyordu.
 * Kenar rengini uzatarak mevcut deseni koru.
 */
function smartResize(grid: PixelGrid, width: number, height: number, fallback: Pixel): PixelGrid {
  const oldH = grid.length;
  const oldW = grid[0]?.length ?? 0;
  return Array.from({ length: height }, (_, y) => {
    const srcY = Math.min(y, Math.max(0, oldH - 1));
    return Array.from({ length: width }, (_, x) => {
      const existing = grid[srcY]?.[Math.min(x, Math.max(0, oldW - 1))];
      if (y < oldH && x < oldW) return grid[y]?.[x] ?? fallback;
      return existing ?? fallback;
    });
  });
}

function averageBgColor(grid: PixelGrid): string {
  let r = 0, g = 0, b = 0, n = 0;
  for (const row of grid) {
    for (const c of row) {
      if (typeof c !== "string" || !/^#[0-9a-f]{6}$/i.test(c)) continue;
      r += Number.parseInt(c.slice(1, 3), 16);
      g += Number.parseInt(c.slice(3, 5), 16);
      b += Number.parseInt(c.slice(5, 7), 16);
      n += 1;
    }
  }
  if (n === 0) return "#11161c";
  const toHex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function RankGenerator({ lang = "tr" }: RankGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanPreviewRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const strokePushedRef = useRef(false);

  const backgroundRef = useRef<PixelGrid>(buildGradientGrid(21, 9, DEFAULT_PRESET.from, DEFAULT_PRESET.to, "vertical"));
  const undoRef = useRef<PixelGrid[]>([]);
  const redoRef = useRef<PixelGrid[]>([]);

  const [text, setText] = useState("VIP");
  const [projectName, setProjectName] = useState("VIP");
  const [fontId, setFontId] = useState(PIXEL_FONTS[0].id);
  const [textColor, setTextColor] = useState(DEFAULT_PRESET.text);
  const [extraTextColors, setExtraTextColors] = useState<string[]>([]);

  const [bgMode, setBgMode] = useState<BgMode>("gradient");
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [gradFrom, setGradFrom] = useState(DEFAULT_PRESET.from);
  const [gradTo, setGradTo] = useState(DEFAULT_PRESET.to);
  const [gradDir, setGradDir] = useState<GradientDirection>("vertical");
  const [solidColor, setSolidColor] = useState(DEFAULT_SOLID);

  const [brushColor, setBrushColor] = useState("#0b0d10");
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  const [background, setBackground] = useState<PixelGrid>(() =>
    buildGradientGrid(21, 9, DEFAULT_PRESET.from, DEFAULT_PRESET.to, "vertical"),
  );
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [autoScale, setAutoScale] = useState(BASE_PREVIEW_SCALE);
  const [zoom, setZoom] = useState(1);

  const [downloadState, setDownloadState] = useState<{ authenticated: boolean; premium: boolean; remaining: number } | null>(null);
  const [downloadPending, setDownloadPending] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [savedProjects, setSavedProjects] = useState<{ id: string; name: string; text: string; font_id: string; text_color: string; updated_at: string }[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const font = getPixelFont(fontId);
  const normalized = normalizeRankText(text);
  const layout = useMemo(() => buildPixelText(font, text), [font, text]);
  const width = layout.width + PADDING_X * 2;
  const height = layout.height + PADDING_Y * 2;
  const isTurkish = lang === "tr";
  const trimmedEmpty = text.trim().length === 0;
  const activePreset = GRADIENT_PRESETS.find((p) => p.id === presetId);

  const copy = isTurkish
    ? {
        step1: "1 · Rank yazısı",
        rankName: "Rank adı",
        rankPlaceholder: "VIP, MVP, Admin...",
        quick: "Hazır ranklar",
        clear: "Temizle",
        chars: "karakter",
        emptyHint: "Yazı boş — önizlemede VIP gösteriliyor. İndirmek için bir yazı yaz.",
        unsupportedHint: "Desteklenmeyen karakterler ? olarak görünür.",
        step2: "2 · Font ve yazı rengi",
        font: "Pixel font",
        fontBlockDesc: "Klasik · 5px · kalın ve net",
        fontTenDesc: "Modern · 7px · ince ve detaylı",
        textColor: "Yazı rengi",
        customColor: "Özel renk",
        lowContrast: "Yazı arka planda zor okunabilir. Daha zıt bir renk dene.",
        step3: "3 · Arka plan",
        modeGradient: "Hazır gradient",
        modeSolid: "Düz renk",
        modeCustom: "Özel fırça",
        gradientPresets: "Tek tıkla profesyonel stiller — her yazıda çalışır",
        customGradient: "Kendi geçişini yap",
        from: "Başlangıç",
        to: "Bitiş",
        vertical: "Dikey",
        horizontal: "Yatay",
        solidHint: "Bir renge tıkla, tüm arka plan anında boyansın.",
        brush: "Fırça",
        eraser: "Silgi",
        brushSize: "Fırça boyutu",
        brushColor: "Fırça rengi",
        fill: "Tümünü boya",
        makeTransparent: "Şeffaf yap",
        undo: "Geri al",
        redo: "İleri al",
        reset: "Sıfırla",
        showGridLines: "Izgara çizgileri",
        customHint: "Sadece ince detaylar için — çoğu işi gradientler halleder.",
        previewTitle: "Canlı önizleme",
        chatPreview: "Oyun içi (sohbet) önizleme",
        actualSize: "Gerçek boyut",
        zoomIn: "Yakınlaştır",
        zoomOut: "Uzaklaştır",
        zoomFit: "Sığdır",
        download: "PNG indir",
        save: "Kaydet",
        saved: "Kaydedildi",
        newProject: "Yeni",
        projectNameLabel: "Proje adı",
        myProjects: "Projelerim",
        loadProject: "Yükle",
        deleteProject: "Sil",
        confirmDelete: "Emin misin?",
        yesDelete: "Evet, sil",
        cancel: "Vazgeç",
        loginToSave: "Kaydetmek için giriş yap",
        dimensions: `${width} × ${height} px PNG`,
      }
    : {
        step1: "1 · Rank text",
        rankName: "Rank name",
        rankPlaceholder: "VIP, MVP, Admin...",
        quick: "Quick ranks",
        clear: "Clear",
        chars: "chars",
        emptyHint: "Text is empty — previewing VIP. Type something to download.",
        unsupportedHint: "Unsupported characters render as ?.",
        step2: "2 · Font & text color",
        font: "Pixel font",
        fontBlockDesc: "Classic · 5px · bold and crisp",
        fontTenDesc: "Modern · 7px · slim and detailed",
        textColor: "Text color",
        customColor: "Custom color",
        lowContrast: "Text is hard to read on this background. Try a more contrasting color.",
        step3: "3 · Background",
        modeGradient: "Gradients",
        modeSolid: "Solid",
        modeCustom: "Brush",
        gradientPresets: "One-click pro styles — work with any text",
        customGradient: "Make your own blend",
        from: "From",
        to: "To",
        vertical: "Vertical",
        horizontal: "Horizontal",
        solidHint: "Click a color to paint the whole background instantly.",
        brush: "Brush",
        eraser: "Eraser",
        brushSize: "Brush size",
        brushColor: "Brush color",
        fill: "Fill all",
        makeTransparent: "Make transparent",
        undo: "Undo",
        redo: "Redo",
        reset: "Reset",
        showGridLines: "Grid lines",
        customHint: "Only for fine details — gradients cover most jobs.",
        previewTitle: "Live preview",
        chatPreview: "In-game (chat) preview",
        actualSize: "Actual size",
        zoomIn: "Zoom in",
        zoomOut: "Zoom out",
        zoomFit: "Fit",
        download: "Download PNG",
        save: "Save",
        saved: "Saved",
        newProject: "New",
        projectNameLabel: "Project name",
        myProjects: "My Projects",
        loadProject: "Load",
        deleteProject: "Delete",
        confirmDelete: "Are you sure?",
        yesDelete: "Yes, delete",
        cancel: "Cancel",
        loginToSave: "Sign in to save",
        dimensions: `${width} × ${height} px PNG`,
      };

  const pushUndo = useCallback(() => {
    undoRef.current = [...undoRef.current.slice(-29), copyGrid(backgroundRef.current)];
    redoRef.current = [];
    setHistoryState({ canUndo: true, canRedo: false });
  }, []);

  const setGrid = useCallback((next: PixelGrid, withUndo: boolean) => {
    if (withUndo) {
      undoRef.current = [...undoRef.current.slice(-29), copyGrid(backgroundRef.current)];
      redoRef.current = [];
    }
    backgroundRef.current = next;
    setBackground(next);
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: withUndo ? false : redoRef.current.length > 0 });
  }, []);

  const addTextColor = useCallback((color: string) => {
    setExtraTextColors((prev) => {
      if (prev.includes(color) || TEXT_COLORS.includes(color)) return prev;
      return [...prev, color].slice(-6);
    });
  }, []);

  // --- Gradient / solid uygula ---
  const applyPreset = useCallback((id: string, autoText = true) => {
    const preset = GRADIENT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setGradFrom(preset.from);
    setGradTo(preset.to);
    setBgMode("gradient");
    if (autoText) {
      setTextColor(preset.text);
      addTextColor(preset.text);
    }
    setGrid(buildGradientGrid(width, height, preset.from, preset.to, gradDir), true);
  }, [addTextColor, gradDir, height, setGrid, width]);

  const regenerateManagedBackground = useCallback(() => {
    if (bgMode === "gradient") {
      const next = buildGradientGrid(width, height, gradFrom, gradTo, gradDir);
      backgroundRef.current = next;
      setBackground(next);
    } else if (bgMode === "solid") {
      const next = createGrid(width, height, solidColor);
      backgroundRef.current = next;
      setBackground(next);
    }
  }, [bgMode, gradFrom, gradTo, gradDir, height, solidColor, width]);

  // Yazı uzayıp boyut değişince: gradient/solid'i sessizce yeniden üret,
  // özel fırçada deseni kenar uzatarak koru (mavi leke bug'ı düzeltildi).
  // Undo geçmişi artık her harfte silinmiyor.
  const sizeKey = `${width}x${height}`;
  const sizeKeyRef = useRef(sizeKey);
  useEffect(() => {
    if (sizeKeyRef.current === sizeKey) return;
    sizeKeyRef.current = sizeKey;
    if (bgMode === "gradient" || bgMode === "solid") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      regenerateManagedBackground();
      return;
    }
    const next = smartResize(backgroundRef.current, width, height, brushColor);
    backgroundRef.current = next;
    setBackground(next);
    undoRef.current = undoRef.current.map((g) => smartResize(g, width, height, brushColor));
    redoRef.current = redoRef.current.map((g) => smartResize(g, width, height, brushColor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeKey]);

  // Gradient renk/yön değişiminde canlı önizleme (undo'ya tek kayıt düşer)
  const gradLiveRef = useRef({ from: gradFrom, to: gradTo, dir: gradDir });
  useEffect(() => {
    const prev = gradLiveRef.current;
    if (prev.from === gradFrom && prev.to === gradTo && prev.dir === gradDir) return;
    gradLiveRef.current = { from: gradFrom, to: gradTo, dir: gradDir };
    if (bgMode !== "gradient") return;
    const t = window.setTimeout(() => {
      setGrid(buildGradientGrid(width, height, gradFrom, gradTo, gradDir), false);
    }, 60);
    return () => window.clearTimeout(t);
  }, [gradFrom, gradTo, gradDir, bgMode, width, height, setGrid]);

  useEffect(() => {
    if (bgMode !== "solid") return;
    const t = window.setTimeout(() => {
      const next = createGrid(width, height, solidColor);
      backgroundRef.current = next;
      setBackground(next);
    }, 60);
    return () => window.clearTimeout(t);
  }, [solidColor, bgMode, width, height]);

  // --- Veri yükleme ---
  useEffect(() => {
    let active = true;
    fetch("/api/tools/minecraft-rank/download", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json().catch(() => ({})) }))
      .then(({ response, result }) => {
        if (!active) return;
        if (response.ok) setDownloadState({ authenticated: true, premium: Boolean(result.premium), remaining: Number(result.remaining) });
        else setDownloadState({ authenticated: false, premium: false, remaining: 0 });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // BUG FIX: eskiden ilk proje otomatik yüklenip yeni gelen kullanıcının
  // ekranını başkasının işiyle dolduruyordu. Artık sadece listeleniyor.
  useEffect(() => {
    let active = true;
    fetch("/api/tools/minecraft-rank/projects", { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (!active || !ok) return;
        setSavedProjects(data.projects || []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // --- Ölçek ---
  useEffect(() => {
    const element = stageWrapRef.current;
    if (!element) return;
    const updateScale = () => {
      const availableWidth = Math.max(1, element.clientWidth - 44);
      const availableHeight = 420;
      setAutoScale(Math.max(4, Math.min(BASE_PREVIEW_SCALE, availableWidth / width, availableHeight / height)));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    updateScale();
    return () => observer.disconnect();
  }, [width, height]);

  const effectiveScale = Math.max(2, Math.min(40, autoScale * zoom));

  // --- Canvas çizimi ---
  const drawToCanvas = useCallback((canvas: HTMLCanvasElement, grid: PixelGrid, withGrid: boolean) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const color = grid[y]?.[x];
        if (color === null || color === undefined) {
          if (withGrid) {
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
    if (withGrid && showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 0.04;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y += 1) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
    }
  }, [height, layout, showGrid, textColor, width]);

  useEffect(() => {
    if (canvasRef.current) drawToCanvas(canvasRef.current, background, true);
    if (cleanPreviewRef.current) drawToCanvas(cleanPreviewRef.current, background, false);
  }, [background, drawToCanvas]);

  // --- Fırça (stroke bazlı undo: sürükleme artık tek hamle) ---
  const cellFromPointer = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width - 1, Math.floor(((event.clientX - rect.left) / rect.width) * width))),
      y: Math.max(0, Math.min(height - 1, Math.floor(((event.clientY - rect.top) / rect.height) * height))),
    };
  }, [height, width]);

  const paintCells = useCallback((x: number, y: number) => {
    const next = backgroundRef.current;
    const value = tool === "eraser" ? null : brushColor;
    const start = Math.floor(brushSize / 2);
    let changed = false;
    for (let dy = 0; dy < brushSize; dy += 1) {
      for (let dx = 0; dx < brushSize; dx += 1) {
        const tx = x + dx - start;
        const ty = y + dy - start;
        if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
        if (next[ty][tx] !== value) {
          next[ty][tx] = value;
          changed = true;
        }
      }
    }
    if (changed) setBackground(next.map((row) => [...row]));
  }, [brushColor, brushSize, height, tool, width]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (bgMode !== "custom") setBgMode("custom");
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!strokePushedRef.current) {
      pushUndo();
      strokePushedRef.current = true;
    }
    const { x, y } = cellFromPointer(event);
    paintCells(x, y);
  }, [bgMode, cellFromPointer, paintCells, pushUndo]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!strokePushedRef.current) return;
    if (event.buttons === 0) return;
    const { x, y } = cellFromPointer(event);
    paintCells(x, y);
  }, [cellFromPointer, paintCells]);

  const stopPainting = useCallback(() => {
    strokePushedRef.current = false;
  }, []);

  const undo = useCallback(() => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(copyGrid(backgroundRef.current));
    backgroundRef.current = previous;
    setBackground(previous.map((row) => [...row]));
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 });
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(copyGrid(backgroundRef.current));
    backgroundRef.current = next;
    setBackground(next.map((row) => [...row]));
    setHistoryState({ canUndo: undoRef.current.length > 0, canRedo: redoRef.current.length > 0 });
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
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
    setGrid(createGrid(width, height, tool === "eraser" ? null : brushColor), true);
  }, [brushColor, height, setGrid, tool, width]);

  const makeTransparent = useCallback(() => {
    setTool("eraser");
    setGrid(createGrid(width, height, null), true);
  }, [height, setGrid, width]);

  const resetAll = useCallback(() => {
    const preset = GRADIENT_PRESETS[0];
    setBgMode("gradient");
    setPresetId(preset.id);
    setGradFrom(preset.from);
    setGradTo(preset.to);
    setGradDir("vertical");
    setTextColor(preset.text);
    setGrid(buildGradientGrid(width, height, preset.from, preset.to, "vertical"), true);
  }, [height, setGrid, width]);

  const startNew = useCallback(() => {
    setText("VIP");
    setProjectName("VIP");
    setFontId(PIXEL_FONTS[0].id);
    setCurrentProjectId(null);
    resetAll();
  }, [resetAll]);

  // --- İndirme / kaydetme ---
  const download = useCallback(async () => {
    if (trimmedEmpty) {
      setDownloadError(isTurkish ? "Önce bir rank yazısı yaz." : "Type a rank name first.");
      return;
    }
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
        setDownloadError(isTurkish ? "Günlük indirme hakkın doldu. Premium kodu kullan veya Discord hesabını doğrula." : "Daily downloads used up. Redeem a premium code or verify Discord.");
        return;
      }
      if (!response.ok) throw new Error("DOWNLOAD_FAILED");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rank-${normalizeRankText(text).toLowerCase() || "rank"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      const premium = response.headers.get("X-Premium") === "true";
      const remaining = Number(response.headers.get("X-Downloads-Remaining") || 0);
      setDownloadState({ authenticated: true, premium, remaining });
    } catch {
      setDownloadError(isTurkish ? "PNG indirilemedi. Hesap sistemi ayarlarını kontrol edin." : "Could not download PNG. Check the account configuration.");
    } finally {
      setDownloadPending(false);
    }
  }, [background, fontId, isTurkish, text, textColor, trimmedEmpty]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/tools/minecraft-rank/projects?id=${projectId}`, { cache: "no-store" });
      if (!response.ok) return;
      const { project } = await response.json();
      if (!project) return;
      setText(project.text ?? "VIP");
      setProjectName(project.name ?? project.text ?? "VIP");
      setFontId(project.font_id ?? PIXEL_FONTS[0].id);
      setTextColor(project.text_color ?? "#ffffff");
      setExtraTextColors(Array.isArray(project.extra_text_colors) ? project.extra_text_colors : []);
      const bgModeLoaded = (project.bg_mode as BgMode) || null;
      if (bgModeLoaded === "gradient" && project.gradient_from && project.gradient_to) {
        setBgMode("gradient");
        setGradFrom(project.gradient_from);
        setGradTo(project.gradient_to);
        setGradDir(project.gradient_dir === "horizontal" ? "horizontal" : "vertical");
        setPresetId(project.gradient_preset || "custom");
      } else if (bgModeLoaded === "solid" && project.solid_color) {
        setBgMode("solid");
        setSolidColor(project.solid_color);
      } else {
        setBgMode("custom");
      }
      if (Array.isArray(project.background) && project.background.length > 0) {
        backgroundRef.current = project.background;
        setBackground(project.background.map((row: Pixel[]) => [...row]));
        undoRef.current = [];
        redoRef.current = [];
        setHistoryState({ canUndo: false, canRedo: false });
      }
      setCurrentProjectId(project.id);
      setShowProjectList(false);
    } catch { /* noop */ }
  }, []);

  const saveProject = useCallback(async () => {
    if (!downloadState?.authenticated) {
      window.location.assign("/login");
      return;
    }
    if (trimmedEmpty) {
      setSaveError(isTurkish ? "Önce bir rank yazısı yaz." : "Type a rank name first.");
      return;
    }
    setSavePending(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/tools/minecraft-rank/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentProjectId || undefined,
          name: (projectName.trim() || text.trim() || "Proje").slice(0, 64),
          text,
          fontId,
          textColor,
          background,
          bgMode,
          gradientFrom: gradFrom,
          gradientTo: gradTo,
          gradientDir: gradDir,
          gradientPreset: presetId,
          solidColor,
          extraTextColors,
        }),
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "SAVE_FAILED");
      if (result.project) setCurrentProjectId(result.project.id);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 2200);
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
  }, [background, bgMode, currentProjectId, downloadState, extraTextColors, fontId, gradDir, gradFrom, gradTo, isTurkish, presetId, projectName, solidColor, text, textColor, trimmedEmpty]);

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
      setConfirmDeleteId(null);
    } catch { /* noop */ }
  }, [currentProjectId]);

  const bgAverage = useMemo(() => averageBgColor(background), [background]);
  const contrast = useMemo(() => contrastRatio(textColor, bgAverage), [textColor, bgAverage]);
  const lowContrast = contrast < 2.2;
  const hasUnsupported = normalized.includes("?");
  const midTone = useMemo(() => mixHex(gradFrom, gradTo, 0.5), [gradFrom, gradTo]);

  return (
    <div className="pixel-rank-editor">
      {/* ---------- SOL: ÖNİZLEME ---------- */}
      <div className="pixel-rank-preview-panel">
        <div className="pixel-rank-preview-header">
          <div>
            <span className="pixel-rank-kicker">{isTurkish ? "Canlı önizleme" : "Live preview"}</span>
            <strong>{copy.dimensions}</strong>
          </div>
          <div className="pixel-rank-zoom">
            <button type="button" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label={copy.zoomOut}>−</button>
            <button type="button" className="pixel-rank-zoom-fit" onClick={() => setZoom(1)} title={copy.zoomFit}>{Math.round(effectiveScale)}px</button>
            <button type="button" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} aria-label={copy.zoomIn}>+</button>
          </div>
        </div>

        <div ref={stageWrapRef} className="pixel-rank-stage-wrap">
          <div className="pixel-rank-stage" style={{ width: `${width * effectiveScale}px`, height: `${height * effectiveScale}px` }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="pixel-rank-canvas"
              style={{ width: `${width * effectiveScale}px`, height: `${height * effectiveScale}px` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPainting}
              onPointerCancel={stopPainting}
              onPointerLeave={stopPainting}
              aria-label={isTurkish ? "Rank önizleme ve fırça alanı" : "Rank preview and brush area"}
            />
          </div>
        </div>

        <div className="pixel-rank-preview-toggles">
          <label className="pixel-rank-check">
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
            <span>{copy.showGridLines}</span>
          </label>
          {bgMode !== "custom" && (
            <span className="pixel-rank-mode-note">
              {bgMode === "gradient" ? (activePreset ? (isTurkish ? activePreset.nameTr : activePreset.nameEn) : `${gradFrom} → ${gradTo}`) : solidColor}
            </span>
          )}
        </div>

        {/* Oyun içi önizleme */}
        <div className="pixel-rank-chat">
          <span className="pixel-rank-chat-label">{copy.chatPreview}</span>
          <div className="pixel-rank-chat-box">
            <span className="pixel-rank-chat-user">Steve:</span>
            <canvas
              ref={cleanPreviewRef}
              width={width}
              height={height}
              className="pixel-rank-chat-canvas"
              style={{ width: `${width * 4}px`, height: `${height * 4}px` }}
              aria-hidden="true"
            />
            <span className="pixel-rank-chat-text">{isTurkish ? "selam millet!" : "hello everyone!"}</span>
          </div>
          <div className="pixel-rank-actual">
            <span>{copy.actualSize} (1×)</span>
            <canvas
              width={width}
              height={height}
              ref={(node) => {
                if (node) drawToCanvas(node, background, false);
              }}
              className="pixel-rank-actual-canvas"
              style={{ width: `${width}px`, height: `${height}px` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="pixel-rank-action-row">
          <button type="button" className="pixel-rank-download" onClick={download} disabled={downloadPending || trimmedEmpty} title={trimmedEmpty ? copy.emptyHint : copy.download}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadPending ? (isTurkish ? "Hazırlanıyor..." : "Preparing...") : copy.download}
          </button>
          <button type="button" className={`pixel-rank-save ${saveSuccess ? "is-success" : ""}`} onClick={saveProject} disabled={savePending || trimmedEmpty} title={downloadState?.authenticated ? copy.save : copy.loginToSave}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {savePending ? "..." : saveSuccess ? copy.saved : copy.save}
          </button>
          <button type="button" className="pixel-rank-new" onClick={startNew} title={copy.newProject}>＋</button>
        </div>
        {trimmedEmpty && <p className="pixel-rank-inline-hint" role="status">{copy.emptyHint}</p>}
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
            <button type="button" className="pixel-rank-projects-toggle" onClick={() => setShowProjectList((prev) => !prev)} aria-expanded={showProjectList}>
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
                      {confirmDeleteId === project.id ? (
                        <>
                          <button type="button" className="pixel-rank-project-delete" onClick={() => deleteProject(project.id)}>{copy.yesDelete}</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)}>{copy.cancel}</button>
                        </>
                      ) : (
                        <button type="button" className="pixel-rank-project-delete" onClick={() => setConfirmDeleteId(project.id)}>{copy.deleteProject}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- SAĞ: KONTROLLER ---------- */}
      <div className="pixel-rank-controls">
        {/* Adım 1 */}
        <section className="pixel-rank-step">
          <h3 className="pixel-rank-step-title">{copy.step1}</h3>
          <label className="pixel-rank-label" htmlFor="rank-text">{copy.rankName}</label>
          <div className="pixel-rank-input-row">
            <input
              id="rank-text"
              type="text"
              value={text}
              onChange={(event) => {
                const next = event.target.value.slice(0, MAX_RANK_LENGTH);
                setText(next);
                if (!currentProjectId) setProjectName(next || "VIP");
              }}
              placeholder={copy.rankPlaceholder}
              maxLength={MAX_RANK_LENGTH}
              className="pixel-rank-input"
              autoComplete="off"
              spellCheck={false}
            />
            {text && (
              <button type="button" className="pixel-rank-clear" onClick={() => setText("")} aria-label={copy.clear}>×</button>
            )}
          </div>
          <div className="pixel-rank-meta-row">
            <span className={text.length >= MAX_RANK_LENGTH ? "is-limit" : ""}>{text.length}/{MAX_RANK_LENGTH} {copy.chars}</span>
            {hasUnsupported && <span className="pixel-rank-warn">{copy.unsupportedHint}</span>}
          </div>
          <span className="pixel-rank-sublabel">{copy.quick}</span>
          <div className="pixel-rank-chips">
            {QUICK_RANKS.map((quick) => (
              <button
                key={quick}
                type="button"
                className={`pixel-rank-chip ${normalized === quick ? "is-active" : ""}`}
                onClick={() => {
                  setText(quick);
                  if (!currentProjectId) setProjectName(quick);
                }}
              >
                {quick}
              </button>
            ))}
          </div>
          <label className="pixel-rank-label" htmlFor="project-name">{copy.projectNameLabel}</label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value.slice(0, 64))}
            maxLength={64}
            className="pixel-rank-input pixel-rank-project-input"
            autoComplete="off"
          />
        </section>

        {/* Adım 2 */}
        <section className="pixel-rank-step">
          <h3 className="pixel-rank-step-title">{copy.step2}</h3>
          <span className="pixel-rank-label">{copy.font}</span>
          <div className="pixel-rank-fonts">
            {PIXEL_FONTS.map((item: PixelFont) => (
              <button
                key={item.id}
                type="button"
                className={`pixel-rank-font-button ${fontId === item.id ? "is-active" : ""}`}
                onClick={() => setFontId(item.id)}
                aria-pressed={fontId === item.id}
              >
                <span className="pixel-rank-font-preview">Ag</span>
                <span className="pixel-rank-font-name">{item.name}</span>
                <span className="pixel-rank-font-desc">{item.id === "block" ? copy.fontBlockDesc : copy.fontTenDesc}</span>
              </button>
            ))}
          </div>
          <span className="pixel-rank-label">{copy.textColor}</span>
          <div className="pixel-rank-swatches">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`pixel-rank-swatch ${textColor.toLowerCase() === color ? "is-active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setTextColor(color)}
                aria-label={color}
                title={color}
              />
            ))}
            {extraTextColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`pixel-rank-swatch ${textColor.toLowerCase() === color.toLowerCase() ? "is-active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setTextColor(color)}
                aria-label={color}
                title={color}
              />
            ))}
            <label className="pixel-rank-custom-color" title={copy.customColor}>
              <input type="color" value={textColor} onChange={(event) => { setTextColor(event.target.value); addTextColor(event.target.value); }} aria-label={copy.customColor} />
              <span aria-hidden="true">+</span>
            </label>
          </div>
          {lowContrast && <p className="pixel-rank-contrast-warn" role="status">⚠ {copy.lowContrast} ({contrast.toFixed(1)}:1)</p>}
        </section>

        {/* Adım 3 */}
        <section className="pixel-rank-step">
          <h3 className="pixel-rank-step-title">{copy.step3}</h3>
          <div className="pixel-rank-mode-tabs" role="tablist" aria-label={copy.step3}>
            {(["gradient", "solid", "custom"] as BgMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={bgMode === mode}
                className={`pixel-rank-mode-tab ${bgMode === mode ? "is-active" : ""}`}
                onClick={() => {
                  setBgMode(mode);
                  if (mode === "gradient") setGrid(buildGradientGrid(width, height, gradFrom, gradTo, gradDir), true);
                  if (mode === "solid") setGrid(createGrid(width, height, solidColor), true);
                }}
              >
                {mode === "gradient" ? copy.modeGradient : mode === "solid" ? copy.modeSolid : copy.modeCustom}
              </button>
            ))}
          </div>

          {bgMode === "gradient" && (
            <>
              <p className="pixel-rank-section-desc">{copy.gradientPresets}</p>
              <div className="pixel-rank-presets">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`pixel-rank-preset ${presetId === preset.id && gradFrom === preset.from && gradTo === preset.to ? "is-active" : ""}`}
                    onClick={() => applyPreset(preset.id, true)}
                    title={`${isTurkish ? preset.nameTr : preset.nameEn} · ${preset.from} → ${preset.to}`}
                  >
                    <span className="pixel-rank-preset-thumb" style={{ background: `linear-gradient(180deg, ${preset.from}, ${preset.to})` }}>
                      <span style={{ color: preset.text }}>VIP</span>
                    </span>
                    <span className="pixel-rank-preset-name">{isTurkish ? preset.nameTr : preset.nameEn}</span>
                  </button>
                ))}
              </div>
              <span className="pixel-rank-label">{copy.customGradient}</span>
              <div className="pixel-rank-gradient-editor">
                <label className="pixel-rank-gradient-field">
                  <span>{copy.from}</span>
                  <input type="color" value={gradFrom} onChange={(e) => { setGradFrom(e.target.value); setPresetId("custom"); }} />
                  <code>{gradFrom}</code>
                </label>
                <span className="pixel-rank-gradient-arrow" aria-hidden="true">→</span>
                <label className="pixel-rank-gradient-field">
                  <span>{copy.to}</span>
                  <input type="color" value={gradTo} onChange={(e) => { setGradTo(e.target.value); setPresetId("custom"); }} />
                  <code>{gradTo}</code>
                </label>
              </div>
              <div className="pixel-rank-dir-row">
                <button type="button" className={gradDir === "vertical" ? "is-active" : ""} onClick={() => setGradDir("vertical")}>↓ {copy.vertical}</button>
                <button type="button" className={gradDir === "horizontal" ? "is-active" : ""} onClick={() => setGradDir("horizontal")}>→ {copy.horizontal}</button>
                <span className="pixel-rank-gradient-live" style={{ background: `linear-gradient(${gradDir === "vertical" ? "180deg" : "90deg"}, ${gradFrom}, ${midTone} 55%, ${gradTo})` }} aria-hidden="true" />
              </div>
            </>
          )}

          {bgMode === "solid" && (
            <>
              <p className="pixel-rank-section-desc">{copy.solidHint}</p>
              <div className="pixel-rank-swatches">
                {SOLID_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`pixel-rank-swatch ${solidColor.toLowerCase() === color ? "is-active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => { setSolidColor(color); setGrid(createGrid(width, height, color), true); }}
                    aria-label={color}
                    title={color}
                  />
                ))}
                <label className="pixel-rank-custom-color" title={copy.customColor}>
                  <input type="color" value={solidColor} onChange={(event) => { setSolidColor(event.target.value); setGrid(createGrid(width, height, event.target.value), true); }} aria-label={copy.customColor} />
                  <span aria-hidden="true">+</span>
                </label>
              </div>
            </>
          )}

          {bgMode === "custom" && (
            <>
              <p className="pixel-rank-section-desc">{copy.customHint}</p>
              <span className="pixel-rank-label">{copy.brushColor}</span>
              <div className="pixel-rank-tools">
                <button type="button" className={`pixel-rank-tool-button ${tool === "brush" ? "is-active" : ""}`} onClick={() => setTool("brush")} title={copy.brush} aria-pressed={tool === "brush"}>
                  <BrushIcon size={17} />
                  <span>{copy.brush}</span>
                </button>
                <button type="button" className={`pixel-rank-tool-button ${tool === "eraser" ? "is-active" : ""}`} onClick={() => setTool("eraser")} title={copy.eraser} aria-pressed={tool === "eraser"}>
                  <span className="pixel-rank-eraser-icon" aria-hidden="true">⌫</span>
                  <span>{copy.eraser}</span>
                </button>
              </div>
              <div className="pixel-rank-swatches">
                {SOLID_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`pixel-rank-swatch ${brushColor.toLowerCase() === color && tool === "brush" ? "is-active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => { setBrushColor(color); setTool("brush"); }}
                    aria-label={color}
                    title={color}
                  />
                ))}
                <label className="pixel-rank-custom-color" title={copy.brushColor}>
                  <input type="color" value={/^#[0-9a-f]{6}$/i.test(brushColor) ? brushColor : "#0b0d10"} onChange={(event) => { setBrushColor(event.target.value); setTool("brush"); }} aria-label={copy.brushColor} />
                  <span aria-hidden="true">+</span>
                </label>
              </div>
              <div className="pixel-rank-brush-row">
                <span className="pixel-rank-label">{copy.brushSize}</span>
                <div className="pixel-rank-size-buttons">
                  {[1, 2, 3].map((size) => (
                    <button key={size} type="button" className={brushSize === size ? "is-active" : ""} onClick={() => setBrushSize(size)} aria-pressed={brushSize === size}>
                      {size}px
                    </button>
                  ))}
                </div>
                <div className="pixel-rank-fill-row">
                  <button type="button" className="pixel-rank-fill-button" onClick={fillBackground}>{copy.fill}</button>
                  <button type="button" className="pixel-rank-fill-button is-ghost" onClick={makeTransparent}>{copy.makeTransparent}</button>
                </div>
              </div>
              <div className="pixel-rank-actions">
                <button type="button" onClick={undo} disabled={!historyState.canUndo}>↶ <span>{copy.undo}</span></button>
                <button type="button" onClick={redo} disabled={!historyState.canRedo}>↷ <span>{copy.redo}</span></button>
                <button type="button" onClick={resetAll}><span>{copy.reset}</span></button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
