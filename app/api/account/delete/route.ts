import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/account/session";
import { checkRateLimit } from "@/lib/account/rate-limit";
import { removePremiumRole } from "@/lib/discord-premium";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

/** Şifreyle doğrulayarak hesabı kalıcı olarak silme (profil ve ilişkili veriler cascade ile silinir). */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const session = await getSessionUser(supabase);
    const user = session.user;
    if (!user || !user.email) return NextResponse.json({ error: session.stale ? "SESSION_REVOKED" : "LOGIN_REQUIRED" }, { status: 401 });
    if (!(await checkRateLimit(`account-security:${user.id}`, 15, 600_000))) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const password = String(body?.password || "");
    if (!password) return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });

    // Şifreyi oturuma dokunmayan geçici istemciyle doğrula.
    const config = getSupabaseConfig();
    if (!config) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const verifier = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (verifyError) return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

    // Artık temizliği: Discord rolü + depolanan görseller (satırlar cascade ile gider).
    try {
      const [{ data: link }, { data: profile }] = await Promise.all([
        admin.from("discord_links").select("discord_user_id").eq("user_id", user.id).maybeSingle(),
        admin.from("profiles").select("avatar_path, banner_path").eq("id", user.id).maybeSingle(),
      ]);
      if (link?.discord_user_id) await removePremiumRole(link.discord_user_id);
      if (profile?.avatar_path) await admin.storage.from("avatars").remove([profile.avatar_path]);
      if (profile?.banner_path) await admin.storage.from("banners").remove([profile.banner_path]);
    } catch (cleanupError) {
      console.error("[account-delete] cleanup warning:", cleanupError);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("[account-delete] delete failed:", deleteError.message);
      return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account-delete] error:", error);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
