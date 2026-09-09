import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Tanı uç noktası: sır SIZDIRMAZ, yalnızca hangi kontrolün takıldığını
 * söyler ( Hesap sistemi kurulumu bekliyor  sorununu ayırt etmek için).
 */
export async function GET() {
  const status = {
    configured: isSupabaseConfigured(),
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    authenticated: false,
    hasProfile: false,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };
    if (user) {
      status.authenticated = true;
      const { data: profile } = await supabase!
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      status.hasProfile = Boolean(profile);
    }
  } catch {
    // Tanı her koşulda 200 döner; hata detayı verilmez.
  }

  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
