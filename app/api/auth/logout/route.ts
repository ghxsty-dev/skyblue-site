import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTrustedMutation } from "@/lib/account/request";

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ error: "LOGOUT_FAILED" }, { status: 502 });
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
