"use client";

import { useEffect, useRef } from "react";

export default function ColourfulText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      angle = (angle + 1) % 360;
      if (ref.current) {
        ref.current.style.backgroundImage = `linear-gradient(${angle}deg, #97cdf2, #59abfe, #a78bfa, #97cdf2)`;
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      ref={ref}
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(90deg, #97cdf2, #59abfe, #a78bfa, #97cdf2)",
        backgroundSize: "200% auto",
        animation: "gradientShift 3s linear infinite",
      }}
    >
      {text}
    </span>
  );
}
