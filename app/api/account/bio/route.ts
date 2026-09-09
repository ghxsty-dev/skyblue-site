import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/account/session";
import { checkRateLimit } from "@/lib/account/rate-limit";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

const MAX_BIO_LENGTH = 100;

/** Profil hakkında yazısı kaydı (düz metin, en fazla 100 karakter). */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { user, stale } = await getSessionUser(supabase);
    if (!user) return NextResponse.json({ error: stale ? "SESSION_REVOKED" : "LOGIN_REQUIRED" }, { status: 401 });
    if (!(await checkRateLimit(`account-security:${user.id}`, 15, 600_000))) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const bio = String(body?.bio ?? "").trim();
    if (bio.length > MAX_BIO_LENGTH) return NextResponse.json({ error: "INVALID_BIO" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { error } = await admin
      .from("profiles")
      .update({ bio, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true, bio }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account-bio] save error:", error);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
