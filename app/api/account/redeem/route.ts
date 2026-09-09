import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/account/session";
import { hashLicenseCode } from "@/lib/account/security";
import { isTrustedMutation } from "@/lib/account/request";
import { notifyPremiumActive } from "@/lib/discord-premium";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const { code, toolSlug } = await request.json();
    if (toolSlug !== "minecraft-rank" || !String(code || "").trim()) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { user, stale } = await getSessionUser(supabase);
    if (!user) return NextResponse.json({ error: stale ? "SESSION_REVOKED" : "UNAUTHORIZED" }, { status: 401 });

    const { data, error } = await supabase.rpc("redeem_license_code", {
      p_code_hash: hashLicenseCode(String(code)),
      p_tool_slug: toolSlug,
    });
    if (error || !data) return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    let discordResult = { roleAssigned: false, dmSent: false, error: "Discord account not linked" as string | null };
    if (admin) {
      const { data: discordLink } = await admin
        .from("discord_links")
        .select("discord_user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (discordLink?.discord_user_id) {
        discordResult = await notifyPremiumActive(discordLink.discord_user_id);
      }
    }

    return NextResponse.json({
      ok: true,
      expiresAt: data,
      discordRoleAssigned: discordResult.roleAssigned,
      discordDmSent: discordResult.dmSent,
      discordError: discordResult.error,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account] redeem error:", error);
    return NextResponse.json({ error: "REDEEM_FAILED" }, { status: 500 });
  }
}
