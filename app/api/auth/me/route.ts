import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_path, role, updated_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json(
    { user: profile ? { id: user.id, ...profile } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
