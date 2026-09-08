"use client";

import { useApp } from "@/lib/context";
import RankGenerator from "./RankGenerator";

export default function RankGeneratorPage() {
  const { lang, t } = useApp();
  const tr = lang === "TR";

  return (
    <div className="page-inner">
      <section className="section-header">
        <h1
          style={{
            fontFamily: "var(--font-monocraft), monospace",
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            background: "linear-gradient(135deg, var(--c1), var(--c2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Minecraft ItemsAdder Rank Generator
        </h1>
        <p>{t.rankPageDesc}</p>
      </section>

      <RankGenerator lang={lang.toLowerCase() as "tr" | "en"} />

      <article className="rank-info">
        <h2>{t.rankHowToUse}</h2>
        <ol>
          <li><strong>{t.rankStep1Title}</strong> — {t.rankStep1Desc}</li>
          <li><strong>{t.rankStep2Title}</strong> — {t.rankStep2Desc}</li>
          <li><strong>{t.rankStep3Title}</strong> — {t.rankStep3Desc}</li>
          <li><strong>{t.rankStep4Title}</strong> — {t.rankStep4Desc}</li>
          <li><strong>{t.rankStep5Title}</strong> — {t.rankStep5Desc}</li>
        </ol>

        <h2>{t.rankFeatures}</h2>
        <ul>
          <li>{t.rankFeature1}</li>
          <li>{t.rankFeature2}</li>
          <li>{t.rankFeature3}</li>
          <li>{t.rankFeature4}</li>
          <li>{t.rankFeature5}</li>
          <li>{t.rankFeature6}</li>
          <li>{t.rankFeature7}</li>
          <li>{t.rankFeature8}</li>
          <li>{t.rankFeature9}</li>
        </ul>
      </article>
    </div>
  );
}
