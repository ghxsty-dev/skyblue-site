import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashDiscordCode, getClientIp } from "@/lib/account/security";
import { checkRateLimit } from "@/lib/account/rate-limit";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: object, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

async function findUserIdByEmail(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, email: string): Promise<string | null> {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200 || page >= 10) return null;
    page += 1;
  }
}

/** Şifremi unuttum, 2. adım: DM'deki kod + yeni şifre ile sıfırlama. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return json({ error: "INVALID_ORIGIN" }, 403);
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    const code = String(body?.code || "");
    const newPassword = String(body?.newPassword || "");

    if (!EMAIL_RE.test(email)) return json({ error: "INVALID_EMAIL" }, 400);
    if (!isStrongPassword(newPassword)) return json({ error: "WEAK_PASSWORD" }, 400);

    const ip = getClientIp(request) || "unknown";
    if (!(await checkRateLimit(`reset:${ip}`, 10, 900_000))) return json({ error: "RATE_LIMITED" }, 429);

    const admin = createSupabaseAdminClient();
    if (!admin) return json({ error: "AUTH_NOT_CONFIGURED" }, 503);

    const userId = await findUserIdByEmail(admin, email);
    if (!userId) return json({ error: "INVALID_CODE" }, 400);

    const { data: resetRow } = await admin
      .from("password_reset_codes")
      .select("id, expires_at")
      .eq("user_id", userId)
      .eq("code_hash", hashDiscordCode(code))
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!resetRow) return json({ error: "INVALID_CODE" }, 400);

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
    if (updateError) {
      console.error("[reset-password] update failed:", updateError.message);
      return json({ error: "UPDATE_FAILED" }, 500);
    }

    // Kod tek kullanımlık + eski oturumları iptal et.
    await admin.from("password_reset_codes").update({ consumed_at: new Date().toISOString() }).eq("id", resetRow.id);
    await admin.from("profiles").update({ force_logout_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", userId);

    return json({ ok: true });
  } catch (error) {
    console.error("[reset-password] error:", error);
    return json({ error: "UPDATE_FAILED" }, 500);
  }
}
