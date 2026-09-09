import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createDiscordCode, hashDiscordCode, getClientIp } from "@/lib/account/security";
import { checkRateLimit } from "@/lib/account/rate-limit";
import { isTrustedMutation } from "@/lib/account/request";
import { sendDiscordDM } from "@/lib/discord-dm";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 15 * 60 * 1000;

function json(body: object, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
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

/**
 * Şifremi unuttum, 1. adım: Discord bağlıysa sıfırlama kodu DM'den gider,
 * bağlı değilse kullanıcı destek kanalına yönlendirilir.
 */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return json({ error: "INVALID_ORIGIN" }, 403);
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: "INVALID_EMAIL" }, 400);

    const ip = getClientIp(request) || "unknown";
    if (!(await checkRateLimit(`forgot:${ip}`, 5, 3_600_000))) return json({ error: "RATE_LIMITED" }, 429);

    const admin = createSupabaseAdminClient();
    if (!admin) return json({ error: "AUTH_NOT_CONFIGURED" }, 503);

    const userId = await findUserIdByEmail(admin, email);
    if (!userId) return json({ ok: true, method: "support" });

    const { data: link } = await admin
      .from("discord_links")
      .select("discord_user_id, discord_username")
      .eq("user_id", userId)
      .maybeSingle();
    if (!link?.discord_user_id) return json({ ok: true, method: "support" });

    const code = createDiscordCode();
    await admin.from("password_reset_codes").delete().eq("user_id", userId).is("consumed_at", null);
    const { error: insertError } = await admin.from("password_reset_codes").insert({
      user_id: userId,
      code_hash: hashDiscordCode(code),
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });
    if (insertError) {
      console.error("[forgot-password] code insert failed:", insertError.message);
      return json({ error: "SEND_FAILED" }, 500);
    }

    const dm = await sendDiscordDM(
      link.discord_user_id,
      `SkyBlue şifre sıfırlama kodun: **${code}**\n15 dakika geçerli, tek kullanımlık. Bu kodu kimseyle paylaşma.`
    );
    if (!dm.ok) {
      console.error("[forgot-password] DM failed:", dm.error);
      await admin.from("password_reset_codes").delete().eq("user_id", userId).is("consumed_at", null);
      return json({ ok: true, method: "support" });
    }

    return json({ ok: true, method: "discord", discordUsername: link.discord_username });
  } catch (error) {
    console.error("[forgot-password] error:", error);
    return json({ error: "SEND_FAILED" }, 500);
  }
}
