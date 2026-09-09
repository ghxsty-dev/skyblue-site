import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

/** Mevcut şifreyle doğrulayarak şifre değiştirme. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword) return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
    if (!isStrongPassword(newPassword)) return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });
    if (newPassword === currentPassword) return NextResponse.json({ error: "PASSWORD_UNCHANGED" }, { status: 400 });

    // Mevcut şifreyi oturuma dokunmayan geçici istemciyle doğrula.
    const config = getSupabaseConfig();
    if (!config) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const verifier = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) {
      console.error("[account-password] update failed:", updateError.message);
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account-password] error:", error);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
