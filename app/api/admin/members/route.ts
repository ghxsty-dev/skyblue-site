import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedMutation } from "@/lib/account/request";
import type { UserRole } from "@/lib/account/types";

export const runtime = "nodejs";

const VALID_ROLES: UserRole[] = ["user", "admin", "moderator", "rehber"];

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { data, error } = await admin
    .from("profiles")
    .select("id, username, avatar_path, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  return NextResponse.json({ members: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { userId, role } = await request.json();
  if (!userId || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { error } = await admin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", String(userId));
  if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
