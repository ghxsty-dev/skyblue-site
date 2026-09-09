import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface SessionUser {
  user: User | null;
  /** Oturum şifre değişikliği sonrası iptal edilmişse true (istemci çıkışa yönlenmeli). */
  stale: boolean;
}

function parseJwtIat(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const iat = (JSON.parse(json) as { iat?: unknown }).iat;
    return typeof iat === "number" ? iat : null;
  } catch {
    return null;
  }
}

/**
 * Oturumu ve tazeliğini birlikte doğrular. force_logout_at sonrası üretilmiş
 * token taşımayan oturumlar kapatılıp stale olarak işaretlenir.
 */
export async function getSessionUser(client: SupabaseClient): Promise<SessionUser> {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { user: null, stale: false };

  let logoutAt = 0;
  try {
    const { data: profile } = await client
      .from("profiles")
      .select("force_logout_at")
      .eq("id", user.id)
      .maybeSingle();
    const raw = (profile as { force_logout_at?: string | null } | null)?.force_logout_at;
    logoutAt = raw ? new Date(raw).getTime() : 0;
  } catch {
    logoutAt = 0;
  }
  if (!logoutAt) return { user, stale: false };

  const { data: { session } } = await client.auth.getSession();
  const iat = parseJwtIat(session?.access_token);
  if (iat !== null && iat * 1000 < logoutAt) {
    try {
      await client.auth.signOut();
    } catch {
      // Oturum zaten geçersiz olabilir; işaretleme yeterli.
    }
    return { user: null, stale: true };
  }
  return { user, stale: false };
}
