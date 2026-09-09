import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * DB tabanlı kayan pencere hız sınırı (tüm sunucu örneklerinde ortak çalışır).
 * Tablo yoksa / bağlantı kurulamazsa fail-open davranır (izin verir).
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin || !key) return true;
  const since = new Date(Date.now() - windowMs).toISOString();
  try {
    await admin.from("rate_limit_hits").delete().eq("key", key).lt("created_at", since);
    const { count, error: countError } = await admin
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", since);
    if (countError) return true;
    if ((count ?? 0) >= limit) return false;
    const { error: insertError } = await admin.from("rate_limit_hits").insert({ key });
    if (insertError) return true;
    return true;
  } catch {
    return true;
  }
}
