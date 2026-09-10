"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrushIcon } from "@/lib/icons";
import {
  buildPixelText,
  buildRankLayout,
  getPixelFont,
  normalizeRankText,
  PIXEL_FONTS,
  type PixelFont,
} from "./pixel-fonts";
import {
  RANK_ICONS,
  resolveSlot,
  SLOT_NONE,
  SLOT_SPACE,
} from "./rank-icons";
import {
  buildGradientGrid,
  contrastRatio,
  CUSTOM_COLORS_KEY,
  GRADIENT_PRESETS,
  MAX_CUSTOM_COLORS,
  MAX_RANK_LENGTH,
  mixHex,
  parseCustomColors,
  QUICK_COLORS,
  type GradientDirection,
} from "./rank-presets";

const PADDING_X = 3;
const PADDING_Y = 2;
const DEFAULT_PRESET = GRADIENT_PRESETS[0];
const DEFAULT_SOLID = "#59abfe";
const BASE_PREVIEW_SCALE = 22;

const INITIAL_FONT_ID = "kare-5";
const INITIAL_TEXT = "VIP";
const INITIAL_LAYOUT = buildPixelText(getPixelFont(INITIAL_FONT_ID), INITIAL_TEXT);
const INITIAL_W = INITIAL_LAYOUT.width + PADDING_X * 2;
const INITIAL_H = INITIAL_LAYOUT.height + PADDING_Y * 2;

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

/** Kompakt renk seçici: hazır liste + kullanıcının kaydedip sakladığı renkler. */
function CompactColorPicker({
  value,
  onChange,
  customs,
  onAddCustom,
  onRemoveCustom,
  addLabel,
  savedLabel,
  lang,
}: {
  value: string;
  onChange: (color: string) => void;
  customs: string[];
  onAddCustom: (color: string) => void;
  onRemoveCustom: (color: string) => void;
  addLabel: string;
  savedLabel: string;
  lang: "tr" | "en";
}) {
  const isTurkish = lang === "tr";
  const lower = value.toLowerCase();
  return (
    <div className="pixel-rank-colors">
      <div className="pixel-rank-quick">
        {QUICK_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`pixel-rank-dot ${lower === c.value ? "is-active" : ""}`}
            style={{ backgroundColor: c.value }}
            onClick={() => onChange(c.value)}
            aria-label={isTurkish ? c.labelTr : c.labelEn}
            title={`${isTurkish ? c.labelTr : c.labelEn} · ${c.value}`}
            aria-pressed={lower === c.value}
          />
        ))}
      </div>
      <div className="pixel-rank-customs">
        <span className="pixel-rank-customs-label">{savedLabel}</span>
        <div className="pixel-rank-customs-row">
          {customs.map((c) => (
            <span key={c} className={`pixel-rank-dot is-custom ${lower === c ? "is-active" : ""}`} style={{ backgroundColor: c }}>
              <button type="button" className="pixel-rank-dot-pick" onClick={() => onChange(c)} aria-label={c} title={c} />
              <button
                type="button"
                className="pixel-rank-dot-remove"
                onClick={(event) => { event.stopPropagation(); onRemoveCustom(c); }}
                aria-label={`× ${c}`}
                title={`× ${c}`}
              >
                ×
              </button>
            </span>
          ))}
          <label className="pixel-rank-dot is-add" title={addLabel}>
            <input
              type="color"
              defaultValue="#59abfe"
              onChange={(event) => { onAddCustom(event.target.value.toLowerCase()); }}
              aria-label={addLabel}
            />
            <span aria-hidden="true">+</span>
          </label>
        </div>
      </div>
    </div>
  );
}

/** Simge seçeneğinin gerçek piksel önizlemesi. */
function IconPreview({ rows, color, label }: { rows: readonly string[]; color: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = rows[0]?.length ?? 0;
  const h = rows.length;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let y = 0; y < h; y += 1) {
      const row = rows[y] ?? "";
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === "1") ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [rows, color, w, h]);
  const scale = w <= 5 ? 4 : 3;
  return (
    <canvas
      ref={ref}
      className="pixel-rank-icon-preview"
      style={{ width: `${w * scale}px`, height: `${h * scale}px` }}
      role="img"
      aria-label={label}
    />
  );
}

/** Sol/sağ slot seçici: Yok / Boşluk / simgeler. */
function SlotPicker({
  value,
  onChange,
  sideLabel,
  noneLabel,
  spaceLabel,
  iconRows,
  iconColor,
  lang,
}: {
  value: string;
  onChange: (value: string) => void;
  sideLabel: string;
  noneLabel: string;
  spaceLabel: string;
  iconRows: (id: string) => readonly string[];
  iconColor: string;
  lang: "tr" | "en";
}) {
  const isTurkish = lang === "tr";
  return (
    <div className="pixel-rank-slot">
      <span className="pixel-rank-label">{sideLabel}</span>
      <div className="pixel-rank-slot-options">
        <button
          type="button"
          className={`pixel-rank-slot-option is-text ${value === SLOT_NONE ? "is-active" : ""}`}
          onClick={() => onChange(SLOT_NONE)}
          aria-pressed={value === SLOT_NONE}
        >
          {noneLabel}
        </button>
        <button
          type="button"
          className={`pixel-rank-slot-option is-text ${value === SLOT_SPACE ? "is-active" : ""}`}
          onClick={() => onChange(SLOT_SPACE)}
          aria-pressed={value === SLOT_SPACE}
          title={spaceLabel}
        >
          <span className="pixel-rank-space-thumb" aria-hidden="true" />
          {spaceLabel}
        </button>
        {RANK_ICONS.map((icon) => {
          const label = isTurkish ? icon.nameTr : icon.nameEn;
          return (
            <button
              key={icon.id}
              type="button"
              className={`pixel-rank-slot-option ${value === icon.id ? "is-active" : ""}`}
              onClick={() => onChange(icon.id)}
              aria-pressed={value === icon.id}
              title={label}
              aria-label={label}
            >
              <IconPreview rows={iconRows(icon.id)} color={iconColor} label={label} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RankGenerator({ lang = "tr" }: RankGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const strokePushedRef = useRef(false);

  const backgroundRef = useRef<PixelGrid>(buildGradientGrid(INITIAL_W, INITIAL_H, DEFAULT_PRESET.from, DEFAULT_PRESET.to, "vertical"));
  const undoRef = useRef<PixelGrid[]>([]);
  const redoRef = useRef<PixelGrid[]>([]);

  const [text, setText] = useState(INITIAL_TEXT);
  const [projectName, setProjectName] = useState(INITIAL_TEXT);
  const [fontId, setFontId] = useState(INITIAL_FONT_ID);
  const [textColor, setTextColor] = useState(DEFAULT_PRESET.text);
  const [leftSlot, setLeftSlot] = useState<string>(SLOT_NONE);
  const [rightSlot, setRightSlot] = useState<string>(SLOT_NONE);
  const [iconColor, setIconColor] = useState("#ffffff");

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

  // Kullanıcının eklediği renkler: tarayıcıda saklanır, her yerde aynı liste.
  const [customColors, setCustomColors] = useState<string[]>([]);
  const customsLoadedRef = useRef(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomColors(parseCustomColors(window.localStorage.getItem(CUSTOM_COLORS_KEY)));
    } catch { /* yok say */ }
    customsLoadedRef.current = true;
  }, []);
  useEffect(() => {
    if (!customsLoadedRef.current) return;
    try {
      window.localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
    } catch { /* yok say */ }
  }, [customColors]);

  const addCustomColor = useCallback((color: string) => {
    const clean = color.toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(clean)) return;
    setCustomColors((prev) => [clean, ...prev.filter((c) => c !== clean)].slice(0, MAX_CUSTOM_COLORS));
    return clean;
  }, []);

  const removeCustomColor = useCallback((color: string) => {
    setCustomColors((prev) => prev.filter((c) => c !== color));
  }, []);

  const [background, setBackground] = useState<PixelGrid>(() =>
    buildGradientGrid(INITIAL_W, INITIAL_H, DEFAULT_PRESET.from, DEFAULT_PRESET.to, "vertical"),
  );
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [autoScale, setAutoScale] = useState(BASE_PREVIEW_SCALE);
  const [zoom, setZoom] = useState(1);

  const [downloadState, setDownloadState] = useState<{ authenticated: boolean; premium: boolean; remaining: number } | null>(null);
  const [showLock, setShowLock] = useState(false);
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
  const leftSlotInput = useMemo(() => resolveSlot(leftSlot, font.height), [leftSlot, font.height]);
  const rightSlotInput = useMemo(() => resolveSlot(rightSlot, font.height), [rightSlot, font.height]);
  const layout = useMemo(
    () => buildRankLayout(font, text, leftSlotInput, rightSlotInput),
    [font, text, leftSlotInput, rightSlotInput],
  );
  const width = layout.width;
  const height = layout.height;
  const isTurkish = lang === "tr";
  const trimmedEmpty = text.trim().length === 0;
  const activePreset = GRADIENT_PRESETS.find((p) => p.id === presetId);

  const copy = isTurkish
    ? {
        step1: "1 · Rank yazısı",
        rankName: "Rank adı",
        rankPlaceholder: "VIP, MVP, Admin...",
        clear: "Temizle",
        chars: "karakter",
        emptyHint: "Yazı boş — önizlemede VIP gösteriliyor. İndirmek için bir yazı yaz.",
        unsupportedHint: "Desteklenmeyen karakterler ? olarak görünür.",
        step2: "2 · Font ve yazı rengi",
        font: "Pixel font",
        textColor: "Yazı rengi",
        addColor: "Renk ekle",
        savedColors: "Kaydedilenler",
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
        step4: "4 · Simge",
        iconLeft: "Sol",
        iconRight: "Sağ",
        iconNone: "Yok",
        iconSpace: "Boşluk",
        iconColor: "Simge rengi",
        iconHint: "Simge, yazı yüksekliğinde kare alana 1 kare boşlukla yerleşir. Boşluk sadece zemini uzatır.",
        previewTitle: "Canlı önizleme",
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
        lockTitle: "İndirmek için kayıt ol",
        lockDesc: "Ücretsiz hesap aç, indirmeye hemen başla. Tasarımın kaybolmaz.",
        lockBenefits: ["Günde 2 bedava indirme", "Discord bağla, 4'e çıkar", "Projelerin bulutta saklanır"],
        lockSignup: "Kayıt ol",
        lockLogin: "Giriş yap",
        lockClose: "Kapat",
        dimensions: `${width} × ${height} px PNG`,
      }
    : {
        step1: "1 · Rank text",
        rankName: "Rank name",
        rankPlaceholder: "VIP, MVP, Admin...",
        clear: "Clear",
        chars: "chars",
        emptyHint: "Text is empty — previewing VIP. Type something to download.",
        unsupportedHint: "Unsupported characters render as ?.",
        step2: "2 · Font & text color",
        font: "Pixel font",
        textColor: "Text color",
        addColor: "Add color",
        savedColors: "Saved",
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
        step4: "4 · Icon",
        iconLeft: "Left",
        iconRight: "Right",
        iconNone: "None",
        iconSpace: "Space",
        iconColor: "Icon color",
        iconHint: "The icon sits in a square matching text height with a 1px gap. Space only extends the background.",
        previewTitle: "Live preview",
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
        lockTitle: "Sign up to download",
        lockDesc: "Create a free account and start downloading. Your design is kept.",
        lockBenefits: ["2 free downloads daily", "Link Discord to raise it to 4", "Projects saved in the cloud"],
        lockSignup: "Sign up",
        lockLogin: "Sign in",
        lockClose: "Close",
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

  // --- Gradient / solid uygula ---
  const applyPreset = useCallback((id: string, autoText = true) => {
    const preset = GRADIENT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setGradFrom(preset.from);
    setGradTo(preset.to);
    setBgMode("gradient");
    if (autoText) setTextColor(preset.text);
    setGrid(buildGradientGrid(width, height, preset.from, preset.to, gradDir), true);
  }, [gradDir, height, setGrid, width]);

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
  // Tam piksel hizası için ekran boyutunu yuvarla; ızgara overlay aynı
  // hücre ölçüsünü kullanır, böylece çizgiler her zoom'da keskin ve hizalı olur.
  const displayW = Math.max(1, Math.round(width * effectiveScale));
  const displayH = Math.max(1, Math.round(height * effectiveScale));
  const cellW = displayW / width;
  const cellH = displayH / height;

  // --- Canvas çizimi (sadece pikseller; ızgara CSS overlay ile çizilir,
  // canvas içi 0.04px stroke her ölçekte yamuk görünüyordu) ---
  const drawToCanvas = useCallback((canvas: HTMLCanvasElement, grid: PixelGrid) => {
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
          ctx.fillStyle = (x + y) % 2 === 0 ? "#26313d" : "#1d252f";
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.fillStyle = textColor;
    for (let y = 0; y < layout.textRows.length; y += 1) {
      const row = layout.textRows[y] ?? "";
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === "1") ctx.fillRect(layout.textDX + x, layout.textDY + y, 1, 1);
      }
    }
    ctx.fillStyle = iconColor;
    for (const icon of layout.icons) {
      for (let y = 0; y < icon.rows.length; y += 1) {
        const row = icon.rows[y] ?? "";
        for (let x = 0; x < row.length; x += 1) {
          if (row[x] === "1") ctx.fillRect(icon.dx + x, icon.dy + y, 1, 1);
        }
      }
    }
  }, [height, iconColor, layout, textColor, width]);

  useEffect(() => {
    if (canvasRef.current) drawToCanvas(canvasRef.current, background);
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
      // Kopyalamaya karşı caydırıcı: F12 / geliştirici araçları / sayfayı kaydetme.
      // Not: kararlı bir kullanıcıyı durdurmaz, sadece günlük kopyalamayı zorlaştırır.
      if (event.key === "F12") {
        event.preventDefault();
        return;
      }
      const mod = event.ctrlKey || event.metaKey;
      const k = event.key.toLowerCase();
      if (mod && event.shiftKey && ["i", "j", "c"].includes(k)) {
        event.preventDefault();
        return;
      }
      if (mod && ["u", "s"].includes(k)) {
        event.preventDefault();
        return;
      }

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
    setLeftSlot(SLOT_NONE);
    setRightSlot(SLOT_NONE);
    setIconColor("#ffffff");
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
        body: JSON.stringify({ text, fontId, textColor, background, leftSlot, rightSlot, iconColor }),
      });
      if (response.status === 401) {
        setShowLock(true);
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
  }, [background, fontId, iconColor, isTurkish, leftSlot, rightSlot, text, textColor, trimmedEmpty]);

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
      setLeftSlot(typeof project.icon_left === "string" ? project.icon_left : SLOT_NONE);
      setRightSlot(typeof project.icon_right === "string" ? project.icon_right : SLOT_NONE);
      setIconColor(typeof project.icon_color === "string" && /^#[0-9a-f]{6}$/i.test(project.icon_color) ? project.icon_color.toLowerCase() : "#ffffff");
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
      setShowLock(true);
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
          leftSlot,
          rightSlot,
          iconColor,
        }),
      });
      if (response.status === 401) {
        setShowLock(true);
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
  }, [background, bgMode, currentProjectId, downloadState, fontId, gradDir, gradFrom, gradTo, iconColor, isTurkish, leftSlot, presetId, projectName, rightSlot, solidColor, text, textColor, trimmedEmpty]);

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

        <div
          ref={stageWrapRef}
          className="pixel-rank-stage-wrap pixel-rank-protected"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="pixel-rank-stage" style={{ width: `${displayW}px`, height: `${displayH}px` }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="pixel-rank-canvas"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              style={{ width: `${displayW}px`, height: `${displayH}px` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPainting}
              onPointerCancel={stopPainting}
              onPointerLeave={stopPainting}
              aria-label={isTurkish ? "Rank önizleme ve fırça alanı" : "Rank preview and brush area"}
            />
            {showGrid && (
              <div
                className="pixel-rank-grid-overlay"
                style={{ backgroundSize: `${cellW}px ${cellH}px` }}
                aria-hidden="true"
              />
            )}
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

        {showLock && (
          <div className="pixel-rank-lock" role="dialog" aria-labelledby="rank-lock-title">
            <button type="button" className="pixel-rank-lock-close" onClick={() => setShowLock(false)} aria-label={copy.lockClose}>×</button>
            <h3 id="rank-lock-title">{copy.lockTitle}</h3>
            <p>{copy.lockDesc}</p>
            <ul>
              {copy.lockBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <div className="pixel-rank-lock-actions">
              <a href="/register" className="account-primary-button" style={{ textDecoration: "none" }}>{copy.lockSignup}</a>
              <a href="/login" className="account-secondary-button" style={{ textDecoration: "none" }}>{copy.lockLogin}</a>
            </div>
          </div>
        )}

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
                <span className="pixel-rank-font-desc">{isTurkish ? item.descTr : item.descEn}</span>
              </button>
            ))}
          </div>
          <span className="pixel-rank-label">{copy.textColor}</span>
          <CompactColorPicker
            value={textColor}
            onChange={setTextColor}
            customs={customColors}
            onAddCustom={(c) => { const v = addCustomColor(c); if (v) setTextColor(v); }}
            onRemoveCustom={removeCustomColor}
            addLabel={copy.addColor}
            savedLabel={copy.savedColors}
            lang={lang}
          />
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
              <CompactColorPicker
                value={solidColor}
                onChange={(color) => { setSolidColor(color); setGrid(createGrid(width, height, color), true); }}
                customs={customColors}
                onAddCustom={(c) => { const v = addCustomColor(c); if (v) { setSolidColor(v); setGrid(createGrid(width, height, v), true); } }}
                onRemoveCustom={removeCustomColor}
                addLabel={copy.addColor}
                savedLabel={copy.savedColors}
                lang={lang}
              />
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
              <CompactColorPicker
                value={tool === "brush" ? brushColor : ""}
                onChange={(color) => { setBrushColor(color); setTool("brush"); }}
                customs={customColors}
                onAddCustom={(c) => { const v = addCustomColor(c); if (v) { setBrushColor(v); setTool("brush"); } }}
                onRemoveCustom={removeCustomColor}
                addLabel={copy.addColor}
                savedLabel={copy.savedColors}
                lang={lang}
              />
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

        {/* Adım 4 · Simge */}
        <section className="pixel-rank-step">
          <h3 className="pixel-rank-step-title">{copy.step4}</h3>
          <p className="pixel-rank-section-desc">{copy.iconHint}</p>
          <SlotPicker
            value={leftSlot}
            onChange={setLeftSlot}
            sideLabel={copy.iconLeft}
            noneLabel={copy.iconNone}
            spaceLabel={copy.iconSpace}
            iconRows={(id) => resolveSlot(id, font.height)?.rows ?? []}
            iconColor={iconColor}
            lang={lang}
          />
          <SlotPicker
            value={rightSlot}
            onChange={setRightSlot}
            sideLabel={copy.iconRight}
            noneLabel={copy.iconNone}
            spaceLabel={copy.iconSpace}
            iconRows={(id) => resolveSlot(id, font.height)?.rows ?? []}
            iconColor={iconColor}
            lang={lang}
          />
          <span className="pixel-rank-label">{copy.iconColor}</span>
          <CompactColorPicker
            value={iconColor}
            onChange={setIconColor}
            customs={customColors}
            onAddCustom={(c) => { const v = addCustomColor(c); if (v) setIconColor(v); }}
            onRemoveCustom={removeCustomColor}
            addLabel={copy.addColor}
            savedLabel={copy.savedColors}
            lang={lang}
          />
        </section>
      </div>
    </div>
  );
}
