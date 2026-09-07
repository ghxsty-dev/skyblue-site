import { NextRequest, NextResponse } from "next/server";
import { createDiscordCode, hashDiscordCode } from "@/lib/account/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

async function currentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null };
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await currentUser();
  if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { data } = await supabase.from("discord_links").select("discord_username, verified_at").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ linked: Boolean(data), discord: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutation(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    const { supabase, user } = await currentUser();
    if (!supabase) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

    const { data: linked } = await admin.from("discord_links").select("user_id").eq("user_id", user.id).maybeSingle();
    if (linked) return NextResponse.json({ error: "ALREADY_LINKED" }, { status: 409 });

    const code = createDiscordCode();
    await admin.from("discord_verification_codes").delete().eq("user_id", user.id).is("consumed_at", null);
    const { error } = await admin.from("discord_verification_codes").insert({
      user_id: user.id,
      code_hash: hashDiscordCode(code),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (error) throw error;

    return NextResponse.json({ code, expiresIn: 600 }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[discord] verification code error:", error);
    return NextResponse.json({ error: "CODE_FAILED" }, { status: 500 });
  }
}
