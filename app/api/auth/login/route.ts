import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTrustedMutation } from "@/lib/account/request";

function json(body: object, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return json({ error: "INVALID_ORIGIN" }, 403);
  try {
    const { email, password } = await request.json();
    const supabase = await createSupabaseServerClient();
    if (!supabase) return json({ error: "AUTH_NOT_CONFIGURED" }, 503);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || "").trim().toLowerCase(),
      password: String(password || ""),
    });

    if (error || !data.user) return json({ error: "INVALID_CREDENTIALS" }, 401);
    return json({ ok: true });
  } catch {
    return json({ error: "LOGIN_FAILED" }, 500);
  }
}
