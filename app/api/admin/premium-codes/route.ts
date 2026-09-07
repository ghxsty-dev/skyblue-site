import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { createLicenseCode, hashLicenseCode } from "@/lib/account/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { data, error } = await admin
    .from("license_codes")
    .select("id, code_prefix, tool_slug, duration_months, redeemed_by, redeemed_at, revoked_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  return NextResponse.json({ codes: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { toolSlug, durationMonths, quantity } = await request.json();
    const duration = Number(durationMonths);
    const count = Math.max(1, Math.min(25, Number(quantity) || 1));
    if (toolSlug !== "minecraft-rank" || ![1, 3, 12].includes(duration)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

    const rawCodes = Array.from({ length: count }, () => createLicenseCode(toolSlug));
    const rows = rawCodes.map((code) => ({
      code_hash: hashLicenseCode(code),
      code_prefix: code.slice(0, 12),
      tool_slug: toolSlug,
      duration_months: duration,
    }));
    const { error } = await admin.from("license_codes").insert(rows);
    if (error) throw error;
    return NextResponse.json({ codes: rawCodes }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin] premium code create failed:", error);
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await request.json();
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });
  const { error } = await admin
    .from("license_codes")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", String(id))
    .is("redeemed_at", null);
  if (error) return NextResponse.json({ error: "REVOKE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
