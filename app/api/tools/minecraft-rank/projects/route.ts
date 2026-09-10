import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";
import { MAX_ICON_GAP, isCornerStyle, isValidCustomIcon, normalizeIconBg } from "@/components/minecraft/pixel-fonts";
import { SLOT_CUSTOM, isKnownSlot } from "@/components/minecraft/rank-icons";
import { isTrustedMutation } from "@/lib/account/request";

export const dynamic = "force-dynamic";

const MAX_PROJECTS = 20;
const MAX_BACKGROUND_SIZE = 200 * 200;

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ projects: [] });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ projects: [] });

  const url = new URL(request.url);
  const loadId = url.searchParams.get("id");

  if (loadId) {
    const { data } = await supabase
      .from("rank_projects")
      .select("id, name, text, font_id, text_color, background, extra_brush_colors, extra_text_colors, bg_mode, gradient_from, gradient_to, gradient_dir, gradient_preset, solid_color, icon_left, icon_right, icon_color, icon_gap, corner_style, custom_left, custom_right, icon_bg_left, icon_bg_right")
      .eq("id", loadId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return NextResponse.json({ project: null }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({
      project: {
        ...data,
        bg_mode: (data as Record<string, unknown>).bg_mode ?? "custom",
        gradient_from: (data as Record<string, unknown>).gradient_from ?? null,
        gradient_to: (data as Record<string, unknown>).gradient_to ?? null,
        gradient_dir: (data as Record<string, unknown>).gradient_dir ?? "vertical",
        gradient_preset: (data as Record<string, unknown>).gradient_preset ?? "custom",
        solid_color: (data as Record<string, unknown>).solid_color ?? null,
        icon_left: (data as Record<string, unknown>).icon_left ?? "none",
        icon_right: (data as Record<string, unknown>).icon_right ?? "none",
        icon_color: (data as Record<string, unknown>).icon_color ?? "#ffffff",
      },
    }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data } = await supabase
    .from("rank_projects")
    .select("id, name, text, font_id, text_color, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(MAX_PROJECTS);

  return NextResponse.json({ projects: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { id, name, text, fontId, textColor, background, extraBrushColors, extraTextColors, bgMode, gradientFrom, gradientTo, gradientDir, gradientPreset, solidColor, leftSlot, rightSlot, iconColor, iconGap, cornerStyle, customLeft, customRight, iconBgLeft, iconBgRight } = body;

  if (!Array.isArray(background) || background.length > MAX_BACKGROUND_SIZE) {
    return NextResponse.json({ error: "Invalid background" }, { status: 400 });
  }

  const cleanSlot = (slot: unknown) => (typeof slot === "string" && isKnownSlot(slot) ? slot : "none");
  const cleanLeft = cleanSlot(leftSlot);
  const cleanRight = cleanSlot(rightSlot);
  if ((cleanLeft === SLOT_CUSTOM && !isValidCustomIcon(customLeft)) || (cleanRight === SLOT_CUSTOM && !isValidCustomIcon(customRight))) {
    return NextResponse.json({ error: "Invalid custom icon" }, { status: 400 });
  }
  const cleanGap = Math.max(0, Math.min(MAX_ICON_GAP, Math.floor(Number(iconGap) || 0)));
  const cleanCorner = isCornerStyle(cornerStyle) ? cornerStyle : "square";

  const projectName = (typeof name === "string" ? name : "").slice(0, 64) || "Proje";
  const rankText = (typeof text === "string" ? text : "VIP").slice(0, 24);

  const cleanHex = (value: unknown, fallback: string) =>
    typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;

  const projectData = {
    name: projectName,
    text: rankText,
    font_id: (typeof fontId === "string" ? fontId : "block").slice(0, 32),
    text_color: cleanHex(textColor, "#ffffff"),
    background: background,
    extra_brush_colors: Array.isArray(extraBrushColors) ? extraBrushColors.slice(0, 6) : [],
    extra_text_colors: Array.isArray(extraTextColors) ? extraTextColors.slice(0, 6) : [],
    bg_mode: bgMode === "solid" || bgMode === "custom" ? bgMode : "gradient",
    gradient_from: cleanHex(gradientFrom, "#fff6a5"),
    gradient_to: cleanHex(gradientTo, "#ffaa00"),
    gradient_dir: gradientDir === "horizontal" ? "horizontal" : "vertical",
    gradient_preset: (typeof gradientPreset === "string" ? gradientPreset : "custom").slice(0, 32),
    solid_color: cleanHex(solidColor, "#59abfe"),
    icon_left: cleanLeft,
    icon_right: cleanRight,
    icon_color: cleanHex(iconColor, "#ffffff"),
    icon_gap: cleanGap,
    corner_style: cleanCorner,
    icon_bg_left: normalizeIconBg(iconBgLeft),
    icon_bg_right: normalizeIconBg(iconBgRight),
    custom_left: cleanLeft === SLOT_CUSTOM ? customLeft : null,
    custom_right: cleanRight === SLOT_CUSTOM ? customRight : null,
    updated_at: new Date().toISOString(),
  };

  if (typeof id === "string" && id.length > 0) {
    const { data, error } = await supabase
      .from("rank_projects")
      .update(projectData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, name, text, font_id, text_color, updated_at")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: data });
  }

  const { count } = await supabase
    .from("rank_projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count || 0) >= MAX_PROJECTS) {
    const { data: oldest } = await supabase
      .from("rank_projects")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (oldest) await supabase.from("rank_projects").delete().eq("id", oldest.id);
  }

  const { data, error } = await supabase
    .from("rank_projects")
    .insert({ ...projectData, user_id: user.id })
    .select("id, name, text, font_id, text_color, updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const projectId = body?.id;
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("rank_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
