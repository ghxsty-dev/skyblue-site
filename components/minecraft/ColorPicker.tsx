"use client";

interface ColorOption {
  readonly id: string;
  readonly value: string;
  readonly label: string;
}

interface ColorPickerProps {
  colors: readonly ColorOption[];
  selected: string;
  customColor: string;
  onChange: (value: string) => void;
  onCustomChange: (value: string) => void;
  label: string;
}

export default function ColorPicker({
  colors,
  selected,
  customColor,
  onChange,
  onCustomChange,
  label,
}: ColorPickerProps) {
  return (
    <div className="rank-field">
      <label className="rank-label">{label}</label>
      <div className="rank-color-grid">
        {colors.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              onChange(c.value);
              onCustomChange("");
            }}
            className={`rank-color-btn ${selected === c.value && !customColor ? "active" : ""}`}
            style={{ background: c.value }}
            title={c.label}
          />
        ))}
        <label className="rank-color-custom" title={lang("Özel renk", "Custom color")}>
          <input
            type="color"
            value={customColor || "#ffffff"}
            onChange={(e) => onCustomChange(e.target.value)}
            className="rank-color-input"
          />
          <span>+</span>
        </label>
      </div>
    </div>
  );
}

function lang(tr: string, en: string): string {
  if (typeof navigator !== "undefined" && navigator.language?.startsWith("tr")) return tr;
  return en;
}
