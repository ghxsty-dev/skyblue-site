import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/account/session";
import { isTrustedMutation } from "@/lib/account/request";
import { normalizeNameStyle } from "@/lib/account/name-style";

export const runtime = "nodejs";

/** Premiuma özel isim görünümü (font + renk + gradient) kaydı. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { user, stale } = await getSessionUser(supabase);
    if (!user) return NextResponse.json({ error: stale ? "SESSION_REVOKED" : "LOGIN_REQUIRED" }, { status: 401 });

    const { data: entitlement } = await supabase
      .from("tool_entitlements")
      .select("id")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (!entitlement) return NextResponse.json({ error: "PREMIUM_REQUIRED" }, { status: 403 });

    const body = await request.json().catch(() => null);
    const style = normalizeNameStyle({
      font: body?.font,
      from: body?.from,
      to: body?.to,
    });
    if (!style) return NextResponse.json({ error: "INVALID_STYLE" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { error } = await admin
      .from("profiles")
      .update({
        name_font: style.font,
        name_color_from: style.from,
        name_color_to: style.to,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true, style }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[name-style] save error:", error);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
