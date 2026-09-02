"use client";

interface FontOption {
  readonly id: string;
  readonly name: string;
  readonly cssVar: string;
}

interface FontSelectorProps {
  fonts: readonly FontOption[];
  selected: string;
  onChange: (id: string) => void;
  lang?: "tr" | "en";
}

export default function FontSelector({
  fonts,
  selected,
  onChange,
  lang = "tr",
}: FontSelectorProps) {
  return (
    <div className="rank-field">
      <label className="rank-label">{lang === "tr" ? "Font" : "Font"}</label>
      <div className="rank-font-grid">
        {fonts.map((f) => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`rank-font-btn ${selected === f.id ? "active" : ""}`}
          >
            <span style={{ fontFamily: `${f.cssVar}, monospace` }}>Aa</span>
            <span className="rank-font-name">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
