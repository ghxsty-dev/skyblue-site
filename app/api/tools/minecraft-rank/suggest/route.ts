import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/account/session";
import { PIXEL_FONTS } from "@/components/minecraft/pixel-fonts";
import { RANK_ICONS } from "@/components/minecraft/rank-icons";
import { GRADIENT_PRESETS } from "@/components/minecraft/rank-presets";
import { isTrustedMutation } from "@/lib/account/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOOL_SLUG = "minecraft-rank";
const AI_DAILY_LIMIT = 10;
const HEX_RE = /^#[0-9a-f]{6}$/i;

function istanbulDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface AiSuggestion {
  fontId: string;
  textColor: string;
  bgMode: "gradient" | "solid";
  gradientFrom: string;
  gradientTo: string;
  solidColor: string;
  iconLeft: string;
  iconRight: string;
  iconGap: number;
  cornerStyle: "square" | "rounded" | "soft";
}

function sanitizeSuggestion(raw: unknown): AiSuggestion {
  const fallback: AiSuggestion = {
    fontId: "block",
    textColor: "#ffffff",
    bgMode: "gradient",
    gradientFrom: "#fff6a5",
    gradientTo: "#ffaa00",
    solidColor: "#59abfe",
    iconLeft: "none",
    iconRight: "none",
    iconGap: 1,
    cornerStyle: "square",
  };
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const hex = (v: unknown, d: string) => (typeof v === "string" && HEX_RE.test(v.trim()) ? v.trim().toLowerCase() : d);
  const fontIds = new Set(PIXEL_FONTS.map((f) => f.id));
  const iconIds = new Set(["none", "space", ...RANK_ICONS.map((i) => i.id)]);
  const gap = Math.floor(Number(r.iconGap));
  return {
    fontId: typeof r.fontId === "string" && fontIds.has(r.fontId) ? r.fontId : fallback.fontId,
    textColor: hex(r.textColor, fallback.textColor),
    bgMode: r.bgMode === "solid" ? "solid" : "gradient",
    gradientFrom: hex(r.gradientFrom, fallback.gradientFrom),
    gradientTo: hex(r.gradientTo, fallback.gradientTo),
    solidColor: hex(r.solidColor, fallback.solidColor),
    iconLeft: typeof r.iconLeft === "string" && iconIds.has(r.iconLeft) ? r.iconLeft : fallback.iconLeft,
    iconRight: typeof r.iconRight === "string" && iconIds.has(r.iconRight) ? r.iconRight : fallback.iconRight,
    iconGap: Number.isFinite(gap) ? Math.max(0, Math.min(8, gap)) : fallback.iconGap,
    cornerStyle: r.cornerStyle === "rounded" || r.cornerStyle === "soft" ? r.cornerStyle : "square",
  };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("NO_JSON");
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();
  const { data: entitlement } = await supabase
    .from("tool_entitlements")
    .select("id")
    .eq("user_id", user.id)
    .eq("tool_slug", TOOL_SLUG)
    .gt("expires_at", now)
    .limit(1)
    .maybeSingle();
  if (!entitlement) return NextResponse.json({ error: "PREMIUM_REQUIRED" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const today = istanbulDate();
  const { data: usage } = await admin
    .from("rank_ai_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();
  if (Number(usage?.count || 0) >= AI_DAILY_LIMIT) {
    return NextResponse.json({ error: "AI_LIMIT_REACHED" }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  const body = await request.json().catch(() => null);
  const text = String(body?.text || "").trim().slice(0, 24);
  if (!text) return NextResponse.json({ error: "EMPTY_TEXT" }, { status: 400 });

  const fontList = PIXEL_FONTS.map((f) => f.id).join(", ");
  const iconList = ["none", "space", ...RANK_ICONS.map((i) => i.id)].join(", ");
  const presetList = GRADIENT_PRESETS.map((p) => `${p.id}(${p.from}>${p.to})`).join(", ");
  const prompt =
    `Minecraft rank banner design assistant. Rank text: "${text}". ` +
    `Pick a harmonious style: text color readable on background. ` +
    `Fonts: ${fontList}. Icons: ${iconList}. ` +
    `Reference gradients: ${presetList} (you may also invent from/to hex). ` +
    `Respond with ONLY compact JSON, no markdown: ` +
    `{"fontId":"...","textColor":"#rrggbb","bgMode":"gradient"|"solid","gradientFrom":"#rrggbb","gradientTo":"#rrggbb","solidColor":"#rrggbb","iconLeft":"...","iconRight":"...","iconGap":0-8,"cornerStyle":"square"|"rounded"|"soft"}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
        }),
      },
    ).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.error("[rank-suggest] gemini failed:", response.status);
      return NextResponse.json({ error: "AI_FAILED" }, { status: 502 });
    }
    const result = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const rawText = result.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    const suggestion = sanitizeSuggestion(extractJson(rawText));

    const nextCount = Number(usage?.count || 0) + 1;
    if (usage) {
      await admin.from("rank_ai_usage").update({ count: nextCount }).eq("user_id", user.id).eq("usage_date", today);
    } else {
      await admin.from("rank_ai_usage").insert({ user_id: user.id, usage_date: today, count: 1 });
    }

    return NextResponse.json({ suggestion }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[rank-suggest] error:", error);
    return NextResponse.json({ error: "AI_FAILED" }, { status: 502 });
  }
}
