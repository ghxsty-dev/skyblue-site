import { NextRequest, NextResponse } from "next/server";
import { PNG } from "pngjs";
import {
  MAX_ICON_GAP,
  buildRankLayout,
  cornerAlpha,
  customSlotInput,
  getPixelFont,
  isCornerStyle,
  isValidCustomIcon,
  normalizeRankText,
  type CornerStyle,
  type RankSlotInput,
} from "@/components/minecraft/pixel-fonts";
import { SLOT_CUSTOM, isKnownSlot, resolveSlot } from "@/components/minecraft/rank-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

const TOOL_SLUG = "minecraft-rank";
const HEX_RE = /^#[0-9a-f]{6}$/i;

function istanbulDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function quotaStatus(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string) {
  const now = new Date().toISOString();
  const today = istanbulDate();
  const [{ data: discord }, { data: premium }, { data: usage }] = await Promise.all([
    supabase.from("discord_links").select("user_id").eq("user_id", userId).maybeSingle(),
    supabase.from("tool_entitlements").select("expires_at").eq("user_id", userId).eq("tool_slug", TOOL_SLUG).gt("expires_at", now).maybeSingle(),
    supabase.from("tool_daily_usage").select("download_count").eq("user_id", userId).eq("tool_slug", TOOL_SLUG).eq("usage_date", today).maybeSingle(),
  ]);
  const limit = discord ? 4 : 2;
  const used = Number(usage?.download_count || 0);
  return { premium: Boolean(premium), discordVerified: Boolean(discord), limit, used, remaining: premium ? -1 : Math.max(limit - used, 0), today };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ configured: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const quota = await quotaStatus(supabase, user.id);
  return NextResponse.json({ authenticated: true, ...quota }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { user } = await getSessionUser(supabase);
    if (!user) return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("banned").eq("id", user.id).maybeSingle();
    if (profile?.banned) return NextResponse.json({ error: "BANNED" }, { status: 403 });

    const body = await request.json();
    const text = normalizeRankText(String(body.text || ""));
    const font = getPixelFont(String(body.fontId || ""));
    const leftSlotId = String(body.leftSlot || "none");
    const rightSlotId = String(body.rightSlot || "none");
    if (!isKnownSlot(leftSlotId) || !isKnownSlot(rightSlotId)) {
      return NextResponse.json({ error: "INVALID_SLOT" }, { status: 400 });
    }
    if ((leftSlotId === SLOT_CUSTOM && !isValidCustomIcon(body.customLeft)) || (rightSlotId === SLOT_CUSTOM && !isValidCustomIcon(body.customRight))) {
      return NextResponse.json({ error: "INVALID_CUSTOM_ICON" }, { status: 400 });
    }
    const toSlotInput = (slotId: string, custom: unknown): RankSlotInput | null => {
      if (slotId === SLOT_CUSTOM) return customSlotInput(custom as Parameters<typeof customSlotInput>[0]);
      return resolveSlot(slotId, font.height);
    };
    const layout = buildRankLayout(font, text, toSlotInput(leftSlotId, body.customLeft), toSlotInput(rightSlotId, body.customRight), {
      iconGap: Math.max(0, Math.min(MAX_ICON_GAP, Math.floor(Number(body.iconGap) || 0))),
    });
    const cornerStyle: CornerStyle = isCornerStyle(body.cornerStyle) ? body.cornerStyle : "square";
    const width = layout.width;
    const height = layout.height;
    const textColor = String(body.textColor || "").toLowerCase();
    const iconColor = String(body.iconColor || "#ffffff").toLowerCase();
    const background = body.background as unknown;

    if (!text || !HEX_RE.test(textColor) || !HEX_RE.test(iconColor) || width < 7 || width > 400 || !Array.isArray(background) || background.length !== height) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }
    if (!background.every((row) => Array.isArray(row) && row.length === width && row.every((pixel) => pixel === null || (typeof pixel === "string" && HEX_RE.test(pixel))))) {
      return NextResponse.json({ error: "INVALID_BACKGROUND" }, { status: 400 });
    }

    const { data: consumed, error: consumeError } = await supabase.rpc("consume_tool_download", {
      p_tool_slug: TOOL_SLUG,
    });
    const result = Array.isArray(consumed) ? consumed[0] : consumed;
    if (consumeError) throw consumeError;
    if (!result?.allowed) {
      return NextResponse.json({ error: "DAILY_LIMIT_REACHED", remaining: 0 }, { status: 429, headers: { "Cache-Control": "no-store" } });
    }

    const pixels = Buffer.alloc(width * height * 4);
    const setPixel = (x: number, y: number, color: string | null) => {
      const offset = (y * width + x) * 4;
      if (color === null) {
        pixels[offset + 3] = 0;
        return;
      }
      pixels[offset] = Number.parseInt(color.slice(1, 3), 16);
      pixels[offset + 1] = Number.parseInt(color.slice(3, 5), 16);
      pixels[offset + 2] = Number.parseInt(color.slice(5, 7), 16);
      pixels[offset + 3] = 255;
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) setPixel(x, y, background[y][x]);
    }
    for (let y = 0; y < layout.textRows.length; y += 1) {
      const row = layout.textRows[y] ?? "";
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === "1") setPixel(layout.textDX + x, layout.textDY + y, textColor);
      }
    }
    for (const icon of layout.icons) {
      for (let y = 0; y < icon.rows.length; y += 1) {
        const row = icon.rows[y] ?? "";
        for (let x = 0; x < row.length; x += 1) {
          const customColor = icon.colors?.[y]?.[x] ?? null;
          if (customColor) {
            setPixel(icon.dx + x, icon.dy + y, customColor);
          } else if (row[x] === "1") {
            setPixel(icon.dx + x, icon.dy + y, iconColor);
          }
        }
      }
    }

    if (cornerStyle !== "square") {
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const alpha = cornerAlpha(x, y, width, height, cornerStyle);
          if (alpha < 1) {
            const offset = (y * width + x) * 4;
            pixels[offset + 3] = Math.round(pixels[offset + 3] * alpha);
          }
        }
      }
    }

    const png = new PNG({ width, height });
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const srcOffset = (y * width + x) * 4;
        const dstOffset = (y * width + x) * 4;
        png.data[dstOffset] = pixels[srcOffset];
        png.data[dstOffset + 1] = pixels[srcOffset + 1];
        png.data[dstOffset + 2] = pixels[srcOffset + 2];
        png.data[dstOffset + 3] = pixels[srcOffset + 3];
      }
    }
    const pngBuffer = PNG.sync.write(png);
    const filename = `rank-${text.toLowerCase().replace(/\s+/g, "-")}.png`;
    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Downloads-Remaining": String(result.premium ? -1 : result.remaining),
        "X-Premium": String(Boolean(result.premium)),
      },
    });
  } catch (error) {
    console.error("[minecraft-rank] download error:", error);
    return NextResponse.json({ error: "DOWNLOAD_FAILED" }, { status: 500 });
  }
}
