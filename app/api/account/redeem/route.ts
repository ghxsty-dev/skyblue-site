import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hashLicenseCode } from "@/lib/account/security";
import { isTrustedMutation } from "@/lib/account/request";

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { data, error } = await supabase.rpc("redeem_license_code", {
      p_code_hash: hashLicenseCode(String(code)),
      p_tool_slug: toolSlug,
    });
    if (error || !data) return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });

    return NextResponse.json({ ok: true, expiresAt: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account] redeem error:", error);
    return NextResponse.json({ error: "REDEEM_FAILED" }, { status: 500 });
  }
}
