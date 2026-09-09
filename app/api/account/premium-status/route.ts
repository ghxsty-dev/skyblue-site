import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/account/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ premium: false, expires_at: null });
  const { user } = await getSessionUser(supabase);
  if (!user) return NextResponse.json({ premium: false, expires_at: null });

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("tool_entitlements")
    .select("expires_at")
    .eq("user_id", user.id)
    .gt("expires_at", now)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    premium: Boolean(data),
    expires_at: data?.expires_at ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}
