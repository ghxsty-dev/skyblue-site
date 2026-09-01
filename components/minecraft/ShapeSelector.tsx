"use client";

interface ShapeSelectorProps {
  shapes: readonly string[];
  selected: string;
  onChange: (shape: string) => void;
  lang?: "tr" | "en";
}

const SHAPE_LABELS: Record<string, { tr: string; en: string; icon: string }> = {
  rectangle: { tr: "Dikdörtgen", en: "Rectangle", icon: "▬" },
  shield: { tr: "Kalkan", en: "Shield", icon: "⛊" },
  rounded: { tr: "Yuvarlak", en: "Rounded", icon: "⬜" },
  hexagon: { tr: "Hexagon", en: "Hexagon", icon: "⬡" },
};

export default function ShapeSelector({
  shapes,
  selected,
  onChange,
  lang = "tr",
}: ShapeSelectorProps) {
  return (
    <div className="rank-field">
      <label className="rank-label">{lang === "tr" ? "Şekil" : "Shape"}</label>
      <div className="rank-shape-grid">
        {shapes.map((s) => {
          const info = SHAPE_LABELS[s] || { tr: s, en: s, icon: "◻" };
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`rank-shape-btn ${selected === s ? "active" : ""}`}
            >
              <span className="rank-shape-icon">{info.icon}</span>
              <span>{lang === "tr" ? info.tr : info.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
