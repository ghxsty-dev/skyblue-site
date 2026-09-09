import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mevcut şifreyle doğrulayarak e-posta değiştirme. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const newEmail = String(body?.newEmail || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!EMAIL_RE.test(newEmail)) return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    if (newEmail === user.email.toLowerCase()) return NextResponse.json({ error: "EMAIL_UNCHANGED" }, { status: 400 });
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
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      email: newEmail,
      email_confirm: true,
    });
    if (updateError) {
      const message = updateError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
      }
      console.error("[account-email] update failed:", updateError.message);
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email: newEmail }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[account-email] error:", error);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
