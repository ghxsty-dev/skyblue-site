import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp, hashSignupIp } from "@/lib/account/security";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: object, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return json({ error: "INVALID_ORIGIN" }, 403);
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!USERNAME_RE.test(username)) {
      return json({ error: "INVALID_USERNAME" }, 400);
    }
    if (!EMAIL_RE.test(email)) {
      return json({ error: "INVALID_EMAIL" }, 400);
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return json({ error: "WEAK_PASSWORD" }, 400);
    }

    const ip = getClientIp(request);
    if (!ip) return json({ error: "IP_UNAVAILABLE" }, 400);

    const admin = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    if (!admin || !supabase) return json({ error: "AUTH_NOT_CONFIGURED" }, 503);

    const ipHash = hashSignupIp(ip);
    const { data: existingProfile, error: lookupError } = await admin
      .from("profiles")
      .select("username, signup_ip_hash")
      .or(`username.eq.${username},signup_ip_hash.eq.${ipHash}`)
      .maybeSingle();

    if (lookupError) {
      console.error("[auth] profile lookup failed:", lookupError.message);
      return json({ error: "REGISTER_FAILED" }, 500);
    }
    if (existingProfile?.username === username) return json({ error: "USERNAME_TAKEN" }, 409);
    if (existingProfile?.signup_ip_hash === ipHash) return json({ error: "IP_ACCOUNT_EXISTS" }, 409);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username },
      app_metadata: { signup_ip_hash: ipHash },
    });

    if (error || !data.user) {
      const message = error?.message.toLowerCase() || "";
      if (message.includes("already") || message.includes("registered")) {
        return json({ error: "EMAIL_TAKEN" }, 409);
      }
      if (message.includes("username")) return json({ error: "USERNAME_TAKEN" }, 409);
      if (message.includes("signup_ip") || message.includes("duplicate")) {
        return json({ error: "IP_ACCOUNT_EXISTS" }, 409);
      }
      console.error("[auth] create user failed:", error?.message);
      return json({ error: "REGISTER_FAILED" }, 500);
    }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${request.nextUrl.origin}/login?verified=1` },
    });
    if (resendError) {
      await admin.auth.admin.deleteUser(data.user.id);
      console.error("[auth] confirmation email failed:", resendError.message);
      return json({ error: "CONFIRMATION_FAILED" }, 500);
    }
    return json({ ok: true, requiresEmailVerification: true, username }, 201);
  } catch (error) {
    console.error("[auth] register error:", error);
    return json({ error: "REGISTER_FAILED" }, 500);
  }
}
