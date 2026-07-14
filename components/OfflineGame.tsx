"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const GRID = 20;
const CELL = 20;
const SPEED = 120;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Point { x: number; y: number }

function randomApple(snake: Point[], w: number, h: number): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * w), y: Math.floor(Math.random() * h) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export default function OfflineGame() {
  const [online, setOnline] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const snakeRef = useRef<Point[]>([]);
  const appleRef = useRef<Point>({ x: 5, y: 5 });
  const dirRef = useRef<Dir>("RIGHT");
  const nextDirRef = useRef<Dir>("RIGHT");
  const scoreRef = useRef(0);
  const drawRef = useRef<() => void>(() => {});

  const cols = Math.floor(300 / CELL);
  const rows = Math.floor(300 / CELL);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOffline = () => setOnline(false);
    const goOnline = () => setOnline(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 300, 300);
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "#16213e";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    }
    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const ratio = i / snake.length;
      ctx.fillStyle = `rgb(${Math.round(89 + ratio * 30)},${Math.round(205 + ratio * 20)},${Math.round(242 - ratio * 30)})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#59abfe";
      ctx.beginPath();
      ctx.roundRect(snake[i].x * CELL + 1, snake[i].y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ff6b6b";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(appleRef.current.x * CELL + CELL / 2, appleRef.current.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [cols, rows]);

  drawRef.current = draw;

  const reset = useCallback(() => {
    const s: Point[] = [{ x: 2, y: Math.floor(rows / 2) }];
    snakeRef.current = s;
    appleRef.current = randomApple(s, cols, rows);
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setRunning(true);
    setTimeout(() => drawRef.current(), 0);
  }, [cols, rows, draw]);

  const tick = useCallback(() => {
    if (!running) return;
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = { ...snake[0] };
    switch (dirRef.current) {
      case "UP": head.y--; break;
      case "DOWN": head.y++; break;
      case "LEFT": head.x--; break;
      case "RIGHT": head.x++; break;
    }
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some((s) => s.x === head.x && s.y === head.y)) {
      setRunning(false);
      setGameOver(true);
      drawRef.current();
      return;
    }
    snake.unshift(head);
    if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      appleRef.current = randomApple(snake, cols, rows);
    } else {
      snake.pop();
    }
    drawRef.current();
  }, [running, cols, rows]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, SPEED);
    return () => clearInterval(id);
  }, [running, tick]);

  useEffect(() => {
    if (!online) reset();
  }, [online, reset]);

  useEffect(() => {
    if (!online) {
      const handleKey = (e: KeyboardEvent) => {
        if (!running) return;
        const map: Record<string, Dir> = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT" };
        const d = map[e.key];
        if (!d) return;
        e.preventDefault();
        const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
        if (d !== opp[dirRef.current]) nextDirRef.current = d;
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [online, running]);

  useEffect(() => {
    if (!online) {
      const c = canvasRef.current;
      if (!c) return;
      let sx = 0, sy = 0;
      const start = (e: TouchEvent) => {
        const t = e.touches[0];
        sx = t.clientX; sy = t.clientY;
      };
      const end = (e: TouchEvent) => {
        if (!running) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        const d: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "RIGHT" : "LEFT") : (dy > 0 ? "DOWN" : "UP");
        const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
        if (d !== opp[dirRef.current]) nextDirRef.current = d;
      };
      c.addEventListener("touchstart", start, { passive: true });
      c.addEventListener("touchend", end, { passive: true });
      return () => {
        c.removeEventListener("touchstart", start);
        c.removeEventListener("touchend", end);
      };
    }
  }, [online, running]);

  if (online) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold text-[var(--text2)]">
            {typeof window !== "undefined" && navigator.language?.startsWith("tr")
              ? "İnternet bağlantısı yok"
              : "No internet connection"}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-xl border border-[var(--border)]"
        />

        <div className="text-sm text-[var(--text2)]">
          {gameOver
            ? (typeof window !== "undefined" && navigator.language?.startsWith("tr")
              ? `Oyun Bitti! Puan: ${score}`
              : `Game Over! Score: ${score}`)
            : (typeof window !== "undefined" && navigator.language?.startsWith("tr")
              ? `Puan: ${score}`
              : `Score: ${score}`)}
        </div>

        {gameOver && (
          <button
            onClick={reset}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#97cdf2] to-[#59abfe] text-white font-medium hover:opacity-80 transition-opacity"
          >
            {typeof window !== "undefined" && navigator.language?.startsWith("tr")
              ? "Tekrar Oyna"
              : "Play Again"}
          </button>
        )}

        <p className="text-[10px] text-[var(--text2)] opacity-50">
          {typeof window !== "undefined" && navigator.language?.startsWith("tr")
            ? "Yön tuşları / kaydırarak oyna"
            : "Arrow keys / swipe to play"}
        </p>
      </div>
    </div>
  );
}
