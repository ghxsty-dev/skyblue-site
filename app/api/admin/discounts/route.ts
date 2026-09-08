import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedMutation } from "@/lib/account/request";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const { data, error } = await admin
    .from("site_discounts")
    .select("id, category, percent, active, label_en, label_tr, updated_at")
    .order("category");
  if (error) return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  return NextResponse.json({ discounts: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!isTrustedMutation(request, "json")) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const { id, percent, active, label_en, label_tr } = body;
  if (!id) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "AUTH_NOT_CONFIGURED" }, { status: 503 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (percent !== undefined) update.percent = Math.min(100, Math.max(0, Number(percent)));
  if (active !== undefined) update.active = Boolean(active);
  if (label_en !== undefined) update.label_en = label_en || null;
  if (label_tr !== undefined) update.label_tr = label_tr || null;

  const { error } = await admin.from("site_discounts").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
