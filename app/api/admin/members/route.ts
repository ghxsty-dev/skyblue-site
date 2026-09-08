import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedMutation } from "@/lib/account/request";
import { notifyPremiumActive, removePremiumRole } from "@/lib/discord-premium";
import type { UserRole } from "@/lib/account/types";

export const runtime = "nodejs";

const VALID_ROLES: UserRole[] = ["user", "kurucu", "bas-gelirtici", "gelirtici", "k-gelirtici", "moderator", "rehber"];

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, username, avatar_path, role, banned, signup_ip, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (profileError) return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });

  const userIds = (profiles || []).map((p) => p.id);
  const now = new Date().toISOString();

  const [{ data: discordLinks }, { data: entitlements }] = await Promise.all([
    admin.from("discord_links").select("user_id, discord_username").in("user_id", userIds),
    admin.from("tool_entitlements").select("user_id, expires_at").in("user_id", userIds).gt("expires_at", now),
  ]);

  const discordMap = new Map((discordLinks || []).map((d: { user_id: string; discord_username: string }) => [d.user_id, d.discord_username]));
  const premiumMap = new Map<string, string>();
  for (const e of (entitlements || []) as { user_id: string; expires_at: string }[]) {
    const existing = premiumMap.get(e.user_id);
    if (!existing || new Date(e.expires_at) > new Date(existing)) {
      premiumMap.set(e.user_id, e.expires_at);
    }
  }

  const members = (profiles || []).map((p: Record<string, unknown>) => ({
    id: p.id,
    username: p.username,
    avatar_path: p.avatar_path,
    role: p.role,
    banned: p.banned,
    signup_ip: p.signup_ip,
    created_at: p.created_at,
    discord_username: discordMap.get(p.id as string) || null,
    premium_expires_at: premiumMap.get(p.id as string) || null,
  }));

  return NextResponse.json({ members }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const { userId, action } = body;

  if (!userId) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  if (action === "role") {
    const { role } = body;
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: "INVALID_ROLE" }, { status: 400 });
    const { error } = await admin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", String(userId));
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "ban") {
    const { banned } = body;
    const { error } = await admin
      .from("profiles")
      .update({ banned: Boolean(banned), updated_at: new Date().toISOString() })
      .eq("id", String(userId));
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "remove-premium") {
    const toolSlug = String(body.toolSlug || "minecraft-rank");
    if (toolSlug !== "minecraft-rank") return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

    const { error } = await admin
      .from("tool_entitlements")
      .delete()
      .eq("user_id", String(userId))
      .eq("tool_slug", toolSlug);
    if (error) return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });

    const { data: discordLink } = await admin
      .from("discord_links")
      .select("discord_user_id")
      .eq("user_id", String(userId))
      .maybeSingle();
    if (discordLink?.discord_user_id) {
      removePremiumRole(discordLink.discord_user_id).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "premium") {
    const { toolSlug, durationMonths } = body;
    const duration = Number(durationMonths);
    if (!toolSlug || ![1, 3, 12].includes(duration)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("tool_entitlements")
      .select("expires_at")
      .eq("user_id", String(userId))
      .eq("tool_slug", toolSlug)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const baseDate = existing?.expires_at && new Date(existing.expires_at) > new Date()
      ? new Date(existing.expires_at)
      : new Date();
    baseDate.setMonth(baseDate.getMonth() + duration);

    if (existing) {
      const { error } = await admin
        .from("tool_entitlements")
        .update({ expires_at: baseDate.toISOString() })
        .eq("user_id", String(userId))
        .eq("tool_slug", toolSlug)
        .gt("expires_at", new Date().toISOString());
      if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    } else {
      const { error } = await admin
        .from("tool_entitlements")
        .insert({ user_id: String(userId), tool_slug: toolSlug, expires_at: baseDate.toISOString() });
      if (error) return NextResponse.json({ error: "INSERT_FAILED" }, { status: 500 });
    }

    const { data: discordLink } = await admin
      .from("discord_links")
      .select("discord_user_id")
      .eq("user_id", String(userId))
      .maybeSingle();
    if (discordLink?.discord_user_id) {
      notifyPremiumActive(discordLink.discord_user_id).catch(() => {});
    }

    return NextResponse.json({ ok: true, expires_at: baseDate.toISOString() });
  }

  return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
}
